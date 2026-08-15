---
name: shothik-interface-design
description: Architectural rules, intent-first routing standards, and UI shell specifications for Shothik using the DeepSeek-close minimalist pattern (Ask-First composer, unified Tools menu, progressive disclosure, contextual user details, and privileged admin separation).
---

# Shothik Interface Design & Architecture Standard

## Overview

This skill defines the architectural, ergonomic, and routing standards for Shothik's main interface using the **DeepSeek-Close Minimalist Shell**. The goal is a calm, dominant, and trustworthy workspace where asking for work is the primary action on first paint, while preserving Shothik's multi-agent workflows (Deep Research, Swarm Debate, Slide Studio, Financial Models, Code Generation, and Web Automation).

---

## Core Design Principles

1. **Ask-First**: The main interface exists for one job: *ask, read, continue*. Users are never forced to navigate complex taxonomy before typing.
2. **Intent-First Routing**: The system infers the outcome from natural language (repo work, web automation, deep research, presentation decks, financial models, or conversational queries) rather than requiring pre-selection.
3. **Progressive Disclosure**: The first screen displays only what is necessary to begin. Deeper technical controls and panels open only when explicitly requested or contextually relevant.
4. **Surface Discipline**: Each major UI surface owns exactly one responsibility:
   - **Sidebar**: Global navigation & session history.
   - **Conversation**: Primary working surface & composer.
   - **Tools Menu**: Controlled launcher for advanced multi-agent capabilities.
   - **User Details Drawer**: Contextual secondary inspection (output, history, sources).
   - **Admin Panel**: Permission-gated internal diagnostics, raw trajectory, and audit trails.
5. **Separation of User Depth vs. System Depth**: Output previews and session histories belong in the user-facing details drawer. Raw trajectory logs, debug stacks, and execution internals belong exclusively in privileged admin views.

---

## The 3-Part Shell Hierarchy

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

## Empty State & Starter Prompts

The empty state must be calm and distraction-free:
- **Heading**: `"What do you want to accomplish today?"`
- **Supporting Line**: `"Ask a question, research deeply, generate slides, build models, or automate workflows."`
- **3 Intent-First Starter Prompts** (Categorized by user outcome):
  1. 🔬 **Research**: *"Research a market and summarize findings"*
  2. ⚖️ **Analysis**: *"Compare options and recommend the best choice"*
  3. 📝 **Create**: *"Create a report, model, or draft from my idea"*
- **Prohibited on First Paint**: Onboarding checklists, setup wizards, launch walls, and operational widgets.

---

## Minimalist Composer & Tools Menu

### 1. Visible Composer Controls
- Multi-line auto-resizing textarea.
- Send / Stop button.
- 📎 Attach menu (Documents, Images, Folders, URLs).
- 🎤 **Voice Input**: Lightweight microphone button for speech-to-text dictation (supporting `bn-BD` and `en-US`).
- **Focus Selector**: Quiet answer-behavior switch (`All Web & AI`, `Pro Search`, `Academic`).
- **Model Selector**: Lightweight reasoning engine picker (`DeepSeek V4 Flash`, `DeepSeek V4 Pro`, `Gemini 2.5`).

### 2. Unified `Tools` Dropdown Menu
All advanced capabilities are grouped into a single, clean dropdown menu:
- 🔬 **Research**:
  - *Deep Research* (Multi-source web & academic intelligence)
  - *Swarm Debate* (3-agent adversarial critique)
- 🎨 **Create**:
  - *Slide Studio* (Pitch decks & visual slides)
  - *Financial Model* (ScenarioLab spreadsheet modeling)
  - *Code Engine* (Full-stack React & InsForge schema)
  - *Venture Synthesis* (1-sentence to company roadmap)
- 🌐 **Web Automation**:
  - *Browser Tasks* (Form fills, logins, data collection)
- 🎙️ **Voice Mode**:
  - *Conversational Voice Mode* (Fluid hands-free real-time chat)

---

## Intent-First Natural Language Routing Engine

When a prompt is submitted, the system classifies the request and chooses the appropriate execution path without requiring manual mode switching:

| User Input Pattern | Inferred Intent | Execution Path | Surface |
| :--- | :--- | :--- | :--- |
| `github.com/...`, `analyze repo`, `fix bug` | Codebase Analysis | Repo ingestion & code context | Conversation + Code Artifact |
| `log into site`, `fill form`, `scrape data` | Web Automation | Browser execution agent | Conversation + Progress status |
| `tam sam som`, `market size`, `competitor analysis` | Deep Research | Multi-query research agent | Conversation + Research Panel |
| `create pitch deck`, `presentation slides` | Slide Generation | Marp / PPTX presentation studio | Conversation + Slide Studio |
| `mrr projection`, `financial model`, `pricing` | Financial Modeling | ScenarioLab spreadsheet engine | Conversation + Sheet Canvas |
| `approve`, `deny`, `share token` | Control Layer | Permission / Secret gate | Inline Control Card |

---

## Dual-Voice Ergonomics

1. **Voice Input (Dictation)**:
   - Lives directly on the composer toolbar next to the attach icon.
   - Converts spoken words into editable text inside the input box.
   - Supports 1-click toggling between Bengali (`bn-BD`) and English (`en-US`).
2. **Voice Mode (Conversational)**:
   - Fluid real-time audio interaction with interactive avatar / orb feedback.
   - Lives inside the **`Tools`** menu on mobile and standard screens.

---

## Control Layer: Approvals & Secret Sharing

1. **Approve / Deny Cards**:
   - Distinct from chat bubbles with clear risk explanation before high-impact operations (file mutations, shell execution, external API publishing).
   - Collapses into a clean historical audit record once approved/denied.
2. **Secret Share Input**:
   - Dedicated masked input modal for sensitive credentials (API keys, passwords, database tokens).
   - Sensitive tokens are never echoed into raw transcript message strings.

---

## Compliance Checklist for Code Reviews

When reviewing or building UI components for Shothik, ensure:
- [ ] First paint has zero launcher strip clutter around the composer.
- [ ] Starter prompts express user outcomes rather than internal subsystem names.
- [ ] The `Tools` menu groups features into *Research*, *Create*, *Web Automation*, and *Voice*.
- [ ] Trajectory inspection, raw logs, and debug tools are restricted to privileged admin views.
- [ ] Artifact cards are compact and open the contextual user details drawer on click.
