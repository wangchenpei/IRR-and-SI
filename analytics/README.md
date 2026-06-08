# 访客统计（路径 A）

静态站无法把访问记录写回仓库，需在页面里加载第三方统计脚本，或把访问事件发送到自有计数接口。

## 使用步骤

1. 编辑 `analytics/config.js`
2. 将 `enabled` 改为 `true`
3. **第三方统计只配置下面三种之一**（不要同时填多个，否则只会按顺序优先加载 GA4）
4. 如需补充“打开次数”统计，可额外配置「自有轻量访问计数接口」，它可与 GA4 同时使用

## 可选：自有轻量访问计数接口

仓库提供 `analytics/visitor-counter-worker.js`，可部署为 Cloudflare Worker，并使用 Cloudflare KV 保存计数。它只记录访问次数，不依赖 GA4，因此对广告拦截器更不敏感。

### Worker 部署概要

1. 在 Cloudflare Workers 创建一个 Worker
2. 创建一个 KV namespace，并绑定到 Worker，变量名必须为 `VISIT_COUNTER`
3. 将 `analytics/visitor-counter-worker.js` 内容复制到 Worker
4. 设置环境变量：
   - `ALLOWED_ORIGIN`：`https://wangchenpei.github.io`
   - `READ_TOKEN`：自定义一个查询统计用的 token
5. 部署后得到 Worker 地址，例如：

```text
https://irr-si-counter.yourname.workers.dev
```

### 页面配置

把 Worker 的 `/hit` 地址填入 `analytics/config.js`：

```javascript
window.IRR_SI_SITE_ANALYTICS = {
  enabled: true,
  ga4MeasurementId: "G-43LVQ35QT7",
  selfHostedCounterEndpoint: "https://irr-si-counter.yourname.workers.dev/hit",
  plausibleDomain: "",
  plausibleScriptSrc: "",
  umamiScriptUrl: "",
  umamiWebsiteId: "",
};
```

### 查看自有计数

访问：

```text
https://irr-si-counter.yourname.workers.dev/stats?token=你的READ_TOKEN
```

返回示例：

```json
{
  "ok": true,
  "total": 123,
  "today": 5,
  "date": "2026-05-31"
}
```

说明：KV 计数非常轻量，适合个人工具站。极高并发时 KV 自增不是强一致计数；若以后访问量很大，可升级到 D1 / Durable Object。

## 方案一：Google Analytics 4（GA4）

1. 打开 [Google Analytics](https://analytics.google.com/)，创建媒体资源与「网站」数据流
2. 在数据流详情里复制 **衡量 ID**（格式 `G-` 开头）
3. 配置示例：

```javascript
window.IRR_SI_SITE_ANALYTICS = {
  enabled: true,
  ga4MeasurementId: "G-ABC12XYZ34",
  selfHostedCounterEndpoint: "",
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
  selfHostedCounterEndpoint: "",
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
  selfHostedCounterEndpoint: "",
  plausibleDomain: "",
  plausibleScriptSrc: "",
  umamiScriptUrl: "https://analytics.example.com/script.js",
  umamiWebsiteId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
};
```

## 部署后

推送到 GitHub Pages 使用的分支后，在对应产品后台查看实时访问（可能有数分钟延迟）。

### GA4 看不到数据时可排查

- **衡量 ID** 须与 GA4 数据流里一致（本仓库默认 `G-43LVQ35QT7`，改 ID 时只改 `analytics/config.js` 即可）。
- **实时报告**：左侧「报告 → 实时」；新属性有时需 **24～48 小时** 后标准报告才有数据。
- **浏览器**：关闭广告拦截 / 隐私扩展后试访问；或用 Chrome 安装 **Google Tag Assistant** / **GA Debugger** 看是否发出 `collect` 请求。
- **网址**：数据流里填的网址应与实际访问一致（如 `https://wangchenpei.github.io/IRR-and-SI/`）。
- **脚本路径**：页面依赖 `https://…/IRR-and-SI/analytics/config.js` 能返回 **200**（勿删仓库根目录下 `analytics/` 文件夹）。
