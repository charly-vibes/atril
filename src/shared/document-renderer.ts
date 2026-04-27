import { marked, Renderer, type Token, type Tokens } from "marked";
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

function displayOpenSpecHeading(text: string): string {
  if (text.startsWith("Requirement:")) return text.slice("Requirement:".length).trim();
  return text;
}

function processOpenSpecTokens(tokens: Token[]): Token[] {
  const result: Token[] = [];
  const stack: { depth: number }[] = [];

  for (const token of tokens) {
    if (token.type === "heading" && (token.text.startsWith("Requirement:") || token.text.startsWith("Scenario:"))) {
      while (true) {
        const top = stack.at(-1);
        if (!top || top.depth < token.depth) break;
        stack.pop();
        result.push({ type: "html", raw: "</details>\n", text: "</details>\n" } as Tokens.HTML);
      }

      const id = slugifyHeading(token.text);
      const kind = token.text.startsWith("Scenario:") ? "scenario" : "requirement";
      const headingText = displayOpenSpecHeading(token.text);
      const headingHtml = `<h${token.depth} id="${escapeHtml(id)}" class="openspec-heading openspec-heading-${kind}">${escapeHtml(headingText)}</h${token.depth}>`;
      const htmlStart = `<details class="openspec-details openspec-details-${kind}"><summary class="openspec-summary">${headingHtml}</summary>\n`;
      result.push({ type: "html", raw: htmlStart, text: htmlStart } as Tokens.HTML);
      
      stack.push({ depth: token.depth });
      continue;
    }
    
    if (token.type === "heading") {
      while (true) {
        const top = stack.at(-1);
        if (!top || top.depth < token.depth) break;
        stack.pop();
        result.push({ type: "html", raw: "</details>\n", text: "</details>\n" } as Tokens.HTML);
      }
    }
    
    result.push(token);
  }

  while (stack.length > 0) {
    stack.pop();
    result.push({ type: "html", raw: "</details>\n", text: "</details>\n" } as Tokens.HTML);
  }

  return result;
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
    if (path.includes("openspec/")) {
      const tokens = marked.lexer(content);
      const modifiedTokens = processOpenSpecTokens(tokens);
      // @ts-ignore - marked expects links object on tokens array
      modifiedTokens.links = tokens.links;
      return marked.parser(modifiedTokens as any) as string;
    }
    return marked.parse(content) as string;
  }

  if (path.endsWith(".org")) {
    return renderOrg(content);
  }

  return `<pre class="plain-document">${escapeHtml(content)}</pre>`;
}
