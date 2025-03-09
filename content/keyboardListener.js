// 保存原始的console对象
const originalConsole = window.console;

// 验证console功能
(() => {
    try {
        originalConsole.log('%c[键盘监听器] 脚本开始加载...', 'color: blue; font-weight: bold;');
        originalConsole.log('[键盘监听器] Console功能测试...');
        originalConsole.warn('[键盘监听器] Console.warn测试...');
        originalConsole.error('[键盘监听器] Console.error测试...');
    } catch (e) {
        alert('Console功能可能受限！');
    }
})();

// 监听键盘事件
// 跟踪所有按键的状态
const keyStates = {}; // 使用对象来存储所有按键的状态
const KEY_DEBOUNCE_TIME = 100; // 设置防抖时间（毫秒）
let isInitialized = false; // 添加初始化标志
let eventListenersActive = false; // 跟踪事件监听器状态

// 验证环境
if (typeof window === 'undefined') {
    originalConsole.error('[键盘监听器] 错误：window对象不存在！');
} else {
    originalConsole.log('[键盘监听器] 环境检查通过');
}

console.warn('[键盘监听器] 如果你看到这条消息，说明日志输出正常工作');
console.info('[键盘监听器] 请确保已在开发者工具中启用了所有日志级别的显示');

// 修改事件处理函数中的日志
function handleKeyEvent(event) {
    // 添加防抖判断
    if (event.repeat) {
        originalConsole.log(`[防抖] 忽略重复事件: ${event.type}`);
        return;
    }
    // 获取按键标识符，优先使用key，如果不可用则使用keyCode
    const keyIdentifier = event.key || `code-${event.keyCode}`;

    // 立即输出事件捕获信息
    originalConsole.log(`%c[键盘事件捕获] ${event.type} - ${keyIdentifier}`, 'color: #4CAF50; font-weight: bold;');

    // 强制立即输出到控制台
    originalConsole.log('[强制输出] 事件已捕获');
    const currentTime = Date.now();

    // 使用不同的日志级别
    originalConsole.warn(`[键盘事件] 捕获到新的键盘事件：${event.type}`);
    originalConsole.info('事件详情:', {
        时间: new Date(currentTime).toISOString(),
        类型: event.type,
        按键: keyIdentifier,
        代码: event.keyCode,
        目标: event.target.tagName,
        阶段: event.eventPhase,
        状态: keyStates[keyIdentifier] || '未按下'
    });

    // 添加更详细的事件跟踪日志
    originalConsole.log(`[键盘事件详情] 时间: ${new Date(currentTime).toISOString()}`)
    originalConsole.log(`- 事件类型: ${event.type}`)
    originalConsole.log(`- 按键标识: ${keyIdentifier}`)
    originalConsole.log(`- 按键代码: ${event.keyCode}`)
    originalConsole.log(`- 事件目标: ${event.target.tagName}`)
    originalConsole.log(`- 事件阶段: ${event.eventPhase}`)
    originalConsole.log(`- 当前按键状态: ${JSON.stringify(keyStates[keyIdentifier] || '未按下')}`)

    // 如果是Shift键，进行特殊处理
    if (event.key === 'Shift' || event.keyCode === 16) {
        console.log(`%c[Shift键处理] 当前状态: ${keyStates[keyIdentifier]?.pressed ? '已按下' : '未按下'}`, 'color: #2196F3; font-weight: bold;')

        if (event.type === 'keydown') {
            // 检查按键是否已经处于按下状态
            if (!keyStates[keyIdentifier] || !keyStates[keyIdentifier].pressed) {
                originalConsole.log('[Shift键状态] 检测到新的按下事件')
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
                            originalConsole.error('消息发送失败:', chrome.runtime.lastError);
                        }
                    });
                } catch (error) {
                    originalConsole.error('发送消息时发生错误:', error);
                }
            } else {
                originalConsole.log('[Shift键状态] 忽略重复的按下事件')
            }
        } else if (event.type === 'keyup') {
            originalConsole.log('[Shift键状态] 检测到释放事件')
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
                        originalConsole.error('消息发送失败:', chrome.runtime.lastError);
                    }
                });
            } catch (error) {
                originalConsole.error('发送消息时发生错误:', error);
            }
        }
    }
}

// 初始化键盘监听器函数
function initializeKeyboardListener() {
    if (isInitialized) {
        originalConsole.warn('[键盘监听器] 已经初始化，跳过重复初始化...');
        return;
    }

    originalConsole.log('%c[键盘监听器] 开始初始化...', 'color: #FF5722; font-weight: bold;');

    try {
        // 检查window对象
        if (!window) {
            throw new Error('window对象不可用');
        }

        // 在捕获阶段添加事件监听，确保能捕获到所有按键事件
        window.addEventListener('keydown', handleKeyEvent, true);
        window.addEventListener('keyup', handleKeyEvent, true);
        // document.addEventListener('keydown', handleKeyEvent, true);
        // document.addEventListener('keyup', handleKeyEvent, true);

        eventListenersActive = true;

        // 验证事件监听器是否成功添加
        originalConsole.log('[验证] 正在测试事件监听器...');
        const testEvent = new KeyboardEvent('keydown', {
            key: 'Test',
            keyCode: 0,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(testEvent);

        originalConsole.log('%c[键盘监听器] 已添加事件监听器', 'color: #4CAF50; font-weight: bold;');

        // 添加测试日志
        document.addEventListener('click', (event) => {
            originalConsole.log('%c[点击测试] 事件监听器工作正常', 'color: #9C27B0; font-weight: bold;');
        }, true);

        // 发送初始状态
        originalConsole.log('[初始化] 发送初始状态...');
        chrome.runtime.sendMessage({
            type: 'KEY_STATUS',
            isShiftPressed: false,
            timestamp: Date.now(),
            source: 'initialization'
        }, (response) => {
            if (chrome.runtime.lastError) {
                originalConsole.error('初始状态发送失败:', chrome.runtime.lastError);
            } else {
                originalConsole.log('初始状态发送成功');
            }
        });

        isInitialized = true; // 标记为已初始化
        originalConsole.log('%c[键盘监听器] ✓ 初始化完成', 'color: #4CAF50; font-weight: bold;');
    } catch (error) {
        originalConsole.error('初始化键盘监听器时发生错误:', error);
    }
}

// 立即初始化，不等待DOMContentLoaded
try {
    originalConsole.log('%c[键盘监听器] 正在执行立即初始化...', 'color: blue; font-weight: bold;');
    initializeKeyboardListener();
} catch (error) {
    originalConsole.error('[键盘监听器] 立即初始化失败:', error);
}


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

// 添加状态检查函数
window.checkKeyboardListenerStatus = function () {
    originalConsole.log('%c[状态检查]', 'color: #FF9800; font-weight: bold;');
    originalConsole.log('初始化状态:', isInitialized);
    originalConsole.log('事件监听器状态:', eventListenersActive);
    originalConsole.log('当前按键状态:', keyStates);

    // 测试console功能
    originalConsole.log('Console测试消息');
    originalConsole.warn('Console警告测试');
    originalConsole.error('Console错误测试');
};

// 添加重新初始化函数
window.reinitializeKeyboardListener = function () {
    originalConsole.log('[重新初始化] 尝试重新初始化键盘监听器...');
    // 重置状态
    isInitialized = false;
    eventListenersActive = false;
    // 清空按键状态
    for (let key in keyStates) {
        delete keyStates[key];
    }
    // 重新初始化
    initializeKeyboardListener();
    originalConsole.log('[重新初始化] 完成');
    // 立即进行状态检查
    window.checkKeyboardListenerStatus();
};

// 立即执行console测试
originalConsole.log('%c[键盘监听器] 脚本加载完成', 'color: blue; font-weight: bold;');
originalConsole.log('可用的测试方法：\n1. window.testKeyboardListener()\n2. window.testMultipleKeys()\n3. window.checkKeyboardListenerStatus()\n4. window.reinitializeKeyboardListener()');
