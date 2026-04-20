import { NextRequest, NextResponse } from "next/server";
import { analyzeFloorPlan } from "@/lib/gemini/client";
import { checkRateLimit } from "@/lib/api/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    
    // Skip rate limit in development for smoother testing
    const isDev = process.env.NODE_ENV === "development";
    if (!isDev) {
      const isAllowed = checkRateLimit(ip, 5000);
      if (!isAllowed) {
        return NextResponse.json(
          { error: "Too many requests. Please wait a few seconds." },
          { status: 429 }
        );
      }
    }

    const { image, mimeType } = await req.json();

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "Image data and mime type are required" },
        { status: 400 }
      );
    }

    const text = await analyzeFloorPlan(image, mimeType);
    let analysis;
    
    try {
      // Robust JSON detection in case of markdown wrapping
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      analysis = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", text);
      throw new Error("Invalid response format from AI");
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("[api/floorplan] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze floor plan" },
      { status: 500 }
    );
  }
}
