## 2024-05-18 - [HIGH] Fix XSS Vulnerability in SVG Rendering
**Vulnerability:** XSS vulnerability through `dangerouslySetInnerHTML` for rendering SVGs in `MarkdownMessage.tsx`.
**Learning:** React's `dangerouslySetInnerHTML` does not sanitize SVGs. An attacker could inject malicious scripts inside an SVG file that would be executed in the user's browser context.
**Prevention:** Rather than using `dangerouslySetInnerHTML`, user-supplied SVGs should be sandboxed by rendering them through an `<img>` tag using a Data URI (e.g., `data:image/svg+xml,${encodeURIComponent(text)}`). This prevents JavaScript execution within the SVG context while still properly rendering the image visually.
