import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitCount = parseInt(searchParams.get("limit") ?? "10");
    const snapshot = await adminDb
      .collection("alerts")
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();
    const alerts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() ?? null,
    }));
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("[alerts] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get("id");
    if (!alertId) {
      return NextResponse.json(
        { error: "Alert ID required" },
        { status: 400 }
      );
    }
    await adminDb.collection("alerts").doc(alertId).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[alerts] DELETE Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
