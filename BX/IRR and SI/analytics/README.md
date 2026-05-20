# 访客统计（路径 A）

静态站无法把访问记录写回仓库，需在页面里加载第三方统计脚本。

## 使用步骤

1. 编辑 `analytics/config.js`
2. 将 `enabled` 改为 `true`
3. **只配置下面三种之一**（不要同时填多个，否则只会按顺序优先加载 GA4）

## 方案一：Google Analytics 4（GA4）

1. 打开 [Google Analytics](https://analytics.google.com/)，创建媒体资源与「网站」数据流
2. 在数据流详情里复制 **衡量 ID**（格式 `G-` 开头）
3. 配置示例：

```javascript
window.IRR_SI_SITE_ANALYTICS = {
  enabled: true,
  ga4MeasurementId: "G-ABC12XYZ34",
  plausibleDomain: "",
  plausibleScriptSrc: "",
  umamiScriptUrl: "",
  umamiWebsiteId: "",
};
```

## 方案二：Plausible

1. 在 [Plausible](https://plausible.io/) 添加你的网站域名
2. 填写 **域名**（与浏览器地址栏里一致的主机名，不要带 `https://`）

```javascript
window.IRR_SI_SITE_ANALYTICS = {
  enabled: true,
  ga4MeasurementId: "",
  plausibleDomain: "yourusername.github.io",
  plausibleScriptSrc: "",
  umamiScriptUrl: "",
  umamiWebsiteId: "",
};
```

若使用 **自托管 Plausible**，可额外设置 `plausibleScriptSrc` 为你的 `script.js` 完整 URL（默认可不写，则用 `https://plausible.io/js/script.js`）。

## 方案三：Umami

1. 在 Umami 后台创建网站，复制 **网站 ID**
2. 复制实例提供的 **跟踪脚本地址**（如 `https://你的域名/script.js`）

```javascript
window.IRR_SI_SITE_ANALYTICS = {
  enabled: true,
  ga4MeasurementId: "",
  plausibleDomain: "",
  plausibleScriptSrc: "",
  umamiScriptUrl: "https://analytics.example.com/script.js",
  umamiWebsiteId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
};
```

## 部署后

推送到 GitHub Pages 使用的分支后，在对应产品后台查看实时访问（可能有数分钟延迟）。
