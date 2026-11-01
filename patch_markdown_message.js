const fs = require('fs');
const filePath = './artifacts/shothik/src/components/chat/MarkdownMessage.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Insert import
if (!content.includes('sanitizeSvg')) {
  const importStatement = 'import { sanitizeSvg } from "@/lib/sanitize";\n';

  // Find the last import
  const lines = content.split('\n');
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIdx = i;
    }
  }

  if (lastImportIdx !== -1) {
    lines.splice(lastImportIdx + 1, 0, importStatement);
    content = lines.join('\n');
  }
}

// Replace dangerouslySetInnerHTML for SVG
content = content.replace(
  /<div dangerouslySetInnerHTML={{ __html: text }} className="max-w-full max-h-64 flex items-center justify-center p-2" \/>/g,
  '<div dangerouslySetInnerHTML={{ __html: sanitizeSvg(text) }} className="max-w-full max-h-64 flex items-center justify-center p-2" />'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched MarkdownMessage.tsx successfully.');
