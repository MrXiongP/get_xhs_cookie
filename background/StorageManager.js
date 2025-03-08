/**
 * StorageManager.js
 * 用于统一管理域名规则和Cookie模板的存储
 */

class StorageManager {
    constructor() {
        this.domainRulesKey = 'xhs_domain_rules';
        this.cookieTemplatesKey = 'xhs_cookie_templates';
        this.domainRuleMapKey = 'xhs_domain_rule_map';
    }

    /**
     * 获取所有存储的数据
     * @returns {Promise<Object>} 包含域名规则和Cookie模板的数据对象
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
            console.error('获取所有数据失败:', error);
            throw error;
        }
    }

    /**
     * 导入数据
     * @param {Object} data 要导入的数据对象
     * @param {string} mode 导入模式: 'merge' 或 'overwrite'
     * @returns {Promise<void>}
     */
    async importData(data, mode = 'merge') {
        try {
            if (!data.domain_rules || !data.cookie_templates) {
                throw new Error('数据格式不正确，缺少必要的字段');
            }

            // 根据模式决定如何处理现有数据
            if (mode === 'overwrite') {
                // 覆盖模式：直接替换所有数据
                await this.saveAllData(data);
            } else {
                // 合并模式：保留现有数据，添加新数据
                const currentData = await this.getAllData();
                
                // 合并域名规则
                const mergedDomainRules = {
                    ...currentData.domain_rules,
                    ...data.domain_rules
                };
                
                // 合并Cookie模板
                const mergedCookieTemplates = {
                    ...currentData.cookie_templates,
                    ...data.cookie_templates
                };
                
                // 保存合并后的数据
                await this.saveAllData({
                    domain_rules: mergedDomainRules,
                    cookie_templates: mergedCookieTemplates
                });
            }

            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            throw error;
        }
    }

    /**
     * 保存所有数据
     * @param {Object} data 要保存的数据对象
     * @returns {Promise<void>}
     */
    async saveAllData(data) {
        try {
            // 提取域名规则列表
            const domainRules = [];
            for (const domain in data.domain_rules) {
                if (data.domain_rules[domain].rules) {
                    domainRules.push(...data.domain_rules[domain].rules);
                }
            }

            // 保存数据到存储
            await chrome.storage.local.set({
                [this.domainRulesKey]: domainRules,
                [this.cookieTemplatesKey]: data.cookie_templates,
                [this.domainRuleMapKey]: data.domain_rules
            });

            return true;
        } catch (error) {
            console.error('保存所有数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取域名规则映射
     * @returns {Promise<Object>} 域名规则映射对象
     */
    async getDomainRuleMap() {
        try {
            const result = await chrome.storage.local.get(this.domainRuleMapKey);
            return result[this.domainRuleMapKey] || {};
        } catch (error) {
            console.error('获取域名规则映射失败:', error);
            throw error;
        }
    }

    /**
     * 获取Cookie模板
     * @returns {Promise<Object>} Cookie模板对象
     */
    async getCookieTemplates() {
        try {
            const result = await chrome.storage.local.get(this.cookieTemplatesKey);
            return result[this.cookieTemplatesKey] || {};
        } catch (error) {
            console.error('获取Cookie模板失败:', error);
            throw error;
        }
    }
}

// 导出StorageManager类
export default StorageManager;