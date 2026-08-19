import React, { useState } from 'react';
import { Sparkles, Brain, AlertTriangle, ShieldCheck, ShieldAlert, Shield, Loader2, ArrowRight } from 'lucide-react';
import type { LocationData, SafetyReport, AISafetyAnalysis } from '../types';
import { analyzeAreaSafetyWithGemini } from '../services/aiService';

interface AISafetyAnalyzerProps {
  location: LocationData | null;
  reports: SafetyReport[];
}

export const AISafetyAnalyzer: React.FC<AISafetyAnalyzerProps> = ({
  location,
  reports,
}) => {
  const [analysis, setAnalysis] = useState<AISafetyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!location) {
      setErrorMsg('Live GPS location is required to perform AI area analysis.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await analyzeAreaSafetyWithGemini(location, reports);
      setAnalysis(result);
    } catch (err) {
      console.warn('AI Safety Analysis error:', err);
      setErrorMsg('AI analysis temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (level) {
      case 'LOW':
        return {
          badgeBg: 'bg-emerald-950/80',
          badgeText: 'text-emerald-400',
          border: 'border-emerald-500/50',
          bar: 'bg-emerald-500',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
        };
      case 'MEDIUM':
        return {
          badgeBg: 'bg-amber-950/80',
          badgeText: 'text-amber-400',
          border: 'border-amber-500/50',
          bar: 'bg-amber-500',
          icon: <Shield className="w-6 h-6 text-amber-400" />,
        };
      case 'HIGH':
        return {
          badgeBg: 'bg-red-950/80',
          badgeText: 'text-red-400',
          border: 'border-red-500/50',
          bar: 'bg-red-500',
          icon: <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />,
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              AI SAFETY INTELLIGENCE
            </h3>
            <p className="text-[11px] text-slate-400">Gemini safety risk assessment</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-purple-400" /> Powered by AI
        </span>
      </div>

      {!analysis && !loading && !errorMsg && (
        <div className="text-center py-4">
          <p className="text-xs text-slate-300 mb-4">
            Click below to analyze nearby safety signals, crowdsourced reports, and GPS location context using Gemini AI.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={!location}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-xs tracking-wider shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            ANALYZE CURRENT AREA
          </button>
        </div>
      )}

      {loading && (
        <div className="py-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-purple-300 font-bold animate-pulse">
            AI is analyzing nearby safety signals...
          </p>
        </div>
      )}

      {errorMsg && !loading && (
        <div className="p-4 bg-slate-950/80 border border-amber-500/40 rounded-2xl text-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            To enable real-time Gemini AI risk analysis, set your <code className="text-purple-300 font-mono">GEMINI_API_KEY</code> environment variable in your <code className="text-purple-300 font-mono">.env.local</code> file.
          </p>
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold w-full"
          >
            Try Again
          </button>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-4 text-xs">
          {(() => {
            const style = getRiskColor(analysis.riskLevel);
            return (
              <div className={`p-4 rounded-2xl border ${style.badgeBg} ${style.border} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {style.icon}
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Current Risk
                      </span>
                      <span className={`text-lg font-black tracking-tight ${style.badgeText}`}>
                        {analysis.riskLevel} RISK
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Risk Score
                    </span>
                    <span className={`font-mono text-base font-black ${style.badgeText}`}>
                      {analysis.riskScore}/100
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${style.bar} transition-all duration-1000`}
                    style={{ width: `${Math.min(100, Math.max(0, analysis.riskScore))}%` }}
                  />
                </div>

                <p className="text-slate-200 font-medium text-xs pt-1">
                  "{analysis.summary}"
                </p>
              </div>
            );
          })()}

          {analysis.riskFactors && analysis.riskFactors.length > 0 && (
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                AI Detected Factors:
              </h4>
              <ul className="space-y-1.5 pl-1">
                {analysis.riskFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-xs">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1.5">
            <h4 className="font-bold text-purple-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              AI Recommendation:
            </h4>
            <p className="text-slate-200 font-semibold leading-relaxed">
              {analysis.recommendation}
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Re-Analyze Area
          </button>
        </div>
      )}
    </div>
  );
};
