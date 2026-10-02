import React, { useState, useEffect } from 'react';
import {
  Search,
  FolderLock,
  FileCheck,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import { Case, EvidenceItem, EvidenceCategory } from '../types';
import { StatusIndicator, MetadataSeparator } from '../components/common/Badge';

interface SearchPageProps {
  onSelectCase: (caseId: string) => void;
  onSelectEvidence: (evidenceId: string) => void;
  initialQuery?: string;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onSelectCase,
  onSelectEvidence,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ cases: Case[]; evidence: EvidenceItem[] }>({
    cases: [],
    evidence: []
  });
  const [hasSearched, setHasSearched] = useState(false);

  const sampleQueries = [
    'SWIFT wire transfer Cayman',
    'HSM master key exfiltration',
    'Patricia Chen affidavit',
    'CASE-2026-001',
    'cold-chain telemetry failure'
  ];

  const handleSearch = async (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await api.searchGlobal(q, category || undefined);
      if (res.success && res.results) {
        setResults(res.results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [category]);

  const categories: EvidenceCategory[] = [
    'DOCUMENT',
    'FINANCIAL',
    'DIGITAL',
    'IMAGE',
    'COMMUNICATION'
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Global Case & Evidence Search
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Perform cross-case keyword and semantic searches across docket metadata, raw extracted text, and forensic analysis files.
        </p>

        {/* Big Search Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch();
          }}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <div className="relative flex-1 min-w-[300px]">
            <Search className="h-5 w-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by keywords, people, organizations, dates, or SHA-256 hashes..."
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  handleSearch('');
                }}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Search Repository
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Suggested Queries:
          </span>
          {sampleQueries.map(sq => (
            <button
              key={sq}
              type="button"
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {isSearching ? (
        <div className="py-20 text-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500 mt-2 font-mono">Searching Evidence Corridors...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Matched Cases */}
          {results.cases.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FolderLock className="h-4 w-4 text-slate-500" />
                  <span>Matching Legal Cases ({results.cases.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.cases.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {c.case_number}
                      </span>
                      <StatusIndicator status={c.status} />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900">{c.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{c.description}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{c.jurisdiction}</span>
                      <span className="text-slate-700 font-medium">Open Docket →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Evidence */}
          {results.evidence.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-slate-500" />
                  <span>Matching Evidence Items & Extracted Text ({results.evidence.length})</span>
                </h3>
              </div>

              <div className="space-y-3">
                {results.evidence.map(e => (
                  <div
                    key={e.id}
                    onClick={() => onSelectEvidence(e.id)}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {e.original_filename}
                        </span>
                        <MetadataSeparator />
                        <span className="text-[10px] font-mono text-slate-500">
                          {e.evidence_category}
                        </span>
                        <MetadataSeparator />
                        <span className="text-[10px] font-mono text-slate-400">
                          Case: {e.case_id}
                        </span>
                      </div>
                      <StatusIndicator status={e.status} />
                    </div>

                    <p className="text-xs text-slate-600">{e.description}</p>

                    {e.extracted_text && (
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] text-slate-700 line-clamp-2">
                        {e.extracted_text}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono">SHA-256: {e.sha256_hash}</span>
                      <span className="text-slate-700 font-medium">Examine Evidence →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {hasSearched && results.cases.length === 0 && results.evidence.length === 0 && (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <Search className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No records found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching by case number, individual names, or broaden your category filter.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
