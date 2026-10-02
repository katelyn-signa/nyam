import React from 'react';

interface StatusDotProps {
  status: string;
  type?: 'case-status' | 'priority' | 'evidence-status' | 'category';
}

export const StatusIndicator: React.FC<StatusDotProps> = ({ status, type = 'case-status' }) => {
  let colorClass = 'text-slate-600';
  let dotColor = 'bg-slate-400';

  const s = status.toUpperCase();

  if (s === 'OPEN' || s === 'PROCESSED') {
    colorClass = 'text-emerald-700';
    dotColor = 'bg-emerald-500';
  } else if (s === 'UNDER_INVESTIGATION' || s === 'PROCESSING' || s === 'HIGH') {
    colorClass = 'text-amber-700';
    dotColor = 'bg-amber-500';
  } else if (s === 'CRITICAL' || s === 'FAILED') {
    colorClass = 'text-rose-700';
    dotColor = 'bg-rose-500';
  } else if (s === 'PENDING' || s === 'MEDIUM') {
    colorClass = 'text-sky-700';
    dotColor = 'bg-sky-500';
  } else if (s === 'CLOSED' || s === 'ARCHIVED' || s === 'LOW') {
    colorClass = 'text-slate-500';
    dotColor = 'bg-slate-400';
  }

  // Format readable label
  const label = s.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${colorClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export const MetadataSeparator: React.FC = () => (
  <span className="text-slate-300 select-none font-bold" aria-hidden="true">
    ·
  </span>
);
