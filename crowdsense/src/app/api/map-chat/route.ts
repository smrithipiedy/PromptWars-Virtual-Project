import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini/client";
import { haversineDistance } from "@/lib/maps/helpers";

export async function POST(req: NextRequest) {
  let message = "";
  try {
    const body = await req.json();
    message = body.message;
    const { venueName, venueAddress, floorPlanZones, liveZones, userLat, userLng } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Determine if user is at the venue (roughly within 300m)
    let isAtVenue = false;
    if (userLat && userLng && liveZones?.length) {
      // Find the center of the venue zones
      const avgLat = liveZones.reduce((sum: number, z: any) => sum + z.latitude, 0) / liveZones.length;
      const avgLng = liveZones.reduce((sum: number, z: any) => sum + z.longitude, 0) / liveZones.length;
      const dist = haversineDistance(userLat, userLng, avgLat, avgLng);
      isAtVenue = dist <= 350; // slightly wider than 300m for tolerance
    }

    const zonesText = floorPlanZones?.length
      ? `Floor plan zones (metadata): ${JSON.stringify(floorPlanZones)}`
      : "";

    const liveZonesText = liveZones?.length
      ? `Live map zones (with coordinates): ${JSON.stringify(liveZones.map((z: any) => ({ name: z.name, lat: z.latitude, lng: z.longitude })))}`
      : "";

    const userStateText = isAtVenue
      ? `The user IS currently at the venue (${userLat.toFixed(5)}, ${userLng.toFixed(5)}).`
      : "The user IS NOT at the venue. They are viewing the map remotely.";

    const prompt = `You are a helpful venue assistant for CrowdSense, embedded in a live event map.
Venue: ${venueName || "Unknown venue"} (${venueAddress || "address unavailable"}).
${zonesText}
${liveZonesText}
${userStateText}

The user asks: "${message}"

Your job:
1. Answer their question helpfully and concisely (1-3 sentences max).
2. If the user IS NOT at the venue, provide general information about the venue but REFRAIN from giving "right here/around the corner" type directions. Instead, use "at the venue" or "located near".
3. ONLY return a pinLocation if the user IS at the venue OR they specifically asked for a location. If the user is NOT at the venue, set pinLocation to null unless they specifically asked "Where is X?".
4. If the question is about finding something (restroom, exit, food, stage, entry, first aid etc.), AND you have a matching zone from the live map zones that has lat/lng, extract a pinLocation.

Respond ONLY with valid JSON, no markdown:
{
  "answer": "string — friendly, helpful answer to the user",
  "pinLocation": {
    "lat": number,
    "lng": number,
    "label": "string — short label e.g. 'Nearest Restroom'",
    "type": "restroom | exit | food | stage | entry | info | other"
  } | null
}

If you cannot determine a real coordinate for the pin, set pinLocation to null. Never make up coordinates that are clearly wrong.`;

    const text = await generateWithFallback(prompt);
    let parsed: any;
    try {
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleanText);
    } catch {
      parsed = { answer: text.slice(0, 300), pinLocation: null };
    }

    return NextResponse.json({ success: true, answer: parsed.answer, pinLocation: parsed.pinLocation });
  } catch (error: any) {
    console.error("[map-chat] API error:", error?.message || error);
    
    // Safety fallback for when Gemini is down
    const mockAnswers: Record<string, string> = {
      "restroom": "The nearest restrooms are usually located near the main entries and the food court. I've highlighted the common locations for you.",
      "exit": "Emergency exits are marked in green on your map. Always follow the lit exit signs in person.",
      "food": "The food court is located in the central hub of the venue. You can find a variety of concessions there.",
      "help": "If you need immediate assistance, please look for staff members in bright vests or head to the Information Desk near the main entry.",
    };

    const lowerMessage = message.toLowerCase();
    let answer = "I'm experiencing high demand right now, but I can tell you that safety staff are stationed throughout the venue. Is there a specific facility like a restroom or exit you are looking for?";
    
    for (const [key, val] of Object.entries(mockAnswers)) {
      if (lowerMessage.includes(key)) {
        answer = val;
        break;
      }
    }

    return NextResponse.json({ 
      success: true, 
      answer,
      note: "Using safety fallback response."
    });
  }
}
