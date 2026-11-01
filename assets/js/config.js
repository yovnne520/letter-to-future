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
  WORKER_URL: "",

  // ============================================================
  //  付费解锁配置（客户付 ¥3.99 获得兑换码，解锁完整信件 + 分享卡）
  //  当前为纯前端 v1：兑换码用「密钥 + 校验位」算法生成，无需后端码池。
  //  ⚠️ 纯前端方案下 UNLOCK_SECRET 会随公开仓库暴露，懂技术者可逆向造码，
  //     仅适合小范围 / 验证期。要真正防伪造 + 防白嫖，请部署 Cloudflare
  //     Worker（cloudflare-worker.js 已预留核销接口）把 Key 与核销都藏到服务端。
  // ============================================================
  // 兑换码校验密钥（生成器 codes.html 与本站须用同一串）
  UNLOCK_SECRET: "letter2future-2026-yovnne",
  // 预览字数：未解锁时只显示信件前这么多字，其余遮住
  PREVIEW_CHARS: 150,
  // 价格展示
  PAY_PRICE: "3.99",
  // 购买引导：替换为你的收款方式（微信小店链接 / 客服微信 / 商品页）
  PAY_INFO: "微信搜索「未来信使小铺」或加客服微信 future-letter 付款后，自动获得解锁码",
  // 购买跳转链接（有微信小店/商品页就填，没有留空则只显示上面的文案）
  PAY_URL: ""
};
