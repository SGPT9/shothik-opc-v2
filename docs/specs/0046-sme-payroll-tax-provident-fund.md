# SPEC-0046: Autonomous SME Payroll Tax & Statutory Provident Fund / Gratuity Ledger Engine

## 1. Context & Motivation
Bangladeshi micro, small, and medium enterprises (MSMEs), factory workshops, tech agencies, and boutique retailers struggle with payroll tax compliance under the **Bangladesh Income Tax Act 2023 (আয়কর আইন ২০২৩)** and employee benefits under the **Bangladesh Labour Act 2006**.

Key operational friction points include:
1. Complex multi-tier progressive personal income tax calculation with gender-based tax-exempt thresholds (৳350,000 for male, ৳400,000 for female/seniors, ৳475,000 for disabled, ৳500,000 for freedom fighters) and minimum city corporation tax gates (৳5,000 / ৳4,000 / ৳3,000).
2. Failure to deduct and deposit monthly Tax Deducted at Source (TDS) under NBR Section 86, resulting in corporate disallowance of entire annual salary expenses.
3. Managing statutory Recognized Provident Fund (RPF) and Gratuity liability reserves without dedicated actuarial or accounting software.
4. Fragmented salary payouts between bKash/Nagad MFS Payroll and BEFTN/NPSB bank transfers without automated double-entry GL ledger synchronization.

This engine provides automated progressive payroll tax deduction, labour law compliant PF/Gratuity accruals, MFS/BEFTN disbursement batch compilation, and one-click NBR salary withholding tax certificates.

---

## 2. Core Architecture

```
                       [ Employee Roster & Attendance Timecard ]
                                         │
                         (Monthly Gross Salary Breakdown)
                                         ▼
                     ┌──────────────────────────────────────┐
                     │          SmePayrollEngine            │
                     │  - Basic, House Rent, Medical, Conv. │
                     │  - Income Tax Act 2023 Slabs (0-25%) │
                     │  - Minimum City Corp Tax Thresholds  │
                     └──────────────────┬───────────────────┘
                                        │
                                        ▼
                     ┌──────────────────────────────────────┐
                     │    Labour Act 2006 Benefits Module   │
                     │  - 10% Employee & Employer RPF Match │
                     │  - Gratuity Reserve Amortization     │
                     │  - NBR Withholding Tax Certificate   │
                     └──────────────────┬───────────────────┘
                                        │
                                        ▼
                     ┌──────────────────────────────────────┐
                     │  Multi-Channel Disbursement Compiler │
                     │  - bKash / Nagad MFS B2C Payroll API │
                     │  - BEFTN / NPSB Bank Batch Manifest  │
                     │  - Double-Entry GL Salary Posting    │
                     └──────────────────────────────────────┘
```

---

## 3. Statutory Tax Slabs (Income Tax Act 2023)

| Annual Taxable Income Tier | General Male | Female / Seniors (65+) | Disabled | Freedom Fighter | Tax Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Tax-Exempt)** | First ৳3,50,000 | First ৳4,00,000 | First ৳4,75,000 | First ৳5,00,000 | **0%** |
| **Tier 2** | Next ৳1,00,000 | Next ৳1,00,000 | Next ৳1,00,000 | Next ৳1,00,000 | **5%** |
| **Tier 3** | Next ৳3,00,000 | Next ৳3,00,000 | Next ৳3,00,000 | Next ৳3,00,000 | **10%** |
| **Tier 4** | Next ৳4,00,000 | Next ৳4,00,000 | Next ৳4,00,000 | Next ৳4,00,000 | **15%** |
| **Tier 5** | Next ৳5,00,000 | Next ৳5,00,000 | Next ৳5,00,000 | Next ৳5,00,000 | **20%** |
| **Tier 6 (Balance)** | Remaining Above | Remaining Above | Remaining Above | Remaining Above | **25%** |

---

## 4. Acceptance Criteria

- **AC-1: Income Tax Act 2023 Progressive Tax Calculator**: Compute exact annual taxable income and monthly TDS deductions across all gender/category thresholds and minimum city corporation tax floors.
- **AC-2: Provident Fund & Gratuity Accrual Engine**: Manage matching employer/employee Provident Fund deductions (e.g. 10% of basic) and monthly Gratuity fund liability accruals.
- **AC-3: Automated Double-Entry General Ledger Postings**:
  - Debit `5100 - Gross Salaries Expense`, Debit `5120 - Employer PF Contribution Expense`, Credit `2110 - Net Salaries Payable`, Credit `2120 - NBR TDS Withheld Payable`, Credit `2130 - Provident Fund Trust Payable`.
- **AC-4: MFS & BEFTN Payout Batch Compiler**: Generate validated bKash/Nagad MFS Payroll CSVs and BEFTN electronic fund transfer files for corporate banking.
- **AC-5: NBR Salary Tax Withholding Certificate (প্রত্যয়নপত্র)**: Generate printable official salary tax deduction certificates under Rule 21 of Income Tax Rules.
- **AC-6: Frontend Twin Studio Modal (`⌘Y`)**: Interactive studio modal featuring live payroll run wizard, progressive tax slab inspector, employee salary slips, and one-click MFS/BEFTN payout triggers.

---

## 5. REST API Endpoints
- `POST /api/v1/payroll/calculate`: Calculate gross-to-net salary, TDS withholding, and PF accruals for employee roster.
- `POST /api/v1/payroll/execute-run`: Execute monthly payroll run, compile disbursement manifests, and record double-entry GL ledger.
- `GET /api/v1/payroll/runs`: List historical monthly payroll runs.
- `GET /api/v1/payroll/summary`: Return annual payroll metrics, TDS remittance obligations, and PF trust reserves.
- `GET /api/v1/payroll/certificate/:employeeId`: Generate NBR statutory salary tax withholding certificate.

---

## 6. Verification Plan
- Unit & integration tests in `artifacts/api-server/src/routes/__tests__/payroll.test.ts`.
- Frontend Twin modal unit tests in `artifacts/shothik/src/components/twin/__tests__/PayrollTaxModal.test.tsx`.
- 100% test coverage with zero unhandled edge cases.
