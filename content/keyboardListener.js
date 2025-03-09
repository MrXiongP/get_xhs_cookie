console.log('%c[键盘监听器] 脚本开始加载...', 'color: blue; font-weight: bold;'); // 添加带样式的脚本加载日志

// 监听键盘事件
// 跟踪所有按键的状态
const keyStates = {}; // 使用对象来存储所有按键的状态
const KEY_DEBOUNCE_TIME = 100; // 设置防抖时间（毫秒）
let isInitialized = false; // 添加初始化标志
let lastShiftState = false; // 追踪上一次Shift键的状态

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

    // 添加更详细的事件跟踪日志
    console.log(`[键盘事件详情] 时间: ${new Date(currentTime).toISOString()}`)
    console.log(`- 事件类型: ${event.type}`)
    console.log(`- 按键标识: ${keyIdentifier}`)
    console.log(`- 按键代码: ${event.keyCode}`)
    console.log(`- 事件目标: ${event.target.tagName}`)
    console.log(`- 事件阶段: ${event.eventPhase}`)
    console.log(`- 当前按键状态: ${JSON.stringify(keyStates[keyIdentifier] || '未按下')}`)

    // 如果是Shift键，进行特殊处理
    if (event.key === 'Shift' || event.keyCode === 16) {
        const isShiftPressed = event.type === 'keydown';
        console.log(`[Shift键处理] 当前状态: ${isShiftPressed ? '已按下' : '未按下'}`)

        // 只有当Shift键状态发生变化时才处理
        if (isShiftPressed !== lastShiftState) {
            console.log(`[Shift键状态] 状态从${lastShiftState ? '按下' : '未按下'}变为${isShiftPressed ? '按下' : '未按下'}`);
            lastShiftState = isShiftPressed;

            if (isShiftPressed) {
                console.log('[Shift键状态] 检测到新的按下事件')
                // 更新按键状态为按下
                keyStates[keyIdentifier] = {
                    pressed: true,
                    lastTriggerTime: currentTime
                };

                // 发送按下消息
                try {
                    chrome.runtime.sendMessage({
                        type: 'KEY_STATUS',
                        isShiftPressed: true,
                        timestamp: currentTime
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('消息发送失败:', chrome.runtime.lastError);
                        }
                    });
                } catch (error) {
                    console.error('发送消息时发生错误:', error);
                }
            } else {
                // 按键释放时重置状态
                keyStates[keyIdentifier] = {
                    pressed: false,
                    lastTriggerTime: currentTime
                };

                // 发送释放消息
                try {
                    chrome.runtime.sendMessage({
                        type: 'KEY_STATUS',
                        isShiftPressed: false,
                        timestamp: currentTime
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('消息发送失败:', chrome.runtime.lastError);
                        }
                    });
                } catch (error) {
                    console.error('发送消息时发生错误:', error);
                }
            }
        }
    }
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
        console.log('%c[键盘监听器] 成功添加事件监听器到window和document', 'color: green; font-weight: bold;');

        // 添加测试日志
        document.addEventListener('click', () => {
            console.log('点击事件被捕获 - 确认事件监听器正在工作');
        }, true);

        // 发送初始状态
        chrome.runtime.sendMessage({
            type: 'KEY_STATUS',
            isShiftPressed: false,
            timestamp: Date.now()
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('初始状态发送失败:', chrome.runtime.lastError);
            } else {
                console.log('初始状态发送成功');
            }
        });

        isInitialized = true; // 标记为已初始化
        console.log('%c[键盘监听器] 初始化完成', 'color: green; font-weight: bold;');
    } catch (error) {
        console.error('初始化键盘监听器时发生错误:', error);
    }
}

// 修改初始化逻辑，等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c[键盘监听器] DOM已加载，开始初始化...', 'color: blue; font-weight: bold;');
    initializeKeyboardListener();
});

// 移除直接调用的初始化
// initializeKeyboardListener();

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

// 添加多键测试函数
window.testMultipleKeys = function () {
    console.log('测试多个按键的状态跟踪...');
    // 测试一系列按键
    const keysToTest = [
        { key: 'a', keyCode: 65 },
        { key: 'b', keyCode: 66 },
        { key: 'Control', keyCode: 17 },
        { key: 'Alt', keyCode: 18 }
    ];

    // 依次测试每个按键，间隔1秒
    keysToTest.forEach((keyInfo, index) => {
        setTimeout(() => {
            window.testKeyboardListener(keyInfo.key, keyInfo.keyCode);
        }, index * 1000);
    });
};

console.log('%c[键盘监听器] 脚本加载完成，可以使用以下方法测试：\n1. window.testKeyboardListener()\n2. window.testMultipleKeys()', 'color: blue; font-weight: bold;');