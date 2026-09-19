# packages/taste-skill/AGENTS.md
# Taste Skill – AI Design Taste & Typography Evaluator

This document specifies the evaluation rules for design quality, UI heuristics, and aesthetic scoring.

---

## 1. Stack & Architecture
- **Rules Engine:** 161 UI/UX design reasoning heuristics (WCAG AAA, typography pairs, micro-animations)
- **Framework Compatibility:** React, Next.js, Vite, Tailwind CSS

---

## 2. Key Conventions
- Avoid default browser colors; enforce curated HSL color schemes.
- Enforce strict contrast ratios $\ge 4.5:1$ for normal text and $\ge 3:1$ for large text.
