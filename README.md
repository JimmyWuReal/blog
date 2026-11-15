# blog

Jimmy Wu 的部落格與筆記，網址：**https://blog.jimmywu.app**

```
blogs/       部落格文章，一篇一個 .md
notebooks/   筆記本，一個資料夾一本，內含 notebook.yml 與筆記
website/     產生網站的 Astro 專案
```

改完內容 push 到 `main`，Cloudflare Pages 約一分鐘後自動更新網站。

## 寫文章

在 `blogs/` 新增 `.md`，例如 `blogs/hello.md` → `blog.jimmywu.app/hello`。

```md
---
title: Hello
description: 第一篇文章
date: 2026-11-08
tags: [life]
---

內文從這裡開始，標題由 `title` 產生，不用再寫 `# 標題`。
```

- 文章必須有 `date`，首頁依日期由新到舊排列。
- 檔名不能和筆記本、`tags`、`og`、`index`、`404` 同名。

## 寫筆記

`notebooks/` 底下每個資料夾是一本筆記本，資料夾名稱就是網址：`notebooks/cp/` → `blog.jimmywu.app/cp`。

1. 新增 `.md`，例如 `notebooks/cp/graph/dijkstra.md` → `blog.jimmywu.app/cp/graph/dijkstra`。
2. 把路徑加進該筆記本的 `notebook.yml`（決定側欄的章節與順序）。

```md
---
title: Dijkstra
description: 求非負權重圖的單源最短路徑
date: 2026-11-08
tags: [graph, shortest-path]
pre: [set, priority-queue]
difficulty: 4
---
```

新筆記本：建立 `notebooks/<名稱>/notebook.yml`，寫上 `title`、`description`（選填）和 `sections`。

## Frontmatter

文章與筆記共用以下欄位。可以寫成清單的欄位，只有一項時也能直接寫單一值。

| 欄位          | 必填       | 說明                                                   |
| ------------- | ---------- | ------------------------------------------------------ |
| `title`       | 是         | 頁面標題。檔名只決定網址。                             |
| `date`        | 文章必填   | `YYYY-MM-DD`。                                         |
| `description` | 否         | 顯示在卡片與連結預覽。                                 |
| `tags`        | 否         | `[math, dp]`。每個標籤有自己的頁面 `/tags/<標籤>`。    |
| `pre`         | 否         | 先備知識，`[遞迴, 模運算]`。顯示在內文前的「先備知識」。 |
| `difficulty`  | 否         | 難度，0（最簡單）到 10 的整數。                        |
| `author`      | 否         | 共同作者 `[x, y]`。Jimmy Wu 一定列在第一位。           |
| `draft`       | 否         | `true` 表示草稿，不會出現在網站上。                    |

每頁都會自動產生連結預覽圖 `/og/<網址>.png`。

## Markdown

寫法和 HackMD 相同：

- `$x^n$` 行內數學、`$$ ... $$` 區塊數學（KaTeX）。
- ` ```cpp ` 程式碼，` ```cpp= ` 加行號，` ```cpp=11 ` 從第 11 行開始。
- 單一換行會保留。
- 支援表格、待辦清單、刪除線（GFM）。
- 用相對路徑連到其他頁面：`[快速冪](../math/fast-power.md)`，網站會轉成正確網址。

## 建置檢查

以下情況建置會失敗，並說明原因：

- 筆記沒列在 `notebook.yml`（草稿除外）、列了兩次，或列了但檔案不存在。
- 連到不存在的 `.md`。
- frontmatter 缺 `title`、文章缺 `date`，或 `difficulty` 不是 0–10 的整數。
- 文章網址和筆記本或網站頁面衝突。

GitHub Actions 每次 push 都會跑同樣的建置。

## 本機執行

需要 Node.js 24。

```sh
cd website
npm ci
npm run dev      # http://localhost:4321
npm run build    # 輸出到 website/dist
```

瀏覽次數使用 Convex，需設定環境變數 `CONVEX_URL`；沒設定時不顯示次數。

## 部署

Cloudflare Pages 連到這個 repo，每次 push 到 `main` 就會部署。

- Production branch：`main`
- Root directory：`website`
- Build command：`npm run build`
- Output directory：`dist`
- Node.js：`24`（來自 `website/.nvmrc`）

Pages 專案名稱仍是 `cp-note`（Cloudflare 無法改名）。

- 網址：https://blog.jimmywu.app
- Cloudflare 網址：https://cp-note-nfn.pages.dev
- [Cloudflare 專案](https://dash.cloudflare.com/3573cf391dd2d9dc99966427952b98ee/pages/view/cp-note)
