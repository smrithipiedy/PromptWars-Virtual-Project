import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  GeoPoint,
} from "firebase/firestore";
import { db } from "./client";
import type { ZoneDensity, CrowdAlert } from "@/types";

export async function writeAttendeeLocation(
  attendeeId: string,
  latitude: number,
  longitude: number,
  zoneId: string
): Promise<void> {
  const ref = doc(db, "attendee_locations", attendeeId);
  await setDoc(ref, {
    attendeeId,
    position: new GeoPoint(latitude, longitude),
    zoneId,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToZoneDensity(
  callback: (zones: ZoneDensity[]) => void
): () => void {
  const q = query(collection(db, "zone_density"), orderBy("density", "desc"));
  return onSnapshot(q, (snapshot) => {
    const zones: ZoneDensity[] = snapshot.docs.map((d) => ({
      ...(d.data() as Omit<ZoneDensity, "id">),
      id: d.id,
    }));
    callback(zones);
  });
}

export function subscribeToAlerts(
  callback: (alerts: CrowdAlert[]) => void
): () => void {
  const q = query(
    collection(db, "alerts"),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  return onSnapshot(q, (snapshot) => {
    const alerts: CrowdAlert[] = snapshot.docs.map((d) => ({
      ...(d.data() as Omit<CrowdAlert, "id">),
      id: d.id,
    }));
    callback(alerts);
  });
}
