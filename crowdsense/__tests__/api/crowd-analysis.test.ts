/**
 * @jest-environment node
 */
process.env.GEMINI_API_KEY = "mock-key";
import { POST } from "@/app/api/crowd-analysis/route";

import { NextRequest } from "next/server";
import { analyzeCrowdPattern } from "@/lib/gemini/client";
import { adminDb } from "@/lib/firebase/server";

jest.mock("@/lib/gemini/client");
jest.mock("@/lib/firebase/server", () => ({
  adminDb: {
    batch: jest.fn(() => ({
      set: jest.fn(),
      commit: jest.fn(),
    })),
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({})),
    })),
  },
}));

describe("API: Crowd Analysis", () => {
  it("returns 400 if zones is missing", async () => {
    const req = new NextRequest("http://localhost/api/crowd-analysis", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 on valid request", async () => {
    (analyzeCrowdPattern as jest.Mock).mockResolvedValue({
      alerts: [{ zoneName: "Main", message: "Busy", severity: "high" }],
    });

    const req = new NextRequest("http://localhost/api/crowd-analysis", {
      method: "POST",
      body: JSON.stringify({ zones: [{ name: "Main", density: 0.8 }] }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.alerts).toHaveLength(1);
  });
});
