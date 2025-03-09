# 小红书Cookie获取器

![Chrome扩展](https://img.shields.io/badge/Chrome_Extension-v1.0-blue?logo=google-chrome)

专业的Chrome扩展工具，用于安全获取和管理小红书网站的Cookie信息，支持开发者调试和数据分析。

## 功能特性

? 核心功能
- 智能识别小红书域名（支持*.xiaohongshu.com）
- 一键获取当前页面完整Cookie集合
- 基于模板的Cookie字段验证
- 即时复制到剪贴板
- 实时操作日志记录

? 高级功能
- 自定义域名匹配规则
- Cookie模板管理系统
  - 必填字段验证
  - 可选字段支持
  - 模板导入导出
- 快捷键支持
- 详细的操作日志

## 技术实现

- **核心架构**
  - Chrome Extension MV3架构
  - Service Worker后台服务
  - 基于Promise的异步处理
  - 模块化的代码组织

- **技术栈**
  - JavaScript ES6+
  - Chrome Extension APIs
    - Cookies API
    - Storage API
    - Scripting API
  - 自定义存储管理器

## 安装指南

### 开发模式安装
1. 克隆仓库
```bash
git clone https://github.com/your-repo/get_xhs.git
```
2. 安装依赖
```bash
cd get_xhs
npm install  # 这将创建node_modules目录并安装所有必要的依赖
```
3. 构建项目
```bash
npm run build  # 使用TailwindCSS和PostCSS进行样式构建
```

4. 加载扩展
   - 访问 `chrome://extensions`
   - 启用「开发者模式」
   - 点击「加载已解压的扩展程序」选择`dist`目录

### 生产环境安装
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/your-extension-id?label=Chrome%20Web%20Store)](https://chrome.google.com/webstore/detail/your-extension-id)

## 使用文档

### 基础使用
1. 访问小红书网站，并登录
2. 点击扩展图标即可获取cookie到剪切板
3. 也可以按住shift键点击扩展图标，展开扩展面板
4. 可以自定义设置域名匹配规则和Cookie模板（复制一段cookie到模板中，然后点击分析并保存模版）

### 开发者API
```javascript
// 获取当前Cookie
chrome.runtime.sendMessage({
  action: 'getCookies',
  domain: 'xiaohongshu.com'
}, response => {
  console.log('Cookies:', response);
});
```

## 权限声明

? 本扩展需要以下权限：
- `cookies`：用于读取指定域名的Cookie数据
- `clipboardWrite`：复制Cookie到剪贴板
- `scripting`：执行页面脚本和日志记录
- `storage`：存储Cookie模板和域名规则
- `host_permissions`：访问小红书相关域名

## 贡献指南

欢迎通过以下方式参与贡献：
1. 提交Issue报告问题
2. Fork仓库并创建Pull Request
3. 完善单元测试（使用Jest框架）
4. 更新文档翻译（支持多语言）

## 安全声明

?? 注意事项：
- 本扩展不会上传任何用户数据
- 请勿在公共设备上保存敏感配置
- 定期检查Cookie有效期



## 许可证

[MIT License](LICENSE) ? 2024 Your Name