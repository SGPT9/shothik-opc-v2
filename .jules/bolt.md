## 2024-10-25 - Prevent React Re-renders from useSelector Destructuring
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { user } = useSelector(state => state.auth)`) is a common performance anti-pattern in this codebase causing unnecessary component re-renders when other unneeded properties change.
**Action:** Always use specific property selectors (e.g., `const user = useSelector(state => state.auth.user)`) to restrict subscriptions only to the required data, particularly in frequently re-rendered or heavy components.
