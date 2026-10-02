import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  Filter,
  Eye,
  Download,
  Upload,
  Sparkles,
  Globe,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../lib/api';
import { ChainOfCustodyEvent } from '../types';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<ChainOfCustodyEvent[]>([]);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getAuditLogs().then(res => {
      if (res.success && res.data) {
        setLogs(res.data);
      }
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const actionFilters = [
    { label: 'All Custody Actions', value: 'ALL' },
    { label: 'Uploads', value: 'UPLOADED' },
    { label: 'Views', value: 'VIEWED' },
    { label: 'Downloads', value: 'DOWNLOADED' },
    { label: 'AI Analyzed', value: 'ANALYZED' }
  ];

  const filteredLogs = logs.filter(l => {
    if (filterAction === 'ALL') return true;
    return l.action === filterAction;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <span>AUDIT TRAIL</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> NIST SP 800-86 AUDIT CONFORMANCE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System & Evidence Chain of Custody Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete immutable ledger of all access, modifications, analyses, and downloads across all evidentiary assets.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          Logged Custody Records: <span className="font-bold text-slate-900">{logs.length}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-1 p-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        {actionFilters.map(af => (
          <button
            key={af.value}
            type="button"
            onClick={() => setFilterAction(af.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterAction === af.value
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {af.label}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <th className="px-4 py-3">Timestamp (UTC)</th>
              <th className="px-4 py-3">Custody Action</th>
              <th className="px-4 py-3">User & Organization</th>
              <th className="px-4 py-3">Evidence Artifact</th>
              <th className="px-4 py-3">Details & Circumstances</th>
              <th className="px-4 py-3">Integrity Digest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="font-mono font-semibold text-slate-900">{log.action}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-medium text-slate-900">{log.user_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {log.user_role} · {log.ip_address}
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-slate-700">
                  <div className="text-slate-900 font-medium truncate max-w-xs">{log.evidence_id}</div>
                  <div className="text-[10px] text-slate-400">Case: {log.case_id}</div>
                </td>
                <td className="px-4 py-3.5 text-slate-600 max-w-sm">
                  {log.details}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="text-emerald-700 font-mono text-[11px] flex items-center gap-1 font-medium">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    {log.sha256_hash ? log.sha256_hash.substring(0, 14) + '...' : 'SEALED'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
