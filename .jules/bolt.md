## 2024-05-24 - Redux useSelector Destructuring Anti-pattern
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { accessToken } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders because the component will re-render whenever *any* property on the object changes, not just the destructured ones.
**Action:** Always select specific properties directly in the selector function (e.g., `const accessToken = useSelector(state => state.auth.accessToken)`).
