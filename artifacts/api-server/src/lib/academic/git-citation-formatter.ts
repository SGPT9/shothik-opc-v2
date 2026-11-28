export interface GitCitationParams {
  repo: string;
  commitSha: string;
  filePath: string;
  startLine: number;
  endLine?: number;
  snippet?: string;
}

export interface GitCitationPill {
  repo: string;
  commitSha: string;
  filePath: string;
  startLine: number;
  endLine?: number;
  gitUrl: string;
  studioDeepLink: string;
  label: string;
  snippet?: string;
}

export interface ParsedFootnote {
  repo: string;
  filePath: string;
  startLine: number;
  endLine?: number;
}

export class GitCitationFormatter {
  /**
   * Formats source repository commit metadata into clickable GitHub and Studio deep link pills.
   */
  static formatCitationPill(params: GitCitationParams): GitCitationPill {
    const { repo, commitSha, filePath, startLine, endLine, snippet } = params;

    const lineAnchor = endLine && endLine !== startLine ? `L${startLine}-L${endLine}` : `L${startLine}`;
    const gitUrl = `https://github.com/${repo}/blob/${commitSha}/${filePath}#${lineAnchor}`;

    const repoShort = repo.split("/").pop() || repo;
    const fileShort = filePath.split("/").pop() || filePath;
    const rangeLabel = endLine && endLine !== startLine ? `${startLine}-${endLine}` : `${startLine}`;
    const label = `${repoShort}:${fileShort}:${rangeLabel}`;

    const endLineParam = endLine && endLine !== startLine ? `&endLine=${endLine}` : "";
    const studioDeepLink = `shothik://studio/source?repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(filePath)}&line=${startLine}${endLineParam}`;

    return {
      repo,
      commitSha,
      filePath,
      startLine,
      endLine,
      gitUrl,
      studioDeepLink,
      label,
      snippet,
    };
  }

  /**
   * Parses markdown footnote citation tokens like [^git:owner/repo:path/to/file.md:12-18]
   */
  static parseFootnotes(text: string): ParsedFootnote[] {
    const pattern = /\[\^git:([^:]+):([^:]+):(\d+)(?:-(\d+))?\]/g;
    const results: ParsedFootnote[] = [];

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      results.push({
        repo: match[1],
        filePath: match[2],
        startLine: parseInt(match[3], 10),
        endLine: match[4] ? parseInt(match[4], 10) : undefined,
      });
    }

    return results;
  }
}
