// 格式化Cookie字符串
function formatCookies(cookies) {
    return cookies
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');
}

// 导入必要的脚本
try {
    importScripts('./domainMatcher.js');
    console.log('成功加载domainMatcher.js');
    importScripts('./cookieTemplate.js');
    console.log('成功加载cookieTemplate.js');
    importScripts('./storage.js');
    console.log('成功加载storage.js');
} catch (error) {
    console.error('加载脚本失败:', error);
}

// 统一的日志输出函数
function logMessage(message, type = 'info', error = null) {
    // 如果有错误对象，添加错误详情
    const fullMessage = error ? `${message} - ${error.message}\n${error.stack || ''}` : message;
    // 输出到扩展控制台
    console.log(`[${type}] ${message}`);
    // 发送到popup页面的操作日志
    chrome.runtime.sendMessage({
        type: 'LOG',
        content: message,
        logType: type
    });
    // 输出到当前活动标签页的控制台
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab?.id) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (msg, t) => { console.log(`[${t}] ${msg}`); },
                args: [message, type]
            }).catch(() => { });
        }
    });
}

// 获取Cookie的核心逻辑
async function getCookies() {
    try {
        logMessage('开始获取Cookie...');
        // 获取当前标签页的URL
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) {
            console.error('获取当前页面URL失败');
            throw new Error('无法获取当前页面URL');
        }
        logMessage(`成功获取当前页面URL: ${tab.url}`);

        const url = new URL(tab.url);
        const domain = url.hostname;
        logMessage(`当前域名: ${domain}`);

        // 检查域名是否匹配规则
        const domainRules = await StorageManager.getAllDomainRules();
        const domainRule = Object.entries(domainRules).find(([_, rule]) => {
            return rule.rules.some(pattern => {
                const regex = new RegExp(pattern);
                return regex.test(domain);
            });
        });
        logMessage(`域名匹配检查结果: ${domainRule ? '匹配' : '不匹配'}`);
        if (!domainRule) {
            throw new Error('当前网站不在允许的域名列表中');
        }

        // 获取所有匹配域名的cookies
        logMessage('开始获取域名相关的cookies...');
        // 修改获取Cookie的方式，使用更宽松的匹配条件
        const cookies = await chrome.cookies.getAll({
            // 使用部分域名匹配，确保能获取到所有相关Cookie
            domain: 'xiaohongshu.com'
        });
        logMessage(`获取到的cookies数量: ${cookies.length}`);

        if (!cookies || cookies.length === 0) {
            throw new Error('未找到小红书相关的Cookie');
        }

        // 移除敏感字段过滤，确保获取所有必要的Cookie
        // 用户需要完整的Cookie信息，包括abRequestId、webId、gid等字段
        const filteredCookies = cookies;
        logMessage(`过滤后的cookies数量: ${filteredCookies.length}`);

        if (filteredCookies.length === 0) {
            throw new Error('未找到有效的Cookie');
        }

        // 格式化Cookie
        logMessage('开始格式化Cookie...');
        const cookieString = formatCookies(filteredCookies);

        // 检查是否有对应域名的Cookie模板，如果有则验证Cookie是否包含所有必需字段
        try {
            const [matchedDomain] = domainRule;
            const template = await StorageManager.getCookieTemplateByDomain(matchedDomain);
            if (template) {
                logMessage('找到Cookie模板，开始验证...');
                const cookieObj = new CookieTemplate(
                    template.domain,
                    template.requiredFields,
                    template.template
                );
                const validationResult = cookieObj.validate(cookieString);
                if (!validationResult.valid) {
                    logMessage(`Cookie验证警告: ${validationResult.message}`, 'warn');
                    // 这里只发出警告，不阻止用户获取Cookie
                }
            } else {
                logMessage('未找到Cookie模板，跳过验证');
            }
        } catch (error) {
            logMessage(`验证Cookie失败: ${error}`, 'error');
            // 验证失败不阻止继续执行
        }

        // 写入剪贴板
        logMessage('开始写入剪贴板...');
        try {
            // 使用chrome.scripting.executeScript在当前标签页的上下文中执行剪贴板操作
            // 首先检查是否有权限
            if (!chrome.scripting) {
                throw new Error('没有chrome.scripting权限，请在manifest.json中添加相应权限');
            }

            // 执行脚本将cookie写入剪贴板
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (text) => {
                    // 创建一个临时文本区域元素
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    // 确保元素不可见
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    // 选择文本并复制
                    textarea.select();
                    const success = document.execCommand('copy');
                    // 移除临时元素
                    document.body.removeChild(textarea);
                    // 检查复制是否成功
                    if (!success) {
                        throw new Error('execCommand复制失败');
                    }
                    // 同时尝试使用现代API作为备份
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text)
                            .catch(e => console.warn('现代剪贴板API失败，但已通过execCommand成功复制:', e));
                    }
                    return success;
                },
                args: [cookieString]
            });

            // 记录详细日志
            logMessage(`Cookie已写入剪贴板，内容长度: ${cookieString.length}`);
            logMessage(`Cookie内容预览: ${cookieString.substring(0, 100)}...`);

            logMessage('Cookie已成功写入剪贴板');

            // 发送成功消息
            chrome.runtime.sendMessage({
                type: 'LOG',
                content: 'Cookie已成功写入剪贴板',
                logType: 'info'
            });
            chrome.runtime.sendMessage({
                type: 'COOKIES_COPIED',
                success: true
            });
        } catch (error) {
            logMessage(`写入剪贴板失败: ${error}`, 'error');
            const errorMessage = error.message || '写入剪贴板时发生未知错误';
            chrome.runtime.sendMessage({
                type: 'LOG',
                content: `写入剪贴板失败: ${errorMessage}`,
                logType: 'error'
            });
            chrome.runtime.sendMessage({
                type: 'COOKIES_COPIED',
                success: false,
                error: errorMessage
            });
        }
    } catch (error) {
        logMessage(`获取Cookie失败: ${error}`, 'error');
        // 发送错误消息给popup页面（如果打开的话）
        chrome.runtime.sendMessage({
            type: 'COOKIES_COPIED',
            success: false,
            error: error.message
        });
        logMessage('已发送错误消息到popup页面');
    }
}

// 存储Shift键状态
let isShiftKeyPressed = false;

// 监听键盘事件
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'KEY_STATUS') {
        isShiftKeyPressed = message.isShiftPressed;
        logMessage(`Shift键状态更新: ${isShiftKeyPressed ? '按下' : '未按下'}`);
        // 当shift键状态改变时更新popup设置
        updateExtensionPopup();
    }
});

// 监听插件图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
    // 根据shift键状态决定行为
    if (!isShiftKeyPressed) {
        // 如果没有按下Shift键，直接获取Cookie
        logMessage('直接获取Cookie');
        getCookies();
    }
    // 如果按下了shift键，不做任何处理
    // 由于manifest.json中设置了default_popup
    // Chrome会自动打开popup页面
});

// 更新action的popup设置
function updateExtensionPopup() {
    if (isShiftKeyPressed) {
        // shift按下时启用popup
        chrome.action.setPopup({ popup: 'popup/index.html' });
    } else {
        // shift未按下时禁用popup
        chrome.action.setPopup({ popup: '' });
    }
}
// 监听来自popup页面和options页面的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_COOKIES') {
        getCookies();
    }

    // 处理options页面的函数请求
    if (message.action === 'getFunction') {
        if (message.function === 'isValidRegex') {
            // 将函数转换为字符串形式传递
            sendResponse(isValidRegex.toString());
            return true;
        }
    }

    // 处理域名规则相关请求
    if (message.action === 'getAllDomainRules') {
        self.getAllDomainRules().then(sendResponse);
        return true;
    }

    if (message.action === 'saveCustomDomainRule') {
        self.saveCustomDomainRule(message.rule).then(sendResponse).catch(error => sendResponse({ error: error.message }));
        return true;
    }

    if (message.action === 'removeCustomDomainRule') {
        self.removeCustomDomainRule(message.rule).then(sendResponse).catch(error => sendResponse({ error: error.message }));
        return true;
    }

    if (message.action === 'getDefaultRules') {
        sendResponse(DEFAULT_DOMAIN_RULES);
        return true;
    }

    // 处理Cookie模板相关请求
    if (message.action === 'getClass' && message.class === 'CookieTemplate') {
        // 发送类的字符串表示而不是类本身，避免序列化错误
        sendResponse({
            name: CookieTemplate.name,
            methods: Object.getOwnPropertyNames(CookieTemplate.prototype),
            staticMethods: Object.getOwnPropertyNames(CookieTemplate)
                .filter(name => typeof CookieTemplate[name] === 'function')
        });
        return true;
    }

    if (message.action === 'getCookieTemplate') {
        getCookieTemplate(message.domain).then(sendResponse).catch(error => sendResponse({ error: error.message }));
        return true;
    }

    if (message.action === 'createTemplateFromCookie') {
        createTemplateFromCookie(message.domain, message.cookieString).then(sendResponse).catch(error => sendResponse({ error: error.message }));
        return true;
    }
});