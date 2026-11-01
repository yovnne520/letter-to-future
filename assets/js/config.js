// ============================================================
//  API 配置（两种模式，二选一）
//
//  模式一 · 直连 DeepSeek（默认，当前启用）
//   - API_KEY 填你的 DeepSeek Key。
//   - ⚠️ GitHub Pages 是纯静态托管，Key 会暴露在公开仓库和浏览器里，
//     任何访客都能看到并盗用。仅建议个人/小范围演示使用。
//   - 也可在页面右上角 ⚙ 设置里填 Key（只存本机浏览器，不进仓库）。
//
//  模式二 · Cloudflare Worker 代理（推荐用于公开/大量访问，隐藏 Key）
//   1) 部署 cloudflare-worker.js（步骤见 CLOUDFLARE_SETUP.md），并设置
//      环境变量 DEEPSEEK_KEY = 你的 DeepSeek Key；
//   2) 把下方 WORKER_URL 填成你的 Worker 地址；
//   3) 把上方 API_KEY 清空（留空字符串 ""）。
//   这样 Key 只存在 Cloudflare 端，前端永不暴露。
// ============================================================
window.APP_CONFIG = {
  // —— 模式一字段 ——
  API_KEY: "sk-31b7740ccd31433c9c455e0fd09c94c9",
  BASE_URL: "https://api.deepseek.com/v1",
  MODEL: "deepseek-chat",
  TEMPERATURE: 0.9,
  // —— 模式二字段（部署好 Worker 后填写，并清空上面的 API_KEY）——
  WORKER_URL: ""
};
