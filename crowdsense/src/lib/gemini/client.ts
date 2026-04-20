import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

/* ────────────────────────────────────────────────────────────
   Gemini AI Client
   Uses the @google/generative-ai SDK (v1beta endpoint default).
   DO NOT override apiVersion – the SDK manages that automatically.
   Model priority: gemini-2.0-flash → gemini-1.5-flash → gemini-1.5-pro
──────────────────────────────────────────────────────────── */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("[gemini] GEMINI_API_KEY is NOT set in .env.local");
} else {
  console.log(`[gemini] API key detected (length=${GEMINI_API_KEY.length})`);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? "");

// Models verified available for this API key via ListModels.
// 2.x series only — 1.5 models are NOT available on new keys.
const VISION_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
];

export function getGeminiModel(modelName: string): GenerativeModel {
  // No apiVersion override – let the SDK use its default (v1beta)
  return genAI.getGenerativeModel({ model: modelName });
}

/** Tries each model in sequence and returns the first that succeeds. */
export async function generateWithFallback(
  promptOrParts: string | any[]
): Promise<string> {
  let lastError: Error | null = null;

  for (const modelName of VISION_MODELS) {
    try {
      const model = getGeminiModel(modelName);
      const result = await model.generateContent(promptOrParts as any);
      const raw = result.response.text();
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
      // If the response contains JSON, extract just the JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      return jsonMatch ? jsonMatch[0] : cleaned;
    } catch (err: any) {
      console.warn(`[gemini] ${modelName} failed: ${err?.message?.slice(0, 200)}`);
      lastError = err;
      const msg = err?.message ?? "";

      // Extract retry delay from Gemini's error message if present
      const retryMatch = msg.match(/retry[^\d]*(\d+)s/i);
      const retryDelay = retryMatch ? parseInt(retryMatch[1], 10) * 1000 : 0;

      // Retry on quota, rate-limit, overload, or model-not-found errors
      if (msg.includes("429") || msg.includes("503") || msg.includes("quota") || msg.includes("404")) {
        if (retryDelay > 0 && retryDelay < 60000) {
          console.log(`[gemini] Waiting ${retryDelay / 1000}s before trying next model...`);
          await new Promise((r) => setTimeout(r, retryDelay));
        }
        continue; // try next model
      }
      break; // non-retryable error
    }
  }

  throw lastError ?? new Error("All Gemini models failed");
}

/* ─── Venue Location Identification ────────────────────────── */
export async function identifyVenueLocation(
  base64Image: string,
  mimeType: string
): Promise<{
  venueName: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  confidence: "high" | "medium" | "low";
  internetInsights?: {
    typicalCrowdPattern: string;
    historicalSafetyIssues: string[];
    venueType: string;
    peakHours: string;
  };
}> {
  const prompt = `You are an expert venue detective.
Analyze the provided floor plan image and IDENTIFY the specific venue.
RULES:
- DO NOT say "Unknown" if there are ANY visual clues (logos, names, city hints, sponsor watermarks, architectural style).
- If you see a name on the plan, use it exactly.
- If uncertain, provide your BEST DEDUCTION (e.g. "Likely [City] Convention Center").

Respond ONLY with valid JSON (no markdown fences):
{
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
}`;

  const parts = [
    { text: prompt },
    { inlineData: { data: base64Image, mimeType } },
  ];

  const text = await generateWithFallback(parts);
  return JSON.parse(text);
}

/* ─── Floor Plan Analysis ───────────────────────────────────── */
export async function analyzeFloorPlan(
  base64Image: string,
  mimeType: string
): Promise<string> {
  const prompt = `You are a professional venue safety analyst.
Analyze this floor plan image and categorize every functional section.

RULES:
1. Identify EVERY zone/room/area visible.
2. CATEGORIZE each into: 'seating', 'food', 'sanitation', 'entry', 'exit', 'stage', 'logistics', or 'other'.
3. GROUP them by a broader category name (e.g. 'Public Dining', 'VIP Seating').
4. CALCULATE aggregate capacity for each group in categoryStats.

Respond ONLY with valid JSON (no markdown fences):
{
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
}`;

  const parts = [
    { text: prompt },
    { inlineData: { data: base64Image, mimeType } },
  ];

  return generateWithFallback(parts);
}

/* ─── Crowd Pattern Analysis ─────────────────────────────────── */
export async function analyzeCrowdPattern(
  zones: Array<{
    name: string;
    estimatedCapacity: number;
    type: string;
    category: string;
    accessibilityFeatures: string[];
    density: number;
  }>,
  categoryStats: Record<string, { count: number; totalCapacity: number }>,
  totalCapacity: number
): Promise<{
  alerts: Array<{
    zoneName: string;
    message: string;
    suggestion: string;
    severity: string;
  }>;
}> {
  const prompt = `You are a crowd safety AI for CrowdSense.
Analyze this real-time zone density data and generate safety alerts.

Zone Data:
${JSON.stringify(zones, null, 2)}

SEVERITY RULES:
- density > 0.9 = CRITICAL
- density > 0.75 = HIGH
- density > 0.5 = MODERATE
- density <= 0.5 = LOW (omit from alerts)

Respond ONLY with valid JSON (no markdown fences):
{
  "alerts": [
    {
      "zoneName": "string",
      "message": "string",
      "suggestion": "string",
      "severity": "low" | "moderate" | "high" | "critical"
    }
  ]
}`;

  const text = await generateWithFallback(prompt);
  return JSON.parse(text);
}
