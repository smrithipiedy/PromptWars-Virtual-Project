import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini/client";

/**
 * Combined venue + floor-plan analysis in a SINGLE Gemini call.
 * Cuts quota usage in half vs calling /api/venue and /api/floorplan separately.
 */
export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "Image data and mime type are required" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert venue analyst and safety inspector.
Analyze this floor plan image and return TWO things in a SINGLE JSON response:

1. VENUE IDENTIFICATION: Identify the venue from visual clues (logos, names, architecture).
2. FLOOR PLAN ANALYSIS: Categorize every zone/room/area visible.

RULES:
- Do NOT say "Unknown" for the venue — make a best deduction from any visual clues.
- Categorize zones as: 'seating', 'food', 'sanitation', 'entry', 'exit', 'stage', 'logistics', or 'other'.
- Group zones into broader category names (e.g. 'Food & Beverage', 'Spectator Areas').
- Calculate total + per-category capacity.

Respond ONLY with this exact valid JSON structure (no markdown fences):
{
  "venue": {
    "venueName": "string",
    "address": "string",
    "city": "string",
    "country": "string",
    "latitude": number or null,
    "longitude": number or null,
    "confidence": "high" | "medium" | "low",
    "formattedAddress": "string",
    "internetInsights": {
      "typicalCrowdPattern": "string",
      "historicalSafetyIssues": ["string"],
      "venueType": "string",
      "peakHours": "string"
    }
  },
  "analysis": {
    "zones": [
      {
        "name": "string",
        "estimatedCapacity": number,
        "type": "seating" | "food" | "sanitation" | "entry" | "exit" | "stage" | "logistics" | "other",
        "category": "string",
        "accessibilityFeatures": ["string"]
      }
    ],
    "categoryStats": {
      "Category Name": { "count": number, "totalCapacity": number }
    },
    "totalCapacity": number,
    "emergencyExits": number,
    "accessibilityScore": number,
    "recommendations": ["string"]
  }
}`;

    const parts = [
      { text: prompt },
      { inlineData: { data: image, mimeType } },
    ];

    const text = await generateWithFallback(parts);
    const result = JSON.parse(text);

    // Add formatted address
    if (result.venue && !result.venue.formattedAddress) {
      result.venue.formattedAddress = [result.venue.address, result.venue.city, result.venue.country]
        .filter(Boolean)
        .join(", ");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[api/analyze] Error:", error);
    return NextResponse.json(
      { error: error.message || "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
