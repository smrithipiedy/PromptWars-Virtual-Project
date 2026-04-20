import { NextRequest, NextResponse } from "next/server";
import { identifyVenueLocation } from "@/lib/gemini/client";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "Image data and mime type are required" },
        { status: 400 }
      );
    }

    const result = await identifyVenueLocation(image, mimeType);

    // Add a formatted address for convenience
    const formattedAddress = [result.address, result.city, result.country]
      .filter(Boolean)
      .join(", ");

    return NextResponse.json({
      ...result,
      formattedAddress
    });
  } catch (error: any) {
    console.error("[api/venue] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to identify venue location" },
      { status: 500 }
    );
  }
}
