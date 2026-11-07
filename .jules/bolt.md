
## 2024-05-18 - Avoid Object Destructuring with useSelector
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { accessToken } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders when unrelated properties change.
**Action:** Use specific property selectors instead (e.g., `const accessToken = useSelector(state => state.auth.accessToken)`).
