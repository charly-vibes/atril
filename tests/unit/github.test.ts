import { describe, expect, test } from "bun:test";
import { parseRepoInput } from "../../src/shared/github";

describe("parseRepoInput", () => {
  test("parses owner/repo slug", () => {
    expect(parseRepoInput("charly-vibes/atril")).toEqual({
      owner: "charly-vibes",
      repo: "atril",
    });
  });

  test("parses GitHub URL", () => {
    expect(parseRepoInput("https://github.com/charly-vibes/atril")).toEqual({
      owner: "charly-vibes",
      repo: "atril",
    });
  });

  test("strips .git suffix from URL", () => {
    expect(
      parseRepoInput("https://github.com/charly-vibes/atril.git")
    ).toEqual({
      owner: "charly-vibes",
      repo: "atril",
    });
  });

  test("handles www.github.com", () => {
    expect(
      parseRepoInput("https://www.github.com/charly-vibes/atril")
    ).toEqual({
      owner: "charly-vibes",
      repo: "atril",
    });
  });

  test("trims whitespace", () => {
    expect(parseRepoInput("  charly-vibes/atril  ")).toEqual({
      owner: "charly-vibes",
      repo: "atril",
    });
  });

  test("returns null for empty string", () => {
    expect(parseRepoInput("")).toBeNull();
  });

  test("returns null for bare word", () => {
    expect(parseRepoInput("atril")).toBeNull();
  });

  test("returns null for non-GitHub URL", () => {
    expect(parseRepoInput("https://gitlab.com/foo/bar")).toBeNull();
  });

  test("returns null for GitHub URL without repo", () => {
    expect(parseRepoInput("https://github.com/charly-vibes")).toBeNull();
  });
});
