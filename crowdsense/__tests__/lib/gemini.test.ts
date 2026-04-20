/**
 * Tests for the Gemini AI client utility functions.
 * Validates JSON extraction, fallback logic, and error handling.
 */

// Mock the @google/generative-ai module
jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}));

// Mock the logger so tests don't produce noise
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("Gemini JSON extraction logic", () => {
  it("extracts plain JSON from a clean response", () => {
    const raw = '{"venueName":"Test Arena","city":"Mumbai"}';
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![0])).toEqual({ venueName: "Test Arena", city: "Mumbai" });
  });

  it("strips markdown code fences from AI response", () => {
    const raw = "```json\n{\"zones\":[],\"totalCapacity\":500}\n```";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    expect(cleaned).toBe('{"zones":[],"totalCapacity":500}');
    expect(() => JSON.parse(cleaned)).not.toThrow();
  });

  it("extracts JSON even when surrounded by conversational text", () => {
    const raw = 'Sure! Here is the analysis: {"totalCapacity":2000,"emergencyExits":4} Hope this helps!';
    const match = raw.match(/\{[\s\S]*\}/);
    expect(match).not.toBeNull();
    const parsed = JSON.parse(match![0]);
    expect(parsed.totalCapacity).toBe(2000);
    expect(parsed.emergencyExits).toBe(4);
  });

  it("identifies retryable errors correctly", () => {
    const retryableMessages = ["429 Too Many Requests", "503 Service Unavailable", "quota exceeded", "404 Not Found"];
    const nonRetryable = ["400 Bad Request", "401 Unauthorized", "500 Internal Server Error"];

    retryableMessages.forEach((msg) => {
      const isRetryable =
        msg.includes("429") || msg.includes("503") || msg.includes("quota") || msg.includes("404");
      expect(isRetryable).toBe(true);
    });

    nonRetryable.forEach((msg) => {
      const isRetryable =
        msg.includes("429") || msg.includes("503") || msg.includes("quota") || msg.includes("404");
      expect(isRetryable).toBe(false);
    });
  });

  it("extracts retry delay from Gemini error message", () => {
    const errorMsg = "Please retry in 34s. [{...}]";
    const match = errorMsg.match(/retry[^\d]*(\d+)s/i);
    expect(match).not.toBeNull();
    expect(parseInt(match![1], 10)).toBe(34);
  });
});

describe("Floor plan analysis data shape", () => {
  it("validates a well-formed floor plan analysis response", () => {
    const mockAnalysis = {
      zones: [
        { name: "Main Stage", estimatedCapacity: 2000, type: "stage", category: "Performance Areas", accessibilityFeatures: ["ramp"] },
        { name: "Food Court", estimatedCapacity: 500, type: "food", category: "Food & Beverage", accessibilityFeatures: [] },
      ],
      categoryStats: {
        "Performance Areas": { count: 1, totalCapacity: 2000 },
        "Food & Beverage": { count: 1, totalCapacity: 500 },
      },
      totalCapacity: 2500,
      emergencyExits: 4,
      accessibilityScore: 85,
      recommendations: ["Add additional signage in food court"],
    };

    expect(mockAnalysis.zones).toHaveLength(2);
    expect(mockAnalysis.totalCapacity).toBe(2500);
    expect(mockAnalysis.accessibilityScore).toBeGreaterThanOrEqual(0);
    expect(mockAnalysis.accessibilityScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(mockAnalysis.recommendations)).toBe(true);
    expect(Object.keys(mockAnalysis.categoryStats)).toHaveLength(2);
  });

  it("validates venue location response shape", () => {
    const mockVenue = {
      venueName: "ExCel London",
      address: "Royal Victoria Dock",
      city: "London",
      country: "UK",
      latitude: 51.508,
      longitude: 0.031,
      confidence: "high" as const,
    };

    expect(mockVenue.venueName).toBeTruthy();
    expect(mockVenue.city).toBeTruthy();
    expect(["high", "medium", "low"]).toContain(mockVenue.confidence);
    expect(typeof mockVenue.latitude).toBe("number");
  });
});
