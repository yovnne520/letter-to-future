// ============================================================
//  Cloudflare Worker —— 隐藏 DeepSeek API Key 的反向代理
//  作用：前端把请求发到这个 Worker，Worker 在服务端补上 Key 再转发
//        给 DeepSeek，于是 Key 只存在于 Cloudflare 的环境变量里，
//        永远不会出现在公开仓库 / 浏览器 / 前端代码中。
//
//  部署步骤见 CLOUDFLARE_SETUP.md
//  关键点：在 Cloudflare 控制台给这个 Worker 设置环境变量
//          DEEPSEEK_KEY = 你的真实 DeepSeek Key
// ============================================================

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // 处理浏览器跨域预检
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!env.DEEPSEEK_KEY) {
      return new Response("DEEPSEEK_KEY 未配置", { status: 500 });
    }

    const upstream = "https://api.deepseek.com/v1/chat/completions";
    const body = await request.text();

    const res = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + env.DEEPSEEK_KEY
      },
      body: body
    });

    // 透传 DeepSeek 的响应，并补上 CORS 头，让前端能跨域读取
    const out = new Response(res.body, res);
    for (const k in corsHeaders) out.headers.set(k, corsHeaders[k]);
    return out;
  }
};
