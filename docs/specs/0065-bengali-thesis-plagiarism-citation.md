# Spec 0065: Bengali Thesis Plagiarism & Citation Matcher

## 1. Overview
N-gram word shingle and semantic similarity scanner for academic Bengali thesis manuscripts with UGC Bangladesh compliance thresholds, similarity percentage scoring, and automated APA 7th / IEEE citation formatting.

## 2. Acceptance Criteria
- **AC-1**: Scan academic manuscripts against reference academic corpuses using 5-gram token shingles.
- **AC-2**: Calculate similarity score percentage and classify UGC compliance status (threshold <= 20%).
- **AC-3**: Automatically format citations into APA 7th edition and IEEE standards for Bengali literature and academic journals.
- **AC-4**: Generate a cryptographic audit seal for UGC submission compliance.

## 3. Implementation
- Engine: `artifacts/api-server/src/lib/academic/bengali-plagiarism-engine.ts`
- Routes: `artifacts/api-server/src/routes/plagiarism.ts`
- Tests: `artifacts/api-server/src/routes/__tests__/plagiarism.test.ts`
