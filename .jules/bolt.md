
## 2024-05-18 - Avoid Object Destructuring from useSelector
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { currentChatId, title } = useSelector(state => state.researchChat)`) is a performance anti-pattern. It causes the component to re-render whenever ANY property in that state slice changes, even if the component doesn't use the changed property.
**Action:** Always use specific property selectors (e.g., `const currentChatId = useSelector(state => state.researchChat.currentChatId); const title = useSelector(state => state.researchChat.title);`) to minimize unnecessary re-renders.
## 2024-05-18 - Unnecessary re-renders in TaskFeed
**Learning:** Components mapping over lists without `React.memo` and with inline callback functions passed as props cause the entire list to re-render when parent unrelated state changes.
**Action:** Always wrap large list item components in `React.memo` and wrap inline callbacks passed from parents with `useCallback` to maintain referential identity.
## 2024-05-15 - Unnecessary Arrays created in render
**Learning:** `useTranslation` returns a `t` function that we are mapping over arrays (`WRITING_TOOL_KEYS` and `AGENT_TOOL_KEYS`) in `NewButtonWithPopup` component on every render, which recreates the array on every render!
**Action:** Use `useMemo` to memoize the mapped arrays so they aren't recreated on every render if `t` doesn't change.
