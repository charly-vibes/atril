import { describe, expect, test } from "bun:test";
import { renderWaiOverview } from "../../src/shared/wai-overview";

describe("renderWaiOverview", () => {
  test("renders PARA sections with nested project groups", () => {
    const html = renderWaiOverview([
      {
        id: "para:projects",
        label: "Projects",
        mode: "project",
        paths: [],
        children: [
          {
            id: "project:atril",
            label: "atril",
            mode: "project",
            paths: [],
            children: [
              {
                id: "project:atril:research",
                label: "Research",
                mode: "project",
                paths: [".wai/projects/atril/research/2026-04-20-findings.md"],
              },
            ],
          },
        ],
      },
      {
        id: "para:resources",
        label: "Resources",
        mode: "location",
        paths: [".wai/resources/reflections/testing.md"],
      },
    ]);

    expect(html).toContain("Projects");
    expect(html).toContain("atril");
    expect(html).toContain("Research");
    expect(html).toContain("Findings");
    expect(html).toContain("Resources");
    expect(html).toContain("Testing");
  });

  test("renders an empty state when no artifacts", () => {
    const html = renderWaiOverview([]);
    expect(html).toContain("No WAI artifacts available");
  });
});
