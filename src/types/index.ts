export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number | null; // meters
  altitude: number | null;
  heading: number | null;
  speed: number | null; // m/s
  timestamp: number;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: number;
}

export type HazardCategory = 'lighting' | 'suspicious' | 'hazard' | 'harassment' | 'safe_zone' | 'police';
export type HazardSeverity = 'low' | 'medium' | 'high';

export interface SafetyReport {
  id: string;
  lat: number;
  lng: number;
  category: HazardCategory;
  severity: HazardSeverity;
  title: string;
  description: string;
  timestamp: number;
  upvotes: number;
  verified?: boolean;
}

export interface CheckInState {
  id: string;
  durationSeconds: number;
  remainingSeconds: number;
  isActive: boolean;
  isPaused: boolean;
  pin: string;
  startedAt: number | null;
  expiresAt: number | null;
  destinationNote: string;
}

export type EmergencyType = 'sos_manual' | 'timer_expired' | 'community_alert';
export type EmergencyStatus = 'active' | 'resolved' | 'cancelled';

export interface EmergencyLogEntry {
  id: string;
  type: EmergencyType;
  timestamp: number;
  location: LocationData | null;
  status: EmergencyStatus;
  details: string;
  contactsNotified: string[];
}
