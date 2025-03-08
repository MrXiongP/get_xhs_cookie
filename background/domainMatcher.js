// 默认的小红书域名规则
const DEFAULT_DOMAIN_RULES = [
    '^.*\.xiaohongshu\.com$',
    '^xiaohongshu\.com$'
];

// 存储键名
const CUSTOM_RULES_KEY = 'xhs_custom_domain_rules';

// 导出为全局变量
self.DEFAULT_DOMAIN_RULES = DEFAULT_DOMAIN_RULES;
self.CUSTOM_RULES_KEY = CUSTOM_RULES_KEY;

// 验证正则表达式的有效性
function isValidRegex(pattern) {
    try {
        new RegExp(pattern);
        return true;
    } catch (e) {
        return false;
    }
}

// 获取所有域名规则（包括默认规则和自定义规则）
self.getAllDomainRules = async function() {
    try {
        const customRules = await chrome.storage.local.get(CUSTOM_RULES_KEY);
        const rules = [...DEFAULT_DOMAIN_RULES];

        if (customRules[CUSTOM_RULES_KEY]) {
            rules.push(...customRules[CUSTOM_RULES_KEY]);
        }

        return rules;
    } catch (error) {
        console.error('获取域名规则失败:', error);
        return DEFAULT_DOMAIN_RULES;
    }
}

// 保存自定义域名规则
self.saveCustomDomainRule = async function(rule) {
    if (!isValidRegex(rule)) {
        throw new Error('无效的正则表达式');
    }

    try {
        const customRules = await chrome.storage.local.get(CUSTOM_RULES_KEY);
        const rules = customRules[CUSTOM_RULES_KEY] || [];

        if (!rules.includes(rule)) {
            rules.push(rule);
            await chrome.storage.local.set({ [CUSTOM_RULES_KEY]: rules });
        }

        return true;
    } catch (error) {
        console.error('保存域名规则失败:', error);
        throw error;
    }
}

// 删除自定义域名规则
async function removeCustomDomainRule(rule) {
    try {
        // 检查是否为默认规则，如果是则不允许删除
        if (DEFAULT_DOMAIN_RULES.includes(rule)) {
            throw new Error('默认规则不可删除');
        }
        
        const customRules = await chrome.storage.local.get(CUSTOM_RULES_KEY);
        const rules = customRules[CUSTOM_RULES_KEY] || [];
        const index = rules.indexOf(rule);

        if (index !== -1) {
            rules.splice(index, 1);
            await chrome.storage.local.set({ [CUSTOM_RULES_KEY]: rules });
        }

        return true;
    } catch (error) {
        console.error('删除域名规则失败:', error);
        throw error;
    }
}

// 检查域名是否匹配规则
async function isDomainMatched(domain) {
    const rules = await getAllDomainRules();

    return rules.some(rule => {
        try {
            const regex = new RegExp(rule);
            return regex.test(domain);
        } catch (e) {
            console.error(`规则 ${rule} 无效:`, e);
            return false;
        }
    });
}

// 导出为全局函数
self.isValidRegex = isValidRegex;
self.removeCustomDomainRule = removeCustomDomainRule;
self.isDomainMatched = isDomainMatched;