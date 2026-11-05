## 2024-11-05 - Safe SVG Rendering in Markdown
**Vulnerability:** XSS vulnerability through direct `dangerouslySetInnerHTML` usage with SVGs in chat components.
**Learning:** `sanitizeHtml` strips `<svg>` tags by default. To securely render user-supplied SVGs without creating custom DOMPurify profiles or risking XSS, sandboxing them via an `<img>` tag data URI (`src=\`data:image/svg+xml,${encodeURIComponent(text)}\``) disables scripting execution while preserving layout rendering.
**Prevention:** Avoid `dangerouslySetInnerHTML` for arbitrary LLM/user input SVGs; use `<img>` data URI or `<iframe>` sandboxing.
