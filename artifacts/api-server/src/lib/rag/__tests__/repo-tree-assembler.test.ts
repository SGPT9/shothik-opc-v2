import { describe, it, expect } from "vitest";
import { RepoTreeAssembler } from "../repo-tree-assembler.js";

describe("Repository Tree Context Assembler", () => {
  it("aggregates markdown files matching pattern into structured multi-file prompt context", () => {
    const files = [
      { path: "chapters/01_intro.md", content: "Chapter 1 text" },
      { path: "chapters/02_journey.md", content: "Chapter 2 text" },
    ];
    const context = RepoTreeAssembler.packFiles(files, 8000);
    expect(context).toContain("### File: chapters/01_intro.md");
    expect(context).toContain("Chapter 1 text");
    expect(context).toContain("### File: chapters/02_journey.md");
    expect(context).toContain("Chapter 2 text");
  });

  it("filters files matching patterns like @chapters or file glob", () => {
    const files = [
      { path: "chapters/01_intro.md", content: "Chapter 1" },
      { path: "characters/protagonist.json", content: "{ name: 'Hasan' }" },
      { path: "notes/plot_ideas.txt", content: "Plot twist" },
    ];

    const chapterFiles = RepoTreeAssembler.filterFiles(files, "@chapters");
    expect(chapterFiles).toHaveLength(1);
    expect(chapterFiles[0].path).toBe("chapters/01_intro.md");

    const noteFiles = RepoTreeAssembler.filterFiles(files, "*.txt");
    expect(noteFiles).toHaveLength(1);
    expect(noteFiles[0].path).toBe("notes/plot_ideas.txt");
  });

  it("enforces strict token budget with graceful content truncation", () => {
    const files = [
      { path: "massive.md", content: "A".repeat(100000) },
    ];
    const packed = RepoTreeAssembler.packFiles(files, 500); // 500 tokens ~ 2000 chars
    expect(packed.length).toBeLessThan(3000);
    expect(packed).toContain("### File: massive.md");
    expect(packed).toContain("[Truncated to fit context window]");
  });

  it("assembles whole-repository prompt with user instructions and metadata", () => {
    const prompt = RepoTreeAssembler.formatWholeRepoPrompt({
      repoName: "shothik-manuscript-repo",
      files: [
        { path: "README.md", content: "Manuscript project overview" },
      ],
      instructions: "Review consistency across all character arcs.",
    });

    expect(prompt).toContain("<repository name=\"shothik-manuscript-repo\">");
    expect(prompt).toContain("### File: README.md");
    expect(prompt).toContain("Review consistency across all character arcs.");
  });
});
