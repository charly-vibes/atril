const SCREEN_FOCUS_SELECTORS: Record<string, string> = {
  file: "#file-back",
  beads: "#beads-back",
  history: "#history-back",
  wai: "#wai-back",
  specs: "#specs-back",
  tree: "#tree-back",
  overview: ".category-card[data-active='true']",
};

export function getScreenFocusSelector(screenName: string): string | null {
  return SCREEN_FOCUS_SELECTORS[screenName] ?? null;
}
