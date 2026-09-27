import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VoiceNoteRecorder } from "../VoiceNoteRecorder";
import { InlineWasmCodeRunner } from "../InlineWasmCodeRunner";

describe("Chat Enhancements: VoiceNoteRecorder & InlineWasmCodeRunner", () => {
  it("renders VoiceNoteRecorder and toggles recording state", () => {
    const handleRecorded = vi.fn();
    render(<VoiceNoteRecorder onAudioRecorded={handleRecorded} />);

    const btn = screen.getByText(/Voice Note/i);
    expect(btn).toBeDefined();

    fireEvent.click(btn);
    expect(screen.getByText(/0:00/i)).toBeDefined();
  });

  it("renders InlineWasmCodeRunner and executes JavaScript code", () => {
    const testCode = "console.log('Hello from Wasm Sandbox');";
    render(<InlineWasmCodeRunner code={testCode} language="javascript" />);

    expect(screen.getByText(/Run in Sandbox/i)).toBeDefined();
    expect(screen.getByText(/Copy/i)).toBeDefined();
  });
});
