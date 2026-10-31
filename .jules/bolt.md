## 2026-10-31 - Memoizing List Item Components
**Learning:** In complex dashboards rendering lists of interactive items (like the TaskFeed in TwinPage), unmemoized list item components can cause significant performance bottlenecks by triggering full list re-renders when a single item's status updates.
**Action:** Always consider wrapping complex list item components in React.memo(), especially when the list frequently updates due to polling or streaming state changes.
