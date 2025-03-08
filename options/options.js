// 声明需要使用的函数
let isValidRegex, getAllDomainRules, saveCustomDomainRule, removeCustomDomainRule;
let CookieTemplate, getCookieTemplate, saveCookieTemplate, createTemplateFromCookie;

// 初始化函数，通过消息传递获取后台函数
async function initBackgroundFunctions() {
    try {
        console.log('开始初始化后台函数...');
        // 获取域名匹配相关函数
        isValidRegex = await chrome.runtime.sendMessage({ action: 'getFunction', function: 'isValidRegex' });
        console.log('获取isValidRegex函数:', isValidRegex ? '成功' : '失败');

        getAllDomainRules = async () => await chrome.runtime.sendMessage({ action: 'getAllDomainRules' });
        console.log('获取getAllDomainRules函数成功');

        saveCustomDomainRule = async (rule) => await chrome.runtime.sendMessage({ action: 'saveCustomDomainRule', rule });
        console.log('获取saveCustomDomainRule函数成功');

        removeCustomDomainRule = async (rule) => await chrome.runtime.sendMessage({ action: 'removeCustomDomainRule', rule });
        console.log('获取removeCustomDomainRule函数成功');

        // 获取Cookie模板相关函数
        CookieTemplate = await chrome.runtime.sendMessage({ action: 'getClass', class: 'CookieTemplate' });
        console.log('获取CookieTemplate类:', CookieTemplate ? '成功' : '失败');

        getCookieTemplate = async (domain) => await chrome.runtime.sendMessage({ action: 'getCookieTemplate', domain });
        console.log('获取getCookieTemplate函数成功');

        createTemplateFromCookie = async (domain, cookieString) =>
            await chrome.runtime.sendMessage({ action: 'createTemplateFromCookie', domain, cookieString });
        console.log('获取createTemplateFromCookie函数成功');

        console.log('所有后台函数初始化完成');
        return true;
    } catch (error) {
        console.error('初始化后台函数失败:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM加载完成，开始初始化页面...');
    // 初始化后台函数
    const initialized = await initBackgroundFunctions();
    console.log('后台函数初始化状态:', initialized ? '成功' : '失败');

    if (!initialized) {
        const statusDiv = document.getElementById('status');
        const statusText = statusDiv.querySelector('p');
        statusDiv.style.backgroundColor = '#FEE2E2';
        statusDiv.style.color = '#B91C1C';
        statusDiv.style.padding = '1rem';
        statusDiv.style.borderRadius = '0.5rem';
        statusText.textContent = '初始化失败，请刷新页面重试';
        statusDiv.classList.remove('hidden');
        console.error('初始化失败，无法继续执行');
        return;
    }

    // 继续执行原有代码
    const domainRuleInput = document.getElementById('domainRule');
    const validateRuleButton = document.getElementById('validateRule');
    const saveRuleButton = document.getElementById('saveRule');
    const statusDiv = document.getElementById('status');
    const statusText = statusDiv.querySelector('p');
    const ruleList = document.getElementById('ruleList');

    // 获取返回按钮元素
    const backToPopupButton = document.getElementById('backToPopup');
    console.log('返回按钮元素:', backToPopupButton ? '已找到' : '未找到');

    // Cookie模板相关元素
    const cookieDomainInput = document.getElementById('cookieDomain');
    const cookieStringInput = document.getElementById('cookieString');
    const analyzeCookieButton = document.getElementById('analyzeCookie');
    const templateList = document.getElementById('templateList');

    // 加载已保存的规则
    async function loadRules() {
        console.log('开始加载已保存的规则...');
        try {
            const rules = await getAllDomainRules();
            console.log('获取到的规则列表:', rules);

            // 按域名对规则进行分组
            const domainGroups = {};
            rules.forEach(rule => {
                const domain = rule.replace(/[\^\$\*\.]/g, '');
                if (!domainGroups[domain]) {
                    domainGroups[domain] = [];
                }
                domainGroups[domain].push(rule);
            });

            // 创建flex容器
            const flexContainer = document.createElement('div');
            flexContainer.className = 'flex flex-row space-x-4';
            flexContainer.id = 'rulesContainer';

            // 创建规则列表区域
            const rulesListContainer = document.createElement('div');
            rulesListContainer.className = 'flex-1';
            let rulesHTML = '<div class="bg-white rounded-lg shadow-sm p-4 mb-4"><h3 class="text-lg font-semibold text-gray-700 mb-3">当前规则列表</h3><table class="w-full">';

            // 添加表头
            rulesHTML += `
                <thead>
                    <tr class="border-b border-gray-200">
                        <th class="text-left py-2 px-3 text-gray-600 font-medium">域名</th>
                        <th class="text-right py-2 px-3 text-gray-600 font-medium">操作</th>
                    </tr>
                </thead>
                <tbody>
            `;

            // 添加域名分组行
            Object.entries(domainGroups).forEach(([domain, domainRules]) => {
                rulesHTML += `
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="py-3 px-3 text-gray-700">${domain}</td>
                        <td class="py-3 px-3 text-right">
                            <button class="text-blue-500 hover:text-blue-700 mr-3 view-domain-rules" data-rules='${JSON.stringify(domainRules)}'>
                                <span class="flex items-center justify-end">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                                    </svg>
                                    查看规则(${domainRules.length})
                                </span>
                            </button>
                        </td>
                    </tr>
                `;
            });

            rulesHTML += '</tbody></table></div>';
            rulesListContainer.innerHTML = rulesHTML;
            flexContainer.appendChild(rulesListContainer);

            // 创建详细规则区域
            const detailsContainer = document.createElement('div');
            detailsContainer.id = 'ruleDetails';
            detailsContainer.className = 'flex-1';
            detailsContainer.innerHTML = `
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-lg font-semibold text-gray-700 mb-3">详细规则</h3>
                    <div class="text-gray-500 text-center py-4">
                        请从左侧列表中选择一个域名查看其详细规则
                    </div>
                </div>
            `;
            flexContainer.appendChild(detailsContainer);

            // 将flex容器添加到规则列表的位置
            ruleList.innerHTML = '';
            ruleList.appendChild(flexContainer);
            console.log('规则列表渲染完成');
        } catch (error) {
            console.error('加载规则失败:', error);
        }
    }

    // 加载已保存的Cookie模板
    async function loadTemplates() {
        console.log('开始加载已保存的Cookie模板...');
        try {
            const templates = await chrome.storage.local.get('xhs_cookie_templates');
            console.log('获取到的模板:', templates);
            const allTemplates = templates['xhs_cookie_templates'] || {};

            templateList.innerHTML = Object.keys(allTemplates).map(domain => {
                const template = allTemplates[domain];
                return `
                    <li style="padding: 0.5rem; background-color: white; border-radius: 0.25rem; margin-bottom: 0.5rem;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <span style="font-weight: 500;">${domain}</span>
                            <button style="color: #DC2626; background: linear-gradient(to right, #DC2626, #B91C1C); -webkit-background-clip: text; -webkit-text-fill-color: transparent;" class="delete-template" data-domain="${domain}">删除</button>
                        </div>
                        <div style="margin-top: 0.25rem; font-size: 0.75rem; color: #6B7280;">
                            <div>必需字段 (${template.requiredFields.length}): ${template.requiredFields.join(', ')}</div>
                        </div>
                    </li>
                `;
            }).join('') || '<li class="p-2 text-gray-500">暂无Cookie模板</li>';
            console.log('模板列表渲染完成');
        } catch (error) {
            console.error('加载Cookie模板失败:', error);
            templateList.innerHTML = '<li class="p-2 text-red-500">加载Cookie模板失败</li>';
        }
    }

    // 初始加载规则和模板
    await loadRules();
    await loadTemplates();

    function showStatus(message, isError = false) {
        console.log(`显示状态消息: ${message}, 是否错误: ${isError}`);
        statusDiv.style.padding = '1rem';
        statusDiv.style.borderRadius = '0.5rem';
        statusDiv.style.fontSize = '0.875rem';
        if (isError) {
            statusDiv.style.backgroundColor = '#FEE2E2';
            statusDiv.style.color = '#B91C1C';
        } else {
            statusDiv.style.backgroundColor = '#D1FAE5';
            statusDiv.style.color = '#047857';
        }
        statusText.textContent = message;
        statusDiv.classList.remove('hidden');

        // 3秒后自动隐藏状态提示
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 3000);
    }

    validateRuleButton.addEventListener('click', () => {
        console.log('验证规则按钮被点击');
        const rule = domainRuleInput.value.trim();
        console.log('验证的规则:', rule);

        if (!rule) {
            showStatus('请输入域名规则', true);
            return;
        }

        const isValid = isValidRegex(rule);
        console.log('规则验证结果:', isValid ? '有效' : '无效');

        showStatus(
            isValid ? '域名规则格式正确' : '域名规则格式不正确',
            !isValid
        );
    });

    saveRuleButton.addEventListener('click', async () => {
        console.log('保存规则按钮被点击');
        const rule = domainRuleInput.value.trim();
        console.log('要保存的规则:', rule);

        if (!rule) {
            showStatus('请输入域名规则', true);
            return;
        }

        try {
            console.log('尝试保存规则...');
            await saveCustomDomainRule(rule);
            console.log('规则保存成功');
            showStatus('规则保存成功');
            domainRuleInput.value = '';
            await loadRules();
        } catch (error) {
            console.error('保存规则失败:', error);
            showStatus(error.message, true);
        }
    });

    // 为规则列表中的按钮添加事件监听
    ruleList.addEventListener('click', async (e) => {
        console.log('规则列表被点击, 事件目标:', e.target.tagName);
        const button = e.target.closest('button');
        if (!button) {
            console.log('点击的不是按钮元素');
            return;
        }

        // 处理查看域名规则按钮点击
        if (button.classList.contains('view-domain-rules')) {
            console.log('查看域名规则按钮被点击');
            try {
                const domainRules = JSON.parse(button.dataset.rules);
                console.log('域名规则列表:', domainRules);

                // 创建详细规则区域的HTML
                let detailsHTML = '<div class="bg-white rounded-lg shadow-sm p-4"><h3 class="text-lg font-semibold text-gray-700 mb-3">详细规则</h3><ul class="space-y-2">';

                // 获取默认规则列表
                const defaultRules = await chrome.runtime.sendMessage({ action: 'getDefaultRules' });

                domainRules.forEach(rule => {
                    const isDefaultRule = defaultRules.includes(rule);
                    detailsHTML += `
                        <li class="flex justify-between items-center p-2 ${isDefaultRule ? 'bg-blue-50' : 'bg-gray-50'} rounded hover:bg-gray-100 transition-colors">
                            <span class="text-gray-700">
                                ${rule}
                                ${isDefaultRule ? '<span class="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">默认规则</span>' : ''}
                            </span>
                            ${isDefaultRule ?
                            `<span class="text-gray-400 text-sm">不可删除</span>` :
                            `<button class="text-red-500 hover:text-red-700 delete-rule" data-rule="${rule}">
                                    <span class="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                        删除
                                    </span>
                                </button>`
                        }
                        </li>
                    `;
                });

                detailsHTML += '</ul></div>';

                // 更新详细规则区域
                const detailsContainer = document.getElementById('ruleDetails');
                if (detailsContainer) {
                    detailsContainer.innerHTML = detailsHTML;
                }
            } catch (error) {
                console.error('显示域名规则详情失败:', error);
                showStatus('显示域名规则详情失败', true);
            }
        }

        // 处理删除按钮点击
        if (button.classList.contains('delete-rule')) {
            console.log('删除规则按钮被点击');
            const ruleToDelete = button.dataset.rule;
            console.log('要删除的规则:', ruleToDelete);

            try {
                console.log('尝试删除规则...');
                await removeCustomDomainRule(ruleToDelete);
                console.log('规则删除成功');
                showStatus('规则删除成功');
                await loadRules();
            } catch (error) {
                console.error('删除规则失败:', error);
                showStatus(error.message, true);
            }
        }
    });

    // 分析Cookie按钮点击事件
    analyzeCookieButton.addEventListener('click', async () => {
        console.log('分析Cookie按钮被点击');
        const domain = cookieDomainInput.value.trim();
        const cookieString = cookieStringInput.value.trim();
        console.log('分析Cookie参数 - 域名:', domain, '字符串长度:', cookieString.length);

        if (!domain) {
            showStatus('请输入域名', true);
            return;
        }

        if (!cookieString) {
            showStatus('请输入Cookie字符串', true);
            return;
        }

        try {
            console.log('尝试分析并保存Cookie模板...');
            await createTemplateFromCookie(domain, cookieString);
            console.log(`成功分析并保存${domain}的Cookie模板`);
            showStatus(`已成功分析并保存${domain}的Cookie模板`);
            cookieDomainInput.value = '';
            cookieStringInput.value = '';
            await loadTemplates();
        } catch (error) {
            console.error('分析Cookie失败:', error);
            showStatus(`分析Cookie失败: ${error.message}`, true);
        }
    });

    // 为模板列表中的删除按钮添加事件监听
    templateList.addEventListener('click', async (e) => {
        console.log('模板列表被点击, 事件目标:', e.target.tagName);
        if (e.target.classList.contains('delete-template')) {
            console.log('删除模板按钮被点击');
            const domainToDelete = e.target.dataset.domain;
            console.log('要删除的模板域名:', domainToDelete);
            try {
                console.log('尝试获取所有模板...');
                const templates = await chrome.storage.local.get('xhs_cookie_templates');
                const allTemplates = templates['xhs_cookie_templates'] || {};
                console.log('获取到的模板:', Object.keys(allTemplates));

                if (allTemplates[domainToDelete]) {
                    console.log(`删除${domainToDelete}的模板`);
                    delete allTemplates[domainToDelete];
                    await chrome.storage.local.set({ 'xhs_cookie_templates': allTemplates });
                    console.log('模板删除成功');
                    showStatus(`已删除${domainToDelete}的Cookie模板`);
                    await loadTemplates();
                } else {
                    console.log(`未找到${domainToDelete}的模板`);
                }
            } catch (error) {
                console.error('删除模板失败:', error);
                showStatus(`删除模板失败: ${error.message}`, true);
            }
        }
    });

    // 添加返回按钮点击事件
    if (backToPopupButton) {
        backToPopupButton.addEventListener('click', () => {
            console.log('返回按钮被点击，准备关闭选项页面');
            window.close(); // 关闭选项页面
        });
    } else {
        console.error('未找到返回按钮元素，无法添加点击事件');
    }

});