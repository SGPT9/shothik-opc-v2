---
name: demography-aware-tech-team
description: Autonomous multi-agent software engineering team specialized in building, optimizing, and deploying web apps tailored for South Asian & Emerging Market demographics (bKash/Nagad payments, Banglish NLP, Steadfast couriers, 6GB RAM smartphone optimization).
globs: "*.ts, *.tsx, *.jsx, *.md"
alwaysApply: false
---

# 🇧🇩 Demography-Aware Autonomous Tech Team Skill

An autonomous agent skill that configures a specialized engineering team (Frontend Architect, MFS Payment Engineer, Logistics Integration Specialist, Hardware Performance Auditor) to build software optimized for South Asian and Emerging Market demographics.

---

## 🛠️ Core Engineering Directives

### 1. Mobile-First & 6GB RAM Hardware Optimization
- **Hardware Target**: Real-world mid-range 6GB RAM Android smartphones (MediaTek G99, Snapdragon 680/685) on 4G/5G cellular networks, with smooth degradation down to lower tiers.
- **Client Heap Allocation**: Up to 256MB–384MB client-side JS heap for in-memory CRDT graphs, local IndexedDB transaction caches, and WASM vector indices.
- **CSS Engine**: Compile-time zero-runtime CSS (StyleX / Vanilla CSS) to eliminate DOM recalculation overhead and sustain 60fps animations.
- **Bundle Target**: Next.js standalone Docker containers <88MB with gzipped JS assets <120KB.

### 2. South Asian MFS Payment Integration
- **Gateways**: bKash, Nagad, Rocket, UPay, and SSLCommerz.
- **Verification Flow**: 10-character `TrxID` SMS webhook listener matching against order ledger.
- **Deep Linking**: 1-Tap mobile app URL schemes (`https://pay.bkash.com.bd/...`) opening native bKash/Nagad app on smartphones.

### 3. Banglish & Multilingual Code-Mixed NLP
- **Language Support**: Bengali (`bn-BD`), Banglish, Hindi, and English.
- **ASR Pipeline**: Buzz-Whisper service with code-mixed vocabulary dictionary (`bKash`, `TrxID`, `Dhaka`, `Steadfast`).

### 4. Hyper-Local Logistics & Courier API Integration
- **Courier Providers**: Steadfast Courier, Pathao Courier, RedX, and Paperfly.
- **Automation**: Auto-generates tracking codes (`BD_STEADFAST_755448`) and DMs tracking links to customers on WhatsApp.

---

## 📋 Implementation Checklist

- [ ] Verify 60fps DOM virtualization and memory allocation on 6GB RAM Android smartphones.
- [ ] Test 1-Tap bKash deep-linking URL schemes inside mobile browsers and WhatsApp.
- [ ] Audit Banglish speech dictation transcription accuracy.
- [ ] Confirm Steadfast / Pathao courier parcel booking API responses.

---

## 🎛️ 3-Step Startup Validation Funnel Invariants

### Step 1: Cofounder Mode (`cofounder`)
- **Role**: Strategic AI Cofounder & Builder.
- **Invariants**: Helps user define Problem Statement, Proposed Solution, and TAM / SAM / SOM Market Sizing ($10B TAM, $1.5B SAM, $150M SOM) in South Asia.

### Step 2: Web Search Mode (`coresearcher`)
- **Role**: Grounded Live Web Validation.
- **Invariants**: Performs live web queries via `search_web` checking competitor landscape (ShopUp, Chaldal, Pathao) and NBR/BTRC regulatory policies.

### Step 3: ScenarioLab Mode (`coworker`)
- **Role**: Stress-Test & Adversarial Lab.
- **Invariants**: Evaluates 2GB RAM phones, 3G cellular networks, bKash TrxID fraud, courier return rates, and Banglish dictations.


---

## 🏗️ Deep Module Architecture Rules

- **Depth Over Surface**: Keep interfaces small (3 or fewer methods) while hiding complex domain logic inside.
- **Seam Isolation**: Place seams where caller leverage and maintainer locality are maximized.
- **Test Surface**: Test directly through external module interfaces with 100% Vitest pass rate.

