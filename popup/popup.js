document.addEventListener('DOMContentLoaded', () => {
    // 设置popup窗口的大小
    const body = document.body;
    const updatePopupSize = () => {
        const width = Math.max(body.scrollWidth, 400);
        const height = Math.max(body.scrollHeight, 300);
        document.documentElement.style.width = `${width}px`;
        document.documentElement.style.height = `${height}px`;
    };
    updatePopupSize();
    // 监听DOM变化以更新窗口大小
    const observer = new MutationObserver(updatePopupSize);
    observer.observe(body, { childList: true, subtree: true });

    // 添加调试日志
    console.log('DOMContentLoaded 事件触发');

    const getCookieButton = document.getElementById('getCookie');
    console.log('获取按钮元素:', getCookieButton);
    console.log('按钮样式:', getCookieButton ? getComputedStyle(getCookieButton) : 'null');
    console.log('按钮可见性:', getCookieButton ? getCookieButton.offsetParent !== null : 'null');

    // 获取自定义域名设置按钮
    const openDomainSettingsButton = document.getElementById('openDomainSettings');
    // 确保设置按钮样式与获取Cookie按钮一致
    if (openDomainSettingsButton) {
        openDomainSettingsButton.style.display = 'flex';
        openDomainSettingsButton.style.visibility = 'visible';
        openDomainSettingsButton.style.opacity = '1';
        openDomainSettingsButton.style.position = 'relative';
        openDomainSettingsButton.style.zIndex = '9999';
        openDomainSettingsButton.style.color = '#ffffff';
        openDomainSettingsButton.style.backgroundColor = '#ef4444';
        openDomainSettingsButton.style.border = 'none';
        openDomainSettingsButton.style.borderRadius = '0.75rem';
        openDomainSettingsButton.style.padding = '0.85rem 1.75rem';
        openDomainSettingsButton.style.margin = '1.25rem auto';
        openDomainSettingsButton.style.boxShadow = '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.2)';
        openDomainSettingsButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        openDomainSettingsButton.style.backgroundImage = 'linear-gradient(to right, #ef4444, #f43f5e, #ec4899)';
        openDomainSettingsButton.style.backgroundSize = '200% auto';
        openDomainSettingsButton.classList.remove('hidden', 'invisible', 'opacity-0');
        console.log('已强制设置设置按钮样式为可见且美观');
    }
    
    const statusDiv = document.getElementById('status');
    const statusText = statusDiv.querySelector('p');
    const logContainer = document.getElementById('logContainer');
    const clearLogsButton = document.getElementById('clearLogs');

    // 确保按钮在DOM加载完成后立即可见并添加美观样式
    if (getCookieButton) {
        // 强制设置按钮样式，确保可见性和美观
        getCookieButton.style.display = 'flex';
        getCookieButton.style.visibility = 'visible';
        getCookieButton.style.opacity = '1';
        getCookieButton.style.position = 'relative';
        getCookieButton.style.zIndex = '9999';
        getCookieButton.style.color = '#ffffff';
        getCookieButton.style.backgroundColor = '#ef4444';
        getCookieButton.style.border = 'none';
        getCookieButton.style.borderRadius = '0.75rem';
        getCookieButton.style.padding = '0.85rem 1.75rem';
        getCookieButton.style.margin = '1.25rem auto';
        getCookieButton.style.boxShadow = '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.2)';
        getCookieButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        getCookieButton.style.backgroundImage = 'linear-gradient(to right, #ef4444, #f43f5e, #ec4899)';
        getCookieButton.style.backgroundSize = '200% auto';
        // 移除可能影响显示的类
        getCookieButton.classList.remove('hidden', 'invisible', 'opacity-0');
        console.log('已强制设置按钮样式为可见且美观');

        // 确保按钮在视口中可见
        setTimeout(() => {
            getCookieButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    const loadingIcon = getCookieButton ? getCookieButton.querySelector('.loading') : null;

    function showStatus(message, isError = false) {
        statusDiv.className = `w-full p-4 rounded-lg text-sm shadow-md fade-in ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        statusText.textContent = message;
        statusDiv.classList.remove('hidden');

        // 3秒后自动隐藏状态提示
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 3000);
    }

    function addLog(message, type = 'info') {
        const logEntry = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();
        logEntry.className = `${type === 'error' ? 'text-red-600' : 'text-gray-600'} slide-in`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
        // 添加日志后更新窗口大小
        updatePopupSize();
        // 同时输出到控制台以便调试
        console.log(`[${type}] ${message}`);
    }

    function setLoading(isLoading) {
        if (!getCookieButton || !loadingIcon) {
            console.error('按钮或加载图标元素不存在');
            return;
        }

        const buttonText = getCookieButton.querySelector('span');
        if (isLoading) {
            loadingIcon.classList.remove('hidden');
            buttonText.textContent = '正在获取...';
            getCookieButton.disabled = true;
            getCookieButton.classList.add('opacity-75');
        } else {
            loadingIcon.classList.add('hidden');
            buttonText.textContent = '获取Cookie';
            getCookieButton.disabled = false;
            getCookieButton.classList.remove('opacity-75');
        }
        // 记录按钮状态变化
        console.log('按钮状态变化:', isLoading ? '加载中' : '正常', '按钮可见性:', getCookieButton.offsetParent !== null);
    }

    // 清除日志
    function clearLogs() {
        logContainer.innerHTML = '';
        addLog('日志已清除');
    }

    // 监听来自background.js的消息
    chrome.runtime.onMessage.addListener((message) => {
        console.log('收到消息:', message);
        if (message.type === 'COOKIES_COPIED') {
            setLoading(false);
            if (message.success) {
                showStatus('Cookie已成功复制到剪贴板！');
            } else {
                showStatus(message.error || '获取Cookie失败', true);
            }
        } else if (message.type === 'LOG') {
            addLog(message.content, message.logType);
        }
    });

    // 确保按钮有点击事件监听器
    if (getCookieButton) {
        getCookieButton.addEventListener('click', () => {
            console.log('按钮被点击');
            setLoading(true);
            // 清除之前的日志
            clearLogs();
            // 添加开始获取的日志
            addLog('开始获取Cookie...');
            // 发送消息给background.js请求获取Cookie
            chrome.runtime.sendMessage({ type: 'GET_COOKIES' });
            showStatus('正在获取Cookie...');
        });
        console.log('已添加按钮点击事件监听器');
    } else {
        console.error('无法为按钮添加点击事件，因为按钮元素不存在');
    }

    // 添加清除日志按钮事件监听
    if (clearLogsButton) {
        clearLogsButton.addEventListener('click', clearLogs);
        console.log('已添加清除日志按钮事件监听器');
    }

    // 在DOM加载完成后再次检查按钮状态
    setTimeout(() => {
        console.log('延迟检查按钮状态:');
        console.log('按钮元素:', getCookieButton);
        console.log('按钮样式:', getCookieButton ? getComputedStyle(getCookieButton) : 'null');
        console.log('按钮可见性:', getCookieButton ? getCookieButton.offsetParent !== null : 'null');
        console.log('按钮尺寸:', getCookieButton ? `宽度:${getCookieButton.offsetWidth}, 高度:${getCookieButton.offsetHeight}` : 'null');

        // 再次确保按钮可见
        if (getCookieButton) {
            getCookieButton.style.display = 'flex';
            getCookieButton.style.visibility = 'visible';
            getCookieButton.style.opacity = '1';
            getCookieButton.style.position = 'relative';
            getCookieButton.style.zIndex = '9999';
            getCookieButton.style.color = '#ffffff';
            getCookieButton.style.backgroundColor = '#ef4444';
            getCookieButton.style.border = 'none';
            getCookieButton.style.borderRadius = '0.75rem';
            getCookieButton.style.padding = '0.85rem 1.75rem';
            getCookieButton.style.margin = '1.25rem auto';
            getCookieButton.style.boxShadow = '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.2)';
            getCookieButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            getCookieButton.style.backgroundImage = 'linear-gradient(to right, #ef4444, #f43f5e, #ec4899)';
            getCookieButton.style.backgroundSize = '200% auto';
            // 移除可能影响显示的类
            getCookieButton.classList.remove('hidden', 'invisible', 'opacity-0');
            console.log('延迟后再次强制设置按钮样式为可见且美观');
        }
    }, 500);

    // 添加自定义域名设置按钮点击事件
    if (openDomainSettingsButton) {
        openDomainSettingsButton.addEventListener('click', () => {
            addLog('打开自定义域名设置页面');
            chrome.runtime.openOptionsPage();
        });
    }
});