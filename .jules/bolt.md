## 2024-05-15 - Unnecessary Arrays created in render
**Learning:** `useTranslation` returns a `t` function that we are mapping over arrays (`WRITING_TOOL_KEYS` and `AGENT_TOOL_KEYS`) in `NewButtonWithPopup` component on every render, which recreates the array on every render!
**Action:** Use `useMemo` to memoize the mapped arrays so they aren't recreated on every render if `t` doesn't change.
