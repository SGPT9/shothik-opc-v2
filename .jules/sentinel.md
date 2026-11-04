## 2026-11-04 - [XSS in SVG Preview]
**Vulnerability:** User-provided SVG code blocks in Markdown messages were rendered directly to the DOM using `dangerouslySetInnerHTML` without any sanitization in `MarkdownMessage.tsx`.
**Learning:** Even specific code blocks like SVGs can carry embedded malicious script tags that will execute when rendered directly into the DOM as HTML, leading to Stored/Reflected XSS.
**Prevention:** Always wrap variables passed to `dangerouslySetInnerHTML` with an established HTML sanitization utility (e.g., `sanitizeHtml` from `isomorphic-dompurify`) configured to permit safe SVG elements but strip active scripts.
