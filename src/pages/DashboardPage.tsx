import React from 'react';
import {
  FolderLock,
  FileCheck,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Plus,
  Search,
  UploadCloud,
  FileText,
  AlertCircle
} from 'lucide-react';
import { DashboardStatistics, Case, EvidenceItem } from '../types';
import { StatusIndicator, MetadataSeparator } from '../components/common/Badge';

interface DashboardPageProps {
  stats: DashboardStatistics | null;
  isLoading: boolean;
  onOpenNewCase: () => void;
  onSelectCase: (caseId: string) => void;
  onSelectEvidence: (evidenceId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  isLoading,
  onOpenNewCase,
  onSelectCase,
  onSelectEvidence,
  onNavigateTab
}) => {
  if (isLoading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Loading Intelligence Repository...</p>
        </div>
      </div>
    );
  }

  const { overview, evidence_by_category, recent_cases, recent_evidence, recent_activity } = stats;

  const totalCategoryCount = Object.values(evidence_by_category).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <span>FEDERAL & JUDICIAL INVESTIGATIVE REPOSITORY</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM OPERATIONAL
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Case Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Centralized evidence vault with cryptographic SHA-256 seal verification, automated chain-of-custody tracking, and AI-assisted forensic extraction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('search')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <span>Search Vault</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewCase}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>Docket New Case</span>
          </button>
        </div>
      </div>

      {/* Primary Key Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Total Cases</span>
            <FolderLock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono">{overview.total_cases}</span>
            <span className="text-xs text-slate-500">dockets</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{overview.active_cases} Active / In-Flight</span>
            <span>{overview.closed_cases} Archived</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Evidence Vault</span>
            <FileCheck className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono">{overview.total_evidence}</span>
            <span className="text-xs text-slate-500">artifacts</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Across all dockets</span>
            <span className="text-emerald-700 font-medium">100% Sealed</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Chain of Custody</span>
            <Activity className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono">{overview.total_custody_events}</span>
            <span className="text-xs text-slate-500">audit logs</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tamper-evident log</span>
            <span className="font-mono text-[11px] text-slate-400">FED-STD-180</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">Integrity Verification</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700 font-mono">{overview.verified_integrity_rate}</span>
            <span className="text-xs text-slate-500">pass rate</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>SHA-256 duplicate guards</span>
            <span className="text-emerald-700 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Evidence Category Distribution */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Evidence Distribution by Forensic Category</h3>
            <p className="text-xs text-slate-500">Classification breakdown of artifacts stored in CourtLens</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{overview.total_evidence} Total Items</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {Object.entries(evidence_by_category).map(([cat, count]) => {
            const percent = Math.round((count / totalCategoryCount) * 100) || 0;
            return (
              <div key={cat} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  {cat}
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-slate-900">{count}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{percent}%</span>
                </div>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                  <div className="bg-slate-900 h-1 rounded-full" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Recent Cases & Recent Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Active Investigative Dockets</h3>
              <p className="text-xs text-slate-500">Recently updated legal matters</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('cases')}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recent_cases.map(c => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900">{c.case_number}</span>
                    <MetadataSeparator />
                    <StatusIndicator status={c.status} />
                  </div>
                  <h4 className="text-xs font-medium text-slate-800 line-clamp-1">{c.title}</h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{c.jurisdiction}</span>
                    <MetadataSeparator />
                    <span>Priority: {c.priority}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-slate-500">
                    {c.evidence_count ?? 1} items
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Evidence Intake */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Evidence Ingestion</h3>
              <p className="text-xs text-slate-500">Cryptographically verified forensic uploads</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('evidence')}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Vault view</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recent_evidence.map(e => (
              <div
                key={e.id}
                onClick={() => onSelectEvidence(e.id)}
                className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 truncate max-w-xs">
                      {e.original_filename}
                    </span>
                    <MetadataSeparator />
                    <span className="text-[10px] font-mono text-slate-500">{e.evidence_category}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate max-w-sm">
                    SHA-256: {e.sha256_hash.substring(0, 20)}...
                  </p>
                  <div className="text-[11px] text-slate-400">
                    Ingested by {e.uploaded_by_name} · {new Date(e.uploaded_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <StatusIndicator status={e.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
