import { describe, it, expect } from "vitest";
import { GitCitationFormatter } from "../git-citation-formatter.js";

describe("Git Citation Formatter", () => {
  it("formats source metadata into clickable GitHub and Studio line anchor URLs", () => {
    const pill = GitCitationFormatter.formatCitationPill({
      repo: "user/novel",
      commitSha: "a1b2c3d4",
      filePath: "chapters/ch1.md",
      startLine: 12,
      endLine: 18,
    });

    expect(pill.gitUrl).toBe("https://github.com/user/novel/blob/a1b2c3d4/chapters/ch1.md#L12-L18");
    expect(pill.label).toBe("novel:ch1.md:12-18");
    expect(pill.studioDeepLink).toContain("shothik://studio/source");
    expect(pill.studioDeepLink).toContain("line=12");
  });

  it("handles single line citations without endLine range", () => {
    const pill = GitCitationFormatter.formatCitationPill({
      repo: "academics/thesis",
      commitSha: "9876fedc",
      filePath: "methodology.tex",
      startLine: 45,
    });

    expect(pill.gitUrl).toBe("https://github.com/academics/thesis/blob/9876fedc/methodology.tex#L45");
    expect(pill.label).toBe("thesis:methodology.tex:45");
  });

  it("extracts and parses markdown citation pills from generated draft text", () => {
    const markdown = "বুলবুল নদীর তীরে দাঁড়িয়ে ছিল [^git:user/novel:chapters/ch1.md:12-18]।";
    const citations = GitCitationFormatter.parseFootnotes(markdown);

    expect(citations).toHaveLength(1);
    expect(citations[0].repo).toBe("user/novel");
    expect(citations[0].filePath).toBe("chapters/ch1.md");
    expect(citations[0].startLine).toBe(12);
    expect(citations[0].endLine).toBe(18);
  });
});
