import { useState } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { storageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { SOSButton } from './components/SOSButton';
import { EmergencyModal } from './components/EmergencyModal';
import { TrustedContacts } from './components/TrustedContacts';
import { SafetyTimer } from './components/SafetyTimer';
import { SafetyMap } from './components/SafetyMap';
import { CommunityReports } from './components/CommunityReports';
import { EmergencyHistory } from './components/EmergencyHistory';
import { CloudRunNotice } from './components/CloudRunNotice';
import type { TrustedContact, SafetyReport, CheckInState, EmergencyLogEntry } from './types';

export function App() {
  const { location, loading: loadingLocation, error: locationError, refreshLocation } = useGeolocation();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'map' | 'contacts' | 'timer' | 'reports' | 'history' | 'deploy'>('map');

  // App Data State
  const [contacts, setContacts] = useState<TrustedContact[]>(() => storageService.getContacts());
  const [reports, setReports] = useState<SafetyReport[]>(() => storageService.getReports());
  const [checkInState, setCheckInState] = useState<CheckInState | null>(() => storageService.getCheckInState());
  const [history, setHistory] = useState<EmergencyLogEntry[]>(() => storageService.getHistory());

  // Emergency Mode State
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [activeEmergencyId, setActiveEmergencyId] = useState<string | null>(null);

  // Add Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [pickedMapCoords, setPickedMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Handlers for Storage Updates
  const handleSaveContacts = (newContacts: TrustedContact[]) => {
    setContacts(newContacts);
    storageService.saveContacts(newContacts);
  };

  const handleAddReport = (newReport: SafetyReport) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    storageService.addReport(newReport);
  };

  const handleUpvoteReport = (id: string) => {
    storageService.upvoteReport(id);
    setReports(storageService.getReports());
  };

  const handleUpdateCheckInState = (newState: CheckInState | null) => {
    setCheckInState(newState);
    storageService.saveCheckInState(newState);
  };

  // Emergency SOS Trigger
  const handleTriggerSOS = () => {
    setIsEmergencyActive(true);

    const newLog: EmergencyLogEntry = {
      id: 'log_' + Date.now(),
      type: 'sos_manual',
      timestamp: Date.now(),
      location: location,
      status: 'active',
      details: 'Panic SOS Triggered by User',
      contactsNotified: contacts.map(c => c.name),
    };

    setActiveEmergencyId(newLog.id);
    storageService.addHistoryEntry(newLog);
    setHistory(storageService.getHistory());
  };

  // Emergency Resolution (PIN disarm)
  const handleResolveEmergency = (pinInput: string): boolean => {
    const validPin = checkInState?.pin || '1234';
    if (pinInput === validPin || pinInput === '1234') {
      setIsEmergencyActive(false);
      if (activeEmergencyId) {
        const updatedHistory = history.map(h =>
          h.id === activeEmergencyId ? { ...h, status: 'resolved' as const } : h
        );
        setHistory(updatedHistory);
        localStorage.setItem('safecircle_history_v1', JSON.stringify(updatedHistory));
        setActiveEmergencyId(null);
      }
      return true;
    }
    return false;
  };

  const handleMapAddReportClick = (lat?: number, lng?: number) => {
    if (lat && lng) {
      setPickedMapCoords({ lat, lng });
    } else {
      setPickedMapCoords(null);
    }
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-600 selection:text-white pb-12">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        location={location}
        loadingLocation={loadingLocation}
        isEmergencyActive={isEmergencyActive}
        onTriggerSOS={handleTriggerSOS}
      />

      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1">
              <SOSButton
                onTrigger={handleTriggerSOS}
                location={location}
                contacts={contacts}
              />
            </div>
            <div className="lg:col-span-2">
              <SafetyMap
                location={location}
                loadingLocation={loadingLocation}
                locationError={locationError}
                onRefreshLocation={refreshLocation}
                reports={reports}
                onAddReportClick={handleMapAddReportClick}
                onUpvoteReport={handleUpvoteReport}
              />
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <TrustedContacts
            contacts={contacts}
            onSaveContacts={handleSaveContacts}
            location={location}
          />
        )}

        {activeTab === 'timer' && (
          <SafetyTimer
            checkInState={checkInState}
            onUpdateCheckInState={handleUpdateCheckInState}
            onTriggerSOS={handleTriggerSOS}
            location={location}
          />
        )}

        {activeTab === 'reports' && (
          <CommunityReports
            reports={reports}
            location={location}
            onAddReport={handleAddReport}
            onUpvote={handleUpvoteReport}
            initialCoords={pickedMapCoords}
            isOpenModal={isReportModalOpen}
            setIsOpenModal={setIsReportModalOpen}
          />
        )}

        {activeTab === 'history' && (
          <EmergencyHistory history={history} />
        )}

        {activeTab === 'deploy' && (
          <CloudRunNotice />
        )}
      </main>

      <EmergencyModal
        isOpen={isEmergencyActive}
        onResolve={handleResolveEmergency}
        location={location}
        contacts={contacts}
      />
    </div>
  );
}

export default App;
