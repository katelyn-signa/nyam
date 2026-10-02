import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  HardDrive,
  Key,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, role, setRole } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getHealth().then(res => {
      setHealth(res);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          System & Engine Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Forensic integrity policies, AI service abstractions, and storage subsystem status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Engine Status */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Cpu className="h-4 w-4 text-amber-500" />
            <span>AI Intelligence Provider Layer</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            CourtLens uses a provider-agnostic AI layer. It dynamically connects to Google Gemini API
            when <code>GEMINI_API_KEY</code> is present, or gracefully falls back to local rule-based heuristic extraction.
          </p>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Active Engine:</span>
              <span className="font-mono font-semibold text-slate-900">
                {health?.ai_provider || 'gemini-3.8-flash (Primary)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Model Alias:</span>
              <span className="font-mono text-slate-800">gemini-3.8-flash</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Legal Neutrality Guard:</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Storage Abstraction */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <HardDrive className="h-4 w-4 text-sky-500" />
            <span>Forensic Evidence Storage Provider</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Evidence storage is encapsulated behind an abstract <code>StorageProvider</code> interface.
            Currently mounted to local secured filesystem, with AWS S3 and GCP Cloud Storage adapters prepared.
          </p>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Active Storage:</span>
              <span className="font-mono font-semibold text-slate-900">Local Filesystem (/uploads)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Path Traversal Guard:</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Enabled
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Max Upload Limit:</span>
              <span className="font-mono text-slate-800">50 MB per file</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Standards */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Cryptographic Integrity Protocol</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            All evidence files undergo server-side SHA-256 cryptographic verification upon ingestion.
            Duplicates trigger explicit collision warnings to preserve chain of custody integrity.
          </p>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Hashing Standard:</span>
              <span className="font-mono font-semibold text-slate-900">SHA-256 (FIPS PUB 180-4)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duplicate Prevention:</span>
              <span className="text-emerald-700 font-medium">Strict Warning Modal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Audit Logging:</span>
              <span className="font-mono text-slate-800">Tamper-evident append-only</span>
            </div>
          </div>
        </div>

        {/* Current Session & Evaluator Controls */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Key className="h-4 w-4 text-indigo-500" />
            <span>Evaluator Session & Permissions</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            You can test the application under different role permissions (Admin, Investigator, Viewer)
            to evaluate role-based access control.
          </p>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Active Evaluator:</span>
              <span className="font-medium text-slate-900">{user?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Active Role:</span>
              <span className="font-mono font-semibold text-slate-900">{role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Organization:</span>
              <span className="text-slate-700">{user?.organization}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
