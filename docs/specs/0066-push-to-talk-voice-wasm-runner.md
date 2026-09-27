# Spec 0066: Push-to-Talk Voice Note Input & Inline Wasm Sandbox Runner

## 1. Overview
Push-to-Talk audio recording with live waveform visualizer for chat inputs, combined with an interactive inline WebAssembly code execution sandbox for running algorithms and scripts client-side in under 5ms.

## 2. Acceptance Criteria
- **AC-1**: Record microphone audio via WebAudio API, render dynamic visualizer bars, and emit transcribed text / audio blob payloads.
- **AC-2**: Render interactive inline Wasm sandbox within chat messages to execute JavaScript/Wasm code snippets safely without server roundtrips.
- **AC-3**: Handle playback controls, elapsed timers, and error recovery states.

## 3. Implementation
- Components: `artifacts/shothik/src/components/chat/VoiceNoteRecorder.tsx` & `artifacts/shothik/src/components/chat/InlineWasmCodeRunner.tsx`
- Tests: `artifacts/shothik/src/components/chat/__tests__/VoiceNoteAndCodeRunner.test.tsx`
