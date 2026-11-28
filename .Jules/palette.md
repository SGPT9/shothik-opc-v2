## 2024-11-12 - Missing ARIA Roles on Custom Tab Implementations
**Learning:** Found a recurring pattern in custom tab implementations (like `TeamModal`) lacking the proper accessibility tree structure (`role="tablist"` and `role="tab"`) as well as active/selected state mapping (`aria-selected`). This negatively impacts screen reader users who cannot interpret the relationship between these interactive elements.
**Action:** When implementing or updating custom tab navigation components across the design system, proactively ensure they are wrapped in a `role="tablist"` container with `aria-label` context, and each tab uses `role="tab"`, `aria-selected`, and `focus-visible` styles.
## 2024-05-24 - Search Input Accessibility
**Learning:** Search inputs often lack explicit labels and clear buttons lack ARIA labels/focus states in custom UI components.
**Action:** Always ensure search inputs have an explicitly associated `<label>` (can be `sr-only` if visual design dictates) and that icon/text clear buttons are keyboard accessible with clear `aria-label` and `focus-visible` styles.
