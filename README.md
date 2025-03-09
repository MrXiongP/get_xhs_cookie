# С����Cookie��ȡ��

![Chrome��չ](https://img.shields.io/badge/Chrome_Extension-v1.0-blue?logo=google-chrome)

רҵ��Chrome��չ���ߣ����ڰ�ȫ��ȡ�͹���С������վ��Cookie��Ϣ��֧�ֿ����ߵ��Ժ����ݷ�����

## ��������

? ���Ĺ���
- ����ʶ��С����������֧��*.xiaohongshu.com��
- һ����ȡ��ǰҳ������Cookie����
- ����ģ���Cookie�ֶ���֤
- ��ʱ���Ƶ�������
- ʵʱ������־��¼

? �߼�����
- �Զ�������ƥ�����
- Cookieģ�����ϵͳ
  - �����ֶ���֤
  - ��ѡ�ֶ�֧��
  - ģ�嵼�뵼��
- ��ݼ�֧��
- ��ϸ�Ĳ�����־

## ����ʵ��

- **���ļܹ�**
  - Chrome Extension MV3�ܹ�
  - Service Worker��̨����
  - ����Promise���첽����
  - ģ�黯�Ĵ�����֯

- **����ջ**
  - JavaScript ES6+
  - Chrome Extension APIs
    - Cookies API
    - Storage API
    - Scripting API
  - �Զ���洢������

## ��װָ��

### ����ģʽ��װ
1. ��¡�ֿ�
```bash
git clone https://github.com/your-repo/get_xhs.git
```
2. ��װ����
```bash
cd get_xhs
npm install  # �⽫����node_modulesĿ¼����װ���б�Ҫ������
```
3. ������Ŀ
```bash
npm run build  # ʹ��TailwindCSS��PostCSS������ʽ����
```

4. ������չ
   - ���� `chrome://extensions`
   - ���á�������ģʽ��
   - ����������ѽ�ѹ����չ����ѡ��`dist`Ŀ¼

### ����������װ
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/your-extension-id?label=Chrome%20Web%20Store)](https://chrome.google.com/webstore/detail/your-extension-id)

## ʹ���ĵ�

### ����ʹ��
1. ����С������վ������¼
2. �����չͼ�꼴�ɻ�ȡcookie�����а�
3. Ҳ���԰�סshift�������չͼ�꣬չ����չ���
4. �����Զ�����������ƥ������Cookieģ�壨����һ��cookie��ģ���У�Ȼ��������������ģ�棩

### ������API
```javascript
// ��ȡ��ǰCookie
chrome.runtime.sendMessage({
  action: 'getCookies',
  domain: 'xiaohongshu.com'
}, response => {
  console.log('Cookies:', response);
});
```

## Ȩ������

? ����չ��Ҫ����Ȩ�ޣ�
- `cookies`�����ڶ�ȡָ��������Cookie����
- `clipboardWrite`������Cookie��������
- `scripting`��ִ��ҳ��ű�����־��¼
- `storage`���洢Cookieģ�����������
- `host_permissions`������С�����������

## ����ָ��

��ӭͨ�����·�ʽ���빱�ף�
1. �ύIssue��������
2. Fork�ֿⲢ����Pull Request
3. ���Ƶ�Ԫ���ԣ�ʹ��Jest��ܣ�
4. �����ĵ����루֧�ֶ����ԣ�

## ��ȫ����

?? ע�����
- ����չ�����ϴ��κ��û�����
- �����ڹ����豸�ϱ�����������
- ���ڼ��Cookie��Ч��



## ���֤

[MIT License](LICENSE) ? 2024 Your Name