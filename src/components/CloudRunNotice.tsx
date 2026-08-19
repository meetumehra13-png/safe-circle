import React from 'react';
import { Server, CheckCircle2, Terminal, Cloud } from 'lucide-react';

export const CloudRunNotice: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md text-white">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
          <Server className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Google Cloud Run Deployment Specs</h2>
          <p className="text-xs text-slate-400">Production multi-stage Docker container architecture ready for Cloud Run</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" /> Container Ready
          </div>
          <h3 className="font-bold text-sm text-slate-100 mb-1">Multi-Stage Dockerfile</h3>
          <p className="text-xs text-slate-400">
            Node.js build stage compiles optimized static assets; Nginx Alpine serves static bundle on Port 8080.
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" /> Stateless & Scalable
          </div>
          <h3 className="font-bold text-sm text-slate-100 mb-1">Zero Backend Dependency</h3>
          <p className="text-xs text-slate-400">
            100% client-side Geolocation, Web Audio synthesis, and browser storage persistence scale automatically on Cloud Run.
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Cloud className="w-4 h-4" /> Cloud Run Port 8080
          </div>
          <h3 className="font-bold text-sm text-slate-100 mb-1">Standard Environment</h3>
          <p className="text-xs text-slate-400">
            Pre-configured with <code className="text-purple-300 font-mono">nginx.conf</code> listening on <code className="text-purple-300 font-mono">PORT 8080</code> as mandated by GCP Cloud Run.
          </p>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-300 space-y-4">
        <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>Local Docker Container Verification Commands:</span>
        </div>

        <div className="space-y-2">
          <p className="text-slate-500">// 1. Build Production Image</p>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-purple-300">
            docker build -t gcr.io/YOUR_PROJECT_ID/safe-circle:latest .
          </div>

          <p className="text-slate-500">// 2. Test Container Locally on Port 8080</p>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-emerald-300">
            docker run -p 8080:8080 gcr.io/YOUR_PROJECT_ID/safe-circle:latest
          </div>

          <p className="text-slate-500">// 3. Deploy Directly to Google Cloud Run</p>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-blue-300">
            gcloud run deploy safe-circle --image gcr.io/YOUR_PROJECT_ID/safe-circle:latest --platform managed --region us-central1 --allow-unauthenticated
          </div>
        </div>
      </div>
    </div>
  );
};
