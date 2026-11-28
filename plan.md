1. **Create Journal Entry**
   - Create `.jules/bolt.md` if it doesn't exist and add a critical learning about the Redux `useSelector` destructuring performance anti-pattern.
2. **Implement Optimization in `useAutoFreeze.js`**
   - Modify `artifacts/shothik/src/hooks/useAutoFreeze.js` to individually select `accessToken` and `user` from `state.auth` using `useSelector((state) => state.auth?.accessToken)` and `useSelector((state) => state.auth?.user)`.
   - Add a brief comment explaining the optimization (preventing unnecessary re-renders).
3. **Verify and Pre-commit Steps**
   - Run linter/typecheck and tests for `@workspace/shothik` using workspace commands to ensure no regressions.
   - Run `pre_commit_instructions` to ensure proper testing, verification, review, and reflection are done.
4. **Submit PR**
   - Submit the change with a title like "⚡ Bolt: [performance improvement] fix useSelector destructuring anti-pattern" and a description covering What, Why, Impact, and Measurement.
