# lib/office-engine/AGENTS.md
# Shothik Office Engine – DOCX, PPTX & Spreadsheet Generation

This document specifies the document processing and compilation conventions for `@workspace/office-engine`.

---

## 1. Stack & Architecture
- **DOCX Generation:** `docx` library with Banglish typography support
- **PPTX Generation:** `pptxgenjs` slide deck compiler
- **Parsing:** Markdown to AST transformation with AST-to-Office emitter

---

## 2. Key Conventions
- Document outputs must support Bengali Unicode fonts (e.g. Kalpurush, SolaimanLipi).
- Streaming exports must clean up temporary buffer allocations immediately.
