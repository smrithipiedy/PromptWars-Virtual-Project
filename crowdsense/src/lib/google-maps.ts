import { logger } from "./logger";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export interface VerifiedVenueDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  website?: string;
  rating?: number;
  types?: string[];
  photoReference?: string;
}

/**
 * Searches for a venue by name using Google Places API (Find Place).
 * This adds a layer of 'Verification' to the AI's deductions.
 */
export async function verifyVenueOnGoogleMaps(venueName: string, cityHint?: string): Promise<VerifiedVenueDetails | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    logger.warn("Google Maps API key not found, skipping venue verification");
    return null;
  }

  try {
    const query = encodeURIComponent(`${venueName}${cityHint ? ` in ${cityHint}` : ""}`);
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,formatted_address,geometry,rating,types,photos&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      const photoReference = candidate.photos?.[0]?.photo_reference;

      return {
        placeId: candidate.place_id,
        name: candidate.name,
        formattedAddress: candidate.formatted_address,
        latitude: candidate.geometry.location.lat,
        longitude: candidate.geometry.location.lng,
        rating: candidate.rating,
        types: candidate.types,
        photoReference,
      };
    }

    logger.info(`No Google Maps match found for: ${venueName}`);
    return null;
  } catch (error) {
    logger.error("Error verifying venue on Google Maps", error);
    return null;
  }
}
