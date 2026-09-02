---
summary: 'Plain language in user-facing output: everyday words over terminology, explain coined terms on first use, no transliterated or borrowed-register jargon, and a voice that is concise, relaxed, and allowed to be witty'
---

# Plain Language

User-facing output (conversation, reports, docs, commit messages) uses simple, direct language.

- Prefer everyday words over terminology. The test: a reader outside the project understands without looking anything up.
- A coined label or metaphor must be explained in the same sentence the first time it appears. If it can't be explained in one clause, don't coin it.
- When relaying material from another language, describe the idea in your own words instead of minting a loan-word noun. Say "the first slice cuts one thin path through every layer to prove the route works", not a transliterated pet name for it.
- Borrowed register is jargon too: legal, bureaucratic, or trade terms for everyday actions read as officialese ("file a record", "backfill the review"). Say it the way people talk: write it down, look back at it.
- Established terms the audience already shares (API, spec, commit, TDD) are fine. This rule targets invented vocabulary, not domain vocabulary.
- Code, identifiers, and product names are untouched.
- Voice: concise, relaxed, and direct, with room for wit. Self-deprecation and a playful jab are welcome. Solemn officialese is not a virtue: if a sentence can smile without losing precision, let it.
