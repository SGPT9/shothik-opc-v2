import { logger } from "../logger";

export interface ParsedDocumentSection {
  pageNumber: number;
  header?: string;
  content: string;
  tables?: string[];
  type: "text" | "table" | "header";
}

export interface OpenDataLoaderResult {
  title: string;
  totalLength: number;
  pageCount: number;
  sections: ParsedDocumentSection[];
  markdown: string;
}

export class OpenDataLoaderBridge {
  /**
   * Parse a raw PDF buffer / base64 payload into structured markdown and sections
   */
  public async parsePdf(buffer: Buffer, filename: string = "document.pdf"): Promise<OpenDataLoaderResult> {
    try {
      // Fast heuristic extraction from PDF byte streams
      const rawText = buffer.toString("utf8");
      
      // Look for text streams in PDF object streams
      const textMatches: string[] = [];
      const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
      let match;

      while ((match = streamRegex.exec(rawText)) !== null) {
        const chunk = match[1];
        // Clean ASCII/UTF-8 readable text
        const cleaned = chunk
          .replace(/[^\x20-\x7E\n\r\t]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (cleaned.length > 20) {
          textMatches.push(cleaned);
        }
      }

      let fullContent = textMatches.join("\n\n");
      if (!fullContent || fullContent.length < 50) {
        // Fallback: extract all continuous printable sequences
        fullContent = rawText
          .replace(/[^\x20-\x7E\n\r\t]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      // Break into simulated pages / logical sections
      const paragraphs = fullContent.split(/\n\n+/).filter(p => p.trim().length > 0);
      const sections: ParsedDocumentSection[] = [];
      let currentPage = 1;
      let markdownBuilder = `# ${filename.replace(/\.pdf$/i, "")}\n\n`;

      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i].trim();
        if (i > 0 && i % 4 === 0) currentPage++;

        const isHeader = p.length < 80 && !p.endsWith(".");
        if (isHeader) {
          sections.push({
            pageNumber: currentPage,
            header: p,
            content: p,
            type: "header",
          });
          markdownBuilder += `\n## ${p}\n\n`;
        } else {
          sections.push({
            pageNumber: currentPage,
            content: p,
            type: "text",
          });
          markdownBuilder += `${p}\n\n`;
        }
      }

      return {
        title: filename,
        totalLength: markdownBuilder.length,
        pageCount: Math.max(1, currentPage),
        sections,
        markdown: markdownBuilder,
      };
    } catch (err: any) {
      logger.error({ error: err.message }, "[OpenDataLoaderBridge] PDF extraction error");
      throw new Error(`Failed to parse PDF document: ${err.message}`);
    }
  }

  /**
   * Parse plain text, markdown, CSV, or DOCX payloads
   */
  public parseTextDocument(content: string, filename: string): OpenDataLoaderResult {
    const isCsv = filename.endsWith(".csv");
    let markdown = content;

    if (isCsv) {
      // Format CSV into clean markdown table
      const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const header = lines[0].split(",").map(h => h.trim());
        const divider = header.map(() => "---");
        const rows = lines.slice(1).map(line => line.split(",").map(c => c.trim()));

        markdown = `| ${header.join(" | ")} |\n| ${divider.join(" | ")} |\n` +
          rows.map(r => `| ${r.join(" | ")} |`).join("\n");
      }
    }

    return {
      title: filename,
      totalLength: markdown.length,
      pageCount: Math.ceil(markdown.length / 3000),
      sections: [
        {
          pageNumber: 1,
          content: markdown,
          type: isCsv ? "table" : "text",
        },
      ],
      markdown,
    };
  }
}

export const openDataLoader = new OpenDataLoaderBridge();
