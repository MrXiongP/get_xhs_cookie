// 存储键名
const COOKIE_TEMPLATES_KEY = 'xhs_cookie_templates';

// Cookie模板结构
class CookieTemplate {
    constructor(domain, requiredFields = [], optionalFields = []) {
        this.domain = domain;
        this.requiredFields = requiredFields;
        this.optionalFields = optionalFields;
    }

    static fromCookieString(domain, cookieString) {
        const cookies = cookieString.split(';').map(cookie => cookie.trim());
        const fields = cookies.map(cookie => cookie.split('=')[0]);
        return new CookieTemplate(domain, fields, []);
    }

    validate(cookieString) {
        const cookies = cookieString.split(';').map(cookie => cookie.trim());
        const fields = cookies.map(cookie => cookie.split('=')[0]);

        // 检查必填字段是否都存在
        const missingFields = this.requiredFields.filter(field => !fields.includes(field));
        if (missingFields.length > 0) {
            return {
                valid: false,
                missingFields,
                message: `缺少必需的Cookie字段: ${missingFields.join(', ')}`
            };
        }

        return {
            valid: true,
            message: '所有必需的Cookie字段都存在'
        };
    }
}

// 获取指定域名的Cookie模板
async function getCookieTemplate(domain) {
    try {
        const templates = await chrome.storage.local.get(COOKIE_TEMPLATES_KEY);
        const allTemplates = templates[COOKIE_TEMPLATES_KEY] || {};
        return allTemplates[domain] ?
            new CookieTemplate(
                domain,
                allTemplates[domain].requiredFields,
                allTemplates[domain].optionalFields
            ) : null;
    } catch (error) {
        console.error('获取Cookie模板失败:', error);
        return null;
    }
}

// 保存Cookie模板
async function saveCookieTemplate(template) {
    try {
        const templates = await chrome.storage.local.get(COOKIE_TEMPLATES_KEY);
        const allTemplates = templates[COOKIE_TEMPLATES_KEY] || {};

        allTemplates[template.domain] = {
            requiredFields: template.requiredFields,
            optionalFields: template.optionalFields
        };

        await chrome.storage.local.set({ [COOKIE_TEMPLATES_KEY]: allTemplates });
        return true;
    } catch (error) {
        console.error('保存Cookie模板失败:', error);
        throw error;
    }
}

// 从Cookie字符串创建并保存模板
async function createTemplateFromCookie(domain, cookieString) {
    const template = CookieTemplate.fromCookieString(domain, cookieString);
    await saveCookieTemplate(template);
    return template;
}

// 导出为全局变量
self.CookieTemplate = CookieTemplate;
self.getCookieTemplate = getCookieTemplate;
self.saveCookieTemplate = saveCookieTemplate;
self.createTemplateFromCookie = createTemplateFromCookie;