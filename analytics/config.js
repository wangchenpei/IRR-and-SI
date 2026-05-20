/**
 * 访客统计：默认关闭。编辑下方对象后提交仓库即可在 Pages 生效。
 * 说明见同目录 README.md
 */
window.IRR_SI_SITE_ANALYTICS = {
  /** 是否加载统计脚本；为 false 时下面 ID 填了也不会请求第三方 */
  enabled: true,

  /** Google Analytics 4：衡量 ID，形如 G-XXXXXXXX */
  ga4MeasurementId: "G-43LVQ35QT7",

  /** Plausible：站点 hostname，如 wangchenpei.github.io */
  plausibleDomain: "",
  /** 自建 Plausible 时改为你的 script.js 完整 URL；留空则用 plausible.io */
  plausibleScriptSrc: "",

  /** Umami：脚本 URL 与网站 ID */
  umamiScriptUrl: "",
  umamiWebsiteId: "",
};

(function () {
  var C = window.IRR_SI_SITE_ANALYTICS;
  if (!C || !C.enabled) {
    return;
  }

  if (C.ga4MeasurementId && String(C.ga4MeasurementId).indexOf("G-") === 0) {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", C.ga4MeasurementId);
    var g = document.createElement("script");
    g.async = true;
    g.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(C.ga4MeasurementId);
    document.head.appendChild(g);
    return;
  }

  if (C.plausibleDomain) {
    var p = document.createElement("script");
    p.defer = true;
    p.setAttribute("data-domain", C.plausibleDomain);
    p.src =
      C.plausibleScriptSrc && String(C.plausibleScriptSrc).length > 0
        ? C.plausibleScriptSrc
        : "https://plausible.io/js/script.js";
    document.head.appendChild(p);
    return;
  }

  if (C.umamiScriptUrl && C.umamiWebsiteId) {
    var u = document.createElement("script");
    u.defer = true;
    u.src = C.umamiScriptUrl;
    u.setAttribute("data-website-id", C.umamiWebsiteId);
    document.head.appendChild(u);
  }
})();
