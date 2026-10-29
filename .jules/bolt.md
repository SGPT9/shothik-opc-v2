## 2024-05-18 - Unnecessary re-renders in TaskFeed
**Learning:** Components mapping over lists without `React.memo` and with inline callback functions passed as props cause the entire list to re-render when parent unrelated state changes.
**Action:** Always wrap large list item components in `React.memo` and wrap inline callbacks passed from parents with `useCallback` to maintain referential identity.
