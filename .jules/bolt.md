
## 2026-11-11 - Object destructuring in Redux useSelector
**Learning:** Destructuring entire objects from Redux \`useSelector\` (e.g., \`const { accessToken } = useSelector(state => state.auth)\`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders.
**Action:** Use specific property selectors instead (e.g., \`const accessToken = useSelector(state => state.auth?.accessToken)\`).
