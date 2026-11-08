## 2026-11-05 - Bkash Checkout Modal Accessibility Improvements
**Learning:** In custom modal implementations like the Bkash Checkout, icon-only close buttons often lack `aria-label`s and proper keyboard focus states. Also, form inputs sometimes omit `id` and `htmlFor` associations.
**Action:** Always verify custom modal components have `aria-label`s on icon-only buttons, explicitly link labels to their inputs using `htmlFor` and `id`, and ensure focus states are visible for keyboard navigation (`focus-visible:ring-2`).
