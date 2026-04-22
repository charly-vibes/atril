import { marked, Renderer } from "marked";
import { escapeHtml } from "./html-utils";

const renderer = new Renderer();
renderer.heading = ({ text, depth }) => {
  const id = slugifyHeading(text);
  return `<h${depth} id="${escapeHtml(id)}">${text}</h${depth}>\n`;
};

marked.setOptions({ async: false, gfm: true, breaks: false, renderer });

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
    return marked.parse(content) as string;
  }

  if (path.endsWith(".org")) {
    return renderOrg(content);
  }

  return `<pre class="plain-document">${escapeHtml(content)}</pre>`;
}
