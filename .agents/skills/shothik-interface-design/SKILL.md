---
name: shothik-interface-design
description: Architectural rules, intent-first routing standards, and UI shell specifications for Shothik using the DeepSeek-close minimalist pattern (Ask-First composer, unified Tools menu, progressive disclosure, contextual user details, and privileged admin separation).
---

# Shothik Interface Design & Architecture Standard (DeepSeek-Close Direction)

## Overview

This skill provides implementation checklists, design tokens, and routing standards for developing, refactoring, and reviewing frontend components across Shothik (`artifacts/shothik/src/**/*`).

---

## 1. 3-Part Shell Architecture Matrix

| Shell Component | Primary Responsibilities | Prohibited Content |
| :--- | :--- | :--- |
| **`Sidebar`** | Navigation, workspace switcher, session history, saved reports. | Advanced workflow launchers, onboarding checklists, operational widgets. |
| **`Conversation`** | Empty state, transcript, composer, inline sources, follow-up actions. | Admin diagnostics, low-level execution logs, raw error stacks. |
| **`User Details Drawer`** | Output preview, artifact inspection, task history, source drill-down. | Raw trajectory dumps, execution debug traces, admin audits. |
| **`Admin Panel`** | Permission-gated debug logs, trajectory inspection, failure analysis. | End-user default surfaces. |

---

## 2. Empty State Implementation Checklist

- [x] Centered `[💬 Chat | 🎴 Work Canvas]` dual-mode toggle directly above the hero greeting.
- [x] Primary heading: `"What do you want to accomplish today?"`.
- [x] Subtitle: `"Ask a question, research deeply, generate slides, build models, or automate workflows."`.
- [x] 3 Outcome starter prompts:
  1. 🔬 **Research**: `"Research a market and summarize the findings"`
  2. ⚖️ **Analysis**: `"Compare options and recommend the best choice"`
  3. 📝 **Create**: `"Create a report, model, or draft from my idea"`
- [x] Zero launcher chip strips or promotional banners surrounding the composer.

---

## 3. Minimalist Composer & Unified `Tools` Menu

### Visible Toolbar Controls
- Textarea auto-resize.
- Send / Stop button.
- 📎 Attach menu (Documents, Images, Folders, URLs).
- 🎤 **Voice Input**: Speech-to-text dictation into textarea (`bn-BD` / `en-US`).
- 🌐 **Focus Selector**: Lightweight dropdown (`All Web & AI`, `Pro Search`, `Academic`).
- 🎙️ **Voice Mode**: Dedicated launcher button for 3D Conversational Voice Orb.
- **Model Selector**: Lightweight engine picker.

### Unified `Tools` Menu Taxonomy
```
Tools
├── 🔬 Research
│   ├── Deep Research (Multi-source web & academic intelligence)
│   └── Swarm Debate (3-agent adversarial critique)
├── 🎨 Create
│   ├── Slide Studio (Pitch decks & visual slides)
│   ├── Financial Model (ScenarioLab spreadsheet modeling)
│   ├── Code Engine (Full-stack React & InsForge schema)
│   ├── Venture Synthesis (1-sentence to company roadmap)
│   └── BoiMela 3D Studio (6x9 Royal Demy layout & 3D book flip)
├── 🌐 Web Automation
│   └── Browser Tasks (Autonomous form filling & navigation)
└── 🎙️ Voice Mode
    └── Conversational Voice Mode (Fluid real-time audio chat)
```

---

## 4. Intent-First Routing Engine Reference

```typescript
export function classifyPromptIntent(prompt: string, context?: WorkContext): RouteDestination {
  const normalized = prompt.toLowerCase();
  
  // 1. Repo / Codebase Work
  if (normalized.includes("github.com") || normalized.startsWith("analyze repo") || context?.hasRepo) {
    return { type: "CODE_ENGINE", surface: "CONVERSATION_PLUS_DRAWER" };
  }
  
  // 2. Web Automation
  if (normalized.includes("log into") || normalized.includes("fill form") || normalized.includes("automate web")) {
    return { type: "WEB_AUTOMATION", surface: "CONVERSATION_INLINE_STATUS" };
  }
  
  // 3. Deep Research
  if (normalized.includes("tam sam som") || normalized.includes("market size") || normalized.includes("deep research")) {
    return { type: "DEEP_RESEARCH", surface: "CONVERSATION_PLUS_DRAWER" };
  }
  
  // 4. Slide Studio
  if (normalized.includes("pitch deck") || normalized.includes("presentation slides")) {
    return { type: "SLIDE_STUDIO", surface: "CONVERSATION_PLUS_DRAWER" };
  }
  
  // 5. BoiMela 3D Book Studio
  if (normalized.includes("boimela") || normalized.includes("novel") || normalized.includes("book formatting")) {
    return { type: "WRITING_STUDIO", surface: "DEDICATED_STUDIO" };
  }
  
  // Default: Conversational Response with progressive disclosure
  return { type: "STANDARD_CHAT", surface: "CONVERSATION" };
}
```

---

## 5. Verification Gate

Always verify frontend changes against this rule using:
```bash
pnpm verify:frontend   # Runs Playwright automated visual QA & intent verification
pnpm verify:all        # Runs monorepo typecheck + server tests + visual QA
```
