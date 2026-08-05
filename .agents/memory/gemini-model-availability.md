---
name: Gemini model availability with user API keys
description: Which Gemini models work with newly-created user API keys
---

Newly-created Gemini API keys (2026) get 404 "no longer available to new users" on the gemini-2.x model family — even though the ListModels endpoint still lists those models.

**Why:** Google gates older model families off for new accounts; the model list is not authoritative about access.

**How to apply:** when calling the Gemini REST API directly with a user-provided key, use the evergreen `gemini-flash-latest` alias (or a current model family); verify access with a real generateContent call, not ListModels.
