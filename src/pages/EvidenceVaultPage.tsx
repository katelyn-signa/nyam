import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  Filter,
  ShieldCheck,
  Download,
  Eye,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { EvidenceItem, EvidenceCategory } from '../types';
import { StatusIndicator, MetadataSeparator } from '../components/common/Badge';
import { EvidencePreviewer } from '../components/evidence/EvidencePreviewer';
import { AIAnalysisCard } from '../components/ai/AIAnalysisCard';
import { api } from '../lib/api';

interface EvidenceVaultPageProps {
  evidenceList: EvidenceItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectCase: (caseId: string) => void;
}

export const EvidenceVaultPage: React.FC<EvidenceVaultPageProps> = ({
  evidenceList,
  isLoading,
  onRefresh,
  onSelectCase
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [hashVerifierInput, setHashVerifierInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    matched: boolean;
    item?: EvidenceItem;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { label: 'All Artifacts', value: 'ALL' },
    { label: 'Document', value: 'DOCUMENT' },
    { label: 'Financial', value: 'FINANCIAL' },
    { label: 'Digital Forensics', value: 'DIGITAL' },
    { label: 'Image', value: 'IMAGE' },
    { label: 'Communication', value: 'COMMUNICATION' }
  ];

  const filteredEvidence = evidenceList.filter(e => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      e.original_filename.toLowerCase().includes(q) ||
      e.sha256_hash.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.source.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'ALL' || e.evidence_category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleVerifyHash = (e: React.FormEvent) => {
    e.preventDefault();
    const target = hashVerifierInput.trim().toLowerCase();
    if (!target) return;

    const found = evidenceList.find(
      item => item.sha256_hash.toLowerCase() === target || item.sha256_hash.toLowerCase().startsWith(target)
    );

    if (found) {
      setVerificationResult({ matched: true, item: found });
      setSelectedEvidence(found);
    } else {
      setVerificationResult({ matched: false });
    }
  };

  const copyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <span>REPOSITORY VAULT</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> SHA-256 INTEGRITY ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Forensic Evidence Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Universal immutable repository of ingested artifacts, cryptographic hashes, and custody seals.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          Total Vault Items: <span className="font-bold text-slate-900">{evidenceList.length}</span>
        </div>
      </div>

      {/* Forensic Hash Verifier Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm">
        <form onSubmit={handleVerifyHash} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 shrink-0 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Verify SHA-256 Hash:</span>
          </div>
          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              value={hashVerifierInput}
              onChange={e => {
                setHashVerifierInput(e.target.value);
                setVerificationResult(null);
              }}
              placeholder="Paste full or prefix 64-char hex digest (e.g. 9f86d081884c7d659a...)"
              className="w-full bg-slate-800 text-emerald-300 font-mono text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Verify Integrity
          </button>
        </form>

        {verificationResult && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs">
            {verificationResult.matched ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Valid Match Found: "{verificationResult.item?.original_filename}" (Case: {verificationResult.item?.case_id})
              </span>
            ) : (
              <span className="text-rose-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                No evidence file in vault matches this cryptographic hash.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          {categories.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                categoryFilter === cat.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search filenames, hashes, sources..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Main Grid: List + Detail Preview Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table / Cards */}
        <div className={`${selectedEvidence ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-3`}>
          {filteredEvidence.map(item => {
            const isSelected = selectedEvidence?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedEvidence(item)}
                className={`p-4 bg-white rounded-xl border transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                      {item.original_filename}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>{item.evidence_category}</span>
                      <MetadataSeparator />
                      <span>{(item.file_size / 1024).toFixed(1)} KB</span>
                      <MetadataSeparator />
                      <span className="font-mono text-slate-700">{item.file_type.toUpperCase()}</span>
                    </div>
                  </div>

                  <StatusIndicator status={item.status} />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-500 truncate max-w-[200px]">
                    SHA: {item.sha256_hash.substring(0, 16)}...
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      copyHash(item.id, item.sha256_hash);
                    }}
                    className="text-slate-400 hover:text-slate-700 flex items-center gap-1"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Evidence Detail Pane */}
        {selectedEvidence && (
          <div className="lg:col-span-2 space-y-6">
            <EvidencePreviewer evidence={selectedEvidence} />

            {selectedEvidence.ai_summary && (
              <AIAnalysisCard summary={selectedEvidence.ai_summary} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
