## YYYY-MM-DD - [Initial Creation]
**Vulnerability:** None
**Learning:** Initializing sentinel journal
**Prevention:** N/A

## 2024-05-24 - [XSS via Unsanitized SVG Rendering]
**Vulnerability:** Found a Cross-Site Scripting (XSS) vulnerability in `MarkdownMessage.tsx` where user-provided SVG text was rendered directly using `dangerouslySetInnerHTML` without any sanitization.
**Learning:** `dangerouslySetInnerHTML` is extremely dangerous with SVGs, as they can embed `<script>` tags or malicious event handlers like `onload`. Even though standard HTML tags might be considered in other contexts, rendering raw user input within an SVG context requires specialized sanitization (e.g., `DOMPurify` with `svg: true` profile).
**Prevention:** Always sanitize dynamically rendered SVG content using a dedicated sanitizer library like `DOMPurify` (with the `USE_PROFILES: { svg: true }` configuration) before passing it to `dangerouslySetInnerHTML`.
