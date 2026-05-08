import { describe, expect, test } from "bun:test";
import { getScreenFocusSelector } from "../../src/shared/focus-management";

describe("getScreenFocusSelector", () => {
  test("returns back-button selectors for content screens", () => {
    expect(getScreenFocusSelector("file")).toBe("#file-back");
    expect(getScreenFocusSelector("beads")).toBe("#beads-back");
    expect(getScreenFocusSelector("history")).toBe("#history-back");
    expect(getScreenFocusSelector("wai")).toBe("#wai-back");
    expect(getScreenFocusSelector("specs")).toBe("#specs-back");
    expect(getScreenFocusSelector("tree")).toBe("#tree-back");
  });

  test("returns active category-card selector for overview", () => {
    expect(getScreenFocusSelector("overview")).toBe(".category-card[data-active='true']");
  });

  test("returns null for entry, loading, and error screens", () => {
    expect(getScreenFocusSelector("entry")).toBeNull();
    expect(getScreenFocusSelector("loading")).toBeNull();
    expect(getScreenFocusSelector("error")).toBeNull();
  });
});
