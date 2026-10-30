## 2026-10-30 - Accessible Icon Buttons and Form Labels
**Learning:** Found instances where icon-only buttons lacked aria-labels and form inputs lacked id associations with their labels (htmlFor). This limits screen reader accessibility.
**Action:** Always verify that icon-only buttons have descriptive `aria-label` attributes and that form `<label>` elements are properly linked to `<input>` elements using `htmlFor` and `id` pairs.
