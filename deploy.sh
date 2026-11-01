#!/usr/bin/env bash
# 一键部署到 GitHub Pages（需先 gh auth login）
set -e

REPO_NAME="letter-to-future"

echo "==> 检查 GitHub 登录"
gh auth status || { echo "请先运行: gh auth login"; exit 1; }

echo "==> 初始化并提交"
git init -q 2>/dev/null || true
git add .
git commit -m "init: 写给未来你的一封信" || echo "（无新提交）"
git branch -M main

USER=$(gh api user --jq .login)
echo "==> 当前 GitHub 用户: $USER"

# 仓库不存在则创建并推送，否则直接推送
if gh repo view "$REPO_NAME" >/dev/null 2>&1; then
  git push -u origin main
else
  gh repo create "$REPO_NAME" --public --source=. --push --branch main
fi

echo "==> 开启 GitHub Pages (main / root)"
gh api -X POST "/repos/$USER/$REPO_NAME/pages" \
  --field "source[branch]=main" \
  --field "source[path]=/" || echo "（Pages 可能已开启，去 Settings → Pages 确认）"

echo ""
echo "✅ 部署完成！约 1 分钟后访问："
echo "   https://$USER.github.io/$REPO_NAME/"
