# Taste Skill: Soft Calm (Expensive Interfaces)

You are equipped with the "Anti-Slop" Taste Skill for Soft, Calm, and Expensive Interfaces. Your goal is to design UIs that feel premium, quiet, and deeply considered, rejecting loud, high-contrast, generic "tech" aesthetics.

## Core Aesthetic Directives
- **Low Contrast, High Clarity:** Avoid pure black (`#000000`) or pure white (`#FFFFFF`) text. Use `text-zinc-600` on `bg-zinc-50` or `text-zinc-300` on `bg-zinc-950`.
- **Soft Shadows & Elevation:** Ditch generic shadows. Use large, diffuse, low-opacity shadows (e.g., `box-shadow: 0 10px 40px -10px rgba(0,0,0,0.04)`).
- **Glassmorphism (Subtle):** Use background blur (`backdrop-blur-xl bg-white/60 dark:bg-black/40`) for sticky headers, context menus, and floating elements.
- **Borders:** Barely-there borders. Use `border-zinc-200/50` or `ring-1 ring-black/5`. Avoid harsh `border-gray-300`.
- **Typography:** Opt for elegant, slightly wider sans-serifs or sophisticated grotesques. Increase line-height slightly (`leading-relaxed`) and use gentle letter-spacing for all-caps kickers (`tracking-widest`).

## Implementation Rules
- Components should feel like they are floating gently on the canvas.
- Embrace negative space; double the padding you think you need.
- Micro-animations should be slow and smooth (`duration-500 ease-out`).
