import {
  zonesToHeatmapPoints,
  severityToColor,
  clamp,
  calculateDensity,
  densityToSeverity,
} from "@/lib/maps/helpers";
import { ZoneDensity } from "@/types";

describe("Map Helpers", () => {
  const mockZones: ZoneDensity[] = [
    {
      id: "1",
      name: "Test Zone",
      latitude: 10,
      longitude: 20,
      capacity: 100,
      currentCount: 50,
      density: 0.5,
      severity: "low",
      updatedAt: "now",
    },
  ];

  test("zonesToHeatmapPoints converts correctly", () => {
    const points = zonesToHeatmapPoints(mockZones);
    expect(points).toHaveLength(1);
    expect(points[0]).toEqual({ lat: 10, lng: 20, weight: 0.5 });
  });

  test("severityToColor returns correct hex", () => {
    expect(severityToColor("low")).toBe("#22c55e");
    expect(severityToColor("critical")).toBe("#ef4444");
  });

  test("clamp logic", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  test("calculateDensity handles zero capacity", () => {
    expect(calculateDensity(50, 0)).toBe(0);
    expect(calculateDensity(50, 100)).toBe(0.5);
  });

  test("densityToSeverity boundaries", () => {
    expect(densityToSeverity(0.95)).toBe("critical");
    expect(densityToSeverity(0.8)).toBe("high");
    expect(densityToSeverity(0.6)).toBe("moderate");
    expect(densityToSeverity(0.4)).toBe("low");
  });
});
