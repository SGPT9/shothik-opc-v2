## 2024-05-24 - Search Input Accessibility
**Learning:** Search inputs often lack explicit labels and clear buttons lack ARIA labels/focus states in custom UI components.
**Action:** Always ensure search inputs have an explicitly associated `<label>` (can be `sr-only` if visual design dictates) and that icon/text clear buttons are keyboard accessible with clear `aria-label` and `focus-visible` styles.
