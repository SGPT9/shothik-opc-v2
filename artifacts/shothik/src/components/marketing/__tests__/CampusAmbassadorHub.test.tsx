import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CampusAmbassadorHub } from "../CampusAmbassadorHub";
import { CampusAmbassadorService } from "@/lib/marketing/campus-ambassador-service";

describe("CampusAmbassadorHub UI Component", () => {
  beforeEach(() => {
    CampusAmbassadorService.resetStore();
  });

  it("renders ambassador profile banner and referral metrics", () => {
    render(<CampusAmbassadorHub initialAmbassadorCode="DU_RAHIM_2026" />);

    expect(screen.getByText(/Rahim Ahmed/i)).toBeInTheDocument();
    expect(screen.getByText(/DU_RAHIM_2026/i)).toBeInTheDocument();
    expect(screen.getAllByText(/University of Dhaka/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Total Classmates/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Commission/i)).toBeInTheDocument();
  });

  it("renders inter-campus leaderboard with ranked universities", () => {
    render(<CampusAmbassadorHub initialAmbassadorCode="DU_RAHIM_2026" />);

    expect(screen.getByText(/Inter-Campus Ambassador Leaderboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Bangladesh University of Engineering and Technology/i)).toBeInTheDocument();
    expect(screen.getByText(/North South University/i)).toBeInTheDocument();
    expect(screen.getByText(/BRAC University/i)).toBeInTheDocument();
  });
});
