import React from 'react';
import {
  ShieldCheck,
  Eye,
  Download,
  Upload,
  Sparkles,
  Edit,
  Trash2,
  Clock,
  User,
  Globe
} from 'lucide-react';
import { ChainOfCustodyEvent } from '../../types';

interface ChainOfCustodyTimelineProps {
  events: ChainOfCustodyEvent[];
}

export const ChainOfCustodyTimeline: React.FC<ChainOfCustodyTimelineProps> = ({ events }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'UPLOADED':
        return <Upload className="h-3.5 w-3.5 text-emerald-600" />;
      case 'VIEWED':
        return <Eye className="h-3.5 w-3.5 text-sky-600" />;
      case 'DOWNLOADED':
        return <Download className="h-3.5 w-3.5 text-indigo-600" />;
      case 'ANALYZED':
        return <Sparkles className="h-3.5 w-3.5 text-amber-600" />;
      case 'MODIFIED':
      case 'CATEGORIZED':
        return <Edit className="h-3.5 w-3.5 text-purple-600" />;
      case 'DELETED':
        return <Trash2 className="h-3.5 w-3.5 text-rose-600" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  if (events.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
        No chain of custody logs recorded for this item yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Forensic Chain of Custody (Audit Trail)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {events.length} Verified Custody Events
        </span>
      </div>

      <div className="mt-4 relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((evt, idx) => (
          <div key={evt.id || idx} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-300 shadow-xs">
              {getActionIcon(evt.action)}
            </div>

            {/* Event detail */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-900">
                    {evt.action}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-700 font-medium">
                    {evt.user_name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({evt.user_role})
                  </span>
                </div>
                <time className="text-[11px] font-mono text-slate-500">
                  {new Date(evt.timestamp).toLocaleString()}
                </time>
              </div>

              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {evt.details}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-slate-400" />
                  <span>IP: {evt.ip_address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>Digest Verified: {evt.sha256_hash?.substring(0, 12)}...</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
