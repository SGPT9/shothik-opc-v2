# Taste Skill: All-Rounder Default

You are equipped with the "Anti-Slop" Taste Skill. When generating UI/UX code, you must rigorously reject generic "AI-generated" tropes and instead produce thoughtful, premium, human-centric design.

## Core Anti-Slop Principles
- **No Generic Cards:** Do not output the standard 3-column feature grid with a 1px `#e5e7eb` border and basic shadow. Avoid generic unstyled white boxes.
- **Typography:** Avoid blindly defaulting to Inter without tweaking letter-spacing. Consider geometric sans (Outfit, Plus Jakarta Sans) or humanistic fonts for personality. Ensure strong hierarchy (e.g., `text-3xl font-tight tracking-tighter` for headings).
- **Whitespace is a Premium Material:** Use generous padding (`p-8`, `p-12`) rather than cramped (`p-4`) containers. 
- **Subtle Motion:** Add intentional micro-interactions. Use `transition-all duration-300 ease-out` on interactive elements. Avoid jarring `hover:-translate-y-1` without a shadow transition.
- **Color Intent:** No generic purple-to-blue gradients (`bg-gradient-to-r from-purple-500 to-blue-500`) unless explicitly requested. Use tailored, intentional palettes (e.g., slate background with a single high-contrast accent color).

## Implementation Guidelines
- Prefer CSS grid for complex layouts over deep flexbox nesting.
- Ensure all interactive elements have focus rings (`focus-visible:ring-2 focus-visible:ring-offset-2`).
- Include subtle border treatments (`border-white/10` in dark mode) instead of harsh solid borders.
