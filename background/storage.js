// �洢����
const STORAGE_KEYS = {
    DOMAIN_RULES: 'xhs_domain_rules',
    COOKIE_TEMPLATES: 'xhs_cookie_templates'
};

// �洢�ṹ������
class StorageManager {
    // ��ȡ������������͹�����ģ��
    static async getAllDomainRules() {
        try {
            const data = await chrome.storage.local.get(STORAGE_KEYS.DOMAIN_RULES);
            return data[STORAGE_KEYS.DOMAIN_RULES] || {};
        } catch (error) {
            console.error('��ȡ��������ʧ��:', error);
            return {};
        }
    }

    // ������������͹�����ģ��
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
            console.error('������������ʧ��:', error);
            throw error;
        }
    }

    // ��ȡ����Cookieģ��
    static async getAllCookieTemplates() {
        try {
            const data = await chrome.storage.local.get(STORAGE_KEYS.COOKIE_TEMPLATES);
            return data[STORAGE_KEYS.COOKIE_TEMPLATES] || {};
        } catch (error) {
            console.error('��ȡCookieģ��ʧ��:', error);
            return {};
        }
    }

    // ����Cookieģ��
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
            console.error('����Cookieģ��ʧ��:', error);
            throw error;
        }
    }

    // ����������ȡ������Cookieģ��
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
            console.error('��ȡCookieģ��ʧ��:', error);
            return null;
        }
    }

    // ����Ǩ��
    static async migrateData() {
        try {
            // ��ȡ�ɵ�����
            const oldCustomRules = await chrome.storage.local.get('xhs_custom_domain_rules');
            const oldTemplates = await chrome.storage.local.get('xhs_cookie_templates');

            // ת���������µ����ݽṹ
            const domainRules = {};
            const cookieTemplates = {};

            // ����Ĭ�Ϲ���
            const defaultRules = ['xiaohongshu.com'];
            domainRules['xiaohongshu.com'] = {
                rules: defaultRules.map(domain => `^${domain}$`),
                template_id: 'xiaohongshu_template'
            };

            // �����Զ������
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

            // ����Cookieģ��
            if (oldTemplates['xhs_cookie_templates']) {
                Object.entries(oldTemplates['xhs_cookie_templates']).forEach(([domain, template]) => {
                    const templateId = `${domain}_template`;
                    cookieTemplates[templateId] = {
                        domain: domain,
                        requiredFields: template.requiredFields,
                        template: template
                    };
                });
            }

            // �����µ����ݽṹ
            await chrome.storage.local.set({
                [STORAGE_KEYS.DOMAIN_RULES]: domainRules,
                [STORAGE_KEYS.COOKIE_TEMPLATES]: cookieTemplates
            });

            return true;
        } catch (error) {
            console.error('����Ǩ��ʧ��:', error);
            throw error;
        }
    }
}

// ����Ϊȫ�ֱ���
self.StorageManager = StorageManager;