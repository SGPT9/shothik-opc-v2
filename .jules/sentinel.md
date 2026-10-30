
## 2024-10-30 - XSS via SVG Code Block Rendering
**Vulnerability:** Unsanitized user/AI input rendered as HTML in `MarkdownMessage.tsx` for `svg` language code blocks using `dangerouslySetInnerHTML`.
**Learning:** Even if the expected language is `svg`, the payload can include embedded scripts (e.g., `<svg><script>...</script></svg>`) which execute immediately when rendered into the DOM.
**Prevention:** Always sanitize dynamically rendered SVG content using libraries like DOMPurify with strict SVG profiles (e.g., `{ USE_PROFILES: { svg: true } }`) before injecting it into the DOM.
