# yamlee-cn.github.io

个人主页，参考 [lilianweng.github.io](https://lilianweng.github.io/) 的极简阅读风格，采用**纯静态 HTML/CSS/JS + Markdown** 构建，零编译、推送即上线。

站内聚焦围绕经济与心理问题的**纯理论阅读思考与概念分享**（原始读书笔记仅保留在本地，不推送到线上仓库）。

## 本地预览

```bash
python3 -m http.server 8000
```

浏览器访问：`http://localhost:8000`

## 如何发布新分享

1. 在 `content/posts/` 下新建一个 Markdown 文件，例如 `my-first-post.md`。
2. 在 `data/posts.json` 数组顶部添加一条记录：

```json
{
  "slug": "my-first-post",
  "title": "文章标题",
  "date": "2026-11-27",
  "readingTime": 5,
  "tags": ["经济学", "心理"],
  "summary": "两行以内的简短摘要，展示在首页卡片中。",
  "file": "content/posts/my-first-post.md",
  "public": true
}
```

3. 提交并推送到 `main` 分支，等待 1～2 分钟即可在 `https://yamlee-cn.github.io` 生效。
