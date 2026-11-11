## 2024-03-24 - Redux Object Destructuring Anti-pattern
**Learning:** Destructuring entire objects from Redux useSelector (e.g., `const { accessToken } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders when other state properties change.
**Action:** Use specific property selectors instead (e.g., `const accessToken = useSelector(state => state.auth.accessToken)`).
