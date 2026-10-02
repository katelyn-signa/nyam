import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  FileCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { EvidenceCategory, EvidenceItem, DuplicateConflictError } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface EvidenceUploaderProps {
  caseId: string;
  caseNumber?: string;
  onUploadSuccess: (item: EvidenceItem) => void;
  onCancel?: () => void;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  caseId,
  caseNumber,
  onUploadSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EvidenceCategory>('DOCUMENT');
  const [source, setSource] = useState('Digital Evidence Intake');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateConflictError | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const categories: EvidenceCategory[] = [
    'DOCUMENT',
    'FINANCIAL',
    'DIGITAL',
    'IMAGE',
    'COMMUNICATION',
    'AUDIO',
    'VIDEO',
    'OTHER'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setError(null);
    setDuplicateWarning(null);

    // Auto-detect category from file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'doc' || ext === 'docx' || ext === 'txt') {
      setCategory('DOCUMENT');
    } else if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
      setCategory('FINANCIAL');
    } else if (ext === 'json' || ext === 'log' || ext === 'bin' || ext === 'pcap') {
      setCategory('DIGITAL');
    } else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp') {
      setCategory('IMAGE');
    } else if (ext === 'mp4' || ext === 'mov' || ext === 'mkv') {
      setCategory('VIDEO');
    } else if (ext === 'mp3' || ext === 'wav' || ext === 'm4a') {
      setCategory('AUDIO');
    }

    setSelectedFile(file);
    if (!description) {
      setDescription(`Evidence artifact: ${file.name}`);
    }
  };

  const executeUpload = async (forceDuplicate: boolean = false) => {
    if (!selectedFile) {
      setError('Please select an evidence file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setDuplicateWarning(null);

    try {
      const res = await api.uploadEvidence(caseId, selectedFile, {
        description,
        category,
        source,
        uploaded_by: user?.id,
        uploaded_by_name: user?.full_name,
        force_duplicate: forceDuplicate
      });

      if (res.success && res.data) {
        onUploadSuccess(res.data);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code === 'DUPLICATE_EVIDENCE') {
        setDuplicateWarning(err.details as DuplicateConflictError);
      } else {
        setError(err.message || 'Evidence upload failed.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Upload Forensic Evidence</h3>
          <p className="text-xs text-slate-500">
            Case target: <span className="font-mono font-medium text-slate-800">{caseNumber || caseId}</span> · Server-side SHA-256 seal computed
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Duplicate Warning Dialog if triggered */}
      {duplicateWarning && (
        <div className="mt-4 p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-900">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h4 className="font-semibold text-amber-900 text-sm">Duplicate Cryptographic Hash Detected!</h4>
              <p className="mt-1 text-amber-800 leading-relaxed">
                The file you selected produces an exact SHA-256 cryptographic match to an existing evidence record in the repository:
              </p>
              <div className="mt-2 p-2 bg-white/80 rounded border border-amber-200 font-mono text-[11px] text-amber-950 space-y-1">
                <div><strong>SHA-256:</strong> {duplicateWarning.sha256_hash}</div>
                <div><strong>Existing File:</strong> {duplicateWarning.existing_filename}</div>
                <div><strong>Record ID:</strong> {duplicateWarning.existing_evidence_id}</div>
              </div>
              <p className="mt-2 text-slate-600">
                In strict accordance with forensic chain-of-custody protocols, duplicate files should not be re-ingested without explicit investigator override.
              </p>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => executeUpload(true)}
                  className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-medium cursor-pointer transition-colors"
                >
                  Force Ingestion (Override Warning)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDuplicateWarning(null);
                    setSelectedFile(null);
                  }}
                  className="px-3 py-1.5 border border-amber-300 hover:bg-amber-100 text-amber-900 rounded text-xs font-medium cursor-pointer transition-colors"
                >
                  Cancel & Retain Original
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {error && (
        <div className="mt-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {/* Dropzone */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-amber-500 bg-amber-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.json,.docx,.mp4,.mp3,.log,.pcap"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="text-sm font-medium text-slate-800">
                Click to browse or drag & drop evidence file
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                Supported: PDF, JPG, PNG, WEBP, TXT, CSV, JSON, DOCX, MP4, MP3 (Up to 50MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-slate-200 flex items-center justify-center text-slate-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">{selectedFile.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  <span>·</span>
                  <span className="font-mono">{selectedFile.type || 'binary/raw'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50"
            >
              Change File
            </button>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Evidence Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as EvidenceCategory)}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Chain of Custody Source <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="e.g., Subpoena #841, Seized Hard Drive 02"
              className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Forensic Description & Investigator Notes
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Document brief, context, or handling notes..."
            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            disabled={!selectedFile || isUploading}
            onClick={() => executeUpload(false)}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Computing Hash & Ingesting...</span>
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4 text-amber-400" />
                <span>Ingest & Verify Evidence</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
