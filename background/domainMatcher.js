// 默认的小红书域名规则
const DEFAULT_DOMAIN_RULES = [
    '.*xiaohongshu\.com',
    'xiaohongshu\.com'
];

// 导出为全局变量
self.DEFAULT_DOMAIN_RULES = DEFAULT_DOMAIN_RULES;

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
self.getAllDomainRules = async function () {
    try {
        // 使用新的StorageManager获取域名规则
        const domainRules = await StorageManager.getAllDomainRules();

        // 将新的数据结构转换为旧的格式，以保持向后兼容性
        let rules = [...DEFAULT_DOMAIN_RULES];

        // 添加自定义规则
        Object.values(domainRules).forEach(domainRule => {
            if (domainRule.rules && Array.isArray(domainRule.rules)) {
                rules = [...rules, ...domainRule.rules];
            }
        });

        // 去重
        rules = [...new Set(rules)];

        return rules;
    } catch (error) {
        console.error('获取域名规则失败:', error);
        return DEFAULT_DOMAIN_RULES;
    }
}

// 保存自定义域名规则
self.saveCustomDomainRule = async function (rule) {
    if (!isValidRegex(rule)) {
        throw new Error('无效的正则表达式');
    }

    try {
        // 从规则中提取域名
        const domain = rule.replace(/[\^\$\*\.]/g, '');

        // 获取现有规则
        const domainRules = await StorageManager.getAllDomainRules();
        const templateId = `${domain}_template`;

        if (domainRules[domain]) {
            // 如果域名已存在，添加新规则
            if (!domainRules[domain].rules.includes(rule)) {
                domainRules[domain].rules.push(rule);
                await StorageManager.saveDomainRule(
                    domain,
                    domainRules[domain].rules,
                    domainRules[domain].template_id
                );
            }
        } else {
            // 如果域名不存在，创建新记录
            await StorageManager.saveDomainRule(domain, [rule], templateId);
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

        // 从规则中提取域名
        const domain = rule.replace(/[\^\$\*\.]/g, '');

        // 获取现有规则
        const domainRules = await StorageManager.getAllDomainRules();

        if (domainRules[domain] && domainRules[domain].rules) {
            const rules = domainRules[domain].rules;
            const index = rules.indexOf(rule);

            if (index !== -1) {
                rules.splice(index, 1);

                if (rules.length > 0) {
                    // 如果还有其他规则，更新规则列表
                    await StorageManager.saveDomainRule(
                        domain,
                        rules,
                        domainRules[domain].template_id
                    );
                } else {
                    // 如果没有规则了，删除整个域名记录
                    const allRules = await StorageManager.getAllDomainRules();
                    delete allRules[domain];
                    await chrome.storage.local.set({ 'xhs_domain_rules': allRules });
                }
            }
        }

        return true;
    } catch (error) {
        console.error('删除域名规则失败:', error);
        throw error;
    }
}

// 检查域名是否匹配规则
async function isDomainMatched(domain) {
    // 获取所有域名规则
    const domainRules = await StorageManager.getAllDomainRules();

    // 首先检查默认规则
    const isMatchedWithDefault = DEFAULT_DOMAIN_RULES.some(pattern => {
        try {
            const regex = new RegExp(pattern);
            return regex.test(domain);
        } catch (e) {
            console.error(`规则 ${pattern} 无效:`, e);
            return false;
        }
    });

    if (isMatchedWithDefault) {
        return true;
    }

    // 检查自定义规则
    const matchedDomain = Object.entries(domainRules).find(([_, rule]) => {
        return rule.rules.some(pattern => {
            try {
                const regex = new RegExp(pattern);
                return regex.test(domain);
            } catch (e) {
                console.error(`规则 ${pattern} 无效:`, e);
                return false;
            }
        });
    });

    return !!matchedDomain;
}

// 导出为全局函数
self.isValidRegex = isValidRegex;
self.removeCustomDomainRule = removeCustomDomainRule;
self.isDomainMatched = isDomainMatched;