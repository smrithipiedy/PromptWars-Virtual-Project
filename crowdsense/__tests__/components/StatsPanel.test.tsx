import React from "react";
import { render, screen } from "@testing-library/react";
import { StatsPanel } from "@/components/Dashboard/StatsPanel";
import { OrganizerStats } from "@/types";
import "@testing-library/jest-dom";

describe("StatsPanel Component", () => {
  const mockStats: OrganizerStats = {
    totalAttendees: 1500,
    criticalZones: 2,
    activeAlerts: 5,
    averageDensity: 0.65,
  };

  test("renders all 4 stat cards with values", () => {
    render(<StatsPanel stats={mockStats} />);

    expect(screen.getByText("Total Attendees")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();

    expect(screen.getByText("Critical Zones")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    expect(screen.getByText("Active Alerts")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    expect(screen.getByText("Avg Density")).toBeInTheDocument();
    expect(screen.getByText("65.0%")).toBeInTheDocument();
  });

  test("applies red color class when critical zones > 0", () => {
    render(<StatsPanel stats={mockStats} />);
    const criticalCard = screen.getByLabelText("2 critical zones");
    expect(criticalCard.innerHTML).toContain("text-red-400");
  });
});
