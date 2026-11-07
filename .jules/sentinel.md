## 2024-05-17 - XSS in SVG rendering using `dangerouslySetInnerHTML`

**Vulnerability:**
SVGs can contain `<script>` tags which can execute JavaScript when rendered directly into the DOM using `dangerouslySetInnerHTML`.
In this codebase, SVG content from markdown blocks (e.g. from an AI response) was being rendered this way in `MarkdownMessage.tsx`.

**Learning:**
Even though the `sanitizeHtml` utility exists in `src/lib/sanitize.ts` and strips `<svg>` tags, rendering raw SVGs with `dangerouslySetInnerHTML` bypassing sanitization creates an XSS vulnerability.

**Prevention:**
To safely render user-supplied SVGs without stripping the SVG content itself, sandbox them using an `<img>` tag with a Data URI (`data:image/svg+xml,${encodeURIComponent(text)}`). This prevents any embedded scripts from executing while preserving the visual content of the SVG.
