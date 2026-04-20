import { NextRequest, NextResponse } from "next/server";
import { analyzeCrowdPattern } from "@/lib/gemini/client";
import { adminDb } from "@/lib/firebase/server";
import { densityToSeverity } from "@/lib/maps/helpers";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zones } = body;

    if (!zones || !Array.isArray(zones)) {
      return NextResponse.json(
        { error: "Invalid request: zones array required" },
        { status: 400 }
      );
    }

    // Transform zones to match expected format and calculate stats
    const transformedZones = zones.map((z: any) => ({
      name: z.name || z.zoneName || "",
      estimatedCapacity: z.capacity || z.estimatedCapacity || 100,
      type: z.type || "other",
      category: z.category || "Public Areas",
      accessibilityFeatures: z.accessibilityFeatures || [],
      density: z.density || (z.currentCount || 0) / (z.capacity || 100),
    }));

    // Calculate category stats
    const categoryStats: Record<string, { count: number; totalCapacity: number }> = {};
    let totalCapacity = 0;
    for (const zone of transformedZones) {
      const category = zone.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, totalCapacity: 0 };
      }
      categoryStats[category].count += 1;
      categoryStats[category].totalCapacity += zone.estimatedCapacity;
      totalCapacity += zone.estimatedCapacity;
    }

    const analysis = await analyzeCrowdPattern(transformedZones, categoryStats, totalCapacity);

    const batch = adminDb.batch();
    for (const alert of analysis.alerts) {
      const alertRef = adminDb.collection("alerts").doc();
      batch.set(alertRef, {
        zoneId: alert.zoneName.toLowerCase().replace(/\s+/g, "-"),
        zoneName: alert.zoneName,
        severity: alert.severity,
        message: alert.message,
        suggestion: alert.suggestion,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();

    const zoneBatch = adminDb.batch();
    for (const zone of zones) {
      const zoneRef = adminDb
        .collection("zone_density")
        .doc(zone.id || zone.name.toLowerCase().replace(/\s+/g, "-"));
      zoneBatch.set(
        zoneRef,
        {
          name: zone.name,
          latitude: zone.latitude ?? 0,
          longitude: zone.longitude ?? 0,
          capacity: zone.capacity,
          currentCount: zone.currentCount,
          density: zone.density,
          severity: densityToSeverity(zone.density),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
    await zoneBatch.commit();

    return NextResponse.json({ success: true, alerts: analysis.alerts });
  } catch (error: any) {
    console.error("[crowd-analysis] Error:", error);

    const msg: string = error?.message ?? "";

    if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests")) {
      return NextResponse.json(
        { error: "Gemini AI quota exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }
    if (msg.includes("404") || msg.includes("not found")) {
      return NextResponse.json(
        { error: "Gemini AI model unavailable. Check your API key and model access." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
