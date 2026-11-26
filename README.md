# yamlee-cn.github.io

个人主页（分享 & 精选公开读书笔记），参考 [lilianweng.github.io](https://lilianweng.github.io/) 的极简阅读风格，采用**纯静态 HTML/CSS/JS + Markdown** 构建，零编译、推送即上线。

## 本地预览

由于浏览器安全策略限制 `file://` 协议读取本地 JSON/Markdown，建议在项目目录下启动本地静态服务预览：

```bash
python3 -m http.server 8000
```

然后打开浏览器访问：`http://localhost:8000`

## 如何修改个人信息

- 站点名称、首页欢迎语、简介、社交链接：编辑 `data/site.js`
- 「关于」页面正文：编辑 `content/about.md`

## 如何发布新内容

### 1. 发布一篇「分享」

1. 在 `content/posts/` 下新建一个 Markdown 文件，例如 `my-first-post.md`。
2. 在 `data/posts.json` 数组顶部添加一条记录：

```json
{
  "slug": "my-first-post",
  "title": "文章标题",
  "date": "2026-11-27",
  "readingTime": 5,
  "tags": ["分享", "效率"],
  "summary": "两行以内的简短摘要，展示在首页卡片中。",
  "file": "content/posts/my-first-post.md",
  "public": true
}
```

### 2. 发布一篇公开「读书笔记」

1. 在 `content/books/` 下新建 Markdown 文件，例如 `psychology-of-money.md`。
2. 在 `data/books.json` 数组顶部添加一条记录，设置 `"public": true`。

## 隐私保护：如何确保本地笔记不被公开

1. **白名单展示机制**：只有明确在 `data/posts.json` 或 `data/books.json` 中登记且 `"public": true` 的条目才会被网站渲染。
2. **Git 忽略保护**：`.gitignore` 已默认忽略以下路径，永远不会被推送到 GitHub：
   - `content/private/`（可放本地私密笔记或草稿）
   - `*.local.md` / `*.private.md`
   - `data/*.local.json`
3. 你的私人读书笔记可以继续保留在本地的 `better-myself` 仓库中，只把希望公开分享的精选篇目整理到本仓库的 `content/books/` 即可。

## 部署到 GitHub Pages

1. 在 GitHub 上新建公开仓库，仓库名必须为 **`yamlee-cn.github.io`**（与你的 GitHub 用户名一致）。
2. 在本目录执行：

```bash
git add .
git commit -m "init personal homepage"
git remote add origin https://github.com/yamlee-cn/yamlee-cn.github.io.git
git push -u origin main
```

3. 打开仓库的 **Settings → Pages**，确认 Source 为 `Deploy from a branch`，Branch 选择 `main` / `/(root)`，保存后等待 1～2 分钟即可访问：`https://yamlee-cn.github.io`。
