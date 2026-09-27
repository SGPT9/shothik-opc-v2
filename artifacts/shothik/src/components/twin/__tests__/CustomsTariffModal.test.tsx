import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomsTariffModal } from "../CustomsTariffModal";

describe("Frontend AG-UI Component: CustomsTariffModal", () => {
  it("renders CustomsTariffModal with HS Classifier, TTI Calculator, and CIPL Generator tabs", () => {
    render(<CustomsTariffModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/NBR Customs Tariff & HS Code Engine/i)).toBeDefined();
    expect(screen.getByText(/HS Classifier/i)).toBeDefined();
    expect(screen.getByText(/TTI Calculator/i)).toBeDefined();
    expect(screen.getByText(/CIPL Generator/i)).toBeDefined();
  });
});
