import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Plus, ExternalLink, ThumbsUp, Radio, AlertTriangle, RefreshCw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationData, SafetyReport } from '../types';
import { calculateDistance, formatDistance, getGoogleMapsUrl } from '../utils/distance';

interface SafetyMapProps {
  location: LocationData | null;
  loadingLocation: boolean;
  locationError: string | null;
  onRefreshLocation: () => void;
  reports: SafetyReport[];
  onAddReportClick: (lat?: number, lng?: number) => void;
  onUpvoteReport: (id: string) => void;
}

export const SafetyMap: React.FC<SafetyMapProps> = ({
  location,
  loadingLocation,
  locationError,
  onRefreshLocation,
  reports,
  onAddReportClick,
  onUpvoteReport,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hasCenteredRef = useRef<boolean>(false);

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedCategoryFilter] = useState<string>('all');

  const initialCenter = location
    ? [location.lat, location.lng] as [number, number]
    : [20.0, 0.0] as [number, number];
  const initialZoom = location ? 15 : 2;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
      }).setView(initialCenter, initialZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      map.on('click', (e: L.LeafletMouseEvent) => {
        onAddReportClick(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        hasCenteredRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && location) {
      if (!hasCenteredRef.current) {
        map.setView([location.lat, location.lng], 15, { animate: true });
        hasCenteredRef.current = true;
      }
    }
  }, [location]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (location) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position:relative; width:24px; height:24px;">
            <div style="position:absolute; width:24px; height:24px; background:#3b82f6; border:3px solid white; border-radius:50%; box-shadow:0 0 12px #3b82f6;"></div>
            <div style="position:absolute; inset:-8px; background:rgba(59,130,246,0.3); border-radius:50%; animation:ping 1.5s infinite;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([location.lat, location.lng], { icon: userIcon })
        .addTo(markersGroup)
        .bindPopup(`
          <div style="color:#0f172a; font-family:sans-serif; text-align:center; padding:4px;">
            <strong style="display:block; font-size:13px; color:#2563eb; margin-bottom:2px;">📍 Your Live Location</strong>
            <div style="font-family:monospace; font-size:11px; background:#f1f5f9; padding:3px 6px; border-radius:4px; margin-bottom:4px; font-weight:bold;">
              ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}
            </div>
            <span style="font-size:10px; color:#64748b;">Accuracy: ±${Math.round(location.accuracy || 10)} meters</span>
          </div>
        `);

      if (location.accuracy && location.accuracy < 1000) {
        L.circle([location.lat, location.lng], {
          radius: location.accuracy,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          weight: 1,
        }).addTo(markersGroup);
      }
    }

    const filtered = selectedCategoryFilter === 'all'
      ? reports
      : reports.filter(r => r.category === selectedCategoryFilter);

    filtered.forEach(report => {
      const isPoliceOrSafe = report.category === 'police' || report.category === 'safe_zone';
      const markerColor = isPoliceOrSafe ? '#10b981' : report.severity === 'high' ? '#ef4444' : '#f59e0b';
      const iconEmoji = report.category === 'police' ? '👮' : report.category === 'lighting' ? '💡' : report.category === 'safe_zone' ? '🛡️' : '⚠️';

      const customIcon = L.divIcon({
        className: 'safety-report-marker',
        html: `
          <div style="background:${markerColor}; color:white; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.4);">
            ${iconEmoji}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([report.lat, report.lng], { icon: customIcon })
        .addTo(markersGroup)
        .bindPopup(`
          <div style="color:#0f172a; font-family:sans-serif; max-width:210px;">
            <strong style="display:block; font-size:13px; margin-bottom:2px;">${report.title}</strong>
            <p style="font-size:11px; color:#475569; margin:0 0 6px 0;">${report.description}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px;">
              <span style="background:${markerColor}; color:white; padding:2px 6px; border-radius:4px; text-transform:uppercase; font-weight:bold;">
                ${report.category.replace('_', ' ')}
              </span>
              <span style="color:#94a3b8; font-family:monospace;">${report.lat.toFixed(4)}, ${report.lng.toFixed(4)}</span>
            </div>
          </div>
        `);
    });
  }, [location, reports, selectedCategoryFilter]);

  const recenterMap = () => {
    if (location && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([location.lat, location.lng], 15, { duration: 1 });
    }
  };

  const sortedReports = [...reports].map(r => {
    const dist = location ? calculateDistance(location.lat, location.lng, r.lat, r.lng) : 0;
    return { ...r, distance: dist };
  }).sort((a, b) => a.distance - b.distance);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md flex flex-col h-[500px] sm:h-[650px] relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Interactive Safety Map</h2>
            <p className="text-xs text-slate-400">
              {location
                ? `Live Map Centered on GPS (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
                : 'Acquiring real GPS coordinates...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => onAddReportClick()}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-900/40"
          >
            <Plus className="w-4 h-4" />
            Report Hazard
          </button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-800">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {loadingLocation && !location && (
            <div className="absolute top-3 left-3 right-3 z-30 bg-slate-900/90 border border-blue-500/50 backdrop-blur-md p-3 rounded-xl text-xs text-blue-300 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2 font-semibold">
                <Radio className="w-4 h-4 text-blue-400 animate-spin" />
                <span>Acquiring real-time browser GPS coordinates... Please allow location access.</span>
              </div>
            </div>
          )}

          {locationError && !location && (
            <div className="absolute top-3 left-3 right-3 z-30 bg-red-950/90 border border-red-800 backdrop-blur-md p-3 rounded-xl text-xs text-red-200 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{locationError}</span>
              </div>
              <button
                onClick={onRefreshLocation}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3 h-3" /> Retry GPS
              </button>
            </div>
          )}

          {location && (
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
              <button
                onClick={recenterMap}
                className="p-2.5 rounded-xl bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 shadow-xl backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold"
                title="Recenter Map to Live GPS Coordinates"
              >
                <Navigation className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Recenter GPS</span>
              </button>
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
            <span className="truncate">
              {location
                ? `📍 Live GPS: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                : '💡 Tap map to drop a report'}
            </span>
            <div className="flex gap-3 font-semibold shrink-0">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/> Safe Haven</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"/> Warning</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"/> Hazard</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {sortedReports.map(r => (
            <div
              key={r.id}
              className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs hover:border-slate-700 transition-all"
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
                  <span className="text-slate-400 font-mono text-[11px]">
                    {location ? `${formatDistance(r.distance)} from live GPS` : 'Location pending'}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{r.title}</h4>
                <p className="text-slate-400">{r.description}</p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Coordinates: {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <a
                  href={getGoogleMapsUrl(r.lat, r.lng)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-400 flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3 h-3" /> Map Link
                </a>
                <button
                  onClick={() => onUpvoteReport(r.id)}
                  className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-semibold"
                >
                  <ThumbsUp className="w-3 h-3" /> {r.upvotes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
