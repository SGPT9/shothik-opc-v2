
## 2024-03-24 - Redux useSelector Object Destructuring Anti-pattern
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { accessToken } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders. The component re-renders whenever ANY property on `state.auth` changes, not just `accessToken`.
**Action:** Always use specific property selectors (e.g., `const accessToken = useSelector(state => state.auth?.accessToken)`) to ensure components only re-render when the specific piece of state they care about changes.
