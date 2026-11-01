/* ============================================================
   写给未来你的一封信 —— 前端逻辑
   ============================================================ */

// ---------- 问卷定义 ----------
const QUESTIONS = [
  { id: "stage",   label: "你目前处在人生的哪个阶段？", type: "single",
    options: ["学生", "刚工作", "打拼中", "转型期", "其他"] },
  { id: "worry",   label: "最近让你最操心的一件事是什么？", type: "text", placeholder: "一句话说说就好" },
  { id: "state",   label: "如果给「现在的自己」拍张状态照，你会用什么词形容？", type: "text", placeholder: "2–4 个词，比如「紧绷但清醒」" },
  { id: "persist", label: "你有没有默默坚持过一件别人不知道的小事？", type: "text", placeholder: "哪怕很小，比如每天走路回家" },
  { id: "desire",  label: "你最希望未来的自己拥有了什么？", type: "single",
    options: ["内心平静", "事业成就", "爱与被爱", "自由", "健康", "其他"] },
  { id: "strength",label: "你觉得自己身上最被低估的一个优点是什么？", type: "text", placeholder: "比如「其实很能扛事」" },
  { id: "fear",    label: "你最害怕未来失去什么？", type: "single",
    options: ["关系", "热情", "健康", "稳定", "自我"] },
  { id: "ideal",   label: "你想象中「过得好的自己」一天是怎样的？", type: "text", placeholder: "一两个画面即可" },
  { id: "unsaid",  label: "你最想对现在的自己说、却一直没说出口的一句话？", type: "text", placeholder: "也许是「你已经很好了」" },
  { id: "charge",  label: "你平时靠什么给自己充电 / 疗愈？", type: "single",
    options: ["独处", "朋友", "创作", "运动", "美食", "其他"] },
  { id: "proud",   label: "你人生里最骄傲的一个小瞬间？", type: "text", placeholder: "不必宏大，真实的就好" },
  { id: "hug",     label: "如果五年后的你回来看现在，ta 最想抱抱你是因为什么？", type: "text", placeholder: "比如「你一个人撑了很久」" }
];

const FUTURE_YEAR = new Date().getFullYear() + 5;

// 分享卡二维码指向的站点地址（本地打开时回退到线上地址）
const SHARE_URL = (location.protocol === "file:")
  ? "https://yovnne520.github.io/letter-to-future/"
  : (location.origin + location.pathname);

// 分享卡 AI 氛围背景图（出图版）；图片未加载完成时回退到渐变
const CARD_BG_PATHS = ["assets/img/bg-dawn.png", "assets/img/bg-star.png", "assets/img/bg-letter.png"];
const cardBgImages = [];
function preloadCardBgs() {
  CARD_BG_PATHS.forEach(p => {
    const img = new Image();
    img.src = p;
    cardBgImages.push(img);
  });
}
function pickCardBg() {
  const loaded = cardBgImages.filter(i => i.complete && i.naturalWidth > 0);
  if (!loaded.length) return null;
  return loaded[Math.floor(Math.random() * loaded.length)];
}
// 等比 cover 铺满画布（保持比例，居中裁剪，避免拉伸变形）
function drawCover(ctx, img, W, H) {
  const ir = img.width / img.height, cr = W / H;
  let sw, sh, sx, sy;
  if (ir > cr) { sh = img.height; sw = sh * cr; sx = (img.width - sw) / 2; sy = 0; }
  else { sw = img.width; sh = sw / cr; sx = 0; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
}

// ---------- 状态 ----------
const answers = {};
let lastResult = null;

// ---------- 工具 ----------
function $(sel) { return document.querySelector(sel); }
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $("#" + id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function toast(msg) {
  let t = $("#toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast"; t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2600);
}

// ---------- 配置合并（config.js + localStorage） ----------
function getConfig() {
  const base = window.APP_CONFIG || {};
  let local = {};
  try { local = JSON.parse(localStorage.getItem("app_cfg") || "{}"); } catch (e) {}
  return Object.assign({}, base, local);
}

// ---------- 渲染问卷 ----------
function renderQuestions() {
  const form = $("#quizForm");
  form.innerHTML = "";
  QUESTIONS.forEach((q, i) => {
    const block = document.createElement("div");
    block.className = "q-block";
    block.dataset.qid = q.id;

    const label = document.createElement("label");
    label.className = "q-label";
    label.innerHTML = `<span class="q-num">Q${i + 1}</span>${q.label}`;
    block.appendChild(label);

    if (q.type === "single") {
      const wrap = document.createElement("div");
      wrap.className = "q-options";
      q.options.forEach(opt => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "opt";
        b.textContent = opt;
        b.onclick = () => {
          wrap.querySelectorAll(".opt").forEach(o => o.classList.remove("selected"));
          b.classList.add("selected");
          answers[q.id] = opt;
          block.classList.remove("warn");
        };
        wrap.appendChild(b);
      });
      block.appendChild(wrap);
    } else {
      const ta = document.createElement("textarea");
      ta.className = "q-input";
      ta.placeholder = q.placeholder || "";
      ta.oninput = () => {
        answers[q.id] = ta.value.trim();
        if (ta.value.trim()) block.classList.remove("warn");
      };
      block.appendChild(ta);
    }
    form.appendChild(block);
  });
}

// ---------- 校验 ----------
function validate() {
  let firstBad = null;
  for (const q of QUESTIONS) {
    const block = document.querySelector(`.q-block[data-qid="${q.id}"]`);
    const ok = answers[q.id] && String(answers[q.id]).trim().length > 0;
    if (!ok) {
      block.classList.add("warn");
      if (!firstBad) firstBad = block;
    }
  }
  if (firstBad) {
    firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
    toast("还有题目没填完哦");
    return false;
  }
  return true;
}

// ---------- 调用大模型 ----------
async function callLLM() {
  const cfg = getConfig();
  const useWorker = !!(cfg.WORKER_URL && String(cfg.WORKER_URL).trim());

  const sys = `你是一个温柔、真诚、擅长共情的"未来信使"。根据一个人对当下生活的回答，以"五年后的Ta"的口吻，写一封给现在自己的信。
要求：
1) 用第二人称"你"；
2) 必须具体、有温度，严禁空话套话（禁止出现"你有时内向有时外向""只要努力就会成功"这类废话）；
3) 先承认对方此刻的真实艰难，再给光，不要廉价鸡汤，不要贬低对方此刻的痛苦；
4) 自然融入对方回答里的细节（坚持的小事、被低估的优点、害怕失去的、骄傲的瞬间等）；
5) 正文不超过 520 字，段落清晰；
6) 额外输出：一句可用于分享的"金句"（不超过 24 字）、一个"未来人格标签"（不超过 8 字，温暖有辨识度）、一个 1-5 的整数"治愈度评分"（代表这封信对当下的治愈程度）。
只输出 JSON，结构严格为：{"letter":"...","tagline":"...","tag":"...","rating":5}`;

  const user = "以下是某人的回答：\n" +
    QUESTIONS.map(q => `${q.label}：${answers[q.id]}`).join("\n");

  const body = {
    model: cfg.MODEL,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user }
    ],
    temperature: cfg.TEMPERATURE != null ? cfg.TEMPERATURE : 0.9
  };

  let endpoint, headers;
  if (useWorker) {
    // 走 Cloudflare Worker 代理：Key 存在 Worker 端环境变量，前端不暴露
    endpoint = String(cfg.WORKER_URL).trim();
    headers = { "Content-Type": "application/json" };
  } else {
    if (!cfg.API_KEY || String(cfg.API_KEY).startsWith("在此")) {
      throw new Error("请先在右上角 ⚙ 设置里填入 API Key，或配置 Worker 代理");
    }
    endpoint = cfg.BASE_URL.replace(/\/$/, "") + "/chat/completions";
    headers = { "Content-Type": "application/json", "Authorization": "Bearer " + cfg.API_KEY };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error("接口返回 " + res.status + (txt ? "：" + txt.slice(0, 120) : ""));
  }
  const j = await res.json();
  const content = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
  return parseResult(content);
}

function parseResult(raw) {
  try {
    let s = String(raw).trim();
    s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const a = s.indexOf("{");
    const b = s.lastIndexOf("}");
    if (a >= 0 && b >= 0) s = s.slice(a, b + 1);
    const obj = JSON.parse(s);
    return {
      letter: String(obj.letter || "").trim(),
      tagline: String(obj.tagline || "").trim(),
      tag: String(obj.tag || "").trim(),
      rating: Math.max(1, Math.min(5, parseInt(obj.rating, 10) || 5))
    };
  } catch (e) {
    return fallbackResult();
  }
}

// 解析失败兜底：用用户原话拼一封温和的信
function fallbackResult() {
  const stage = answers.stage || "此刻";
  const state = answers.state || "正在努力的自己";
  const proud = answers.proud || "你扛过的那些小事";
  const unsaid = answers.unsaid || "你已经做得很好了";
  const letter =
`亲爱的你：

我是五年后的你。刚才翻到这一年的你，突然很想抱抱那个${state}的自己。

我知道${stage}的日子并不轻松，很多事你都是一个人撑过来的——${proud}，这些别人未必看见，但我都记得。

你问过自己一句话：${unsaid}。我想告诉你，这句话是真的。你不需要先变成谁，才值得被爱。

往后的路还长，但我保证，那个更从容、更自由的我，是从现在这个你一点点长出来的。别急。

未来的你，一直都在。`;
  return {
    letter,
    tagline: "你不需要先变成谁，才值得被爱",
    tag: "温柔的长期主义者",
    rating: 5
  };
}

// ---------- 渲染结果 ----------
function renderResult(data) {
  lastResult = data;
  $("#futureYear").textContent = FUTURE_YEAR;
  $("#letterBox").textContent = data.letter;
  $("#tagBadge").textContent = data.tag || "未来的你";
  $("#tagline").textContent = data.tagline || "";
  const stars = $("#stars");
  stars.textContent = "★★★★★".slice(0, data.rating) + "☆☆☆☆☆".slice(0, 5 - data.rating);
  showScreen("screen-result");
}

// ---------- 分享卡（Canvas） ----------
function buildShareCard(data) {
  const W = 1080, H = 1920;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");

  // —— 背景：AI 生成氛围图铺底（出图版），未加载则回退渐变 ——
  const bg = pickCardBg();
  if (bg) {
    drawCover(ctx, bg, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.fillRect(0, 0, W, H);
  } else {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#fff3e6");
    g.addColorStop(0.45, "#ffe6ef");
    g.addColorStop(1, "#e7e0fb");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    drawGlow(ctx, 210, 270, 340, "rgba(255,210,170,0.55)");
    drawGlow(ctx, 890, 540, 360, "rgba(255,188,220,0.50)");
    drawGlow(ctx, 540, 1720, 440, "rgba(186,176,255,0.50)");
  }

  // 外描边
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 4;
  roundRect(ctx, 44, 44, W - 88, H - 88, 44); ctx.stroke();

  ctx.textAlign = "center";

  // —— 信封插画 ——
  drawEnvelope(ctx, W / 2, 178, 150);

  // 标题
  ctx.fillStyle = "#8a4b2b";
  ctx.font = "600 54px -apple-system, 'PingFang SC', sans-serif";
  ctx.fillText("写给未来你的一封信", W / 2, 332);
  ctx.fillStyle = "#bd8a6a";
  ctx.font = "400 27px -apple-system, 'PingFang SC', sans-serif";
  ctx.fillText("FROM YOUR FUTURE SELF · 一封迟到的温柔", W / 2, 372);

  // —— 信纸面板 ——
  const px = 90, py = 432, pw = W - 180, ph = 766;
  ctx.save();
  ctx.shadowColor = "rgba(120,90,60,0.18)";
  ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  roundRect(ctx, px, py, pw, ph, 40); ctx.fill();
  ctx.restore();

  // 引号装饰
  ctx.fillStyle = "rgba(200,116,63,0.32)";
  ctx.font = "700 130px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText("“", px + 40, py + 140);
  ctx.textAlign = "center";

  // 金句（大字诗意）
  ctx.fillStyle = "#3a2f2a";
  ctx.font = "700 56px 'Songti SC', 'STSong', serif";
  wrapText(ctx, data.tagline || "你值得被未来的自己温柔以待", W / 2, py + 230, pw - 150, 84, 5);

  // 署名
  ctx.fillStyle = "#a06a3c";
  ctx.font = "500 34px 'Songti SC', serif";
  ctx.fillText("—— 五年后的你", W / 2, py + 620);

  // —— 标签徽章 ——
  const tag = data.tag || "未来的你";
  ctx.font = "700 40px -apple-system, 'PingFang SC', sans-serif";
  const tw = ctx.measureText(tag).width + 84;
  const ty = 1250;
  ctx.save();
  ctx.shadowColor = "rgba(122,108,196,0.42)"; ctx.shadowBlur = 26;
  ctx.fillStyle = "#7a6cc4";
  roundRect(ctx, (W - tw) / 2, ty, tw, 84, 42); ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#fff";
  ctx.fillText(tag, W / 2, ty + 55);

  // —— 星级（手绘五角星）——
  const starY = 1420, starR = 32, gap = 84;
  const total = 5, rating = data.rating || 5;
  const startX = W / 2 - gap * (total - 1) / 2;
  for (let i = 0; i < total; i++) {
    drawStar(ctx, startX + i * gap, starY, starR, i < rating);
  }
  ctx.fillStyle = "#9a7b6a";
  ctx.font = "400 28px -apple-system, 'PingFang SC', sans-serif";
  ctx.fillText("治愈度 " + rating + ".0 / 5.0", W / 2, starY + 72);

  // —— 二维码 ——
  const qrSize = 200, qrX = W / 2 - qrSize / 2, qrY = 1540;
  const qrOK = drawQR(ctx, SHARE_URL, qrX, qrY, qrSize);
  if (!qrOK) {
    ctx.strokeStyle = "rgba(58,47,42,0.25)"; ctx.lineWidth = 2;
    roundRect(ctx, qrX, qrY, qrSize, qrSize, 16); ctx.stroke();
    ctx.fillStyle = "rgba(58,47,42,0.5)";
    ctx.font = "400 26px -apple-system, sans-serif";
    ctx.fillText("二维码", W / 2, qrY + qrSize / 2 + 10);
  }
  ctx.fillStyle = "#8a7b72";
  ctx.font = "400 28px -apple-system, 'PingFang SC', sans-serif";
  ctx.fillText("长按识别 · 让未来的自己写封信给你", W / 2, qrY + qrSize + 44);

  // 域名水印
  ctx.fillStyle = "rgba(138,123,114,0.75)";
  ctx.font = "400 24px -apple-system, sans-serif";
  ctx.fillText("yovnne520.github.io/letter-to-future", W / 2, 1840);

  return c.toDataURL("image/png");
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawGlow(ctx, x, y, r, color) {
  const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
  rg.addColorStop(0, color);
  rg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawEnvelope(ctx, cx, cy, s) {
  ctx.save();
  const w = s, h = s * 0.66;
  const x = cx - w / 2, y = cy - h / 2;
  ctx.strokeStyle = "#c8743f";
  ctx.lineWidth = 6;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  roundRect(ctx, x, y, w, h, 14); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(cx, y + h * 0.55);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  drawHeart(ctx, cx, y + h * 0.30, 15);
  ctx.restore();
}

function drawHeart(ctx, cx, cy, s) {
  ctx.save();
  ctx.fillStyle = "#e8607a";
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.3);
  ctx.bezierCurveTo(cx + s, cy - s * 0.4, cx + s * 0.6, cy - s, cx, cy - s * 0.3);
  ctx.bezierCurveTo(cx - s * 0.6, cy - s, cx - s, cy - s * 0.4, cx, cy + s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawStar(ctx, cx, cy, r, filled) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
    const ox = cx + Math.cos(a) * r, oy = cy + Math.sin(a) * r;
    const a2 = a + Math.PI / 5;
    const ix = cx + Math.cos(a2) * r * 0.45, iy = cy + Math.sin(a2) * r * 0.45;
    if (i === 0) ctx.moveTo(ox, oy); else ctx.lineTo(ox, oy);
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = "#f0a23c";
    ctx.fill();
    ctx.strokeStyle = "#e08a2c"; ctx.lineWidth = 2; ctx.stroke();
  } else {
    ctx.strokeStyle = "rgba(240,162,60,0.45)"; ctx.lineWidth = 3; ctx.stroke();
  }
  ctx.restore();
}

// 在 canvas 上绘制真实可扫的二维码；失败返回 false（回退装饰框）
function drawQR(ctx, text, x, y, size) {
  try {
    if (typeof qrcode !== "function") return false;
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    const count = qr.getModuleCount();
    const cell = size / count;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#3a2f2a";
    for (let r = 0; r < count; r++) {
      for (let cc = 0; cc < count; cc++) {
        if (qr.isDark(r, cc)) {
          ctx.fillRect(x + cc * cell, y + r * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 12;
    roundRect(ctx, x - 6, y - 6, size + 12, size + 12, 18); ctx.stroke();
    return true;
  } catch (e) { return false; }
}

function wrapText(ctx, text, x, y, maxW, lineH, maxLines) {
  const chars = String(text).split("");
  let line = "", lines = [];
  for (const ch of chars) {
    if (ctx.measureText(line + ch).width > maxW && line) {
      lines.push(line); line = ch;
      if (lines.length === maxLines - 1) break;
    } else line += ch;
  }
  if (line && lines.length < maxLines) lines.push(line);
  let yy = y;
  for (const l of lines) { ctx.fillText(l, x, yy); yy += lineH; }
}

// ---------- 事件绑定 ----------
function bind() {
  $("#startBtn").onclick = () => showScreen("screen-quiz");
  $("#generateBtn").onclick = async () => {
    if (!validate()) return;
    showScreen("screen-loading");
    try {
      const data = await callLLM();
      renderResult(data);
    } catch (e) {
      toast(e.message || "生成失败，请检查 API 设置");
      showScreen("screen-quiz");
    }
  };
  $("#retryBtn").onclick = () => {
    for (const k in answers) delete answers[k];
    renderQuestions();
    showScreen("screen-quiz");
  };
  $("#shareCardBtn").onclick = () => {
    if (!lastResult) return;
    const url = buildShareCard(lastResult);
    $("#cardImg").src = url;
    $("#downloadCard").href = url;
    $("#cardModal").classList.add("open");
  };
  $("#closeCard").onclick = () => $("#cardModal").classList.remove("open");

  // 设置弹窗
  const cfg = getConfig();
  $("#cfgKey").value = (localStorage.getItem("app_cfg") ? JSON.parse(localStorage.getItem("app_cfg")).API_KEY : "") || "";
  $("#cfgBase").value = cfg.BASE_URL || "";
  $("#cfgModel").value = cfg.MODEL || "";
  $("#settingsBtn").onclick = () => $("#settingsModal").classList.add("open");
  $("#closeCfg").onclick = () => $("#settingsModal").classList.remove("open");
  $("#saveCfg").onclick = () => {
    const obj = {
      API_KEY: $("#cfgKey").value.trim(),
      BASE_URL: $("#cfgBase").value.trim() || "https://api.deepseek.com/v1",
      MODEL: $("#cfgModel").value.trim() || "deepseek-chat"
    };
    localStorage.setItem("app_cfg", JSON.stringify(obj));
    toast("已保存到本机，刷新后生效");
    $("#settingsModal").classList.remove("open");
  };
}

// ---------- 初始化 ----------
renderQuestions();
bind();
preloadCardBgs();
$("#futureYear").textContent = FUTURE_YEAR;
