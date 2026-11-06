
## 2026-11-06 - Redux useSelector Destructuring Anti-pattern
**Learning:** Destructuring entire slice objects from `useSelector` (e.g., `const { user } = useSelector(state => state.auth)`) triggers unnecessary component re-renders whenever ANY property within that slice changes, even if the component doesn't use the changed property. This is a common bottleneck in complex React applications in this codebase.
**Action:** Always select specific, primitive properties or narrow down the object selection (e.g., `const user = useSelector(state => state.auth.user)`) to avoid triggering unnecessary re-renders.
