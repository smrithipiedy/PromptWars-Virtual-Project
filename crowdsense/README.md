# CrowdSense 🚀

**AI-powered real-time crowd safety platform for live events.**

CrowdSense combines Google Maps live heatmaps, Gemini Vision AI, and Firebase real-time telemetry to give event organizers instant crowd density intelligence — from floor plan upload to autonomous safety alerts.

---

## Features

| Feature | Technology |
|---|---|
| **Floor Plan Analyzer** | Gemini 2.0 Vision AI — identifies venue, categorizes zones, scores accessibility |
| **Live Crowd Heatmap** | Google Maps JavaScript API + Firebase Firestore real-time subscriptions |
| **AI Guide Chatbot** | Gemini conversational AI — context-aware venue navigation assistant |
| **Operations Dashboard** | Real-time zone density charts, AI-generated alerts, capacity tracking |
| **Attendee Live Map** | Location-aware crowd density view with pinnable waypoints |

---

## Google Services Used

- **Google Gemini API** (`gemini-2.0-flash`) — Vision-based floor plan analysis, venue identification, crowd pattern analysis, conversational AI
- **Google Maps JavaScript API** — Live heatmap visualization, zone markers, route overlays
- **Firebase Firestore** — Real-time crowd telemetry, zone density subscriptions, alert streaming
- **Firebase** — Backend infrastructure and real-time data sync

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/        # Unified venue + floor plan AI endpoint (single Gemini call)
│   │   ├── map-chat/       # Conversational AI assistant
│   │   ├── venue/          # Venue identification + Firestore sync
│   │   └── floorplan/      # Floor plan analysis
│   ├── analyzer/           # Floor Plan Analyzer page
│   ├── dashboard/          # Operations Dashboard
│   └── attendee/           # Attendee Live Map
├── components/
│   ├── FloorPlan/          # Upload + analysis UI
│   ├── Map/                # Heatmap, markers, chatbot, route overlay
│   └── Dashboard/          # Charts, alerts, stat cards
├── context/
│   └── VenueContext.tsx    # Global venue state (single source of truth)
└── lib/
    ├── gemini/client.ts    # Gemini AI client with multi-model fallback
    ├── firebase/           # Firestore subscriptions
    ├── api/rate-limit.ts   # Server-side rate limiting
    └── logger.ts           # Structured production logging
```

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd crowdsense
npm install
```

### 2. Environment variables

Create `.env.local`:

```
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Get your Gemini API key at [aistudio.google.com](https://aistudio.google.com/apikey).

### 3. Run

```bash
npm run dev        # Development (rate limiting disabled)
npm run build      # Production build
npm test           # Run test suite
```

Open [http://localhost:3000](http://localhost:3000).

---

## How to Use

1. **Upload a floor plan** on the `/analyzer` page — Gemini AI identifies the venue and categorizes all zones
2. **View the dashboard** at `/dashboard` — live crowd density, zone alerts, and AI recommendations sync automatically
3. **Open the live map** at `/attendee` — see the crowd heatmap and chat with the AI venue guide

---

## Design Decisions

- **Single AI call per upload**: Venue identification + floor plan analysis are combined into one Gemini request to minimize API quota usage
- **Multi-model fallback**: The Gemini client rotates through `gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-pro` automatically on quota/503 errors
- **Global state**: `VenueContext` is the single source of truth — Dashboard, Map, and Chatbot all stay in sync without redundant fetches
- **Rate limiting**: Server-side rate limiter is active in production, automatically bypassed in development
- **Structured logging**: All server events use the `logger` utility for production-grade observability

---

## Testing

```bash
npm test                    # All tests
npm test -- --coverage      # With coverage report
```

Tests cover API route handlers, the Gemini client, and core utility functions.
