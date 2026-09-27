# Spec 0060: Autonomous B2B Micro-Factoring, AI Accounts Receivable Radar & Early Liquidity Engine

## 1. Executive Summary & Objective
An autonomous B2B micro-factoring and early liquidity working-capital system for Bangladeshi suppliers, SMEs, and One-Person Companies (OPCs):
1. **B2B Corporate Buyer Credit Scoring Engine**: Rates creditworthiness and default risk of major Bangladeshi buyers (e.g., Pran-RFL, Square Pharmaceuticals, Akij Group, Beximco, ACI, Aarong, Shwapno) using historical payment settlement cycles.
2. **Accounts Receivable Aging Radar**: Classifies outstanding merchant invoices into standard aging buckets (0–30 days, 31–60 days, 61–90 days, 90+ days delinquent) and calculates expected recovery probabilities.
3. **Dynamic Early Liquidity Factoring Calculator**: Computes advance payment offers (typically 75%–90% of invoice face value), factoring discount fees based on annualized APR haircuts (12%–24% p.a.) and remaining tenure days until maturity.
4. **Legal Promissory Note & Cryptographic Lien Generator**: Generates enforceable factoring assignment contracts under the Bangladesh Contract Act 1872 & Negotiable Instruments Act 1881, sealed with SHA-256 digital hashes.
5. **Frontend AG-UI Twin Studio Modal**: Responsive cockpit with keyboard shortcut `⌘L` (or `Ctrl+L`), interactive invoice factoring sliders, real-time bKash/Nagad Enterprise payout disbursement triggers, and buyer risk badges.

---

## 2. Acceptance Criteria

- **AC-1**: B2B Corporate Credit Scoring: Evaluates credit tier (AAA, AA, A, BBB, HIGH_RISK) and default probability based on buyer profile and payment track record.
- **AC-2**: Accounts Receivable Aging Radar: Analyzes invoice portfolios, computes aging buckets, days sales outstanding (DSO), and cash collection forecasts.
- **AC-3**: Early Liquidity Factoring Calculator: Computes net advance disbursement amount, platform discount fee, and merchant payout with dynamic APR haircuts.
- **AC-4**: Legal Promissory Note & Cryptographic Lien: Generates legal assignment agreement text and SHA-256 seal.
- **AC-5**: Frontend Studio Modal: Interactive React/Next.js modal with shortcut `⌘L`, instant advance request toggles, and disbursement telemetry.
