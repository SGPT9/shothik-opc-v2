## 2024-03-24 - React Redux useSelector Destructuring Anti-pattern
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { accessToken } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders. Every time any property in the `auth` state changes, every component destructuring from it will re-render, even if the specific property they need didn't change.
**Action:** Use specific property selectors instead. Replace `const { prop } = useSelector(state => state.slice)` with `const prop = useSelector(state => state.slice.prop)`.
## 2024-06-25 - Redux useSelector Destructuring Anti-pattern
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { accessToken } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders. When the auth state changes (even for a different property), all components destructuring from `state.auth` will re-render.
**Action:** Always select specific properties instead of destructuring the whole object: `const accessToken = useSelector(state => state.auth?.accessToken)`. Apply this optimization when possible to prevent unnecessary re-renders.
## 2026-11-04 - Redux useSelector Destructuring Anti-Pattern
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { user } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase. It causes unnecessary re-renders whenever ANY property in the parent object (like `state.auth` or `state.settings`) changes, even if the destructured property itself didn't change.
**Action:** Always select exactly the property needed (e.g., `const user = useSelector(state => state.auth?.user)`) to ensure the component only re-renders when the specific piece of state it cares about actually changes.

## 2024-05-18 - Avoid Object Destructuring from useSelector
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { currentChatId, title } = useSelector(state => state.researchChat)`) is a performance anti-pattern. It causes the component to re-render whenever ANY property in that state slice changes, even if the component doesn't use the changed property.
**Action:** Always use specific property selectors (e.g., `const currentChatId = useSelector(state => state.researchChat.currentChatId); const title = useSelector(state => state.researchChat.title);`) to minimize unnecessary re-renders.
## 2024-05-18 - Unnecessary re-renders in TaskFeed
**Learning:** Components mapping over lists without `React.memo` and with inline callback functions passed as props cause the entire list to re-render when parent unrelated state changes.
**Action:** Always wrap large list item components in `React.memo` and wrap inline callbacks passed from parents with `useCallback` to maintain referential identity.
## 2024-05-15 - Unnecessary Arrays created in render
**Learning:** `useTranslation` returns a `t` function that we are mapping over arrays (`WRITING_TOOL_KEYS` and `AGENT_TOOL_KEYS`) in `NewButtonWithPopup` component on every render, which recreates the array on every render!
**Action:** Use `useMemo` to memoize the mapped arrays so they aren't recreated on every render if `t` doesn't change.
