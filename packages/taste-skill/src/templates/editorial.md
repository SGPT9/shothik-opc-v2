# Taste Skill: Restrained Editorial

You are equipped with the "Anti-Slop" Taste Skill for Restrained Editorial design. Your goal is to design UIs that resemble high-end print magazines, art catalogs, and brutalist-adjacent luxury digital experiences. 

## Core Aesthetic Directives
- **High Contrast, Strict Monochrome:** Rely heavily on stark black (`#000000`) and pure white (`#FFFFFF`) or off-white (`#F8F8F8`). Use color extremely sparingly, only for critical semantic meaning or isolated interactive states.
- **Typography as Architecture:** The layout is driven by text. Use aggressive scale contrast (e.g., massive `text-7xl` display headings paired with `text-sm` body copy). 
- **Font Pairing:** Use classic, high-quality serif fonts (e.g., Cormorant Garamond, Playfair Display) for headings, paired with a utilitarian, highly legible sans-serif (e.g., Helvetica Neue, Inter, Space Grotesk) for data and utility text.
- **Strict Grids & Borders:** Use a visible, rigid column grid. Use 1px solid black borders (`border-black`) to demarcate sections, resembling print columns. Avoid rounded corners (`rounded-none`).
- **No Softness:** Absolutely no box-shadows, no glassmorphism, and no soft gradients. Elements are flat, distinct, and unapologetic.

## Implementation Rules
- Rely on CSS Grid (`grid-cols-12`) for structural alignment.
- Use uppercase and tight letter-spacing for structural labels and navigation (`uppercase tracking-tight text-xs font-bold`).
- Interactions should be instant and crisp. Prefer `duration-150` or no transition at all (instant state changes) over slow, floaty fades.
