import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  User,
  Building,
  MapPin,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';
import { AIAnalysisSummary } from '../../types';

interface AIAnalysisCardProps {
  summary?: AIAnalysisSummary;
  onReanalyze?: () => void;
  isAnalyzing?: boolean;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  summary,
  onReanalyze,
  isAnalyzing = false
}) => {
  if (!summary) {
    return (
      <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center">
        <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">AI Intelligence Dossier Pending</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Generate an automated summary, extracted entities, key timeline dates, and forensic relevance indicators.
        </p>
        {onReanalyze && (
          <button
            type="button"
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>{isAnalyzing ? 'Extracting Insights...' : 'Run CourtLens AI Intelligence'}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200/80 bg-white overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-amber-500/10 via-slate-50 to-white border-b border-amber-200/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 leading-tight">
              AI Evidence Intelligence Dossier
            </h4>
            <p className="text-[11px] text-slate-500">
              Assisted semantic extraction · Relevance Score: <span className="font-semibold text-slate-800">{summary.relevance_score}/100</span>
            </p>
          </div>
        </div>

        {onReanalyze && (
          <button
            type="button"
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>
        )}
      </div>

      {/* Mandatory Legal Disclaimer Banner */}
      <div className="p-3 bg-amber-50/70 border-b border-amber-200/50 flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
          {summary.disclaimer || 'AI-generated assistance — verify against original evidence. Does not constitute legal advice or legal findings.'}
        </p>
      </div>

      {/* Body content */}
      <div className="p-5 space-y-5">
        {/* Executive Summary */}
        <div>
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Executive Summary
          </h5>
          <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
            {summary.short_summary}
          </p>
        </div>

        {/* Key Findings */}
        <div>
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Key Investigative Observations
          </h5>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {summary.key_points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Extracted Entities */}
        <div>
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Identified Entities & Mentions
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* People */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-1.5">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>Persons</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {summary.entities.people.length > 0 ? (
                  summary.entities.people.map((p, idx) => (
                    <span key={idx} className="text-slate-800 text-xs font-medium">
                      {p}{idx < summary.entities.people.length - 1 ? ' · ' : ''}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-[11px]">None detected</span>
                )}
              </div>
            </div>

            {/* Organizations */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-1.5">
                <Building className="h-3.5 w-3.5 text-slate-500" />
                <span>Organizations</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {summary.entities.organizations.length > 0 ? (
                  summary.entities.organizations.map((org, idx) => (
                    <span key={idx} className="text-slate-800 text-xs font-medium">
                      {org}{idx < summary.entities.organizations.length - 1 ? ' · ' : ''}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-[11px]">None detected</span>
                )}
              </div>
            </div>

            {/* Locations */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>Locations</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {summary.entities.locations.length > 0 ? (
                  summary.entities.locations.map((loc, idx) => (
                    <span key={idx} className="text-slate-800 text-xs font-medium">
                      {loc}{idx < summary.entities.locations.length - 1 ? ' · ' : ''}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-[11px]">None detected</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Chronological Events */}
        {summary.important_events && summary.important_events.length > 0 && (
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Extracted Chronological Milestones
            </h5>
            <div className="space-y-2 text-xs">
              {summary.important_events.map((evt, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80"
                >
                  <div className="flex items-center gap-1.5 font-mono text-slate-600 font-semibold shrink-0 text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{evt.date}</span>
                  </div>
                  <span className="text-slate-700">{evt.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
