---
description: Comprehensive Shothik DeepSeek-close interface design rules, intent-first routing standards, surface discipline, and composer ergonomics.
globs: artifacts/shothik/src/**/*
alwaysApply: true
---

# Shothik Main Interface Design Standard (DeepSeek-Close Direction)

## Summary
This rule governs the UI shell, routing architecture, and component standards for Shothik using the **DeepSeek-close minimalist shell**. The main interface is a focused, calm, and trustworthy workspace with clear separation between navigation, conversation, advanced workflows, user-facing secondary detail, and privileged admin inspection.

The core change is structural rather than cosmetic: the default user experience is centered on asking for work, reading results, and continuing the task. Advanced workflows (deep research, swarm debate, web automation, codebase work, slide decks, spreadsheet models, and 3D publishing) remain available via intent inference or the unified `Tools` menu, but never compete with the primary composer on first paint.

---

## 1. Design Principles

1. **Ask-First**: The main interface exists for one primary job: *ask, read, continue*. The interface must never demand mode selection or taxonomy comprehension before typing.
2. **Intent-First Routing**: The system infers whether the prompt is ordinary conversation, codebase work, web automation, deep research, presentation creation, financial modeling, or voice interaction directly from natural language.
3. **Progressive Disclosure**: First paint shows only what is needed to begin. Secondary depth appears only when the user requests it, clicks an artifact, or contextually needs it.
4. **Surface Discipline**: Each major UI surface owns one distinct responsibility:
   - **Sidebar**: Global navigation & session history.
   - **Conversation Column**: Primary work surface & composer.
   - **Tools Menu**: Controlled launcher for advanced multi-agent workflows.
   - **Optional User Details Drawer**: Secondary user depth (output preview, history, sources; closed by default).
   - **Admin Panel**: Separate, permission-gated debug, trajectory, and audit inspection.
5. **Separation of User Depth vs. System Depth**: Output previews and task histories belong in the user-facing details drawer. Raw trajectory logs, debug stacks, and execution internals belong exclusively in privileged admin views.

---

## 2. The 3-Part Shell Structure

```
┌─────────────────┬───────────────────────────────────────────┬───────────────────────────┐
│     Sidebar     │            Conversation Column            │    User Details Drawer    │
│  (Navigation)   │          (Primary Work Surface)           │   (Contextual / Closed)   │
├─────────────────┼───────────────────────────────────────────┼───────────────────────────┤
│ • Workspace     │ [Empty State]: Mode Toggle + Hero Greeting│ • Output (Preview/Export) │
│ • History       │ [Transcript]:  Sources ➔ Answer ➔ Cards   │ • History (Prior Tasks)   │
│ • New Chat      │ [Composer]:    Input + Dictation + Tools  │ • Sources (Citations/Docs)│
└─────────────────┴───────────────────────────────────────────┴───────────────────────────┘
```

---

## 3. Empty State Standards

- **Mode Switcher**: Centered `[💬 Chat | 🎴 Work Canvas]` segmented toggle positioned directly above the greeting.
- **Heading**: `"What do you want to accomplish today?"`
- **Supporting Line**: `"Ask a question, research deeply, generate slides, build models, or automate workflows."`
- **3 Intent-First Starter Prompts**:
  1. 🔬 **Research**: `"Research a market and summarize the findings"`
  2. ⚖️ **Analysis**: `"Compare options and recommend the best choice"`
  3. 📝 **Create**: `"Create a report, model, or draft from my idea"`
- **Prohibited on First Paint**: Setup checklists, onboarding boxes, feature promotion cards, and multi-chip launcher walls.

---

## 4. Composer & Tools Menu Rules

- **Visible Controls**: Multi-line textarea, Send/Stop button, Attach menu, Voice Dictation mic button, lightweight Focus selector (`All Web & AI`, `Pro Search`, `Academic`), and lightweight Model selector.
- **Prohibited Persistent Strips**: `Slide Studio`, `Synthesize Venture`, `Deep Research`, `Financial Model`, `Code Engine`, `Receipt`, and separate `Voice Orb` chips must never appear as a persistent launcher wall around the composer.
- **Unified `Tools` Menu**: All advanced workflows must be grouped into the `Tools` dropdown menu:
  - 🔬 **Research**: Deep Research, Swarm Debate.
  - 🎨 **Create**: Slide Studio, Financial Model, Code Engine, Venture Synthesis, BoiMela 3D Studio.
  - 🌐 **Web Automation**: Browser-driven navigation and form actions.
  - 🎙️ **Voice Mode**: Conversational Voice Mode.

---

## 5. Dual-Voice Ergonomics

1. **Voice Input (Dictation)**:
   - Microphone button on the composer toolbar for speech-to-text dictation directly into the input textarea.
   - Dual-language support for Bengali (`bn-BD`) and English (`en-US`).
2. **Voice Mode (Conversational)**:
   - Real-time conversational voice experience (interactive Voice Orb).
   - Accessible via the `Tools` menu and an ergonomic dedicated action button on the composer toolbar / header.

---

## 6. Transcript & Response Hierarchy

1. **Answer**: Primary and prominent with generous spacing.
2. **Sources**: Research-oriented answers keep sources tightly attached above or alongside the answer.
3. **Follow-Up Actions**: Contextual task continuations rather than feature promotions.
4. **Artifact Cards**: Compact, utility-first cards that open the Optional User Details panel when clicked.
5. **Thinking & Reasoning Accordion (`ThinkBox`)**: Collapsible, calm reasoning trace with live word metrics, duration, and one-click copy.

---

## 7. 5-Step Intent Routing Model

1. **Step 1: Detect Intent**: Classify prompt by outcome (information, analysis, creation, transformation, continue work, codebase, web automation, advanced workflow, control action).
2. **Step 2: Detect Context**: Evaluate repositories, files, URLs, session history, generated artifacts, or secrets.
3. **Step 3: Choose Execution Path**: Select between Normal Conversation, Repo Workflow, Web Automation, Advanced Workflow, or Control Flow.
4. **Step 4: Choose UI Surface**: Target Conversation, Tools, User Details Drawer, or Admin Panel.
5. **Step 5: Permission & Secret Checkpoints**: Trigger distinct Approve/Deny cards for risky actions and dedicated Secret Share modals for sensitive credentials.

---

## 8. Giant Tech Part 3 Artifact & Canvas Standards

Adopted from industry best practices (Anthropic Claude Artifacts, OpenAI ChatGPT Canvas, Cursor IDE, and Perplexity Pro):

1. **Bi-Directional Context Bridge**:
   - Selecting text in a document or cells in a spreadsheet canvas allows targeting follow-up prompts directly at that selection (`onCommentSelection`).
2. **Isolated Sandboxed Execution**:
   - Previews (React UI components, Python calculations, and SVG presentations) must execute in isolated sandboxes with zero risk of blocking the main chat thread.
3. **Grounded Coordinate Highlighting**:
   - Citations jump directly to the exact page and highlight the coordinate bounding box on the PDF/manuscript (`CitationBadge` ➔ `DocArtifact`).
4. **Transient State Feedback**:
   - All 1-click actions (Run Sandbox, Copy, Export CSV, Slide Remote, File Download) must display an immediate 2-second visual confirmation state (`select-none` + `cursor-pointer`).
5. **Draggable & Resizable Surface**:
   - Part 3 uses `ResizablePanelGroup` with a responsive draggable handle and global `Escape` key dismissal.

---

## 9. Cross-Platform Benchmark Synthesis Standards (ChatGPT, Perplexity, Cursor, Claude & Emerging Market Demographics)

1. **ChatGPT Alignment (Ask-First & Voice Ergonomics)**:
   - Maintain an uncluttered Ask-First composer with expandable pills for tools, web, and models.
   - Strictly separate direct speech-to-text dictation from full conversational voice orb interactions.
2. **Perplexity Alignment (Grounded Research & Trust Scores)**:
   - Real-time step progress banners (`Searching`, `Reading Sources`, `Reasoning`, `Synthesizing`).
   - Domain reliability score badges (`99.4% Verified`), DOI citations, and slide-in verbatim quote drawers.
3. **Cursor Alignment (Direct In-Place Editing & Zen Presentation)**:
   - All presentation slides, spreadsheet cells, and metric cards must support inline live editing on click.
   - 1-Click offline portable exports (Single-file `.html` presentations, `.csv` spreadsheets, `.md` research).
   - Zen Fullscreen Presentation mode (`⛶`) with complete keyboard navigation (`←`, `→`, `Space`, `Esc`).
4. **Claude Alignment (Pinned Suite Tabs & Collapsible Reasoning)**:
   - Pinned Work Canvas top tabs (`Slides`, `Sheet`, `Research`, `Doc`) with persistent state across tab switching.
   - Calm `ThinkBox` container with live execution metrics and token usage tracking.
5. **Demography-Aware Team Constraints (South Asia & Emerging Markets)**:
   - Low-RAM (2GB) memory budget: Virtualized grids and lightweight DOM nodes preventing browser tab crashes on entry-level Android devices.
   - Localized purchasing power (PPP): Micro-pass token counters (৳100 BDT) in the header with 1-tap bKash/Nagad deep-links.
   - High-contrast daylight legibility: WCAG AAA compliance (13.5:1 dark mode ratio, 12.8:1 white mode ratio) with Noto Sans Bengali font fallback.

---

## 10. Tri-Color Brand Palette Standard (Electric Blue, Pure White, Deep Obsidian Slate)

1. **Electric Blue Primary Brand Token (`--primary: #2563EB` / `oklch(0.56 0.22 255)` / `oklch(0.64 0.21 250)`)**:
   - Used for all primary actions, active tabs, focus rings, selected filters, and verified trust badges.
   - Generates high perceived value, crisp technological authority, and instant recognizability.
2. **Pure White Light Mode (`--background: #FAFAFC` / `--card: #FFFFFF` / `--foreground: #0F172A`)**:
   - Clean, glare-free, distractionless canvas with deep ink typography maintaining a 14.5:1 contrast ratio.
   - Subtle slate gray borders (`#E2E8F0`) and muted backdrops (`#F1F5F9`).
3. **Deep Obsidian Slate Dark Mode (`--background: #0B0F17` / `--card: #151B28` / `--foreground: #F8FAFC`)**:
   - Ultra-calm dark theme optimized for OLED and low-power screens without pitch-black harshness.
   - Vibrant sapphire blue highlights (`#3B82F6`) and slate divider lines (`#334155`) with 15.2:1 contrast ratio.

