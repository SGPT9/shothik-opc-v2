
## 2024-10-28 - React String Operations in Render Filters
**Learning:** In the `AgentCockpit` and similar components, calculating `.toLowerCase()` on the search query *inside* the `.filter()` callback for every element causes redundant O(N) string allocations during renders, creating unnecessary CPU pressure.
**Action:** Always extract static loop/filter transformations (like `.toLowerCase()` on a search input) outside of the `.filter()` callback and wrap the whole computation in `useMemo`.
