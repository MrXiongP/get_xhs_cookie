// 监听来自background.js的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'WRITE_TO_CLIPBOARD') {
        try {
            // 创建一个临时的textarea元素
            const textarea = document.createElement('textarea');
            textarea.value = message.text;
            document.body.appendChild(textarea);

            // 选中文本
            textarea.select();

            // 执行复制命令
            document.execCommand('copy');

            // 移除临时元素
            document.body.removeChild(textarea);

            // 发送成功消息回background
            chrome.runtime.sendMessage({
                type: 'LOG',
                content: 'Cookie已成功写入剪贴板',
                logType: 'info'
            });
        } catch (error) {
            console.error('写入剪贴板失败:', error);
            // 发送错误消息回background
            chrome.runtime.sendMessage({
                type: 'LOG',
                content: `写入剪贴板失败: ${error.message}`,
                logType: 'error'
            });
        }
    }
});