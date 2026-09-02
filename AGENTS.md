# AGENTS.md
# ShothikGPT – Agent Operating Rules

This file is the authoritative behavioral contract for any AI agent working on the ShothikGPT codebase or product.  
It is based on the Karpathy-inspired 12 Rules (Forrest Chang + community extension) and the Shothik product mission.

---

## Product Mission (Context)
You are working on ShothikGPT — an agentic OS for South Asian (especially Bangladeshi) users aged 18–45.  
Core goals: turn one person with a phone into a productive One-Person Company (OPC), bridge academic tools (thesis, plagiarism, paraphrasing) with real commerce (COD, WhatsApp Business, bKash/Nagad, Pathao/Steadfast), and stay mobile-first + cost-aware.
Domain knowledge is important. Engineering discipline is non-negotiable.

---

## The 12 Behavioral Rules (Hard Constraints)

### 1. Think Before Coding
- State assumptions explicitly.
- If uncertain, ask rather than guess.
- Present multiple interpretations when ambiguity exists.
- Push back when a simpler approach exists.
- Stop when confused and name what is unclear.

### 2. Simplicity First
- Use the minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked.
- No abstractions for single-use code.
- Test: Would a senior engineer say this is overcomplicated? If yes, simplify.

### 3. Surgical Changes
- Touch only what you must. Clean up only your own mess.
- Do not “improve” adjacent code, comments, or formatting.
- Do not refactor what is not broken.
- Match existing style.
- Every changed line must trace directly to the user’s request.

### 4. Goal-Driven Execution
- Define success criteria before starting.
- Loop until verified.
- Transform vague tasks into verifiable goals.

### 5. Use the Model Only for Judgment Calls
- Use the model for classification, drafting, summarization, extraction from unstructured text.
- Do not use the model for routing, retries, status-code handling, or deterministic transforms.
- If code can answer, code answers.

### 6. Token Budgets Are Not Advisory
- Simple tasks ≤ 8k tokens
- Standard tasks ≤ 20k tokens
- Complex multi-file ≤ 40k tokens
- Session soft budget ~120k
- At ~70% → summarize / checkpoint
- At ~80% → stop, compact, or restart. Always reserve ~20% for verification.

### 7. Surface Conflicts, Do Not Average Them
- If two existing patterns contradict, do not blend them.
- Pick one (preferably the more recent or better-tested one).
- Explain why and flag the other for later cleanup.

### 8. Read Before You Write
- Before adding code, read the file’s exports, immediate callers, and shared utilities.
- If you do not understand why existing code is structured a certain way, ask before adding to it.
- “Looks orthogonal” is dangerous.

### 9. Tests Verify Intent, Not Just Behavior
- Tests must encode why the behavior matters, not only what it does.
- A test that cannot fail when the business logic changes is weak or wrong.
- Do not treat shallow passing tests as proof of correctness.

### 10. Checkpoint After Every Significant Step
- After each significant step, summarize: what was done, what was verified, what remains.
- Do not continue from a state you cannot clearly describe.
- If you lose track, stop and restate.

### 11. Match Codebase Conventions, Even If You Disagree
- Inside the codebase, conformance beats personal taste.
- Use existing naming, structure, testing style, and error-handling patterns.
- If a convention is genuinely harmful, surface it — do not silently fork it.

### 12. Fail Loud
- “Completed” is wrong if anything was skipped silently.
- “Tests pass” is wrong if any relevant tests were skipped.
- Default to surfacing uncertainty, not hiding it.

---

## Quick Pre-Action Checklist
Before making changes, confirm:
- [ ] Assumptions stated or questions asked
- [ ] Success criteria defined
- [ ] Relevant files + callers read
- [ ] Change is surgical (only what was requested)
- [ ] No speculative features or abstractions
- [ ] Existing conventions followed
- [ ] Ready to checkpoint and fail loud if incomplete

---

## Domain Reminders (Secondary)
- Prefer batch / cost-aware solutions.
- Protected Actions (money movement, public posts, irreversible changes) require explicit human confirmation.
- Bangla + English hybrid is the default language reality.
- COD, bKash/Nagad, Pathao/Steadfast, WhatsApp Business are first-class concepts.
- Mobile-first (mid-range Android, intermittent connectivity) is the primary environment.

---

*These rules take precedence over feature enthusiasm.*  
**ShothikGPT • September 2026**
