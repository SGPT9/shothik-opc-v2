
## 2026-11-11 - Object destructuring in Redux useSelector
**Learning:** Destructuring entire objects from Redux \`useSelector\` (e.g., \`const { accessToken } = useSelector(state => state.auth)\`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders.
**Action:** Use specific property selectors instead (e.g., \`const accessToken = useSelector(state => state.auth?.accessToken)\`).
## 2024-05-24 - Redux useSelector Destructuring Anti-pattern
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { accessToken } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders because the component will re-render whenever *any* property on the object changes, not just the destructured ones.
**Action:** Always select specific properties directly in the selector function (e.g., `const accessToken = useSelector(state => state.auth.accessToken)`).
## 2024-05-24 - Artifact Cleanup
**Learning:** Using temporary script files (e.g., `replace.js`) to modify code via `run_in_bash_session` can leave behind untracked files that clutter the repository.
**Action:** Ensure you delete these artifacts (e.g., `rm replace.js`) immediately after they serve their purpose and before finalizing changes.
## 2024-03-24 - Redux Object Destructuring Anti-pattern
**Learning:** Destructuring entire objects from Redux useSelector (e.g., `const { accessToken } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders when other state properties change.
**Action:** Use specific property selectors instead (e.g., `const accessToken = useSelector(state => state.auth.accessToken)`).

## 2024-03-24 - Redux useSelector Object Destructuring Anti-pattern
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { accessToken } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders. The component re-renders whenever ANY property on `state.auth` changes, not just `accessToken`.
**Action:** Always use specific property selectors (e.g., `const accessToken = useSelector(state => state.auth?.accessToken)`) to ensure components only re-render when the specific piece of state they care about changes.
## 2025-02-18 - Avoid destructuring whole objects from useSelector
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { user } = useSelector((state) => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders when other unselected parts of the state change.
**Action:** Use specific property selectors instead (e.g., `const user = useSelector((state) => state.auth?.user)`).
## 2024-10-25 - Prevent React Re-renders from useSelector Destructuring
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { user } = useSelector(state => state.auth)`) is a common performance anti-pattern in this codebase causing unnecessary component re-renders when other unneeded properties change.
**Action:** Always use specific property selectors (e.g., `const user = useSelector(state => state.auth.user)`) to restrict subscriptions only to the required data, particularly in frequently re-rendered or heavy components.

## 2024-05-18 - Avoid Object Destructuring with useSelector
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { accessToken } = useSelector(state => state.auth)`) is a frequent performance anti-pattern in this codebase causing unnecessary re-renders when unrelated properties change.
**Action:** Use specific property selectors instead (e.g., `const accessToken = useSelector(state => state.auth.accessToken)`).
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
