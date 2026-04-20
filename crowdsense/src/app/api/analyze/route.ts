import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini/client";
import { verifyVenueOnGoogleMaps } from "@/lib/google-maps";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Input validation schema for Security & Code Quality
const analyzeSchema = z.object({
  image: z.string().min(1, "Image data is required"),
  mimeType: z.string().regex(/^image\//, "Must be an image mime type"),
});

/**
 * Combined venue + floor-plan analysis in a SINGLE Gemini call.
 * Enhanced with Google Places verification for higher trust.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validate Input (Security Focus)
    const validation = analyzeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { image, mimeType } = validation.data;

    const prompt = `You are an expert venue analyst and safety inspector.
Analyze this floor plan image and return TWO things in a SINGLE JSON response:

1. VENUE IDENTIFICATION: Identify the venue from visual clues (logos, names, architecture).
2. FLOOR PLAN ANALYSIS: Categorize every zone/room/area visible.

RULES:
- Do NOT say "Unknown" for the venue — make a best deduction from any visual clues.
- Categorize zones as: 'seating', 'food', 'sanitation', 'entry', 'exit', 'stage', 'logistics', or 'other'.
- Group zones into broader category names (e.g. 'Food & Beverage', 'Spectator Areas').
- Calculate total + per-category capacity.

Respond ONLY with this exact valid JSON structure:
{
  "venue": {
    "venueName": "string",
    "address": "string",
    "city": "string",
    "country": "string",
    "latitude": number or null,
    "longitude": number or null,
    "confidence": "high" | "medium" | "low",
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

    logger.info("Starting Gemini analysis for floor plan...");
    const text = await generateWithFallback(parts);
    const result = JSON.parse(text);

    // 2. Verified Venue Lookup (Google Services Integration Focus)
    // Enrich Gemini's vision-based deduction with official Google Maps data
    if (result.venue?.venueName) {
      logger.info(`Deducted venue: ${result.venue.venueName}. Verifying with Google Places...`);
      const verified = await verifyVenueOnGoogleMaps(
        result.venue.venueName, 
        result.venue.city || result.venue.country
      );

      if (verified) {
        logger.info("Venue verified on Google Maps.");
        // Merge verified data
        result.venue.venueName = verified.name;
        result.venue.formattedAddress = verified.formattedAddress;
        result.venue.latitude = verified.latitude;
        result.venue.longitude = verified.longitude;
        result.venue.verified = {
          placeId: verified.placeId,
          rating: verified.rating,
          types: verified.types,
          photoUrl: verified.photoReference 
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${verified.photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            : undefined
        };
      } else {
        // Fallback to basic formatting
        result.venue.formattedAddress = [result.venue.address, result.venue.city, result.venue.country]
          .filter(Boolean)
          .join(", ");
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error("[api/analyze] Error:", error);
    return NextResponse.json(
      { error: error.message || "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
