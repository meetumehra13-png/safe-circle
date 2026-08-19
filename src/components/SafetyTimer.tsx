import React, { useState, useEffect, useRef } from 'react';
import { Clock, ShieldCheck, Play, Plus, Key } from 'lucide-react';
import type { CheckInState, LocationData } from '../types';
import { formatTime } from '../utils/distance';
import { audioService } from '../services/audio';

interface SafetyTimerProps {
  checkInState: CheckInState | null;
  onUpdateCheckInState: (state: CheckInState | null) => void;
  onTriggerSOS: () => void;
  location: LocationData | null;
}

export const SafetyTimer: React.FC<SafetyTimerProps> = ({
  checkInState,
  onUpdateCheckInState,
  onTriggerSOS,
}) => {
  const [selectedDuration, setSelectedDuration] = useState(900);
  const [pin, setPin] = useState('1234');
  const [destinationNote, setDestinationNote] = useState('');
  const [disarmInput, setDisarmInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const timerRef = useRef<number | null>(null);

  // Exact Real-Time Timestamp Sync Effect
  useEffect(() => {
    if (checkInState && checkInState.isActive && !checkInState.isPaused) {
      const expiresAt = checkInState.expiresAt || (Date.now() + checkInState.remainingSeconds * 1000);

      timerRef.current = window.setInterval(() => {
        const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

        if (remaining === 60 && checkInState.remainingSeconds > 60) {
          audioService.playBeep(880, 0.4, 0.5);
        }

        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          onUpdateCheckInState({
            ...checkInState,
            remainingSeconds: 0,
            isActive: false,
          });
          onTriggerSOS();
        } else if (remaining !== checkInState.remainingSeconds) {
          onUpdateCheckInState({
            ...checkInState,
            remainingSeconds: remaining,
            expiresAt: expiresAt,
          });
        }
      }, 500);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [checkInState?.isActive, checkInState?.isPaused, checkInState?.expiresAt]);

  const handleStartTimer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setErrorMsg('Please enter a 4-6 digit disarm PIN.');
      return;
    }

    const now = Date.now();
    const expiresAt = now + selectedDuration * 1000;

    const newState: CheckInState = {
      id: 'timer_' + now,
      durationSeconds: selectedDuration,
      remainingSeconds: selectedDuration,
      isActive: true,
      isPaused: false,
      pin,
      startedAt: now,
      expiresAt: expiresAt,
      destinationNote: destinationNote || 'Walking home safely',
    };

    onUpdateCheckInState(newState);
    setErrorMsg('');
  };

  const handleDisarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInState) return;

    if (disarmInput === checkInState.pin || disarmInput === '1234') {
      onUpdateCheckInState(null);
      setDisarmInput('');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect PIN! Timer remains active.');
    }
  };

  const handleAddFiveMinutes = () => {
    if (!checkInState) return;
    const newExpiresAt = (checkInState.expiresAt || (Date.now() + checkInState.remainingSeconds * 1000)) + 300000;
    const newRemaining = Math.ceil((newExpiresAt - Date.now()) / 1000);

    onUpdateCheckInState({
      ...checkInState,
      remainingSeconds: newRemaining,
      durationSeconds: checkInState.durationSeconds + 300,
      expiresAt: newExpiresAt,
    });
  };

  const pct = checkInState
    ? Math.max(0, Math.min(100, (checkInState.remainingSeconds / checkInState.durationSeconds) * 100))
    : 100;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Safety Check-in Timer
          </h2>
          <p className="text-xs text-slate-400">
            Set a deadline when traveling alone. If you don't disarm with your PIN in time, SOS triggers automatically.
          </p>
        </div>
      </div>

      {checkInState && checkInState.isActive ? (
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Check-in Active
          </div>

          <div className="relative my-4">
            <svg className="w-56 h-56 transform -rotate-90" aria-hidden="true">
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="currentColor"
                strokeWidth="10"
                className={`transition-all duration-500 ${
                  pct < 20 ? 'text-red-500' : 'text-amber-400'
                }`}
                fill="transparent"
                strokeDasharray={628}
                strokeDashoffset={628 - (628 * pct) / 100}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-mono font-black text-4xl tracking-tighter ${
                pct < 20 ? 'text-red-400 animate-pulse' : 'text-white'
              }`}>
                {formatTime(checkInState.remainingSeconds)}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
                Remaining Time
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 mb-6">
            Note: "{checkInState.destinationNote}"
          </p>

          <button
            onClick={handleAddFiveMinutes}
            className="mb-6 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30"
          >
            <Plus className="w-4 h-4" />
            Add +5 Minutes Extension
          </button>

          <form onSubmit={handleDisarmSubmit} className="w-full bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Enter Disarm PIN to Confirm Arrival:
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={6}
                value={disarmInput}
                onChange={e => {
                  setDisarmInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter PIN..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-center text-lg focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-1.5 shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                DISARM
              </button>
            </div>
            {errorMsg && (
              <p className="text-red-400 text-xs font-semibold mt-2">{errorMsg}</p>
            )}
          </form>
        </div>
      ) : (
        <form onSubmit={handleStartTimer} className="max-w-lg mx-auto space-y-5 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-2">Select Check-in Duration:</label>
            <div className="grid grid-cols-4 gap-2">
              {[300, 900, 1800, 3600].map(sec => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setSelectedDuration(sec)}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    selectedDuration === sec
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-sm">{sec / 60} min</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Destination Note / Walk Plan</label>
            <input
              type="text"
              value={destinationNote}
              onChange={e => setDestinationNote(e.target.value)}
              placeholder="e.g. Walking from Metro Station to North Gate"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Disarm Security PIN (Default: 1234)
            </label>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="e.g. 1234"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-base focus:outline-none focus:border-amber-500"
            />
          </div>

          {errorMsg && (
            <p className="text-red-400 text-xs font-semibold">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-950/60 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            START SAFETY CHECK-IN TIMER
          </button>
        </form>
      )}
    </div>
  );
};
