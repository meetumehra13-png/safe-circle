import React, { useState, useRef } from 'react';
import { AlertOctagon, ShieldAlert, MessageSquare, MapPin } from 'lucide-react';
import type { LocationData, TrustedContact } from '../types';

interface SOSButtonProps {
  onTrigger: () => void;
  location: LocationData | null;
  contacts: TrustedContact[];
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  onTrigger,
  location,
  contacts,
}) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const cancelHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHolding(false);
    setProgress(0);
  };

  const startHold = () => {
    cancelHold();
    setHolding(true);
    setProgress(0);
    const startTime = Date.now();
    const duration = 2000;

    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed >= duration) {
        cancelHold();
        onTrigger();
      }
    }, 30);
  };

  const primaryContact = contacts.find(c => c.isPrimary) || contacts[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          Emergency Panic System
        </div>
      </div>

      <h2 className="text-2xl font-black text-white tracking-tight mb-1">
        EMERGENCY SOS
      </h2>
      <p className="text-slate-400 text-xs max-w-sm mb-6">
        Press & HOLD for 2 seconds to activate high-decibel alarm, haptic alert, and broadcast real-time GPS location pin to your trusted contacts.
      </p>

      <div className="relative my-2">
        <svg className="w-48 h-48 transform -rotate-90" aria-hidden="true">
          <circle
            cx="96"
            cy="96"
            r="86"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-800"
            fill="transparent"
          />
          <circle
            cx="96"
            cy="96"
            r="86"
            stroke="currentColor"
            strokeWidth="8"
            className="text-red-500 transition-all ease-linear"
            fill="transparent"
            strokeDasharray={540}
            strokeDashoffset={540 - (540 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>

        <button
          aria-label="Hold for 2 seconds to trigger Emergency SOS panic alarm"
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          className={`absolute inset-4 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl select-none ${
            holding
              ? 'bg-red-700 scale-95 shadow-red-600/50'
              : 'bg-gradient-to-br from-red-600 via-red-700 to-rose-900 hover:scale-105 active:scale-95 shadow-red-900/60'
          }`}
        >
          <AlertOctagon className={`w-14 h-14 text-white mb-1 ${holding ? 'animate-bounce' : ''}`} />
          <span className="text-white font-black text-xl tracking-wider">
            {holding ? `${Math.ceil((100 - progress) / 50)}s` : 'HOLD SOS'}
          </span>
          <span className="text-[10px] text-red-200 uppercase tracking-widest font-semibold mt-0.5">
            {holding ? 'Releasing cancels' : 'Press & Hold'}
          </span>
        </button>
      </div>

      <button
        onClick={onTrigger}
        aria-label="Instant SOS Override"
        className="mt-3 text-xs text-red-400 hover:text-red-300 font-semibold underline underline-offset-4"
      >
        Or tap once for Instant SOS Override
      </button>

      <div className="mt-6 pt-4 border-t border-slate-800/80 w-full grid grid-cols-2 gap-3 text-left text-xs">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-1">
            Target Contacts
          </span>
          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>{contacts.length} Contact{contacts.length !== 1 ? 's' : ''} Ready</span>
          </div>
          {primaryContact && (
            <span className="text-[10px] text-emerald-400 block truncate mt-0.5">
              1st: {primaryContact.name}
            </span>
          )}
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-1">
            Live GPS Coordinates
          </span>
          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px] truncate">
              {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Resolving GPS...'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate mt-0.5">
            {location?.accuracy ? `Accurate to ±${Math.round(location.accuracy)}m` : 'High Precision Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};
