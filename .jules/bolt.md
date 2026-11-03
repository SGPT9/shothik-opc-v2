
## 2025-02-12 - Prevent Unnecessary Re-renders from useSelector Destructuring
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { accessToken } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders. It causes components to re-render whenever *any* property within the slice changes (because the object reference changes).
**Action:** Always use specific property selectors to ensure components only re-render when the specific property they depend on actually changes (e.g., `const accessToken = useSelector((state) => state.auth.accessToken);`).
