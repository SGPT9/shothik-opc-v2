export interface RepoFileEntry {
  path: string;
  content: string;
  size?: number;
}

export interface WholeRepoPromptParams {
  repoName: string;
  files: RepoFileEntry[];
  instructions?: string;
  tokenBudget?: number;
}

export class RepoTreeAssembler {
  /**
   * Filters files based on glob patterns or semantic aliases like '@chapters'.
   */
  static filterFiles(files: RepoFileEntry[], pattern: string): RepoFileEntry[] {
    if (!pattern || pattern === "*") {
      return files;
    }

    const trimmed = pattern.trim().toLowerCase();

    // Semantic alias handling (e.g., @chapters, @characters, @notes)
    if (trimmed.startsWith("@")) {
      const alias = trimmed.slice(1);
      return files.filter((f) => {
        const lowerPath = f.path.toLowerCase();
        return lowerPath.includes(alias) || lowerPath.startsWith(`${alias}/`);
      });
    }

    // Glob wildcard pattern matching (e.g., *.md, chapters/*.txt)
    const regexPattern = trimmed
      .replace(/\./g, "\\.")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");
    const regex = new RegExp(`^${regexPattern}$|^.*${regexPattern}$`, "i");

    return files.filter((f) => regex.test(f.path));
  }

  /**
   * Aggregates multiple repository files into a structured markdown prompt context,
   * strictly adhering to a token budget (~4 characters per token).
   */
  static packFiles(files: RepoFileEntry[], tokenBudget: number = 8000): string {
    const maxChars = tokenBudget * 4;
    const packedParts: string[] = [];
    let currentChars = 0;

    for (const file of files) {
      const ext = file.path.split(".").pop() || "txt";
      const header = `### File: ${file.path}\n\`\`\`${ext}\n`;
      const footer = `\n\`\`\`\n\n`;

      const availableChars = maxChars - currentChars - header.length - footer.length;

      if (availableChars <= 0) {
        break;
      }

      if (file.content.length <= availableChars) {
        packedParts.push(`${header}${file.content}${footer}`);
        currentChars += header.length + file.content.length + footer.length;
      } else {
        // Truncate file content gracefully
        const truncatedContent = file.content.slice(0, Math.max(0, availableChars - 50));
        packedParts.push(
          `${header}${truncatedContent}\n[Truncated to fit context window]${footer}`
        );
        currentChars = maxChars;
        break;
      }
    }

    return packedParts.join("").trim();
  }

  /**
   * Generates a complete prompt envelope for LLM or Letta Twin ingestion.
   */
  static formatWholeRepoPrompt(params: WholeRepoPromptParams): string {
    const { repoName, files, instructions = "", tokenBudget = 8000 } = params;
    const packedContent = RepoTreeAssembler.packFiles(files, tokenBudget);

    return [
      `<repository name="${repoName}">`,
      packedContent,
      `</repository>`,
      instructions ? `\nInstructions:\n${instructions}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
}
