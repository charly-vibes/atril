function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function renderInlineMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, href: string) => {
    return `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
  });
}

function renderInlineOrg(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(/\[\[([^\]]+)\]\[([^\]]+)\]\]/g, (_match, href: string, label: string) => {
    return `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
  });
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderMarkdown(content: string): string {
  const blocks = content.trim().split(/\n\s*\n/);
  return blocks
    .map((block) => {
      const line = block.trim();
      if (line.startsWith("# ")) {
        const heading = line.slice(2).trim();
        return `<h1 id="${escapeHtml(slugifyHeading(heading))}">${escapeHtml(heading)}</h1>`;
      }
      return `<p>${renderInlineMarkdown(line.replace(/\n+/g, " "))}</p>`;
    })
    .join("");
}

function renderOrg(content: string): string {
  const lines = content.trim().split(/\n+/);
  return lines
    .map((line) => {
      if (line.startsWith("* ")) {
        const heading = line.slice(2).trim();
        return `<h1 id="${escapeHtml(slugifyHeading(heading))}">${escapeHtml(heading)}</h1>`;
      }
      return `<p>${renderInlineOrg(line.trim())}</p>`;
    })
    .join("");
}

export function renderReadableDocument(path: string, content: string): string {
  if (path.endsWith(".md")) {
    return renderMarkdown(content);
  }

  if (path.endsWith(".org")) {
    return renderOrg(content);
  }

  return `<pre class="plain-document">${escapeHtml(content)}</pre>`;
}
