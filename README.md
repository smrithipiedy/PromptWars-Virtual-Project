# CrowdSense — AI-Powered Crowd Safety Intelligence

**CrowdSense** is a next-generation safety platform designed for live events, transforming static floor plans into dynamic, spatial intelligence dashboards. Built for the **PromptWars Virtual Challenge**, it demonstrates the powerful synergy between **Google Gemini AI** and **Google Maps Platform**.

## 🎯 Project Overview

- **Chosen Vertical**: Public Safety & Smart Venue Management.
- **Problem**: Venue organizers often lack real-time, spatial understanding of crowd density, leading to bottlenecks and safety hazards.
- **Solution**: An AI assistant that "reads" architectural floor plans and bridges them with real-world geographical data to provide live safety telemetry.

## 🧠 Approach & Logic

Our approach centers on **Spatial Grounding**:

1.  **Vision-to-Metadata**: We use **Gemini 2.0 Flash** to perform Zero-Shot architectural analysis. Instead of just "describing" an image, the model extracts structured JSON containing functional zones, estimated capacities, and safety recommendations.
2.  **Entity Resolution**: The AI deduces the venue identity from visual clues. We then use the **Google Places API** to "verify" this deduction, fetching official data (ratings, precise coordinates, photo assets) to ground the AI's intuition in factual reality.
3.  **Real-time Intelligence**: We combine these static insights with live telemetry (simulated for the demo) to create a heatmap-driven dashboard that identifies "Critical Zones" before they become dangerous.

## ⚙️ How it Works

1.  **Ingestion**: User uploads a venue layout (PNG/JPG).
2.  **Optimization**: The client-side **Image Compression Engine** reduces the payload for optimal Gemini API performance.
3.  **Analysis**: Gemini analyzes the layout and returns a structured map of categories (Seating, Stage, Exits, etc.).
4.  **Verification**: The system calls **Google Maps Places API** to confirm the venue's existence and enrich the metadata.
5.  **Telemetry**: The Dashboard calculates density metrics (Occupancy vs. Capacity) and generates AI-driven Safety Alerts if thresholds are exceeded.

## 📝 Assumptions made

- **Perspective**: The floor plan is a top-down or isometric 2D representation.
- **Visual Clues**: The AI requires at least some text or logo context on the image to perform high-confidence venue identification.
- **Language**: Analysis is currently optimized for English-language architectural labels.

## 🌟 Key Features

- **Gemini Vision Analysis**: Automatically identifies venues and categorizes functional zones from a single image.
- **Google Maps Interaction**: Deep integration with Maps, Marker clustering, and Visualization libraries.
- **Safety Assistant**: Configured with Harm Category safeguards to provide responsible safety suggestions.

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **AI**: Google Gemini 2.0 Flash
- **Maps**: Google Maps JavaScript SDK & Places API
- **Quality**: Zod, Jest, and Error Boundaries

## 🚀 Evaluation Highlights

- **Google Services**: Meaningful multi-service integration (Gemini + Maps + Places).
- **Security**: Strict input validation and model safety configurations.
- **Efficiency**: Client-side processing and quota-optimized AI prompts.
- **Accessibility**: ARIA-compliant UI and full SEO optimization.

## 👩🏻‍💻 Live demo link:
- https://crowdsense-nine.vercel.app/

---
*Built with ❤️ for PromptWars.*
