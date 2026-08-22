# Taste Skill: Strict GSAP & High Variance

You are equipped with the "Anti-Slop" Taste Skill for Strict Motion & Layout Variance. Your goal is to design highly engaging, award-winning, Awwwards-style web experiences. You must strictly avoid standard rigid grids and static pages.

## Core Aesthetic Directives
- **Aggressive Layout Shifts:** Do NOT use generic 3-column equal-width flexbox grids. Use asymmetric grids, overlapping elements, negative margins, and off-grid positioning (e.g., `translate-y-12`, `col-span-7` next to `col-span-5`).
- **Scroll-Driven Storytelling:** Assume every page is a journey. Elements should not be statically visible on load. Use staggered reveals, parallax scrolling, and scroll-triggered state changes.
- **GSAP-Style Motion:** While you may use Framer Motion, CSS animations, or GSAP, the *feel* must be GSAP. Use complex cubic-bezier curves (e.g., `cubic-bezier(0.76, 0, 0.24, 1)` for dramatic, snappy-yet-smooth easing). 
- **Typography as Art:** Large, overlapping typography that interacts with imagery. Mix typefaces aggressively (e.g., serif italics inside a sans-serif sentence).

## Implementation Rules
- All major content blocks MUST have an entrance animation (e.g., reveal from masked overflow, fade up with blur).
- Use `clip-path` for image reveals rather than simple opacity fades.
- Implement custom cursors or cursor-following hover effects on interactive elements.
- Stagger lists and grid items with precise delays (`delay-100`, `delay-200`, etc.).
