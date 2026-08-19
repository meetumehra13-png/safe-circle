import React, { useState } from 'react';
import { FileText, Plus, ThumbsUp, MapPin, ShieldAlert, Check, AlertCircle } from 'lucide-react';
import type { SafetyReport, LocationData, HazardCategory, HazardSeverity } from '../types';
import { getGoogleMapsUrl } from '../utils/distance';

interface CommunityReportsProps {
  reports: SafetyReport[];
  location: LocationData | null;
  onAddReport: (report: SafetyReport) => void;
  onUpvote: (id: string) => void;
  initialCoords?: { lat: number; lng: number } | null;
  isOpenModal: boolean;
  setIsOpenModal: (open: boolean) => void;
}

export const CommunityReports: React.FC<CommunityReportsProps> = ({
  reports,
  location,
  onAddReport,
  onUpvote,
  initialCoords,
  isOpenModal,
  setIsOpenModal,
}) => {
  const [category, setCategory] = useState<HazardCategory>('lighting');
  const [severity, setSeverity] = useState<HazardSeverity>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const lat = initialCoords ? initialCoords.lat : location?.lat;
    const lng = initialCoords ? initialCoords.lng : location?.lng;

    if (lat === undefined || lng === undefined) {
      setErrorMsg('Live GPS location is unavailable. Tap a location on the Safety Map to attach coordinates.');
      return;
    }

    const newReport: SafetyReport = {
      id: 'rep_' + Date.now(),
      lat,
      lng,
      category,
      severity,
      title,
      description,
      timestamp: Date.now(),
      upvotes: 1,
      verified: false,
    };

    onAddReport(newReport);
    setTitle('');
    setDescription('');
    setErrorMsg('');
    setIsOpenModal(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Community Safety Feed</h2>
            <p className="text-xs text-slate-400">Crowdsourced real-time safety alerts and verified safe havens</p>
          </div>
        </div>

        <button
          onClick={() => {
            setErrorMsg('');
            setIsOpenModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/40"
        >
          <Plus className="w-4 h-4" />
          Submit New Report
        </button>
      </div>

      <div className="space-y-3">
        {reports.map(r => (
          <div
            key={r.id}
            className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                  r.category === 'police' || r.category === 'safe_zone'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : r.severity === 'high'
                    ? 'bg-red-950 text-red-400 border border-red-800/60'
                    : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                }`}>
                  {r.category.replace('_', ' ')}
                </span>
                {r.verified && (
                  <span className="bg-blue-950 text-blue-400 px-2 py-0.5 rounded-md font-bold text-[10px] border border-blue-800/60 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified Official
                  </span>
                )}
                <span className="text-slate-500 text-[10px]">
                  {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h3 className="font-bold text-white text-base">{r.title}</h3>
              <p className="text-slate-400">{r.description}</p>
              <div className="text-[10px] text-slate-500 font-mono">
                GPS: {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
              <a
                href={getGoogleMapsUrl(r.lat, r.lng)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-semibold flex items-center gap-1 hover:text-white"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> Map
              </a>

              <button
                onClick={() => onUpvote(r.id)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{r.upvotes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Submit Community Safety Report
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Report Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as HazardCategory)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="lighting">Poor Street Lighting</option>
                  <option value="suspicious">Suspicious Activity</option>
                  <option value="hazard">Physical Obstacle / Hazard</option>
                  <option value="harassment">Harassment / Verbal Incident</option>
                  <option value="police">Police Station / Patrol</option>
                  <option value="safe_zone">Verified Safe Haven / Open Shop</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as HazardSeverity[]).map(sev => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`py-2 rounded-xl border text-center font-bold uppercase text-[10px] ${
                        severity === sev
                          ? sev === 'high'
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Broken streetlight near bus stop"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Description / Details</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide helpful context for others passing by..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>Location Attached:</span>
                <span className={`font-bold ${initialCoords || location ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {initialCoords
                    ? `${initialCoords.lat.toFixed(4)}, ${initialCoords.lng.toFixed(4)} (Picked on Map)`
                    : location
                    ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} (Live GPS)`
                    : 'Location Unavailable'}
                </span>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-950/60 border border-red-800 rounded-xl text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Post Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
