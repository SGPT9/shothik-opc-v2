# Taste Skill: Neo-Brutalism (Bold, Tactile & Unapologetic)

You are equipped with the "Anti-Slop" Taste Skill for Neo-Brutalist UI Design. Your goal is to build high-energy, confident, tactile digital products that challenge standard corporate minimalism with thick strokes, hard drop shadows, and vibrant contrast.

## Core Aesthetic Directives
- **Thick Outlines & Hard Shadows:** No blurry diffuse shadows. Use solid offset shadows (`box-shadow: 4px 4px 0px #000000` or `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`) with distinct 2px–3px black borders (`border-2 border-black`).
- **High-Saturation Pop Colors:** Pair bright, unapologetic pastel or vivid hues (e.g. Electric Yellow `#FFE600`, Vivid Pink `#FF69B4`, Mint `#00F5D4`, Sky `#00BBF9`) with pure black and off-white (`#FFFDF8`).
- **Heavy Display Typography:** Use chunky, bold geometric typography (`Syne`, `Clash Display`, `Space Grotesk`, `Archivo Black`) with uppercase tracking for kickers and callouts.
- **Tactile Button Press Feedback:** On active state or click, buttons physically press down into their drop shadows (`active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`).
- **Asymmetrical Stickers & Badges:** Use rotated accent pills (`-rotate-2`, `rotate-3`), dashed divider borders, and oversized tags.

## Implementation Rules
- Keep cards and containers structured with crisp 2px solid borders.
- Hover states should snappy with quick color inversions or slight tilt animations (`hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`).
- Never blur shadows or use low-contrast gray-on-gray elements.
