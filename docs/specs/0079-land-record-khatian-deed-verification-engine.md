# Spec 0079: Autonomous Bengali Land Record (Khatian/Porcha/দলিল) Verification, Chain-of-Ownership Title Search & Stamp Duty Valuation Engine

## 1. Executive Summary & Objective
In Bangladesh, over 75% of civil litigation and small business disputes stem from disputed land ownership, dual-registration of title deeds (সাফ-কোবালা/হেবা), broken chains of transfer (বায়া দলিল), and un-mutated khatians (সিএস, এসএ, আরএস, বিএস, সিটি জরিপ). Small enterprise owners, factory founders, and retail merchants frequently buy, lease, or mortgage land and warehouse properties without institutional legal counsel.

**Slice 79** introduces the **Autonomous Bengali Land Record & Deed Verification Engine** to ShothikGPT:
1. **Bengali Land Unit Normalization & Area Converter**: Converts traditional Bengal revenue units (শতাংশ/ডেসিমেল, কাঠা, বিঘা, ছটাক, একর, বর্গফুট, বর্গমিটার) with exact conversion constants (1 কাঠা = 1.65 শতাংশ = 720 sq ft; 1 বিঘা = 20 কাঠা = 33 শতাংশ; 1 একর = 100 শতাংশ).
2. **Chain-of-Ownership (বায়া দলিল) Sequence Auditor**: Analyzes historical deeds from original CS (Cadastral Survey 1888-1940) -> SA (State Acquisition 1956-1962) -> RS (Revisional Survey 1965-1990) -> BS/City Survey to detect broken chain links, missing succession certificates, or date discrepancies.
3. **Sub-Registry Stamp Duty & NBR Source Tax Calculator**: Computes statutory government fees under the Stamp Act 1899 and Registration Act 1908:
   - Registration Fee: 1%
   - Stamp Duty: 1.5%
   - Local Government Tax: 3% (City Corporation / Pourashava / Union Parishad)
   - Source Tax (AIT / আয়কর ধারা 53FF): 2% to 8% depending on mouza classification (Commercial vs Residential, Dhaka/Chittagong vs District).
   - Gain Tax & E-Gov fee (৳240) + N-fee (৳300).
4. **E-Mutation (ই-নামজারি) Compliance & Gap Analysis**: Screens required documentation for Assistant Commissioner (Land) AC Land / Tahsil office filings (মূল দলিল, বায়া দলিল, পর্চা, খতিয়ান, দাখিলা/ভূমি উন্নয়ন কর রসিদ, ওয়ারিশান সনদ).
5. **Cryptographic SHA-256 Title Search Audit Seal**: Generates a verifiable audit certificate sealing deed metadata, identified risk factors, and valuation summary.
6. **Frontend AG-UI Twin Studio Modal (`LandRegistryModal.tsx`)**: Real-time interactive cockpit with unit converter, deed analyzer, chain-of-ownership timeline, and mutation readiness gauge.

---

## 2. Acceptance Criteria (AC)

- **AC-1 (Unit Conversion & Daag Allocation)**: Accurately converts between শতাংশ, কাঠা, বিঘা, ছটাক, and sqft. Flags when transacted land area exceeds parent daag area.
- **AC-2 (Chain-of-Ownership Link Audit)**: Validates transfer lineage from root record to current seller. Detects gaps in transfer dates or missing বায়া দলিল.
- **AC-3 (Stamp Duty & Tax Incidence)**: Itemizes statutory registration fees, stamp duty, local govt tax, and AIT source tax across Dhaka City, Chattogram, Pourashava, and Union Parishad jurisdictions.
- **AC-4 (Mutation Filing Screener)**: Evaluates submitted documents against AC Land requirements, returning a readiness score (0-100%) and missing requirements list.
- **AC-5 (Cryptographic Verification Seal)**: Signs audit results with SHA-256 hash containing deed number, mouza, khatian, daag, and valuation.
- **AC-6 (Frontend AG-UI & Command Center)**: Responsive modal mounted with keyboard shortcut `⌥D`, integrated into `TwinCommandPalette.tsx` and `twin/page.tsx`.
