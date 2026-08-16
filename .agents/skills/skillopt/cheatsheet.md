# SkillOpt Quick Reference Cheatsheet

| Component | Purpose | Default Constraint |
|---|---|---|
| **Textual LR Budget** | Restricts diff size per step | Max 300 characters / 50 tokens |
| **Validation Gate** | Prevents accuracy regression | $S_{val}' > S_{val}$ |
| **Rejected Buffer** | Avoids repeating bad edits | Max 20 historical rejected diffs |
| **Slow Meta Update** | Consolidates redundant instructions | Every 5 epochs |
