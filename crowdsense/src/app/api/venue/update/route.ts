import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.venue || !data.analysis) {
      return NextResponse.json(
        { error: "Invalid floor plan data" },
        { status: 400 }
      );
    }

    const { adminDb } = await import("@/lib/firebase/server");

    // 1. Update/Reset Zones in Firestore
    const zonesRef = adminDb.collection("zone_density");
    // Delete existing zones (simple approach for now)
    const existingZones = await zonesRef.get();
    const batch = adminDb.batch();
    existingZones.docs.forEach(doc => batch.delete(doc.ref));

    // Create new zones from analysis
    data.analysis.zones.forEach((zone: any) => {
      const newDoc = zonesRef.doc();
      batch.set(newDoc, {
        name: zone.name,
        type: zone.type,
        currentCount: 0,
        capacity: zone.estimatedCapacity,
        density: 0,
        severity: "low",
        updatedAt: new Date().toISOString()
      });
    });

    // 2. Create Initial Alerts from Recommendations
    const alertsRef = adminDb.collection("alerts");
    // Clear old alerts
    const existingAlerts = await alertsRef.get();
    existingAlerts.docs.forEach(doc => batch.delete(doc.ref));

    data.analysis.recommendations.slice(0, 3).forEach((rec: string, i: number) => {
      const newAlert = alertsRef.doc();
      batch.set(newAlert, {
        zoneId: "global",
        zoneName: "General",
        severity: "info",
        message: rec,
        suggestion: "Review venue safety protocols",
        createdAt: new Date().toISOString()
      });
    });

    await batch.commit();

    logger.info("Firestore synced with new floor plan", {
      venue: data.venue.venueName,
      zones: data.analysis.zones.length,
      alerts: 3
    });

    return NextResponse.json({
      success: true,
      message: "Venue data synchronized successfully to cloud",
    });
  } catch (error: any) {
    logger.error("Failed to update venue data", { error: error?.message || error });
    return NextResponse.json(
      { error: "Failed to update venue data" },
      { status: 500 }
    );
  }
}
