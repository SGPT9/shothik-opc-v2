# Spec 0069: HarfBuzz-Compatible Bengali OpenType Typography & Complex Script Shaper

## 1. Overview
Unicode NFC normalization, complex conjunct (যুক্তবর্ণ) ligature mapping, pre-base vowel reordering, and 300-DPI / ESC-POS printable metric calculations for flawless PDF and thermal press layouts.

## 2. Acceptance Criteria
- **AC-1**: Normalize text into Unicode NFC and resolve common conjuncts (`ক্ষ`, `জ্ঞ`, `শ্র`, `ত্র`, `দ্ধ`, `ন্দ`, `স্ত`, `ম্প`, `ব্র`, `প্র`, `ক্র`, `হ্ন`, `ট্ট`).
- **AC-2**: Accurately estimate glyph count and character width in millimeters based on point size.
- **AC-3**: Pre-order syllables for raw 1-bit bitmap rasterization on Bluetooth ESC/POS thermal receipt printers.

## 3. Implementation
- Engine: `lib/office-engine/bengali-shaper.ts`
- Tests: `lib/office-engine/__tests__/bengali-shaper.test.ts`
