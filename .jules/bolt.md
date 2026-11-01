
## 2023-11-01 - Avoid Redundant Array Filtering on Unrelated State Changes
**Learning:** React components that filter arrays during render (like filtering search results based on a query) will recalculate those filters *every time* the component renders, even if the underlying data or search query hasn't changed (e.g., when a user switches tabs).
**Action:** Always wrap expensive or moderately expensive filtering logic in `useMemo`, depending on the source data (e.g., `servers`, `searchQuery`). Also, hoist constant operations like `toLowerCase()` outside the `.filter` loop to avoid repeating them for every item.
