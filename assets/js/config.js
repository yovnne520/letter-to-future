// ============================================================
//  API 配置
//  把 API_KEY 替换成你在 DeepSeek 后台拿到的 Key。
//  ⚠️ 安全提醒：GitHub Pages 是纯静态托管，Key 会暴露在公开仓库
//  和浏览器中，任何访客都能看到并盗用。仅建议个人/小范围演示使用。
//  若要公开大规模使用，请加 Cloudflare Worker 做代理隐藏 Key。
//  （也可用页面右上角 ⚙ 设置，Key 只存在你本机浏览器。）
// ============================================================
window.APP_CONFIG = {
  API_KEY: "在此粘贴你的DeepSeek API Key",
  BASE_URL: "https://api.deepseek.com/v1",
  MODEL: "deepseek-chat",
  TEMPERATURE: 0.9
};
