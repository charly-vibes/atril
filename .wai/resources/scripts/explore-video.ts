/**
 * Atril site exploration — records a walkthrough video
 * Run: bunx playwright test --config=exploration/pw-video.config.ts
 * Or:  bun run exploration/explore-video.ts
 */
import { chromium } from "@playwright/test";
import path from "path";

const BASE = "http://localhost:3000";
const REPO = "charly-vibes/dont";
const QUERY = `owner=charly-vibes&repo=dont&branch=main`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: path.join(import.meta.dir, "videos"),
      size: { width: 1280, height: 800 },
    },
  });
  const page = await context.newPage();

  // ── 0. Landing page ──────────────────────────────────────────────────────
  await page.goto(BASE);
  await sleep(1200);

  // ── 1. Enter repo ─────────────────────────────────────────────────────────
  await page.getByPlaceholder("owner/repo or GitHub URL").fill(REPO);
  await sleep(600);
  await page.getByRole("button", { name: "Open" }).click();
  await page.waitForURL(`**view=overview**`);
  await sleep(1500);

  // ── 2. Overview — read the entry points ──────────────────────────────────
  // hover each suggestion button
  for (const label of ["Specs", "Project memory", "Documentation", "README", "Recent history"]) {
    const btn = page.getByRole("button", { name: new RegExp(label) }).first();
    await btn.hover();
    await sleep(400);
  }
  await sleep(800);

  // ── 3. Specs tab → openspec/changes/ ─────────────────────────────────────
  await page.getByRole("button", { name: "Specs", exact: true }).click();
  await page.waitForURL(`**view=tree**`);
  await sleep(1200);

  // Scroll through the file list
  await page.mouse.wheel(0, 400);
  await sleep(600);
  await page.mouse.wheel(0, 400);
  await sleep(600);
  await page.mouse.wheel(0, -800);
  await sleep(600);

  // Open a spec file
  const specBtn = page.getByRole("button", { name: /dont-core/ }).first();
  await specBtn.click();
  await page.waitForURL(`**view=file**`);
  await sleep(1500);

  // Scroll the spec
  await page.mouse.wheel(0, 300);
  await sleep(500);
  await page.mouse.wheel(0, 300);
  await sleep(500);
  await page.mouse.wheel(0, -600);
  await sleep(500);

  // ── 4. Back → Overview ───────────────────────────────────────────────────
  await page.getByRole("button", { name: /← Back/ }).click();
  await sleep(600);
  await page.getByRole("button", { name: /← Back/ }).click();
  await page.waitForURL(`**view=overview**`);
  await sleep(1000);

  // ── 5. Memory tab → .wai/ ────────────────────────────────────────────────
  await page.getByRole("button", { name: "Memory", exact: true }).first().click();
  await page.waitForURL(`**view=wai**`);
  await sleep(1500);
  await page.mouse.wheel(0, 300);
  await sleep(600);
  await page.mouse.wheel(0, -300);
  await sleep(600);

  // ── 6. Back → Docs tab ───────────────────────────────────────────────────
  await page.getByRole("button", { name: /← Back/ }).click();
  await page.waitForURL(`**view=overview**`);
  await sleep(600);
  await page.getByRole("button", { name: "Docs", exact: true }).first().click();
  await page.waitForURL(`**view=tree**`);
  await sleep(1200);

  // Open a doc
  const docBtn = page.getByRole("button", { name: /introduction/ }).first();
  if (await docBtn.isVisible()) {
    await docBtn.click();
    await page.waitForURL(`**view=file**`);
    await sleep(1200);
    await page.mouse.wheel(0, 300);
    await sleep(500);
    await page.getByRole("button", { name: /← Back/ }).click();
    await sleep(600);
  }

  // ── 7. Back → README ─────────────────────────────────────────────────────
  await page.getByRole("button", { name: /← Back/ }).click();
  await page.waitForURL(`**view=overview**`);
  await sleep(600);
  await page.getByRole("button", { name: "README", exact: true }).first().click();
  await page.waitForURL(`**view=file**`);
  await sleep(1500);
  await page.mouse.wheel(0, 400);
  await sleep(500);
  await page.mouse.wheel(0, -400);
  await sleep(500);

  // ── 8. Back → History ────────────────────────────────────────────────────
  await page.getByRole("button", { name: /← Back/ }).click();
  await page.waitForURL(`**view=overview**`);
  await sleep(600);
  await page.getByRole("button", { name: /Recent history/ }).click();
  await page.waitForURL(`**view=history**`);
  await sleep(1500);
  await page.mouse.wheel(0, 300);
  await sleep(600);
  await page.mouse.wheel(0, -300);
  await sleep(600);

  // ── 9. Back → Issues (Beads) ─────────────────────────────────────────────
  await page.getByRole("button", { name: /← Back/ }).click();
  await page.waitForURL(`**view=overview**`);
  await sleep(600);
  // Issues badge should be visible even if not clickable (no .beads in dont)
  // but try anyway
  const issuesBtn = page.locator(".source-badge[data-source='beads']");
  if (await issuesBtn.isVisible()) {
    await issuesBtn.click();
    await sleep(1000);
  }

  // ── 10. File tree search ──────────────────────────────────────────────────
  // Go to tree view and use the search box
  await page.goto(`${BASE}/?${QUERY}&view=tree`);
  await sleep(1200);
  const searchBox = page.locator("#tree-search");
  await searchBox.fill("spec.md");
  await sleep(1000);
  await searchBox.fill("proposal");
  await sleep(1000);
  await searchBox.fill("");
  await sleep(600);

  // ── 11. Browse file tree interactively ───────────────────────────────────
  const treeDir = page.locator(".tree-item[data-type='tree']").first();
  if (await treeDir.isVisible()) {
    await treeDir.click();
    await sleep(800);
    await treeDir.click();
    await sleep(600);
  }

  // ── 12. Breadcrumb navigation ─────────────────────────────────────────────
  // Open a nested file then use breadcrumb
  await page.goto(`${BASE}/?${QUERY}&view=file&path=openspec/changes/add-core-dont-specs/specs/dont-core/spec.md`);
  await sleep(1500);
  // Click a breadcrumb segment
  const breadcrumbSeg = page.locator(".breadcrumb-seg").first();
  if (await breadcrumbSeg.isVisible()) {
    await breadcrumbSeg.click();
    await sleep(1000);
  }

  // ── 13. Theme toggle ─────────────────────────────────────────────────────
  await page.goto(`${BASE}/?${QUERY}&view=overview`);
  await sleep(800);
  await page.getByRole("button", { name: /Toggle theme/ }).click();
  await sleep(1000);
  await page.getByRole("button", { name: /Toggle theme/ }).click();
  await sleep(800);

  // ── 14. End ───────────────────────────────────────────────────────────────
  await sleep(800);

  await context.close(); // flushes video
  await browser.close();

  console.log("✓ Video saved to exploration/videos/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
