#!/usr/bin/env bash
set -euo pipefail

if [ ! -d .git ]; then
  echo "請先進入 Git Repository 根目錄。" >&2
  exit 1
fi

current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
  echo "預期目前分支為 main，實際為 $current_branch；請先切換 main。" >&2
  exit 1
fi

if [ ! -f index.html ]; then
  echo "找不到根目錄 index.html；未有修改。" >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  # Ignore newly unpacked files, but reject tracked modifications.
  if [ -n "$(git diff --name-only)" ] || [ -n "$(git diff --cached --name-only)" ]; then
    echo "工作目錄有尚未提交嘅已追蹤改動。請先保存佢哋。" >&2
    exit 1
  fi
fi

mkdir -p public src
git mv index.html public/index.html
if [ -d functions ]; then
  git rm -r -- functions
fi

git add wrangler.jsonc src/worker.js public/index.html
git commit -m "Migrate NavigationHub to Workers with static assets"
echo "Commit 已建立，請檢查 git show --stat 後再 git push origin main"
