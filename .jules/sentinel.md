## 2025-02-14 - Fix Hardcoded Webhook Verify Token
**Vulnerability:** A hardcoded fallback value "shothik_chatbotx_secret_token" was being used for `META_WEBHOOK_VERIFY_TOKEN` in `app/api/chatbotx/webhook/route.ts`.
**Learning:** Hardcoding secrets or their fallbacks in source code exposes them to anyone with read access to the repository, leading to potential unauthorized access or webhook impersonation.
**Prevention:** Never use hardcoded strings as fallbacks for secrets. Enforce the presence of required environment variables and fail securely (e.g., return a 500 error) if they are missing.
