(function () {
  var cfg = window.SITE_CONFIG || {};

  var ICONS = {
    github:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    help:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    user:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    mail:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    moon:
      '<svg id="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sun:
      '<svg id="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
  };

  var NAV_ITEMS = [
    { key: "home", label: "分享", href: "index.html" },
    { key: "archives", label: "归档", href: "archives.html" },
    { key: "tags", label: "标签", href: "tags.html" },
    { key: "search", label: "搜索", href: "search.html" },
    { key: "about", label: "关于", href: "about.html" },
    { key: "faq", label: "FAQ", href: "faq.html" }
  ];

  function esc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderHeader(activeKey) {
    var header = document.getElementById("site-header");
    if (!header) return;

    var navHtml = NAV_ITEMS.map(function (item) {
      var cls = item.key === activeKey ? ' class="active"' : "";
      return '<li><a href="' + item.href + '"' + cls + ">" + item.label + "</a></li>";
    }).join("");

    header.innerHTML =
      '<nav class="nav" aria-label="主导航">' +
      '  <div class="logo-wrap">' +
      '    <a class="logo" href="index.html">' + esc(cfg.brand || "Personal Log") + "</a>" +
      '    <button id="theme-toggle" type="button" accesskey="t" title="切换亮/暗色模式 (Alt + T)" aria-label="切换亮/暗色模式">' +
      ICONS.moon +
      ICONS.sun +
      "    </button>" +
      "  </div>" +
      '  <ul id="menu">' + navHtml + "</ul>" +
      "</nav>";

    var btn = document.getElementById("theme-toggle");
    if (btn && window.toggleSiteTheme) {
      btn.addEventListener("click", window.toggleSiteTheme);
    }
  }

  function renderFooter() {
    var footer = document.getElementById("site-footer");
    if (!footer) return;
    var year = new Date().getFullYear();
    var startYear = cfg.footerStartYear || year;
    var yearText = startYear < year ? startYear + "–" + year : String(year);
    footer.innerHTML =
      "<span>© " +
      yearText +
      ' <a href="index.html">' +
      esc(cfg.brand || "Personal Log") +
      "</a></span>" +
      " · <span>Hosted on GitHub Pages</span>";
  }

  function loadPosts() {
    return fetch("data/posts.json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load data/posts.json");
        return res.json();
      })
      .then(function (items) {
        return (items || [])
          .filter(function (item) {
            return item.public === true;
          })
          .sort(function (a, b) {
            return String(b.date || "").localeCompare(String(a.date || ""));
          });
      });
  }

  function postUrl(item) {
    return "post.html?slug=" + encodeURIComponent(item.slug);
  }

  function renderEntryCard(item) {
    var metaParts = [];
    if (item.date) metaParts.push("<span>" + esc(item.date) + "</span>");
    if (item.readingTime) metaParts.push("<span>约 " + esc(item.readingTime) + " 分钟</span>");
    if (item.tags && item.tags.length) {
      metaParts.push("<span>" + item.tags.map(function (t) { return "#" + esc(t); }).join(" ") + "</span>");
    }

    return (
      '<article class="post-entry">' +
      '  <header class="entry-header">' +
      "    <h2>" + esc(item.title) + "</h2>" +
      "  </header>" +
      (item.summary ? '  <section class="entry-content"><p>' + esc(item.summary) + "</p></section>" : "") +
      '  <footer class="entry-footer">' + metaParts.join("<span>·</span>") + "</footer>" +
      '  <a class="entry-link" aria-label="' + esc(item.title) + '" href="' + postUrl(item) + '"></a>' +
      "</article>"
    );
  }

  function initHomePage() {
    var heroEl = document.getElementById("home-info");
    if (heroEl) {
      var socialsHtml = (cfg.socials || [])
        .map(function (s) {
          var isExt = /^https?:\/\//i.test(s.url);
          var ext = isExt ? ' target="_blank" rel="noopener noreferrer"' : "";
          return (
            '<a href="' +
            esc(s.url) +
            '" title="' +
            esc(s.name) +
            '" aria-label="' +
            esc(s.name) +
            '"' +
            ext +
            ">" +
            (ICONS[s.icon] || ICONS.github) +
            "</a>"
          );
        })
        .join("");

      heroEl.innerHTML =
        "<h1>" +
        esc(cfg.greeting || "你好") +
        "</h1>" +
        '<p class="home-bio">' +
        esc(cfg.bio || "") +
        "</p>" +
        '<div class="social-icons">' +
        socialsHtml +
        "</div>";
    }

    var listEl = document.getElementById("post-list");
    if (!listEl) return;

    loadPosts()
      .then(function (posts) {
        if (!posts.length) {
          listEl.innerHTML = '<div class="empty-state">暂时还没有公开文章。</div>';
          return;
        }
        listEl.innerHTML = posts.map(renderEntryCard).join("");
      })
      .catch(function () {
        listEl.innerHTML =
          '<div class="empty-state">加载内容失败。如果在本地预览，请运行 <code>python3 -m http.server 8000</code> 后访问 <code>http://localhost:8000</code>。</div>';
      });
  }

  function initArchivesPage() {
    var container = document.getElementById("archives-container");
    if (!container) return;

    loadPosts()
      .then(function (posts) {
        if (!posts.length) {
          container.innerHTML = '<div class="empty-state">暂时还没有归档内容。</div>';
          return;
        }
        var groups = {};
        posts.forEach(function (item) {
          var year = (item.date || "其他").slice(0, 4);
          if (!groups[year]) groups[year] = [];
          groups[year].push(item);
        });

        var years = Object.keys(groups).sort(function (a, b) {
          return b.localeCompare(a);
        });

        container.innerHTML = years
          .map(function (year) {
            var rows = groups[year]
              .map(function (item) {
                return (
                  '<div class="archive-entry">' +
                  '  <span class="archive-entry-title">' + esc(item.title) + "</span>" +
                  '  <span class="archive-entry-meta">' + esc(item.date || "") + "</span>" +
                  '  <a class="entry-link" aria-label="' + esc(item.title) + '" href="' + postUrl(item) + '"></a>' +
                  "</div>"
                );
              })
              .join("");

            return (
              '<section class="archive-year">' +
              '  <h2 class="archive-year-header">' +
              esc(year) +
              ' <span class="archive-count">' +
              groups[year].length +
              " 篇</span></h2>" +
              rows +
              "</section>"
            );
          })
          .join("");
      })
      .catch(function () {
        container.innerHTML = '<div class="empty-state">加载归档失败。</div>';
      });
  }

  function initTagsPage() {
    var cloudEl = document.getElementById("tags-cloud");
    var listEl = document.getElementById("tags-list");
    if (!cloudEl || !listEl) return;

    var params = new URLSearchParams(window.location.search);
    var selectedTag = params.get("tag") || "";

    loadPosts()
      .then(function (posts) {
        var counts = {};
        posts.forEach(function (item) {
          (item.tags || []).forEach(function (tag) {
            counts[tag] = (counts[tag] || 0) + 1;
          });
        });

        var tags = Object.keys(counts).sort(function (a, b) {
          return counts[b] - counts[a] || a.localeCompare(b, "zh-CN");
        });

        if (!tags.length) {
          cloudEl.innerHTML = '<div class="empty-state">暂无标签。</div>';
          return;
        }

        function draw() {
          cloudEl.innerHTML = tags
            .map(function (tag) {
              var active = tag === selectedTag ? " active" : "";
              return (
                '<button type="button" class="' +
                active +
                '" data-tag="' +
                esc(tag) +
                '">' +
                esc(tag) +
                " <sup>" +
                counts[tag] +
                "</sup></button>"
              );
            })
            .join("");

          var matched = selectedTag
            ? posts.filter(function (item) {
                return (item.tags || []).indexOf(selectedTag) !== -1;
              })
            : posts;

          listEl.innerHTML = matched.map(renderEntryCard).join("");
        }

        cloudEl.addEventListener("click", function (e) {
          var btn = e.target.closest("[data-tag]");
          if (!btn) return;
          var clicked = btn.getAttribute("data-tag");
          selectedTag = selectedTag === clicked ? "" : clicked;
          var nextUrl = selectedTag
            ? "tags.html?tag=" + encodeURIComponent(selectedTag)
            : "tags.html";
          window.history.replaceState(null, "", nextUrl);
          draw();
        });

        draw();
      })
      .catch(function () {
        listEl.innerHTML = '<div class="empty-state">加载标签失败。</div>';
      });
  }

  function initSearchPage() {
    var inputEl = document.getElementById("search-input");
    var listEl = document.getElementById("search-results");
    if (!inputEl || !listEl) return;

    loadPosts()
      .then(function (posts) {
        function search(q) {
          var keyword = q.trim().toLowerCase();
          if (!keyword) {
            listEl.innerHTML = '<div class="empty-state">输入关键词，搜索站内分享文章。</div>';
            return;
          }
          var matched = posts.filter(function (item) {
            var haystack = [item.title, item.summary, (item.tags || []).join(" ")]
              .join(" ")
              .toLowerCase();
            return haystack.indexOf(keyword) !== -1;
          });

          if (!matched.length) {
            listEl.innerHTML = '<div class="empty-state">没有找到与「' + esc(q.trim()) + '」相关的内容。</div>';
            return;
          }
          listEl.innerHTML = matched.map(renderEntryCard).join("");
        }

        inputEl.addEventListener("input", function () {
          search(inputEl.value);
        });
        search("");
      })
      .catch(function () {
        listEl.innerHTML = '<div class="empty-state">搜索初始化失败。</div>';
      });
  }

  function bindCopyButtons(root) {
    root.querySelectorAll(".copy-code-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var code = btn.nextElementSibling ? btn.nextElementSibling.textContent : "";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(function () {
            btn.textContent = "已复制";
            setTimeout(function () {
              btn.textContent = "复制";
            }, 1500);
          });
        }
      });
    });
  }

  function initMarkdownPage(elementId, mdPath, fallbackHtml) {
    var contentEl = document.getElementById(elementId);
    if (!contentEl) return;

    fetch(mdPath, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("not found");
        return res.text();
      })
      .then(function (md) {
        var rendered = window.SimpleMarkdown.render(md);
        contentEl.innerHTML = rendered.html;
        bindCopyButtons(contentEl);
      })
      .catch(function () {
        contentEl.innerHTML = fallbackHtml;
      });
  }

  function initAboutPage() {
    initMarkdownPage(
      "about-content",
      "content/about.md",
      '<p>欢迎来到我的个人主页。你可以直接编辑 <code>content/about.md</code> 来完善这里的自我介绍。</p>'
    );
  }

  function initFaqPage() {
    initMarkdownPage(
      "faq-content",
      "content/faq.md",
      '<p>你可以在 <code>content/faq.md</code> 中编写常见问答与站点说明。</p>'
    );
  }

  function initPostPage() {
    var articleEl = document.getElementById("post-article");
    if (!articleEl) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get("slug") || "";

    loadPosts()
      .then(function (posts) {
        var idx = posts.findIndex(function (item) {
          return item.slug === slug;
        });

        if (idx === -1) {
          articleEl.innerHTML =
            '<div class="empty-state">未找到该文章，或该文章当前未设为公开。<br><br><a href="index.html">返回首页 →</a></div>';
          return;
        }

        var item = posts[idx];
        var prevItem = idx > 0 ? posts[idx - 1] : null;
        var nextItem = idx < posts.length - 1 ? posts[idx + 1] : null;

        document.title = item.title + " · " + (cfg.titleSuffix || "Personal Log");

        var mdPath = item.file || "content/posts/" + item.slug + ".md";

        return fetch(mdPath, { cache: "no-cache" })
          .then(function (res) {
            if (!res.ok) throw new Error("md not found");
            return res.text();
          })
          .then(function (md) {
            var rendered = window.SimpleMarkdown.render(md);

            var metaParts = [];
            if (item.date) metaParts.push("<span>发布于 " + esc(item.date) + "</span>");
            if (item.readingTime) metaParts.push("<span>约 " + esc(item.readingTime) + " 分钟阅读</span>");
            metaParts.push("<span>作者：" + esc(cfg.author || "Yam") + "</span>");

            var tocHtml = "";
            if (rendered.toc.length >= 2) {
              var tocItems = rendered.toc
                .map(function (h) {
                  var cls = h.level === 3 ? ' class="toc-h3"' : "";
                  return "<li" + cls + '><a href="#' + esc(h.id) + '">' + esc(h.text) + "</a></li>";
                })
                .join("");
              tocHtml =
                '<details class="toc" open>' +
                "  <summary>目录</summary>" +
                '  <div class="toc-inner"><ul>' + tocItems + "</ul></div>" +
                "</details>";
            }

            var tagsHtml =
              item.tags && item.tags.length
                ? '<div class="post-tags">' +
                  item.tags
                    .map(function (t) {
                      return '<a href="tags.html?tag=' + encodeURIComponent(t) + '">#' + esc(t) + "</a>";
                    })
                    .join("") +
                  "</div>"
                : "";

            var navHtml = "";
            if (prevItem || nextItem) {
              navHtml =
                '<nav class="paginav" aria-label="文章导航">' +
                (prevItem
                  ? '<a class="prev" href="' +
                    postUrl(prevItem) +
                    '"><span class="nav-label">« 上一篇</span><span class="nav-title">' +
                    esc(prevItem.title) +
                    "</span></a>"
                  : "") +
                (nextItem
                  ? '<a class="next" href="' +
                    postUrl(nextItem) +
                    '"><span class="nav-label">下一篇 »</span><span class="nav-title">' +
                    esc(nextItem.title) +
                    "</span></a>"
                  : "") +
                "</nav>";
            }

            articleEl.innerHTML =
              '<header class="post-header">' +
              '  <div class="post-breadcrumbs"><a href="index.html">首页</a> / <a href="index.html">分享</a></div>' +
              '  <h1 class="post-title">' + esc(item.title) + "</h1>" +
              '  <div class="post-meta">' + metaParts.join("<span>·</span>") + "</div>" +
              "</header>" +
              tocHtml +
              '<div class="post-content">' + rendered.html + "</div>" +
              '<footer class="post-footer">' + tagsHtml + navHtml + "</footer>";

            bindCopyButtons(articleEl);
          });
      })
      .catch(function () {
        articleEl.innerHTML = '<div class="empty-state">文章内容加载失败，请检查 Markdown 文件路径是否正确。</div>';
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page") || "home";
    var navKey = page === "post" ? "home" : page;

    renderHeader(navKey);
    renderFooter();

    if (page === "home") initHomePage();
    else if (page === "archives") initArchivesPage();
    else if (page === "tags") initTagsPage();
    else if (page === "search") initSearchPage();
    else if (page === "about") initAboutPage();
    else if (page === "faq") initFaqPage();
    else if (page === "post") initPostPage();
  });
})();
