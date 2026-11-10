## 2025-02-18 - Avoid destructuring whole objects from useSelector
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { user } = useSelector((state) => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders when other unselected parts of the state change.
**Action:** Use specific property selectors instead (e.g., `const user = useSelector((state) => state.auth?.user)`).
