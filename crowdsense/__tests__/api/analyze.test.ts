/**
 * Tests for the /api/analyze route handler.
 * Verifies input validation and error handling without hitting the real Gemini API.
 */
import { generateWithFallback } from "@/lib/gemini/client";

// Mock Gemini client BEFORE importing the route
jest.mock("@/lib/gemini/client", () => ({
  generateWithFallback: jest.fn(),
}));

import { POST } from "@/app/api/analyze/route";

const mockGenerate = generateWithFallback as jest.MockedFunction<typeof generateWithFallback>;

const VALID_MOCK_RESPONSE = JSON.stringify({
  venue: {
    venueName: "Test Convention Centre",
    address: "123 Main St",
    city: "Mumbai",
    country: "India",
    latitude: 19.076,
    longitude: 72.877,
    confidence: "high",
    internetInsights: {
      typicalCrowdPattern: "High flow near entrances",
      historicalSafetyIssues: [],
      venueType: "Convention Centre",
      peakHours: "6-9 PM",
    },
  },
  analysis: {
    zones: [
      {
        name: "Main Hall",
        estimatedCapacity: 2000,
        type: "seating",
        category: "Spectator Areas",
        accessibilityFeatures: ["ramp", "elevator"],
      },
    ],
    categoryStats: {
      "Spectator Areas": { count: 1, totalCapacity: 2000 },
    },
    totalCapacity: 2000,
    emergencyExits: 4,
    accessibilityScore: 88,
    recommendations: ["Add signage near exit B"],
  },
});

function makeRequest(body: object): any {
  return {
    json: async () => body,
  };
}

// Mock NextResponse to avoid internal cookie logic crashes
jest.mock("next/server", () => {
  return {
    NextResponse: {
      json: (data: any, init?: any) => {
        return {
          status: init?.status || 200,
          json: async () => data,
        };
      },
    },
  };
});

describe("POST /api/analyze", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when image is missing", async () => {
    const req = makeRequest({ mimeType: "image/png" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("returns 400 when mimeType is missing", async () => {
    const req = makeRequest({ image: "base64data" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("returns 200 with parsed venue and analysis on success", async () => {
    mockGenerate.mockResolvedValueOnce(VALID_MOCK_RESPONSE);

    const req = makeRequest({ image: "base64encodedimage", mimeType: "image/png" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.venue.venueName).toBe("Test Convention Centre");
    expect(body.analysis.totalCapacity).toBe(2000);
    expect(body.venue.formattedAddress).toBe("123 Main St, Mumbai, India");
  });

  it("returns 500 with the real error message when Gemini fails", async () => {
    mockGenerate.mockRejectedValueOnce(new Error("API quota exceeded"));

    const req = makeRequest({ image: "base64data", mimeType: "image/jpeg" });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("API quota exceeded");
  });

  it("includes formattedAddress in venue response", async () => {
    mockGenerate.mockResolvedValueOnce(VALID_MOCK_RESPONSE);

    const req = makeRequest({ image: "base64data", mimeType: "image/png" });
    const res = await POST(req);
    const body = await res.json();

    expect(body.venue.formattedAddress).toBeDefined();
    expect(typeof body.venue.formattedAddress).toBe("string");
  });
});
