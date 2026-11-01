# 用 Cloudflare Worker 隐藏 DeepSeek API Key

## 为什么需要它
本站点部署在 GitHub Pages（纯静态），`assets/js/config.js` 里的 DeepSeek Key 会随公开仓库和浏览器暴露，**任何访客都能看到并盗用**。用 Cloudflare Worker 做反向代理后，Key 只存在于 Cloudflare 的环境变量里，前端/仓库/浏览器中**永远看不到 Key**。

---

## 部署步骤（约 5 分钟，免费）

### 1. 注册 Cloudflare
打开 https://dash.cloudflare.com/sign-up 注册（免费，无需绑卡）。

### 2. 创建一个 Worker
- 左侧菜单 **Workers & Pages** → **Create** → 选 **Worker** → 命名（如 `letter-proxy`）→ **Deploy**（先随便部署一个占位）。

### 3. 粘贴代码
进入该 Worker → **Edit code**（或 Quick Edit），把本项目根目录 `cloudflare-worker.js` 的**全部内容**粘贴进去 → **Save and Deploy**。

### 4. 设置环境变量（把 Key 藏在这里）
- Worker → **Settings** → **Variables**（或 Secrets）→ 新增环境变量：
  - 名称：`DEEPSEEK_KEY`
  - 值：你的真实 DeepSeek Key（`sk-...`）
  - 建议勾选 **Encrypt**（加密存储）
- 保存后**重新 Deploy 一次**让变量生效。

### 5. 记下 Worker 地址
默认地址形如：`https://letter-proxy.<你的子域>.workers.dev`
（也可在 **Settings → Triggers** 里绑定你自己的域名。）

### 6. 改前端配置
打开本项目 `assets/js/config.js`：
```js
window.APP_CONFIG = {
  API_KEY: "",                         // ← 清空
  BASE_URL: "https://api.deepseek.com/v1",
  MODEL: "deepseek-chat",
  TEMPERATURE: 0.9,
  WORKER_URL: "https://letter-proxy.<你的子域>.workers.dev"  // ← 填你的 Worker 地址
};
```

### 7. 重新部署到 GitHub Pages
跟之前一样：`git push`（或联系助手用 API 直传），等 Pages 重建即可。

---

## 验证
打开网站测一次，能正常生成信件即成功。此时在浏览器 DevTools / 仓库里搜 `sk-`，**找不到任何 DeepSeek Key**。

## 费用
Cloudflare 免费额度每日 10 万次请求，个人和小站完全够用，无需付费。
