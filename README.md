# 写给未来你的一封信 · AI 性格/情感测评网站

回答 12 个轻量问题，AI 以「五年后的你」的口吻，写一封**具体、温暖、有被看见感**的信给现在的自己，并生成可分享的卡片。

纯静态站点（HTML/CSS/JS），可一键部署到 GitHub Pages。

---

## 1. 配置 API Key（二选一）

**方式 A：写入配置文件（推荐用于公开部署）**
打开 `assets/js/config.js`，把 `API_KEY` 替换成你的 DeepSeek Key：
```js
window.APP_CONFIG = {
  API_KEY: "sk-xxxx",                 // 换成你的 Key
  BASE_URL: "https://api.deepseek.com/v1",
  MODEL: "deepseek-chat",
  TEMPERATURE: 0.9
};
```
> ⚠️ Key 会暴露在公开仓库和浏览器中，任何访客都能看到并盗用。**仅建议个人/小范围演示**。公开大规模使用请改用方式 B 或 Cloudflare 代理（见第 4 节）。

**方式 B：页面内设置（不暴露给仓库）**
部署后，点页面右上角 ⚙，填入 Key，仅保存在你本机浏览器（localStorage）。适合自己试用、不想提交 Key。

---

## 2. 本地预览
```bash
# 在项目根目录
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```
首次打开若点「生成」提示要 Key，用方式 B 填入即可。

---

## 3. 部署到 GitHub Pages

**最简（用 GitHub CLI）：**
```bash
bash deploy.sh          # 自动 git 初始化、建仓、推送、开启 Pages
```
运行前请先 `gh auth login` 登录你的 GitHub 账号。

**手动：**
1. 在 GitHub 新建一个公开仓库（如 `letter-to-future`）。
2. 本地：
   ```bash
   git init
   git add .
   git commit -m "init: 写给未来你的一封信"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```
3. 仓库 → Settings → Pages → Source 选 `main` / `root` → Save。
4. 等待约 1 分钟，访问 `https://<用户名>.github.io/<仓库名>/`。

---

## 4. 安全升级：用 Cloudflare Worker 隐藏 Key（可选但推荐）

GitHub Pages 无法隐藏前端密钥。若要公开且不被盗刷：
1. 注册 Cloudflare，新建 Worker。
2. 把 DeepSeek 调用放进 Worker，Key 存在 Worker 环境变量；前端只调你的 Worker。
3. `config.js` 的 `BASE_URL` 改成你的 Worker 地址，删掉前端 Key。

这样 Key 不落在浏览器，且可加限流防滥用。

---

## 文件结构
```
index.html              页面结构（落地/问卷/生成中/结果/弹窗）
assets/css/style.css    样式
assets/js/config.js     API 配置（填 Key 的地方）
assets/js/app.js        逻辑：问卷 / 调模型 / 渲染 / 分享卡
测评结果分析设计.md      产品分析设计文档
deploy.sh               一键部署脚本
```
