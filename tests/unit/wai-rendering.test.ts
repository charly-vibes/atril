import { describe, expect, test } from "bun:test";
import { renderWaiOverview } from "../../src/shared/wai-overview";

describe("renderWaiOverview (OpenSpec add-unified-repo-reader:4.2)", () => {
  test("renders grouped wai artifacts with project and shared sections", () => {
    const html = renderWaiOverview([
      {
        id: "project:atril",
        label: "Project: atril",
        mode: "project",
        paths: [
          ".wai/projects/atril/plan/2026-04-20-next-steps.md",
          ".wai/projects/atril/research/2026-04-20-findings.md",
        ],
      },
      {
        id: "location:resources",
        label: "Shared resources",
        mode: "location",
        paths: [".wai/resources/reflections/testing.md"],
      },
    ]);

    expect(html).toContain("WAI artifacts");
    expect(html).toContain("Grouped by project and shared location");
    expect(html).toContain("Project: atril");
    expect(html).toContain("Shared resources");
    expect(html).toContain('data-path=".wai/projects/atril/plan/2026-04-20-next-steps.md"');
    expect(html).toContain("testing.md");
  });

  test("renders an empty state when no wai artifacts can be browsed", () => {
    const html = renderWaiOverview([]);

    expect(html).toContain("No WAI artifacts available");
    expect(html).toContain("This repository exposes a .wai directory but no readable artifacts were detected.");
  });
});
