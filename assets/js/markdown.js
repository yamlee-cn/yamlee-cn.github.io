/* Zero-dependency Markdown parser tailored for Chinese long-form reading */
window.SimpleMarkdown = (function () {
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugify(text, usedIds) {
    var base = text
      .trim()
      .toLowerCase()
      .replace(/<[^>]+>/g, "")
      .replace(/[^\w\u4e00-\u9fa5\- ]+/g, "")
      .replace(/\s+/g, "-") || "section";
    var id = base;
    var count = 1;
    while (usedIds[id]) {
      id = base + "-" + count++;
    }
    usedIds[id] = true;
    return id;
  }

  function parseInline(text) {
    var codeTokens = [];
    // Protect inline code first
    text = text.replace(/`([^`]+)`/g, function (_, code) {
      var idx = codeTokens.length;
      codeTokens.push("<code>" + escapeHtml(code) + "</code>");
      return "\u0000CODE" + idx + "\u0000";
    });

    text = escapeHtml(text);

    // Images (inline)
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, function (_, alt, src, title) {
      var titleAttr = title ? ' title="' + title + '"' : "";
      return '<img src="' + src + '" alt="' + alt + '"' + titleAttr + ' loading="lazy">';
    });

    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, function (_, label, href, title) {
      var isExternal = /^https?:\/\//i.test(href);
      var extAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      var titleAttr = title ? ' title="' + title + '"' : "";
      return '<a href="' + href + '"' + extAttr + titleAttr + ">" + label + "</a>";
    });

    // Bold + Italic, Bold, Italic, Strikethrough
    text = text.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    text = text.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
    text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");

    // Restore inline code
    text = text.replace(/\u0000CODE(\d+)\u0000/g, function (_, idx) {
      return codeTokens[Number(idx)];
    });

    return text;
  }

  function stripFrontMatter(md) {
    if (md.startsWith("---\n") || md.startsWith("---\r\n")) {
      var end = md.indexOf("\n---", 3);
      if (end !== -1) {
        return md.slice(end + 4).replace(/^\r?\n/, "");
      }
    }
    return md;
  }

  function parseTableRow(line) {
    return line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map(function (cell) {
        return cell.trim();
      });
  }

  function render(markdown) {
    var src = stripFrontMatter(markdown.replace(/\r\n/g, "\n"));
    var lines = src.split("\n");
    var html = [];
    var toc = [];
    var usedIds = {};
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      // Blank line
      if (/^\s*$/.test(line)) {
        i++;
        continue;
      }

      // Fenced code block
      var fenceMatch = line.match(/^```([\w-]*)\s*$/);
      if (fenceMatch) {
        var lang = fenceMatch[1] || "";
        var codeLines = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing fence
        var langAttr = lang ? ' class="language-' + escapeHtml(lang) + '"' : "";
        html.push(
          '<pre><button class="copy-code-btn" type="button">复制</button><code' +
            langAttr +
            ">" +
            escapeHtml(codeLines.join("\n")) +
            "</code></pre>"
        );
        continue;
      }

      // Headings
      var headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
      if (headingMatch) {
        var level = headingMatch[1].length;
        var rawText = headingMatch[2];
        var id = slugify(rawText, usedIds);
        if (level === 2 || level === 3) {
          toc.push({ level: level, id: id, text: rawText.replace(/[*_`~]/g, "") });
        }
        html.push("<h" + level + ' id="' + id + '">' + parseInline(rawText) + "</h" + level + ">");
        i++;
        continue;
      }

      // Horizontal rule
      if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        html.push("<hr>");
        i++;
        continue;
      }

      // Standalone figure image: ![caption](url)
      var figMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)$/);
      if (figMatch) {
        var alt = escapeHtml(figMatch[1]);
        var imgSrc = escapeHtml(figMatch[2]);
        var caption = figMatch[3] ? escapeHtml(figMatch[3]) : alt;
        html.push(
          "<figure><img src=\"" +
            imgSrc +
            '" alt="' +
            alt +
            '" loading="lazy">' +
            (caption ? "<figcaption>" + caption + "</figcaption>" : "") +
            "</figure>"
        );
        i++;
        continue;
      }

      // Blockquote
      if (/^>\s?/.test(line)) {
        var quoteLines = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quoteLines.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        var inner = render(quoteLines.join("\n")).html;
        html.push("<blockquote>" + inner + "</blockquote>");
        continue;
      }

      // Table
      if (
        line.includes("|") &&
        i + 1 < lines.length &&
        /^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(lines[i + 1])
      ) {
        var headers = parseTableRow(line);
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].includes("|") && !/^\s*$/.test(lines[i])) {
          rows.push(parseTableRow(lines[i]));
          i++;
        }
        var thead =
          "<thead><tr>" +
          headers
            .map(function (h) {
              return "<th>" + parseInline(h) + "</th>";
            })
            .join("") +
          "</tr></thead>";
        var tbody =
          "<tbody>" +
          rows
            .map(function (r) {
              return (
                "<tr>" +
                r
                  .map(function (c) {
                    return "<td>" + parseInline(c) + "</td>";
                  })
                  .join("") +
                "</tr>"
              );
            })
            .join("") +
          "</tbody>";
        html.push("<table>" + thead + tbody + "</table>");
        continue;
      }

      // Unordered list (supports 2-level nesting)
      if (/^\s*[-*+]\s+/.test(line)) {
        var ulParts = [];
        var subItems = [];
        var flushSub = function () {
          if (subItems.length && ulParts.length) {
            var lastIdx = ulParts.length - 1;
            ulParts[lastIdx] =
              ulParts[lastIdx].replace(/<\/li>$/, "") +
              "<ul>" +
              subItems.join("") +
              "</ul></li>";
            subItems = [];
          }
        };
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
          var indent = lines[i].match(/^(\s*)/)[1].length;
          var itemText = lines[i].replace(/^\s*[-*+]\s+/, "");
          if (indent >= 2 && ulParts.length) {
            subItems.push("<li>" + parseInline(itemText) + "</li>");
          } else {
            flushSub();
            ulParts.push("<li>" + parseInline(itemText) + "</li>");
          }
          i++;
        }
        flushSub();
        html.push("<ul>" + ulParts.join("") + "</ul>");
        continue;
      }

      // Ordered list
      if (/^\s*\d+\.\s+/.test(line)) {
        var olItems = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          var olText = lines[i].replace(/^\s*\d+\.\s+/, "");
          olItems.push("<li>" + parseInline(olText) + "</li>");
          i++;
        }
        html.push("<ol>" + olItems.join("") + "</ol>");
        continue;
      }

      // Paragraph
      var paraLines = [];
      while (
        i < lines.length &&
        !/^\s*$/.test(lines[i]) &&
        !/^(#{1,6}\s+|```|>\s?|[-*+]\s+|\d+\.\s+|(-{3,}|\*{3,}|_{3,})\s*$)/.test(lines[i])
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      html.push("<p>" + paraLines.map(parseInline).join("<br>") + "</p>");
    }

    return { html: html.join("\n"), toc: toc };
  }

  return { render: render };
})();
