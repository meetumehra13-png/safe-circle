import type { TrustedContact, SafetyReport, CheckInState, EmergencyLogEntry } from '../types';

const CONTACTS_KEY = 'safecircle_contacts_v1';
const REPORTS_KEY = 'safecircle_reports_v1';
const CHECKIN_KEY = 'safecircle_checkin_v1';
const HISTORY_KEY = 'safecircle_history_v1';

const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: 'c1',
    name: 'Sarah Connor',
    phone: '+15550192834',
    relationship: 'Family / Sister',
    isPrimary: true,
    notes: 'Primary emergency contact. Call immediately.',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'c2',
    name: 'Marcus Vance',
    phone: '+15550183746',
    relationship: 'Trusted Friend',
    isPrimary: false,
    notes: 'Lives nearby downtown.',
    createdAt: Date.now() - 86400000 * 2,
  },
];

const DEFAULT_REPORTS: SafetyReport[] = [
  {
    id: 'r1',
    lat: 37.7749,
    lng: -122.4194,
    category: 'police',
    severity: 'low',
    title: '[Sample Safe Haven] Central Police Station',
    description: '24/7 Verified Safe Zone & Emergency Shelter (Reference Community Data)',
    timestamp: Date.now() - 3600000 * 12,
    upvotes: 24,
    verified: true,
  },
  {
    id: 'r2',
    lat: 37.7789,
    lng: -122.4144,
    category: 'lighting',
    severity: 'medium',
    title: '[Sample Hazard] Streetlights Out on 5th Ave',
    description: 'Main pedestrian walkway lights dark (Reference Community Data)',
    timestamp: Date.now() - 3600000 * 4,
    upvotes: 8,
    verified: false,
  },
  {
    id: 'r3',
    lat: 37.7719,
    lng: -122.4234,
    category: 'safe_zone',
    severity: 'low',
    title: '[Sample Safe Haven] City Transit Hub Center',
    description: 'Security officers on duty, well-lit lobby (Reference Community Data)',
    timestamp: Date.now() - 3600000 * 24,
    upvotes: 15,
    verified: true,
  },
];

export const storageService = {
  getContacts(): TrustedContact[] {
    try {
      const data = localStorage.getItem(CONTACTS_KEY);
      if (!data) {
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(DEFAULT_CONTACTS));
        return DEFAULT_CONTACTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CONTACTS;
    }
  },

  saveContacts(contacts: TrustedContact[]): void {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  },

  getReports(): SafetyReport[] {
    try {
      const data = localStorage.getItem(REPORTS_KEY);
      if (!data) {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(DEFAULT_REPORTS));
        return DEFAULT_REPORTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_REPORTS;
    }
  },

  saveReports(reports: SafetyReport[]): void {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  },

  addReport(report: SafetyReport): void {
    const reports = this.getReports();
    reports.unshift(report);
    this.saveReports(reports);
  },

  upvoteReport(id: string): void {
    const reports = this.getReports();
    const target = reports.find(r => r.id === id);
    if (target) {
      target.upvotes += 1;
      this.saveReports(reports);
    }
  },

  getCheckInState(): CheckInState | null {
    try {
      const data = localStorage.getItem(CHECKIN_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCheckInState(state: CheckInState | null): void {
    if (!state) {
      localStorage.removeItem(CHECKIN_KEY);
    } else {
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(state));
    }
  },

  getHistory(): EmergencyLogEntry[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addHistoryEntry(entry: EmergencyLogEntry): void {
    const history = this.getHistory();
    history.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },
};
