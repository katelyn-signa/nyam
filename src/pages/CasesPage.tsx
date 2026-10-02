import React, { useState } from 'react';
import {
  FolderLock,
  Plus,
  Search,
  Filter,
  FileCheck,
  Calendar,
  User,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Case, CaseStatus, CasePriority } from '../types';
import { StatusIndicator, MetadataSeparator } from '../components/common/Badge';

interface CasesPageProps {
  cases: Case[];
  isLoading: boolean;
  onSelectCase: (caseId: string) => void;
  onOpenNewCase: () => void;
}

export const CasesPage: React.FC<CasesPageProps> = ({
  cases,
  isLoading,
  onSelectCase,
  onOpenNewCase
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statuses = [
    { label: 'All Dockets', value: 'ALL' },
    { label: 'Open', value: 'OPEN' },
    { label: 'Under Investigation', value: 'UNDER_INVESTIGATION' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Closed', value: 'CLOSED' }
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Case Management Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active forensic investigations, judicial dockets, and evidentiary proceedings.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewCase}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          <span>Docket New Case</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {statuses.map(st => (
            <button
              key={st.value}
              type="button"
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                statusFilter === st.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter dockets..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Cases List */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500 mt-2 font-mono">Querying Dockets...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <FolderLock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No cases match your filter criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing search parameters or docket a new case.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map(c => (
            <div
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className="group bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Docket Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
                    {c.case_number}
                  </span>
                  <StatusIndicator status={c.status} />
                </div>

                {/* Case Title */}
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-950 transition-colors line-clamp-2 leading-snug">
                  {c.title}
                </h3>

                {/* Case Description */}
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                {/* Metadata items */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Type</span>
                    <span className="font-medium text-slate-700 truncate max-w-[160px]">
                      {c.case_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Jurisdiction</span>
                    <span className="text-slate-700 truncate max-w-[160px]">
                      {c.jurisdiction}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Lead Investigator</span>
                    <span className="font-medium text-slate-700 truncate max-w-[160px]">
                      {c.assigned_to || 'Assigned Agent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom footer with evidence count and arrow */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-mono">
                  <FileCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>{c.evidence_count ?? 1} Evidence Items</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-slate-900 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Docket</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
