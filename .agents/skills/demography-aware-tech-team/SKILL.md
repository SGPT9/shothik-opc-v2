---
name: demography-aware-tech-team
description: Autonomous multi-agent software engineering team specialized in building, optimizing, and deploying web apps tailored for South Asian & Emerging Market demographics (bKash/Nagad payments, Banglish NLP, Steadfast couriers, 2GB RAM device optimization).
globs: "*.ts, *.tsx, *.jsx, *.md"
alwaysApply: false
---

# 🇧🇩 Demography-Aware Autonomous Tech Team Skill

An autonomous agent skill that configures a specialized engineering team (Frontend Architect, MFS Payment Engineer, Logistics Integration Specialist, Low-RAM Performance Auditor) to build software optimized for South Asian and Emerging Market demographics.

---

## 🛠️ Core Engineering Directives

### 1. Mobile-First & Low-RAM Hardware Optimization
- **Hardware Target**: Low-spec 2GB RAM Android smartphones on 3G/4G cellular networks.
- **CSS Engine**: Enforce StyleX compile-time CSS (Meta Astryx) to eliminate DOM recalculation overhead.
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

- [ ] Verify low-RAM DOM virtualization on 2GB RAM Android devices.
- [ ] Test 1-Tap bKash deep-linking URL schemes inside mobile browsers and WhatsApp.
- [ ] Audit Banglish speech dictation transcription accuracy.
- [ ] Confirm Steadfast / Pathao courier parcel booking API responses.

---

## 🎛️ 3 Core Chat Modes Invariants

### 1. Cofounder Mode (`cofounder`)
- **Role**: Autonomous Strategic Technical Cofounder.
- **Invariants**: Executes deep module architecture, database CRUD, and writes code across the codebase.

### 2. Web Search Mode (`coresearcher`)
- **Role**: Grounded Fact-Checking & Web Literature Analyst.
- **Invariants**: Performs live web searches via `search_web` before drawing conclusions.

### 3. ScenarioLab Mode (`coworker`)
- **Role**: Adversarial Stress-Testing & Demographic Simulator.
- **Invariants**: Evaluates 2GB RAM phones, 3G cellular networks, bKash TrxID fraud, and Banglish dictations.

---

## 🏗️ Deep Module Architecture Rules

- **Depth Over Surface**: Keep interfaces small (3 or fewer methods) while hiding complex domain logic inside.
- **Seam Isolation**: Place seams where caller leverage and maintainer locality are maximized.
- **Test Surface**: Test directly through external module interfaces with 100% Vitest pass rate.

