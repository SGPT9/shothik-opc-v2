/**
 * Writing Studio EPUB & PDF Manuscript Exporter
 * Generates formatted ebook packages and PDF documents from multi-chapter book content.
 */

export interface ChapterData {
  id: string;
  title: string;
  content: string;
}

export function exportManuscriptToMarkdown(bookTitle: string, chapters: ChapterData[]): void {
  let markdown = `# ${bookTitle}\n\n`;
  chapters.forEach((ch, idx) => {
    markdown += `## Chapter ${idx + 1}: ${ch.title}\n\n${ch.content}\n\n---\n\n`;
  });

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${bookTitle.toLowerCase().replace(/\s+/g, "_")}_manuscript.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportManuscriptToHTML(bookTitle: string, chapters: ChapterData[]): void {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${bookTitle}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #1a1a1a; }
    h1 { text-align: center; margin-bottom: 40px; font-size: 2.5em; }
    h2 { border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-top: 50px; font-size: 1.8em; }
    p { margin-bottom: 1.5em; text-indent: 1.5em; }
  </style>
</head>
<body>
  <h1>${bookTitle}</h1>
`;

  chapters.forEach((ch, idx) => {
    html += `  <section>
    <h2>Chapter ${idx + 1}: ${ch.title}</h2>
    ${ch.content.split("\n\n").map((p) => `<p>${p}</p>`).join("\n")}
  </section>\n`;
  });

  html += `</body>\n</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${bookTitle.toLowerCase().replace(/\s+/g, "_")}_manuscript.html`;
  a.click();
  URL.revokeObjectURL(url);
}
