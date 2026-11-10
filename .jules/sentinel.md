## 2024-05-18 - XSS vulnerability in SVG markdown previews
**Vulnerability:** Cross-Site Scripting (XSS) via `<svg>` tags in markdown previews. The application rendered arbitrary user-supplied SVGs directly into the DOM using `dangerouslySetInnerHTML`.
**Learning:** `dangerouslySetInnerHTML` was used without sanitization because the standard `sanitizeHtml` function strips `<svg>` tags. This left the raw user input exposed to script execution since embedded `<script>` tags inside SVG elements execute when injected via inner HTML.
**Prevention:** When rendering user-supplied SVGs, sandbox them using an `<img>` tag with a Data URI (e.g., `data:image/svg+xml,${encodeURIComponent(text)}`) instead of inline HTML. `<img>` tags do not execute embedded scripts.
