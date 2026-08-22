# Taste Skill 🎨

**Taste Skill** is a portable system designed to stop AI coding agents (like Cursor, Claude, or Trae) from generating generic, boring frontend slop. It forces better layout hierarchy, premium typography, generous whitespace, and subtle micro-interactions to instantly elevate your UI.

## Overview

AI agents are great at logic, but they often default to basic, utilitarian designs—using primary colors, dense layouts, and default system fonts. Taste Skill injects a curated set of rules directly into your agent's workspace to force it to output high-end, premium interfaces from the first prompt.

## Installation

You can bootstrap Taste Skill into any project using our CLI:

```bash
npx @shothik/taste-skill init
```

This command will:
1. Create a `.agents/rules` directory in your workspace.
2. Inject our core `taste-design-system.md` rulebook.
3. Configure your `AGENTS.md` (or equivalent system prompt file) to reference these rules.

## Core Principles Enforced

When an AI agent reads the Taste Skill rulebook, it will adhere to:

- **Generous Whitespace**: Double the default padding and margins (e.g., `p-8` instead of `p-4`).
- **Cool-Gray Palette**: Swap pure whites and blacks for sophisticated grays (`#f5f6f7` for light mode, `#0b0f17` for dark mode).
- **Glassmorphism**: Use subtle backdrop blurs and semi-transparent borders for floating elements.
- **Micro-Animations**: Add `transition-all duration-200 ease-in-out` on interactive elements.
- **System Typography**: Prioritize modern system fonts (Inter, SF Pro) with strict weight hierarchy.
- **Progressive Disclosure**: Hide complex toolbars and settings until the user actually interacts with them (e.g., on-focus or on-hover).

## Examples

### Before (Typical AI Output)
```tsx
<div className="p-4 border rounded bg-white">
  <h2 className="font-bold text-black">Title</h2>
  <button className="bg-blue-500 text-white p-2">Submit</button>
</div>
```

### After (With Taste Skill)
```tsx
<div className="p-8 rounded-2xl bg-white/50 backdrop-blur-md border border-gray-200/50 shadow-sm transition-all hover:shadow-md">
  <h2 className="text-xl font-semibold tracking-tight text-gray-900 mb-2">Title</h2>
  <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-medium transition-colors">
    Submit
  </button>
</div>
```

## Manual Setup (Cursor/Claude)

If you don't want to use the CLI, you can manually copy the rules:

1. Create a file named `.cursorrules` or `.claude.md` in your project root.
2. Copy the contents of `src/rules/taste-design-system.md` into it.
3. Restart your AI session.

## License
MIT
