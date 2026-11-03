
## 2024-05-18 - Avoid Object Destructuring from useSelector
**Learning:** Destructuring entire objects from Redux `useSelector` (e.g., `const { currentChatId, title } = useSelector(state => state.researchChat)`) is a performance anti-pattern. It causes the component to re-render whenever ANY property in that state slice changes, even if the component doesn't use the changed property.
**Action:** Always use specific property selectors (e.g., `const currentChatId = useSelector(state => state.researchChat.currentChatId); const title = useSelector(state => state.researchChat.title);`) to minimize unnecessary re-renders.
