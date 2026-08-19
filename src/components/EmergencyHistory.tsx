import React from 'react';
import { History, ShieldCheck, MapPin } from 'lucide-react';
import type { EmergencyLogEntry } from '../types';
import { getGoogleMapsUrl } from '../utils/distance';

interface EmergencyHistoryProps {
  history: EmergencyLogEntry[];
}

export const EmergencyHistory: React.FC<EmergencyHistoryProps> = ({ history }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Emergency Incident Log</h2>
          <p className="text-xs text-slate-400">Immutable local log of past emergency activations, check-ins, and disarms</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-6">
          <ShieldCheck className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No Emergency Incidents Recorded</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Your safety log is completely clear. Triggered SOS alerts and expired check-in timers will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(item => (
            <div
              key={item.id}
              className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                    item.type === 'sos_manual'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {item.type === 'sos_manual' ? 'Panic SOS Triggered' : 'Check-in Timer Expired'}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{item.details}</h4>
                {item.location && (
                  <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" />
                    GPS: {item.location.lat.toFixed(5)}, {item.location.lng.toFixed(5)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {item.location && (
                  <a
                    href={getGoogleMapsUrl(item.location.lat, item.location.lng)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-400 font-semibold"
                  >
                    View Map Pin
                  </a>
                )}
                <span className={`px-2.5 py-1 rounded-xl font-bold uppercase text-[10px] ${
                  item.status === 'resolved'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
