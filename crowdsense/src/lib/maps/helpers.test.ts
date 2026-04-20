import { haversineDistance, calculateDensity, densityToSeverity } from "./helpers";

describe("Map Helpers", () => {
  describe("haversineDistance", () => {
    test("calculates distance between two known points (Vancouver to Calgary)", () => {
      // Vancouver: 49.2827, -123.1207
      // Calgary: 51.0447, -114.0719
      // Distance is approx 670km
      const dist = haversineDistance(49.2827, -123.1207, 51.0447, -114.0719);
      expect(dist).toBeGreaterThan(600000);
      expect(dist).toBeLessThan(700000);
    });

    test("returns 0 for the same point", () => {
      const dist = haversineDistance(49, -123, 49, -123);
      expect(dist).toBe(0);
    });
  });

  describe("calculateDensity", () => {
    test("calculates density correctly", () => {
      expect(calculateDensity(50, 100)).toBe(0.5);
      expect(calculateDensity(200, 100)).toBe(1); // Clamped
      expect(calculateDensity(-10, 100)).toBe(0); // Clamped
    });

    test("handles zero capacity", () => {
      expect(calculateDensity(10, 0)).toBe(0);
    });
  });

  describe("densityToSeverity", () => {
    test("maps density to correct severity levels", () => {
      expect(densityToSeverity(0.1)).toBe("low");
      expect(densityToSeverity(0.6)).toBe("moderate");
      expect(densityToSeverity(0.8)).toBe("high");
      expect(densityToSeverity(0.95)).toBe("critical");
    });
  });
});
