import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, PhoneCall, MessageSquare, MapPin, Copy, Check, ShieldCheck, AlertOctagon, Share2 } from 'lucide-react';
import type { LocationData, TrustedContact } from '../types';
import { audioService } from '../services/audio';
import { generateEmergencySMS, getGoogleMapsUrl } from '../utils/distance';

interface EmergencyModalProps {
  isOpen: boolean;
  onResolve: (pin: string) => boolean;
  location: LocationData | null;
  contacts: TrustedContact[];
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onResolve,
  location,
  contacts,
}) => {
  const [sirenActive, setSirenActive] = useState(true);
  const [copied, setCopied] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (sirenActive) {
        audioService.startSiren();
      }
      if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    } else {
      audioService.stopSiren();
    }

    return () => {
      audioService.stopSiren();
    };
  }, [isOpen, sirenActive]);

  if (!isOpen) return null;

  const toggleSiren = () => {
    if (sirenActive) {
      audioService.stopSiren();
      setSirenActive(false);
    } else {
      audioService.startSiren();
      setSirenActive(true);
    }
  };

  const handleCopyLink = () => {
    if (location) {
      const url = getGoogleMapsUrl(location.lat, location.lng);
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onResolve(pinInput);
    if (!success) {
      setPinError('Invalid disarm PIN. Enter 1234 or your preset PIN.');
    } else {
      setPinInput('');
      setPinError('');
      audioService.stopSiren();
    }
  };

  const primaryContact = contacts.find(c => c.isPrimary) || contacts[0];
  const smsBody = generateEmergencySMS(location);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="absolute inset-0 border-8 border-red-600 animate-pulse pointer-events-none opacity-80" />

      <div className="max-w-xl w-full bg-slate-900 border-2 border-red-600 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-white my-auto">
        <div className="flex items-center justify-between pb-6 border-b border-red-900/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-600 text-white animate-bounce shadow-lg shadow-red-600/50">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-2xl font-black text-red-500 tracking-tight">
                EMERGENCY SOS ACTIVE
              </h2>
              <p className="text-xs text-red-300 font-semibold">
                High alert mode broadcasted. Stay calm.
              </p>
            </div>
          </div>

          <button
            onClick={toggleSiren}
            aria-label={sirenActive ? 'Mute emergency siren' : 'Unmute emergency siren'}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold ${
              sirenActive
                ? 'bg-red-600 border-red-500 text-white animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {sirenActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            {sirenActive ? 'SIREN ON' : 'SIREN OFF'}
          </button>
        </div>

        <div className="bg-red-950/40 border border-red-900/80 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-500" />
              Live Location Coordinates
            </span>
            {location && (
              <span className="text-[10px] bg-red-900/60 text-red-200 px-2 py-0.5 rounded-full font-mono">
                ±{Math.round(location.accuracy || 10)}m accuracy
              </span>
            )}
          </div>

          <div className="font-mono text-sm sm:text-base text-slate-100 bg-slate-950/80 p-3 rounded-xl border border-red-900/40 flex items-center justify-between gap-2">
            <span className="truncate">
              {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Resolving GPS...'}
            </span>
            {location && (
              <button
                onClick={handleCopyLink}
                aria-label="Copy Google Maps location link"
                className="px-2.5 py-1 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-sans font-semibold flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Map Pin'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <a
            href="tel:911"
            aria-label="Call emergency 911"
            className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-950/80 transition-transform transform active:scale-95"
          >
            <PhoneCall className="w-5 h-5 animate-pulse" />
            CALL 911 / POLICE
          </a>

          {primaryContact ? (
            <a
              href={`sms:${primaryContact.phone}?body=${encodeURIComponent(smsBody)}`}
              aria-label={`Send emergency SMS to primary contact ${primaryContact.name}`}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-950/80 transition-transform transform active:scale-95"
            >
              <MessageSquare className="w-5 h-5" />
              SMS Primary ({primaryContact.name})
            </a>
          ) : (
            <button
              onClick={handleCopyLink}
              aria-label="Share location link"
              className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm"
            >
              <Share2 className="w-5 h-5" />
              Share Location Link
            </button>
          )}
        </div>

        {contacts.length > 0 && (
          <div className="mb-6 bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Dispatch to Trusted Contacts ({contacts.length}):
            </h4>
            <div className="space-y-2">
              {contacts.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="text-slate-400 ml-2">({c.relationship})</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${c.phone}`}
                      aria-label={`Call ${c.name}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white font-semibold flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" /> Call
                    </a>
                    <a
                      href={`sms:${c.phone}?body=${encodeURIComponent(smsBody)}`}
                      aria-label={`Send SMS to ${c.name}`}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-semibold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" /> SMS
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleDisarmSubmit} className="pt-4 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-300 mb-2">
            Enter PIN to Disarm & Confirm Safety (Default PIN: 1234):
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={e => {
                setPinInput(e.target.value);
                setPinError('');
              }}
              placeholder="Enter PIN..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center text-lg tracking-widest focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center gap-2 shrink-0"
            >
              <ShieldCheck className="w-5 h-5" />
              I'M SAFE (DISARM)
            </button>
          </div>
          {pinError && (
            <p className="text-red-400 text-xs font-semibold mt-2">{pinError}</p>
          )}
        </form>
      </div>
    </div>
  );
};
