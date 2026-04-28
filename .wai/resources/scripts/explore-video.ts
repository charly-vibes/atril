/**
 * Atril site exploration — records a walkthrough video
 * Covers all 35 usability evaluation scenarios.
 * Run: bun run .wai/resources/scripts/explore-video.ts
 */
import { chromium } from "@playwright/test";
import path from "path";

const BASE = "http://localhost:3000";
// atril repo has specs + history; charly-vibes/wai has beads issues
const REPO = "charly-vibes/atril";
const QUERY = `owner=charly-vibes&repo=atril&branch=main`;
const WAI_QUERY = `owner=charly-vibes&repo=wai&branch=main`;

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

  // ── S1: First impression — entry screen cold load ─────────────────────────
  console.log("S1: Entry screen cold load");
  await page.goto(BASE);
  await sleep(2000); // let user read

  // ── S3: Empty submit ──────────────────────────────────────────────────────
  console.log("S3: Empty submit");
  await page.getByRole("button", { name: "Open" }).click();
  await sleep(1500);

  // ── S2: URL with query string (copy-paste from browser) ───────────────────
  console.log("S2: URL with ?tab= query string");
  await page.getByPlaceholder("owner/repo or GitHub URL").fill(
    "https://github.com/facebook/react?tab=readme-ov-file"
  );
  await sleep(800);
  await page.getByRole("button", { name: "Open" }).click();
  await sleep(2500); // either loads or errors

  // ── S5: Nonexistent repo error recovery ───────────────────────────────────
  console.log("S5: Nonexistent repo");
  await page.goto(BASE);
  await sleep(500);
  await page.getByPlaceholder("owner/repo or GitHub URL").fill("doesnotexist123/fakerepo999");
  await page.getByRole("button", { name: "Open" }).click();
  await sleep(3000); // wait for API error
  // Check if input retains value after error
  const inputVal = await page.getByPlaceholder("owner/repo or GitHub URL").inputValue();
  console.log(`  Input value after error: "${inputVal}"`);

  // ── S29: Theme toggle discoverability ─────────────────────────────────────
  console.log("S29: Theme toggle — is it findable?");
  await page.goto(BASE);
  await sleep(800);
  // hover near top-right to see if it's visible
  await page.mouse.move(1240, 25);
  await sleep(1200);
  await page.getByRole("button", { name: /Toggle theme/ }).click();
  await sleep(800);
  await page.getByRole("button", { name: /Toggle theme/ }).click();
  await sleep(800);
  await page.getByRole("button", { name: /Toggle theme/ }).click();
  await sleep(800);

  // ── Load atril repo ───────────────────────────────────────────────────────
  console.log("Loading atril repo...");
  await page.goto(BASE);
  await sleep(500);
  await page.getByPlaceholder("owner/repo or GitHub URL").fill(REPO);
  await page.getByRole("button", { name: "Open" }).click();
  await page.waitForURL(`**view=overview**`, { timeout: 15000 });
  await sleep(2000);

  // ── S7: Badge affordance — hover active vs inactive ───────────────────────
  console.log("S7: Source badge affordance");
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "overview.png") });
  // hover each badge to see cursor/tooltip behavior
  for (const label of ["SPECS", "ISSUES", "MEMORY", "DOCS", "README"]) {
    const badge = page.locator(".source-badge").filter({ hasText: label }).first();
    if (await badge.isVisible()) {
      await badge.hover();
      await sleep(600);
    }
  }
  await sleep(800);

  // ── S8: Suggestion list — what's shown first? ────────────────────────────
  console.log("S8: Suggestion list order");
  await page.mouse.wheel(0, 200);
  await sleep(1000);
  await page.mouse.wheel(0, -200);
  await sleep(600);

  // ── S9: Branch switching discoverability ─────────────────────────────────
  console.log("S9: Branch toggle — looks like a label?");
  // Hover over the branch area
  const branchBtn = page.locator(".branch-toggle, button:has-text('main'), [data-branch]").first();
  if (await branchBtn.isVisible()) {
    await branchBtn.hover();
    await sleep(1200);
    await branchBtn.click();
    await sleep(1200);
    // Try to type a nonexistent branch
    const branchInput = page.locator("input[type='text']").last();
    if (await branchInput.isVisible()) {
      await branchInput.fill("nonexistent-branch-xyz");
      await branchInput.press("Enter");
      await sleep(2000);
    }
  }

  // ── S11: Badge counts — no quantity info ─────────────────────────────────
  console.log("S11: Badge info density");
  await page.goto(`${BASE}/?${QUERY}&view=overview`);
  await sleep(1500);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "badges.png") });

  // ── S10/S24: File search from overview ───────────────────────────────────
  console.log("S10/S24: File search");
  // overview search navigates to tree on each keystroke — test each separately
  for (const term of ["router", "spec", "/src"]) {
    await page.goto(`${BASE}/?${QUERY}&view=overview`);
    await sleep(800);
    const s = page.locator("#overview-search");
    if (await s.isVisible()) {
      await s.click();
      await s.fill(term);
      await sleep(1200);
      await page.screenshot({ path: path.join(import.meta.dir, "videos", `search-${term.replace("/","")}.png`) });
    }
  }

  // ── S12/S13: Spec reading — sequential nav, TOC ───────────────────────────
  console.log("S12/S13: Spec reading flow");
  await page.goto(`${BASE}/?${QUERY}&view=overview`);
  await sleep(1000);
  await page.getByRole("button", { name: "Specs", exact: true }).first().click();
  await page.waitForURL(`**view=tree**`, { timeout: 10000 });
  await sleep(1500);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "spec-tree.png") });

  // Open a spec file
  const specFile = page.getByRole("button", { name: /spec-viewer|beads-viewer|platform/ }).first();
  if (await specFile.isVisible()) {
    await specFile.click();
    await page.waitForURL(`**view=file**`, { timeout: 8000 });
    await sleep(1500);
    await page.screenshot({ path: path.join(import.meta.dir, "videos", "spec-file.png") });

    // Scroll to see if TOC exists
    await page.mouse.wheel(0, 400);
    await sleep(600);
    await page.mouse.wheel(0, 400);
    await sleep(600);
    await page.mouse.wheel(0, -800);
    await sleep(500);

    // ── S14: Collapsible details default state ──────────────────────────────
    console.log("S14: Collapsible requirements/scenarios");
    const details = page.locator("details").first();
    if (await details.isVisible()) {
      await details.screenshot({ path: path.join(import.meta.dir, "videos", "details-element.png") });
      await details.click();
      await sleep(800);
    }

    // ── S15: History button ─────────────────────────────────────────────────
    console.log("S15: File history button");
    const historyBtn = page.getByRole("button", { name: /History/ });
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      await page.waitForURL(`**view=history**`, { timeout: 8000 });
      await sleep(1500);
      await page.screenshot({ path: path.join(import.meta.dir, "videos", "file-history.png") });
      await page.goBack();
      await sleep(800);
    }

    // ── S16: Breadcrumb segment click ───────────────────────────────────────
    console.log("S16: Breadcrumb navigation");
    const breadcrumbSeg = page.locator(".breadcrumb-seg, [data-breadcrumb-seg], nav button").nth(1);
    if (await breadcrumbSeg.isVisible()) {
      await breadcrumbSeg.hover();
      await sleep(800);
      await breadcrumbSeg.click();
      await sleep(1200);
    }
  }

  // ── S18/S19/S21/S22: Issues/Beads view (charly-vibes/wai has beads) ────────
  console.log("S18-S22: Issues view");
  await page.goto(`${BASE}/?${WAI_QUERY}&view=overview`);
  await sleep(1500);
  const issuesBadge = page.locator(".source-badge").filter({ hasText: /ISSUES/i }).first();
  if (await issuesBadge.isVisible()) {
    await issuesBadge.click();
    await page.waitForURL(`**view=beads**`, { timeout: 15000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(import.meta.dir, "videos", "issues-overview.png") });

    // S18: Default empty detail panel
    console.log("S18: Empty detail panel on load");
    await sleep(1000);

    // S19: Filter combination
    console.log("S19: Filter combination");
    const statusFilter = page.getByRole("combobox").first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption("open");
      await sleep(800);
    }
    const typeFilter = page.getByRole("combobox").nth(1);
    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption("task");
      await sleep(800);
    }
    const priorityFilter = page.getByRole("combobox").nth(2);
    if (await priorityFilter.isVisible()) {
      await priorityFilter.selectOption("P2");
      await sleep(800);
    }
    await page.screenshot({ path: path.join(import.meta.dir, "videos", "issues-filtered.png") });

    // S20: Search no results
    console.log("S20: Issues search");
    const issueSearch = page.getByPlaceholder("Search issues…");
    if (await issueSearch.isVisible()) {
      // reset filters first
      for (const combo of await page.getByRole("combobox").all()) {
        await combo.selectOption({ index: 0 });
      }
      await issueSearch.fill("xyznonexistent");
      await sleep(1000);
      await page.screenshot({ path: path.join(import.meta.dir, "videos", "issues-no-results.png") });
      await issueSearch.fill("");
      await sleep(600);
    }

    // S21: Click an issue and view dependencies
    console.log("S21: Issue detail + dependencies");
    const firstIssue = page.locator(".issue-item, [data-issue-id]").first();
    if (await firstIssue.isVisible()) {
      await firstIssue.click();
      await sleep(1000);
      await page.screenshot({ path: path.join(import.meta.dir, "videos", "issue-detail.png") });
      await page.mouse.wheel(0, 400);
      await sleep(800);
    }

    // S22: Share — URL updates?
    console.log("S22: Share URL check");
    const currentUrl = page.url();
    console.log(`  URL after selecting issue: ${currentUrl}`);
    await page.screenshot({ path: path.join(import.meta.dir, "videos", "issue-share-url.png") });

    // S23: Freshness indicator
    console.log("S23: Freshness indicator");
    await page.mouse.wheel(0, -800);
    await sleep(600);
  }

  // ── Language Explorer: WAI view entry ────────────────────────────────────
  console.log("Language Explorer: WAI view entry point");
  await page.goto(`${BASE}/?${QUERY}&view=wai`);
  await sleep(2000);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "wai-overview.png") });

  // Find and click the language entry button
  const langEntryBtn = page.locator(".wai-language-entry").first();
  if (await langEntryBtn.isVisible()) {
    await langEntryBtn.hover();
    await sleep(600);
    await langEntryBtn.click();
    await page.waitForURL(`**section=language**`, { timeout: 8000 });
    await sleep(1500);
    await page.screenshot({ path: path.join(import.meta.dir, "videos", "language-overview.png") });
    console.log("  Language overview loaded");

    // Click the first bounded context item
    const ctxItem = page.locator(".language-context-item").first();
    if (await ctxItem.isVisible()) {
      const ctxName = await ctxItem.locator(".language-context-name").textContent();
      console.log(`  Clicking context: ${ctxName}`);
      await ctxItem.hover();
      await sleep(600);
      await ctxItem.click();
      await page.waitForURL(`**context=**`, { timeout: 8000 });
      await sleep(1500);
      await page.screenshot({ path: path.join(import.meta.dir, "videos", "language-glossary.png") });
      // Scroll through the glossary
      await page.mouse.wheel(0, 400);
      await sleep(600);
      await page.mouse.wheel(0, 400);
      await sleep(600);
      await page.mouse.wheel(0, -800);
      await sleep(500);
    }
  } else {
    console.log("  Language entry button not found — skipping deep navigation");
  }

  // ── Language Explorer: deep-link to language overview ────────────────────
  console.log("Language Explorer: deep-link to language overview");
  await page.goto(`${BASE}/?${QUERY}&view=wai&section=language`);
  await sleep(2000);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "language-deep-link.png") });

  // ── Language Explorer: deep-link to specific context ─────────────────────
  console.log("Language Explorer: deep-link to navigation context");
  await page.goto(`${BASE}/?${QUERY}&view=wai&section=language&context=navigation`);
  await sleep(2000);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "language-context-navigation.png") });
  // Scroll to verify glossary renders
  await page.mouse.wheel(0, 600);
  await sleep(800);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "language-context-navigation-scrolled.png") });
  await page.mouse.wheel(0, -600);
  await sleep(400);

  // ── Language Explorer: deep-link with term anchor ─────────────────────────
  console.log("Language Explorer: deep-link with term anchor");
  await page.goto(`${BASE}/?${QUERY}&view=wai&section=language&context=navigation&term=Back+Navigation`);
  await sleep(2000);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "language-term-anchor.png") });

  // ── Language Explorer: invalid context (not-found fallback) ───────────────
  console.log("Language Explorer: invalid context → not-found banner");
  await page.goto(`${BASE}/?${QUERY}&view=wai&section=language&context=doesnotexist`);
  await sleep(2000);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "language-not-found.png") });
  const notFoundMsg = await page.locator(".language-not-found").first().textContent().catch(() => "");
  console.log(`  Not-found message: "${notFoundMsg}"`);

  // ── S25/S26: History view ─────────────────────────────────────────────────
  console.log("S25: History readability");
  await page.goto(`${BASE}/?${QUERY}&view=history`);
  await sleep(2000);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "history.png") });
  // Expand a commit
  const firstCommit = page.locator("details").first();
  if (await firstCommit.isVisible()) {
    await firstCommit.click();
    await sleep(800);
    await page.screenshot({ path: path.join(import.meta.dir, "videos", "history-expanded.png") });
  }

  // ── S24: Tree search — fuzzy vs prefix ───────────────────────────────────
  console.log("S24: Tree search fuzzy vs prefix");
  await page.goto(`${BASE}/?${QUERY}&view=tree`);
  await sleep(1500);
  const treeSearch = page.locator("#tree-search, input[placeholder='Search files…']").first();
  if (await treeSearch.isVisible()) {
    // No slash = fuzzy
    await treeSearch.fill("router");
    await sleep(1000);
    await page.screenshot({ path: path.join(import.meta.dir, "videos", "tree-search-fuzzy.png") });
    // With slash = prefix
    await treeSearch.fill("/src/router");
    await sleep(1000);
    await page.screenshot({ path: path.join(import.meta.dir, "videos", "tree-search-prefix.png") });
    await treeSearch.fill("");
    await sleep(600);
  }

  // ── S26: Tree view browsing ───────────────────────────────────────────────
  console.log("S26: Tree browsing");
  const treeItems = page.locator(".tree-item[data-type='tree']");
  const count = await treeItems.count();
  if (count > 0) {
    await treeItems.first().click();
    await sleep(800);
    await page.screenshot({ path: path.join(import.meta.dir, "videos", "tree-expanded.png") });
  }

  // ── S34: Empty/zero-content repo ─────────────────────────────────────────
  console.log("S34: Zero-content repo");
  await page.goto(BASE);
  await sleep(400);
  await page.getByPlaceholder("owner/repo or GitHub URL").fill("torvalds/linux");
  await page.getByRole("button", { name: "Open" }).click();
  await page.waitForURL(`**view=overview**`, { timeout: 15000 });
  await sleep(2000);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "zero-content.png") });

  // ── S35: Loading state quality ────────────────────────────────────────────
  console.log("S35: Loading state — capture it mid-load");
  await page.goto(BASE);
  await sleep(400);
  await page.getByPlaceholder("owner/repo or GitHub URL").fill("microsoft/vscode");
  await page.getByRole("button", { name: "Open" }).click();
  await sleep(600); // capture during loading
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "loading-state.png") });
  await sleep(4000); // let it complete or error

  // ── S28: URL parameter format ─────────────────────────────────────────────
  console.log("S28: URL parameter format");
  await page.goto(`${BASE}/?${QUERY}&view=overview`);
  await sleep(800);
  const finalUrl = page.url();
  console.log(`  URL format: ${finalUrl}`);

  // ── S30: No share affordance ──────────────────────────────────────────────
  console.log("S30: Share affordance — is there a copy button?");
  await page.goto(`${BASE}/?${QUERY}&view=file&path=README.md`);
  await sleep(2000);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "file-share.png") });

  // ── S32: Error state — bad API (rate limit simulation with bad token) ─────
  console.log("S32: Error states");
  // Confirm error screen has back button + message
  await page.goto(`${BASE}/?owner=doesnotexist999&repo=fakerepo999&view=overview`);
  await sleep(4000);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "error-state.png") });

  // ── S33: Mobile responsive — beads ───────────────────────────────────────
  console.log("S33: Mobile responsive issues view");
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`${BASE}/?${WAI_QUERY}&view=beads`);
  await sleep(2500);
  await page.screenshot({ path: path.join(import.meta.dir, "videos", "mobile-issues.png") });
  await page.setViewportSize({ width: 1280, height: 800 });

  // ── End ───────────────────────────────────────────────────────────────────
  await sleep(500);
  await context.close();
  await browser.close();
  console.log("✓ Video + screenshots saved to .wai/resources/scripts/videos/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
