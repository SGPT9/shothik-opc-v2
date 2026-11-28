## 2024-05-18 - Unnecessary re-renders in TaskFeed
**Learning:** Components mapping over lists without `React.memo` and with inline callback functions passed as props cause the entire list to re-render when parent unrelated state changes.
**Action:** Always wrap large list item components in `React.memo` and wrap inline callbacks passed from parents with `useCallback` to maintain referential identity.
## 2024-05-15 - Unnecessary Arrays created in render
**Learning:** `useTranslation` returns a `t` function that we are mapping over arrays (`WRITING_TOOL_KEYS` and `AGENT_TOOL_KEYS`) in `NewButtonWithPopup` component on every render, which recreates the array on every render!
**Action:** Use `useMemo` to memoize the mapped arrays so they aren't recreated on every render if `t` doesn't change.
