import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini/client";

export async function POST(req: NextRequest) {
  let scenario = "";
  try {
    const body = await req.json();
    scenario = body.scenario;
    const { venueName, venueAddress, floorPlanZones, recommendations, accessibilityScore, totalCapacity } = body;

    if (!scenario || !venueName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let prompt = "";

    if (scenario === "at_venue") {
      prompt = `You are CrowdSense AI, a helpful crowd safety assistant. The user is currently at "${venueName}" (${venueAddress}).

Venue details from floor plan analysis:
- Total capacity: ${totalCapacity}
- Accessibility score: ${accessibilityScore}%
- Zones detected: ${JSON.stringify(floorPlanZones)}
- Safety recommendations: ${JSON.stringify(recommendations)}

Provide 3-4 personalized, actionable insights for someone currently at this venue. Focus on:
1. Crowd hotspots to be aware of and avoid
2. Best zones to move to if it gets crowded
3. Emergency exits and accessibility features
4. Real-time tips for their visit

Keep it friendly, practical, and 2-3 sentences per insight. Format as JSON:
{
  "greeting": "short welcoming message acknowledging they are at the venue",
  "insights": [
    { "title": "...", "body": "...", "type": "tip|warning|info" }
  ]
}`;
    } else if (scenario === "visited") {
      prompt = `You are CrowdSense AI. A user recently visited "${venueName}" (${venueAddress}) and is reviewing our AI analysis.

Our floor plan analysis found:
- Total capacity: ${totalCapacity}
- Zones: ${JSON.stringify(floorPlanZones)}
- Accessibility score: ${accessibilityScore}%
- Recommendations: ${JSON.stringify(recommendations)}

Generate a review request that:
1. Thanks them for visiting
2. Asks them to confirm if the zone names/types look accurate
3. Asks about actual crowd conditions they experienced
4. Invites any corrections or additional notes

Format as JSON:
{
  "greeting": "thank you message",
  "questions": [
    { "id": "zone_accuracy", "question": "...", "type": "yesno" },
    { "id": "crowd_level", "question": "...", "type": "scale" },
    { "id": "corrections", "question": "...", "type": "text" },
    { "id": "overall", "question": "...", "type": "stars" }
  ]
}`;
    } else if (scenario === "planning_visit") {
      prompt = `You are CrowdSense AI, a crowd safety expert. A user is planning to visit "${venueName}" (${venueAddress}).

Our AI analyzed the venue floor plan and found:
- Total capacity: ${totalCapacity} people
- Zone layout: ${JSON.stringify(floorPlanZones)}
- Accessibility score: ${accessibilityScore}%
- Safety recommendations: ${JSON.stringify(recommendations)}

Provide comprehensive pre-visit advice. Be specific and practical. Format as JSON:
{
  "greeting": "enthusiastic intro about their upcoming visit",
  "advice": [
    {
      "category": "What to Bring",
      "icon": "bag",
      "tips": ["...", "...", "..."]
    },
    {
      "category": "Crowd Navigation",
      "icon": "route",
      "tips": ["...", "...", "..."]
    },
    {
      "category": "Safety First",
      "icon": "shield",
      "tips": ["...", "...", "..."]
    },
    {
      "category": "Best Times & Zones",
      "icon": "clock",
      "tips": ["...", "...", "..."]
    }
  ]
}`;
    } else {
      return NextResponse.json({ error: "Invalid scenario" }, { status: 400 });
    }

    const text = await generateWithFallback(prompt);
    const parsed = JSON.parse(text);

    return NextResponse.json({ success: true, data: parsed, scenario });
  } catch (error: any) {
    console.error("[venue-assistant] API error:", error?.message || error);
    
    // Return high-quality mock data if AI is down/limited
    const mockData: Record<string, any> = {
      at_venue: {
        greeting: "Welcome to the venue! Here are some live safety insights for your visit.",
        insights: [
          { title: "Safety First", body: "Locate the nearest exit upon entry. Emergency exits are marked in green on your map.", type: "warning" },
          { title: "Hydration", body: "Stay hydrated by visiting the food court stations during off-peak hours.", type: "tip" },
          { title: "Staff Support", body: "Ask staff for help if you feel overwhelmed or lost.", type: "info" }
        ]
      },
      visited: {
        greeting: "Thanks for visiting! Your feedback helps us improve our crowd safety models.",
        questions: [
          { id: "accuracy", question: "Did the zone names and locations seem accurate to you?", type: "yesno" },
          { id: "crowd", question: "How were the crowd levels during your visit?", type: "scale" },
          { id: "review", question: "Any specific areas that felt unsafe or congested?", type: "text" },
          { id: "rating", question: "Overall rating of the venue's crowd management:", type: "stars" }
        ]
      },
      planning_visit: {
        greeting: "Excited for your upcoming visit! Here is some preparation advice based on our analysis.",
        advice: [
          {
            category: "What to Bring",
            icon: "bag",
            tips: ["Power bank for your phone", "Water bottle", "Comfortable walking shoes"]
          },
          {
            category: "Crowd Strategy",
            icon: "route",
            tips: ["Arrive 30 mins early to avoid peak entry queues", "Set a meeting point with your group", "Check the live map regularly"]
          },
          {
            category: "General Precaution",
            icon: "shield",
            tips: ["Check the weather before heading out", "Keep your tickets ready", "Keep your belongings secure"]
          }
        ]
      }
    };

    return NextResponse.json({
      success: true, 
      data: mockData[scenario] || mockData.planning_visit,
      note: "Using safety fallback guidance."
    });
  }
}
