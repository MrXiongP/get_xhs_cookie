// 存储键名
const STORAGE_KEYS = {
    DOMAIN_RULES: 'xhs_domain_rules',
    COOKIE_TEMPLATES: 'xhs_cookie_templates'
};

// 存储结构管理类
class StorageManager {
    // 获取所有域名规则
    static async getAllDomainRules() {
        try {
            const data = await chrome.storage.local.get(STORAGE_KEYS.DOMAIN_RULES);
            const rules = data[STORAGE_KEYS.DOMAIN_RULES] || {};

            // 确保返回的规则包含默认规则
            if (!rules['xiaohongshu.com']) {
                rules['xiaohongshu.com'] = {
                    rules: ['.*xiaohongshu\.com', 'xiaohongshu\.com'],
                    template_id: 'xiaohongshu_template'
                };
                // 同时创建默认的Cookie模板
                const templates = await this.getAllCookieTemplates();
                if (!templates['xiaohongshu_template']) {
                    await this.saveCookieTemplate('xiaohongshu_template', 'xiaohongshu.com',
                        ['abRequestId', 'webId', 'gid', 'xsecappid'],
                        {
                            abRequestId: '[a-f0-9-]{36}',
                            webId: '[a-f0-9]{32}',
                            gid: 'yj[\\w]{50,60}',
                            xsecappid: 'xhs-pc-web',
                            webBuild: '\\d+\\.\\d+\\.\\d+',
                            web_session: '[a-f0-9]{40}',
                            acw_tc: '[a-f0-9]{32}',
                            websectiga: '[a-f0-9]{64}',
                            sec_poison_id: '[a-f0-9-]{36}',
                            loadts: '\\d{13}',
                            unread: '\\{.*\\}'
                        }
                    );
                }
            }
            return rules;
        } catch (error) {
            console.error('获取域名规则失败:', error);
            return {};
        }
    }

    // 保存域名规则
    static async saveDomainRule(domain, rules, templateId) {
        try {
            const allRules = await this.getAllDomainRules();
            allRules[domain] = {
                rules: rules,
                template_id: templateId
            };
            await chrome.storage.local.set({ [STORAGE_KEYS.DOMAIN_RULES]: allRules });
            return true;
        } catch (error) {
            console.error('保存域名规则失败:', error);
            throw error;
        }
    }

    // 获取所有Cookie模板
    static async getAllCookieTemplates() {
        try {
            const data = await chrome.storage.local.get(STORAGE_KEYS.COOKIE_TEMPLATES);
            return data[STORAGE_KEYS.COOKIE_TEMPLATES] || {};
        } catch (error) {
            console.error('获取Cookie模板失败:', error);
            return {};
        }
    }

    // 保存Cookie模板
    static async saveCookieTemplate(templateId, domain, requiredFields, template) {
        try {
            const allTemplates = await this.getAllCookieTemplates();
            allTemplates[templateId] = {
                domain: domain,
                requiredFields: requiredFields,
                template: template
            };
            await chrome.storage.local.set({ [STORAGE_KEYS.COOKIE_TEMPLATES]: allTemplates });
            return true;
        } catch (error) {
            console.error('保存Cookie模板失败:', error);
            throw error;
        }
    }

    // 根据域名获取Cookie模板
    static async getCookieTemplateByDomain(domain) {
        try {
            const domainRules = await this.getAllDomainRules();
            const domainRule = domainRules[domain];
            if (!domainRule || !domainRule.template_id) {
                return null;
            }

            const templates = await this.getAllCookieTemplates();
            return templates[domainRule.template_id] || null;
        } catch (error) {
            console.error('获取Cookie模板失败:', error);
            return null;
        }
    }

    // 数据迁移
    static async migrateData() {
        try {
            // 获取旧的自定义规则
            const oldCustomRules = await chrome.storage.local.get('xhs_custom_domain_rules');
            const oldTemplates = await chrome.storage.local.get('xhs_cookie_templates');

            // 转换旧的数据结构
            const domainRules = {};
            const cookieTemplates = {};

            // 添加默认规则
            const defaultRules = ['xiaohongshu.com'];
            domainRules['xiaohongshu.com'] = {
                rules: defaultRules.map(domain => `^${domain}$`),
                template_id: 'xiaohongshu_template'
            };

            // 添加自定义规则
            if (oldCustomRules['xhs_custom_domain_rules']) {
                oldCustomRules['xhs_custom_domain_rules'].forEach(rule => {
                    const domain = rule.replace(/[\^\$\*\.]/g, '');
                    if (!domainRules[domain]) {
                        domainRules[domain] = {
                            rules: [rule],
                            template_id: `${domain}_template`
                        };
                    } else {
                        domainRules[domain].rules.push(rule);
                    }
                });
            }

            // 添加Cookie模板
            if (oldTemplates['xhs_cookie_templates']) {
                Object.entries(oldTemplates['xhs_cookie_templates']).forEach(([templateId, template]) => {
                    cookieTemplates[templateId] = {
                        domain: template.domain,
                        requiredFields: template.requiredFields,
                        template: template.template
                    };
                });
            }

            // 保存新的数据结构
            await chrome.storage.local.set({
                [STORAGE_KEYS.DOMAIN_RULES]: domainRules,
                [STORAGE_KEYS.COOKIE_TEMPLATES]: cookieTemplates
            });

            return true;
        } catch (error) {
            console.error('数据迁移失败:', error);
            throw error;
        }
    }
}

// 导出为全局变量
self.StorageManager = StorageManager;