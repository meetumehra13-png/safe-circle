import React from 'react';
import { Shield, Radio, AlertTriangle, MapPin, Users, Clock, FileText, Server } from 'lucide-react';
import type { LocationData } from '../types';

interface NavbarProps {
  activeTab: 'map' | 'contacts' | 'timer' | 'reports' | 'history' | 'deploy';
  setActiveTab: (tab: 'map' | 'contacts' | 'timer' | 'reports' | 'history' | 'deploy') => void;
  location: LocationData | null;
  loadingLocation: boolean;
  isEmergencyActive: boolean;
  onTriggerSOS: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  location,
  loadingLocation,
  isEmergencyActive,
  onTriggerSOS,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-900/30">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                SAFE CIRCLE
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Stay Connected • Stay Aware
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            <Radio className={`w-3.5 h-3.5 ${loadingLocation ? 'text-amber-400 animate-spin' : location ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className="font-mono text-[11px] text-slate-300">
              {loadingLocation ? (
                'Acquiring GPS...'
              ) : location ? (
                <span className="text-emerald-400 font-semibold">
                  GPS Active ({location.accuracy ? `±${Math.round(location.accuracy)}m` : 'Live'})
                </span>
              ) : (
                <span className="text-red-400 font-semibold">GPS Unavailable</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Safety Map
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Contacts
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'timer'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Check-in Timer
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Reports
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Log
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'deploy'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Cloud Run
          </button>

          {!isEmergencyActive && (
            <button
              onClick={onTriggerSOS}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-900/40 transition-all transform hover:scale-105 active:scale-95"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              PANIC SOS
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
