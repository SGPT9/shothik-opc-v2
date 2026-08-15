---
description: Shothik DeepSeek-close interface design rules, intent-first routing, surface separation, and composer ergonomics.
globs: artifacts/shothik/src/**/*
alwaysApply: true
---

# Shothik Main Interface Design & Shell Rule

## Summary
This rule governs the UI shell, routing architecture, and component standards for Shothik using the **DeepSeek-close minimalist shell**. The main interface must be a focused, calm, and trustworthy workspace with clear separation between navigation, conversation, advanced workflows, user-facing secondary detail, and privileged admin inspection.

---

## 1. Design Principles (Mandatory)

1. **Ask-First**: The primary action on first paint is asking for work. The UI must never force the user to choose a mode or understand the product taxonomy before typing.
2. **Intent-First Routing**: The system infers the outcome from natural language (repo work, web automation, deep research, presentation decks, financial models, or conversational queries) rather than requiring pre-selection.
3. **Progressive Disclosure**: First paint must show only what is needed to begin. Secondary details and specialized panels appear only when explicitly opened or contextually produced.
4. **Surface Discipline**: Each surface owns one clear responsibility:
   - **Sidebar**: Global navigation & session history.
   - **Conversation Column**: Primary work surface & composer.
   - **Tools Menu**: Controlled launcher for advanced multi-agent workflows.
   - **Optional User Details Drawer**: Secondary user depth (output preview, history, sources). Closed by default.
   - **Admin Panel**: Separate, permission-gated debug, trajectory, and audit inspection.
5. **Separation of User Depth vs. Admin Depth**:
   - User Details: Output preview, artifact detail, task history, sources.
   - Admin Panel: Raw trajectory logs, debug stacks, low-level execution internals.

---

## 2. 3-Part Shell Structure

```
┌─────────────────┬───────────────────────────────────────────┬───────────────────────────┐
│     Sidebar     │            Conversation Column            │    User Details Drawer    │
│  (Navigation)   │          (Primary Work Surface)           │   (Contextual / Closed)   │
├─────────────────┼───────────────────────────────────────────┼───────────────────────────┤
│ • Workspace     │ [Empty State]: Calm Heading + 3 Prompts   │ • Output (Preview/Export) │
│ • History       │ [Transcript]:  Sources ➔ Answer ➔ Cards   │ • History (Prior Tasks)   │
│ • New Chat      │ [Composer]:    Input + Dictation + Tools  │ • Sources (Citations/Docs)│
└─────────────────┴───────────────────────────────────────────┴───────────────────────────┘
```

---

## 3. Empty State Standards

- **Heading**: `"What do you want to accomplish today?"`
- **Supporting Line**: `"Ask a question, research deeply, generate slides, build models, or automate workflows."`
- **3 Intent-First Starter Prompts**:
  1. 🔬 **Research**: `"Research a market and summarize the findings"`
  2. ⚖️ **Analysis**: `"Compare options and recommend the best choice"`
  3. 📝 **Create**: `"Create a report, model, or draft from my idea"`
- **Prohibited on First Paint**: Setup checklists, onboarding boxes, feature promotion cards, and multi-chip launcher walls.

---

## 4. Composer & Tools Menu Rules

- **Visible Controls**: Input box, Send/Stop button, Attach menu, Voice Dictation mic button, lightweight Focus selector (`All Web & AI`, `Pro Search`, `Academic`), and Model selector.
- **Prohibited Persistent Strips**: `Slide Studio`, `Synthesize Venture`, `Deep Research`, `Financial Model`, `Code Engine`, and persistent `Receipt` buttons must never appear as a persistent strip around the input box.
- **Unified `Tools` Menu**: All advanced workflows must be grouped into the `Tools` dropdown menu:
  - 🔬 **Research**: Deep Research, Swarm Debate.
  - 🎨 **Create**: Slide Studio, Financial Model, Code Engine, Venture Synthesis.
  - 🌐 **Web Automation**: Browser-driven tasks.
  - 🎙️ **Voice Mode**: Conversational Voice Mode.

---

## 5. Intent-First Routing Engine

All prompts must be automatically routed based on outcome and context without requiring manual mode switches:

| Prompt / Context | Inferred Intent | Execution Path | Surface |
| :--- | :--- | :--- | :--- |
| `github.com/...`, `analyze repo`, `fix issue` | Repo & Codebase | Code context & file inspector | Conversation + Code Artifact |
| `log into site`, `fill form`, `automate web` | Web Automation | Headless / live browser agent | Conversation + Progress status |
| `tam sam som`, `market size`, `competitors` | Deep Research | Multi-query research agent | Conversation + Research Panel |
| `create pitch deck`, `presentation slides` | Slide Studio | Marp / PPTX presentation studio | Conversation + Slide Studio |
| `mrr projection`, `financial model`, `pricing` | Financial Modeling | ScenarioLab spreadsheet engine | Conversation + Sheet Canvas |
| `approve`, `deny`, `share token` | Control Layer | Permission & secret checkpoints | Inline Control Card / Modal |

---

## 6. Dual-Voice Ergonomics

1. **Voice Input (Dictation)**:
   - Microphone button on the composer toolbar for speech-to-text dictation into the input box.
   - Dual-language support for Bengali (`bn-BD`) and English (`en-US`).
2. **Voice Mode (Conversational)**:
   - Real-time hands-free audio conversation with interactive visual feedback.
   - Discovered inside the `Tools` menu on standard/mobile screens.

---

## 7. Control Layer: Approvals & Secret Sharing

1. **Approve / Deny**:
   - Must appear distinctly from message bubbles before executing risky/irreversible actions (file editing, destructive commands, logging into external sites, publishing).
   - Must summarize the action and collapse into a clean audit trail upon resolution.
2. **Secret Share**:
   - Must provide a dedicated masked input modal for sensitive credentials (API keys, passwords, private tokens).
   - Sensitive values must never be echoed in plain text in transcripts.
