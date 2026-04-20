export type ZoneSeverity = "low" | "moderate" | "high" | "critical";

export interface AttendeeLocation {
  attendeeId: string;
  latitude: number;
  longitude: number;
  zoneId: string;
  updatedAt: string;
}

export interface ZoneDensity {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentCount: number;
  density: number;
  severity: ZoneSeverity;
  updatedAt: string;
}

export interface CrowdAlert {
  id: string;
  zoneId: string;
  zoneName: string;
  severity: ZoneSeverity;
  message: string;
  suggestion: string;
  createdAt: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

export interface VenueLocation {
  venueName: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  confidence: "high" | "medium" | "low";
  internetInsights?: {
    typicalCrowdPattern: string;
    historicalSafetyIssues: string[];
    venueType: string;
    peakHours: string;
  };
}

export interface FloorPlanAnalysis {
  zones: Array<{
    name: string;
    estimatedCapacity: number;
    type: "seating" | "food" | "sanitation" | "entry" | "exit" | "stage" | "logistics" | "other";
    category: string;
    accessibilityFeatures: string[];
  }>;
  categoryStats: Record<string, { count: number; totalCapacity: number }>;
  totalCapacity: number;
  emergencyExits: number;
  accessibilityScore: number;
  recommendations: string[];
}

export interface OrganizerStats {
  totalAttendees: number;
  criticalZones: number;
  activeAlerts: number;
  averageDensity: number;
}
