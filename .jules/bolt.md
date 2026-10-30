## 2023-10-29 - [Optimizing Arrays]
**Learning:** Filtering arrays on render loops will create unnecessary renders and drop the frontend's performance.
**Action:** Use `useMemo` whenever trying to derive values from changing states to prevent unnecessary rerenders on the UI level.
