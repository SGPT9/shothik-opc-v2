// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VTuberVoiceAvatarOverlay } from "../VTuberVoiceAvatarOverlay";

describe("VTuberVoiceAvatarOverlay Component", () => {
  it("should render Open-LLM-VTuber 3D Interactive Voice Avatar Overlay", () => {
    render(<VTuberVoiceAvatarOverlay avatarName="Shothik Avatar Presenter" isActive={true} />);

    expect(screen.getAllByText("Shothik Avatar Presenter").length).toBeGreaterThan(0);
    expect(screen.getByText("Open-LLM-VTuber Engine")).toBeDefined();
  });
});
