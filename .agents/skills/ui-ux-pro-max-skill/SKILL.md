---
name: ui-ux-pro-max
description: AI design intelligence for building professional UI/UX across multiple platforms and frameworks. Includes 161 design reasoning rules, 84 UI styles, color palette harmony, typography pairing, accessibility standards (WCAG AA/AAA), micro-animations, and UX auditing checklists.
---

# UI UX Pro Max Skill

This skill provides comprehensive UI/UX design intelligence, design system generation, and auditing capabilities for web applications.

## Core Design Principles & Auditing Rules

### 1. Typography & Hierarchy
- Use strong, harmonious font pairings (e.g., Inter / Outfit for modern tech, Cormorant Garamond / Montserrat for luxury/editorial).
- Establish clear type scale (h1, h2, h3, body, caption) with consistent `line-height` (1.2 for headings, 1.5-1.6 for body).

### 2. Color Palette & Contrast
- Maintain strict WCAG AA contrast (minimum 4.5:1 for body text, 3:1 for large text and UI components).
- Use HSL/tailored CSS variable colors with curated dark mode tones (e.g., slate-950/900 background, indigo/purple/cyan accents).

### 3. Layout & Micro-Interactions
- Ensure smooth hover states (`150ms-300ms` cubic-bezier transitions).
- Explicit `cursor-pointer` on all interactive buttons, cards, and links.
- Responsive breakpoints: Mobile (375px), Tablet (768px), Desktop (1024px+), Ultra-wide (1440px+).
- **Polsia 4-Column Grid Layout**:
  - *Col 1*: Agent Control & Status (`260px`)
  - *Col 2*: Task Queue & Document Store (`minmax(0, 1fr)`)
  - *Col 3*: Output & Publishing Channels (`280px`)
  - *Col 4*: Narrative Log Feed & Composer (`360px`)
- **3-Fold IDE Workspace Layout**:
  - *Fold 1*: Left Nav Chapter/File Explorer (`leftNavOpen`)
  - *Fold 2*: Center Canvas (*Writing Studio, Fortune Sheet, Mind Map, Slides*)
  - *Fold 3*: Right AI Sub-Agent Execution Console (`rightConsoleOpen`)

### 4. Accessibility & Semantic HTML
- No raw emojis as primary UI icons — use SVG iconography (Lucide / Heroicons).
- Visible focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`) for keyboard accessibility.
- Semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`) with explicit `aria-label` attributes on icon-only controls.

### 5. Performance & Core Web Vitals (CWV)
- Optimize LCP (Largest Contentful Paint) via lazy image loading, font preloading, and Turbopack output tracing.
- Prevent layout shifts (CLS) by reserving explicit container dimensions.

---

## 🎨 ChatGPT & Perplexity UI/UX Design Synthesis (Learned Patterns)

### A. ChatGPT Design Intelligence
- **Minimalist Centered Canvas**: Keep main chat thread spacious, centered, and 100% width. Hide secondary tool button clutter until hovered.
- **Status Micro-Copy**: Display clear real-time action status ("Searching live web...", "Running 2GB RAM stress test...", "Synthesizing TAM/SAM/SOM...") instead of generic loading spinners.
- **Inline Canvas Handoff**: Seamlessly slide out 4-Tab Replit Canvas (`ArtifactPanel.tsx`) when structured content (slides, sheets, code) is generated.

### B. Perplexity Search Intelligence
- **Interactive Source Citation Cards**: Display numbered favicon source pills (`[1]`, `[2]`, `[3]`) linked directly to primary sources.
- **Contextual Follow-up Query Pills**: Render 3 interactive follow-up question pills at the bottom of every research response.
- **High-Density Tabular Answers**: Structure competitive research and market sizing data into clean, scannable markdown tables.

### C. The Shothik Edge (Real-World Action Layer)
- Combine **ChatGPT's clean layout** + **Perplexity's citation pills** + **Shothik's 1-Tap Execution Cards** (`bKash Pay`, `Steadfast Booking`, `NBR Tax Clearance`).

