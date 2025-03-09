console.log('%c[键盘监听器] 脚本开始加载...', 'color: blue; font-weight: bold;');

// 监听键盘事件
// 跟踪所有按键的状态
const keyStates = {}; // 使用对象来存储所有按键的状态
const KEY_DEBOUNCE_TIME = 100; // 设置防抖时间（毫秒）
let isInitialized = false; // 添加初始化标志

// 统一的事件处理函数
// 添加更多调试信息
console.debug('%c[键盘监听器] 调试模式已启用', 'color: purple; font-weight: bold;');
console.warn('[键盘监听器] 如果你看到这条消息，说明日志输出正常工作');
console.info('[键盘监听器] 请确保已在开发者工具中启用了所有日志级别的显示');

// 修改事件处理函数中的日志
function handleKeyEvent(event) {
    // 获取按键标识符，优先使用key，如果不可用则使用keyCode
    const keyIdentifier = event.key || `code-${event.keyCode}`;
    const currentTime = Date.now();

    // 使用不同的日志级别
    console.warn(`[键盘事件] 捕获到新的键盘事件：${event.type}`);
    console.info('事件详情:', {
        时间: new Date(currentTime).toISOString(),
        类型: event.type,
        按键: keyIdentifier,
        代码: event.keyCode,
        目标: event.target.tagName,
        阶段: event.eventPhase,
        状态: keyStates[keyIdentifier] || '未按下'
    });

    // 如果是Shift键，进行特殊处理
    if (event.key === 'Shift' || event.keyCode === 16) {
        console.log(`[Shift键处理] 当前状态: ${keyStates[keyIdentifier]?.pressed ? '已按下' : '未按下'}`);

        if (event.type === 'keydown') {
            // 检查按键是否已经处于按下状态
            if (!keyStates[keyIdentifier] || !keyStates[keyIdentifier].pressed) {
                console.log('[Shift键状态] 检测到新的按下事件');
                // 更新按键状态为按下
                keyStates[keyIdentifier] = {
                    pressed: true,
                    lastTriggerTime: currentTime
                };

                // 发送按下消息
                sendShiftKeyStatus(true);
            } else {
                console.log('[Shift键状态] 忽略重复的按下事件');
            }
        } else if (event.type === 'keyup') {
            console.log('[Shift键状态] 检测到释放事件');
            // 按键释放时重置状态
            keyStates[keyIdentifier] = {
                pressed: false,
                lastTriggerTime: currentTime
            };

            // 发送释放消息
            sendShiftKeyStatus(false);
        }
    }
}

// 发送Shift键状态的函数
function sendShiftKeyStatus(isPressed) {
    try {
        chrome.runtime.sendMessage({
            type: 'KEY_STATUS',
            isShiftPressed: isPressed,
            timestamp: Date.now()
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('消息发送失败:', chrome.runtime.lastError);
            }
        });
    } catch (error) {
        console.error('发送消息时发生错误:', error);
    }
}

// 在页面失去焦点时发送Shift键释放状态
function handleVisibilityChange() {
    if (document.hidden) {
        console.log('[页面状态] 页面失去焦点，发送Shift键释放状态');
        sendShiftKeyStatus(false);
    }
}

// 在popup页面关闭时发送Shift键释放状态
if (window.location.href.includes('popup/index.html')) {
    window.addEventListener('unload', () => {
        console.log('[Popup页面] 关闭，发送Shift键释放状态');
        sendShiftKeyStatus(false);
    });
}

// 初始化键盘监听器函数
function initializeKeyboardListener() {
    if (isInitialized) {
        console.log('%c[键盘监听器] 已经初始化，跳过重复初始化...', 'color: orange; font-weight: bold;');
        return;
    }

    console.log('%c[键盘监听器] 正在初始化...', 'color: green; font-weight: bold;');

    try {
        // 在捕获阶段添加事件监听，确保能捕获到所有按键事件
        window.addEventListener('keydown', handleKeyEvent, true);
        window.addEventListener('keyup', handleKeyEvent, true);
        // 同时在document上也添加事件监听，以防某些情况下window无法捕获
        document.addEventListener('keydown', handleKeyEvent, true);
        document.addEventListener('keyup', handleKeyEvent, true);
        // 添加visibilitychange事件监听
        document.addEventListener('visibilitychange', handleVisibilityChange, true);

        console.log('%c[键盘监听器] 成功添加事件监听器', 'color: green; font-weight: bold;');

        // 发送初始状态
        sendShiftKeyStatus(false);

        isInitialized = true;
        console.log('%c[键盘监听器] 初始化完成', 'color: green; font-weight: bold;');
    } catch (error) {
        console.error('初始化键盘监听器时发生错误:', error);
    }
}

// 在DOMContentLoaded和load事件中都尝试初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c[键盘监听器] DOM已加载，开始初始化...', 'color: blue; font-weight: bold;');
    initializeKeyboardListener();
});

window.addEventListener('load', () => {
    console.log('%c[键盘监听器] 窗口已加载，确保初始化...', 'color: blue; font-weight: bold;');
    initializeKeyboardListener();
});

// 添加测试函数，可以在控制台手动触发测试
window.testKeyboardListener = function (key = 'Shift', keyCode = 16) {
    console.log(`手动测试键盘监听器，测试按键: ${key}...`);
    // 模拟按键按下事件
    const downEvent = new KeyboardEvent('keydown', {
        key: key,
        keyCode: keyCode,
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(downEvent);
    console.log(`已模拟${key}键按下事件`);

    // 500ms后模拟按键释放事件
    setTimeout(() => {
        const upEvent = new KeyboardEvent('keyup', {
            key: key,
            keyCode: keyCode,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(upEvent);
        console.log(`已模拟${key}键释放事件`);
    }, 500);
};

// 初始化时发送一次Shift键状态
sendShiftKeyStatus(false);

console.log('%c[键盘监听器] 脚本加载完成', 'color: blue; font-weight: bold;');