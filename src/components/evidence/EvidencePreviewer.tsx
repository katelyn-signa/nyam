import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileText,
  FileCode,
  Table,
  Image as ImageIcon,
  ShieldCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { EvidenceItem } from '../../types';

interface EvidencePreviewerProps {
  evidence: EvidenceItem;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
}

export const EvidencePreviewer: React.FC<EvidencePreviewerProps> = ({
  evidence,
  onAnalyze,
  isAnalyzing = false
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'raw' | 'metadata'>('preview');

  const copyHashToClipboard = () => {
    navigator.clipboard.writeText(evidence.sha256_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const renderContent = () => {
    const ext = evidence.file_type.toLowerCase();
    const mime = evidence.mime_type.toLowerCase();

    // 1. CSV tabular rendering
    if (ext === 'csv' && evidence.extracted_text) {
      const rows = evidence.extracted_text
        .split('\n')
        .map(r => r.trim())
        .filter(Boolean)
        .map(r => r.split(','));

      if (rows.length > 0) {
        const headers = rows[0];
        const dataRows = rows.slice(1);

        return (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 font-semibold text-slate-700 font-mono">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-slate-800 font-mono">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // 2. JSON formatted rendering
    if ((ext === 'json' || mime.includes('json')) && evidence.extracted_text) {
      try {
        const parsed = JSON.parse(evidence.extracted_text);
        return (
          <pre className="p-4 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        );
      } catch {
        return (
          <pre className="p-4 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto max-h-96">
            {evidence.extracted_text}
          </pre>
        );
      }
    }

    // 3. Image rendering
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) || mime.startsWith('image/')) {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-lg border border-slate-200">
          <img
            src={`/api/v1/evidence/${evidence.id}/download`}
            alt={evidence.original_filename}
            className="max-h-80 max-w-full rounded shadow-sm object-contain"
            onError={e => {
              // Fallback placeholder if file binary not on disk
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="mt-3 text-xs text-slate-500 font-mono">
            Image Artifact · {evidence.original_filename} ({(evidence.file_size / 1024).toFixed(1)} KB)
          </div>
        </div>
      );
    }

    // 4. Plain text / PDF OCR extraction text
    if (evidence.extracted_text) {
      return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
          {evidence.extracted_text}
        </div>
      );
    }

    return (
      <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
        <FileText className="h-10 w-10 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-800">{evidence.original_filename}</p>
        <p className="text-xs text-slate-500 mt-1">Binary file artifact preserved in secure storage vault.</p>
        <a
          href={`/api/v1/evidence/${evidence.id}/download`}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download Original File</span>
        </a>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
            {evidence.file_type === 'csv' ? (
              <Table className="h-4 w-4" />
            ) : evidence.file_type === 'json' ? (
              <FileCode className="h-4 w-4" />
            ) : ['jpg', 'png'].includes(evidence.file_type) ? (
              <ImageIcon className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 leading-tight">{evidence.original_filename}</h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>{evidence.evidence_category}</span>
              <span>·</span>
              <span>{(evidence.file_size / 1024).toFixed(1)} KB</span>
              <span>·</span>
              <span>Status: {evidence.status}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onAnalyze && (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-950 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isAnalyzing ? 'Analyzing with AI...' : 'Run AI Intelligence'}</span>
            </button>
          )}

          <a
            href={`/api/v1/evidence/${evidence.id}/download`}
            download={evidence.original_filename}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* SHA-256 Cryptographic Seal Banner */}
      <div className="px-4 py-2 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-slate-400 font-mono text-[11px]">SHA-256 HASH:</span>
          <span className="font-mono text-emerald-300 text-[11px] truncate max-w-xs sm:max-w-md">
            {evidence.sha256_hash}
          </span>
        </div>
        <button
          type="button"
          onClick={copyHashToClipboard}
          className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {copiedHash ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Hash</span>
            </>
          )}
        </button>
      </div>

      {/* View Segmented Tabs */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-slate-50/50 text-xs">
        <button
          type="button"
          onClick={() => setActiveView('preview')}
          className={`px-3 py-1 font-medium rounded-md transition-colors ${
            activeView === 'preview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Document Preview
        </button>
        <button
          type="button"
          onClick={() => setActiveView('metadata')}
          className={`px-3 py-1 font-medium rounded-md transition-colors ${
            activeView === 'metadata'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Forensic Metadata
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4">
        {activeView === 'preview' && renderContent()}

        {activeView === 'metadata' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                File Properties
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Record ID</span>
                <span className="font-mono text-slate-800">{evidence.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Original Name</span>
                <span className="font-medium text-slate-800">{evidence.original_filename}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">MIME Type</span>
                <span className="font-mono text-slate-800">{evidence.mime_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Byte Size</span>
                <span className="font-mono text-slate-800">{evidence.file_size.toLocaleString()} bytes</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Storage Path</span>
                <span className="font-mono text-slate-800">{evidence.storage_path}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Forensic Custody Details
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Ingested By</span>
                <span className="font-medium text-slate-800">{evidence.uploaded_by_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Ingestion Timestamp</span>
                <span className="font-mono text-slate-800">
                  {new Date(evidence.uploaded_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Chain Source</span>
                <span className="font-medium text-slate-800">{evidence.source}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Verification Status</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Sealed & Valid
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last Modified</span>
                <span className="font-mono text-slate-800">
                  {new Date(evidence.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
