import React, { useState } from 'react';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { Case, CasePriority, CaseStatus } from '../../types';
import { api } from '../../lib/api';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated: (createdCase: Case) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ isOpen, onClose, onCaseCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [caseType, setCaseType] = useState('Financial Fraud & Embezzlement');
  const [priority, setPriority] = useState<CasePriority>('HIGH');
  const [jurisdiction, setJurisdiction] = useState('US Federal District Court');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 10));
  const [assignedTo, setAssignedTo] = useState('Detective Marcus Vance');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Case title is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createCase({
        title,
        description,
        case_type: caseType,
        priority,
        jurisdiction,
        incident_date: `${incidentDate}T00:00:00Z`,
        assigned_to: assignedTo
      });

      if (res.success && res.data) {
        onCaseCreated(res.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const caseTypes = [
    'Financial Fraud & Embezzlement',
    'Cybercrime & IP Theft',
    'Commercial Arbitration',
    'Securities & Regulatory Inquiry',
    'Internal Corporate Audit',
    'Public Corruption'
  ];

  const priorities: CasePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center">
              <FolderPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Docket New Legal Case</h3>
              <p className="text-[11px] text-slate-500">Initiate formal investigation record in CourtLens</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Case / Matter Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Apex Financial vs. Zenith Capital Asset Fraud"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Case Type</label>
              <select
                value={caseType}
                onChange={e => setCaseType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {caseTypes.map(ct => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as CasePriority)}
                className="w-full rounded-lg border border-slate-300 p-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {priorities.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Legal Jurisdiction</label>
              <input
                type="text"
                value={jurisdiction}
                onChange={e => setJurisdiction(e.target.value)}
                placeholder="e.g., US District Court, SDNY"
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Incident / Occurrence Date</label>
              <input
                type="date"
                value={incidentDate}
                onChange={e => setIncidentDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned Lead Investigator</label>
            <input
              type="text"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Matter Description & Scope</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Outline initial investigative hypotheses, key statutory provisions, and known targets..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Docketing Case...</span>
                </>
              ) : (
                <span>Docket Formal Case</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
