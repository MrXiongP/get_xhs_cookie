/**
 * StorageManager.js
 * ����ͳһ�������������Cookieģ��Ĵ洢
 */

class StorageManager {
    constructor() {
        this.domainRulesKey = 'xhs_domain_rules';
        this.cookieTemplatesKey = 'xhs_cookie_templates';
        this.domainRuleMapKey = 'xhs_domain_rule_map';
    }

    /**
     * ��ȡ���д洢������
     * @returns {Promise<Object>} �������������Cookieģ������ݶ���
     */
    async getAllData() {
        try {
            const result = await chrome.storage.local.get([
                this.domainRulesKey,
                this.cookieTemplatesKey,
                this.domainRuleMapKey
            ]);

            return {
                domain_rules: result[this.domainRuleMapKey] || {},
                cookie_templates: result[this.cookieTemplatesKey] || {}
            };
        } catch (error) {
            console.error('��ȡ��������ʧ��:', error);
            throw error;
        }
    }

    /**
     * ��������
     * @param {Object} data Ҫ��������ݶ���
     * @param {string} mode ����ģʽ: 'merge' �� 'overwrite'
     * @returns {Promise<void>}
     */
    async importData(data, mode = 'merge') {
        try {
            if (!data.domain_rules || !data.cookie_templates) {
                throw new Error('���ݸ�ʽ����ȷ��ȱ�ٱ�Ҫ���ֶ�');
            }

            // ����ģʽ������δ�����������
            if (mode === 'overwrite') {
                // ����ģʽ��ֱ���滻��������
                await this.saveAllData(data);
            } else {
                // �ϲ�ģʽ�������������ݣ����������
                const currentData = await this.getAllData();
                
                // �ϲ���������
                const mergedDomainRules = {
                    ...currentData.domain_rules,
                    ...data.domain_rules
                };
                
                // �ϲ�Cookieģ��
                const mergedCookieTemplates = {
                    ...currentData.cookie_templates,
                    ...data.cookie_templates
                };
                
                // ����ϲ��������
                await this.saveAllData({
                    domain_rules: mergedDomainRules,
                    cookie_templates: mergedCookieTemplates
                });
            }

            return true;
        } catch (error) {
            console.error('��������ʧ��:', error);
            throw error;
        }
    }

    /**
     * ������������
     * @param {Object} data Ҫ��������ݶ���
     * @returns {Promise<void>}
     */
    async saveAllData(data) {
        try {
            // ��ȡ���������б�
            const domainRules = [];
            for (const domain in data.domain_rules) {
                if (data.domain_rules[domain].rules) {
                    domainRules.push(...data.domain_rules[domain].rules);
                }
            }

            // �������ݵ��洢
            await chrome.storage.local.set({
                [this.domainRulesKey]: domainRules,
                [this.cookieTemplatesKey]: data.cookie_templates,
                [this.domainRuleMapKey]: data.domain_rules
            });

            return true;
        } catch (error) {
            console.error('������������ʧ��:', error);
            throw error;
        }
    }

    /**
     * ��ȡ��������ӳ��
     * @returns {Promise<Object>} ��������ӳ�����
     */
    async getDomainRuleMap() {
        try {
            const result = await chrome.storage.local.get(this.domainRuleMapKey);
            return result[this.domainRuleMapKey] || {};
        } catch (error) {
            console.error('��ȡ��������ӳ��ʧ��:', error);
            throw error;
        }
    }

    /**
     * ��ȡCookieģ��
     * @returns {Promise<Object>} Cookieģ�����
     */
    async getCookieTemplates() {
        try {
            const result = await chrome.storage.local.get(this.cookieTemplatesKey);
            return result[this.cookieTemplatesKey] || {};
        } catch (error) {
            console.error('��ȡCookieģ��ʧ��:', error);
            throw error;
        }
    }
}

// ����StorageManager��
export default StorageManager;