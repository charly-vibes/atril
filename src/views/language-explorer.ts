import { escapeHtml } from "../shared/html-utils";

export interface BoundedContext {
  name: string;
  path: string;
  purpose: string;
}

/**
 * Parse the README's bounded context table and match rows to context file paths.
 * Returns one entry per path, with purpose from the table (or empty string if not found).
 */
export function listBoundedContexts(
  readmeContent: string,
  contextPaths: string[],
): BoundedContext[] {
  if (contextPaths.length === 0) return [];

  const purposeMap = parsePurposeTable(readmeContent);

  return contextPaths.map((path) => {
    const filename = path.slice(path.lastIndexOf("/") + 1); // e.g. "navigation.md"
    const name = filename.replace(/\.md$/, "");
    const purpose = purposeMap.get(filename) ?? "";
    return { name, path, purpose };
  });
}

/**
 * Parse the Bounded Contexts table in the README.
 * Expects rows like: | name | [filename.md](...) | purpose |
 * Returns a Map from filename to purpose.
 */
function parsePurposeTable(content: string): Map<string, string> {
  const map = new Map<string, string>();
  // Match pipe-table rows with 3 columns, skipping header and separator rows
  const rowPattern = /^\|\s*[^|]+\|\s*\[([^\]]+)\]\([^)]+\)\s*\|\s*([^|]+)\|/gm;
  for (const match of content.matchAll(rowPattern)) {
    const filename = match[1]!.trim();
    const purpose = match[2]!.trim();
    map.set(filename, purpose);
  }
  return map;
}

/**
 * Render bounded contexts as a navigable list.
 */
export function renderLanguageOverview(contexts: BoundedContext[]): string {
  if (contexts.length === 0) {
    return `<section class="language-overview empty"><p>No bounded contexts defined</p></section>`;
  }

  const items = contexts
    .map(
      (ctx) => `<li>
        <button type="button" class="language-context-item" data-context="${escapeHtml(ctx.name)}">
          <span class="language-context-name">${escapeHtml(ctx.name)}</span>
          <span class="language-context-purpose">${escapeHtml(ctx.purpose)}</span>
        </button>
      </li>`,
    )
    .join("");

  return `<section class="language-overview"><ul class="language-context-list">${items}</ul></section>`;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

/**
 * Convert a term string to a URL-fragment anchor: lowercase, hyphenated.
 * Strips bold markdown markers first.
 */
export function termToAnchor(term: string): string {
  return term
    .replace(/\*\*/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

/**
 * Extract term/definition pairs from a markdown context file.
 * Detects the first table with "Term" and "Definition" column headers (case-insensitive, bold-stripped).
 */
export function extractGlossaryTerms(content: string): GlossaryTerm[] {
  const lines = content.split("\n");
  let headerIdx = -1;
  let termCol = -1;
  let defCol = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (!line.startsWith("|")) continue;
    // Parse as a table header row
    const cols = splitTableRow(line);
    const tIdx = cols.findIndex((c) => c.replace(/\*\*/g, "").trim().toLowerCase() === "term");
    const dIdx = cols.findIndex((c) => c.replace(/\*\*/g, "").trim().toLowerCase() === "definition");
    if (tIdx >= 0 && dIdx >= 0) {
      headerIdx = i;
      termCol = tIdx;
      defCol = dIdx;
      break;
    }
  }

  if (headerIdx < 0) return [];

  const terms: GlossaryTerm[] = [];
  for (let i = headerIdx + 2; i < lines.length; i++) { // +2 to skip separator row
    const line = lines[i]!;
    if (!line.startsWith("|")) break;
    const cols = splitTableRow(line);
    const term = (cols[termCol] ?? "").replace(/\*\*/g, "").trim();
    const definition = (cols[defCol] ?? "").trim();
    if (term) terms.push({ term, definition });
  }

  return terms;
}

function splitTableRow(line: string): string[] {
  return line
    .slice(1, line.lastIndexOf("|"))
    .split("|")
    .map((c) => c.trim());
}

/**
 * Render glossary terms as an HTML definition list with named anchors.
 */
export function renderGlossary(terms: GlossaryTerm[]): string {
  if (terms.length === 0) {
    return `<dl class="glossary"></dl>`;
  }

  const entries = terms
    .map((t) => {
      const anchor = termToAnchor(t.term);
      return `<dt id="${escapeHtml(anchor)}">${escapeHtml(t.term)}</dt><dd>${escapeHtml(t.definition)}</dd>`;
    })
    .join("");

  return `<dl class="glossary">${entries}</dl>`;
}
