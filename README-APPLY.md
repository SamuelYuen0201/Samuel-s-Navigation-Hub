# NavigationHub → Cloudflare Workers + Static Assets

Repo: https://github.com/SamuelYuen0201/Samuel-s-Navigation-Hub
Target branch: `main`

## 內容

- `wrangler.jsonc`: Cloudflare Worker entry point + `public/` assets，指定 API 路由進入 Worker。
- `src/worker.js`: `/api/telemetry` + `/api/logs` + 靜態資源 fallback。
- `apply.sh`: 在已 clone 嘅 Git Repository 根目錄執行，搬移首頁、移除舊 Pages Functions、更新 Workers 檔案並建立 Commit。

本 ZIP **不包含原 Repository 嘅 `index.html` 或 `NavigationHub.zip`**，因為需要從你現有 GitHub Repository 原樣保留／搬移，唔應該用重建版本覆蓋原文。

## 使用方法

喺電腦上操作：

```bash
git clone https://github.com/SamuelYuen0201/Samuel-s-Navigation-Hub.git
cd Samuel-s-Navigation-Hub
# 將本 ZIP 解壓後嘅 wrangler.jsonc、src/worker.js、apply.sh 複製到此資料夾（保持路徑）
bash apply.sh
# 如果希望推送
 git push origin main
```

`apply.sh` 預設只建立本地 Git Commit，唔會自動推送。請先確認完整 git diff 然後再 push。

**Cloudflare 設定：** `name` 預設為 `samuel-hub`，如現有 Worker 名稱不同，請先修改 `wrangler.jsonc`。D1 綁定需叫 `DB`，管理秘密需叫 `ADMIN_KEY`，且 D1 應存在名為 `visits` 的資料表及相應欄位。未設定 DB 時，目前程式仍會返回 HTTP 201，唔代表資料已儲存。

**私隱與安全：** 現有程式會接收 IP、裝置指紋與可能的精確 GPS 座標。請喺取得明確同意後先收集，考慮資料最小化、保留期限、加密與適當授權。`/api/logs?key=...` 會令 ADMIN_KEY 出現在 URL/歷史紀錄/日誌，建議改用 Authorization Header 或 Cloudflare Access 之後先上正式環境。
