import React, { useState } from 'react';
import {
  Clock,
  FolderPlus,
  FileCheck,
  Sparkles,
  Calendar,
  MessageSquare,
  Activity,
  Filter,
  Plus
} from 'lucide-react';
import { TimelineEvent, TimelineEventType } from '../../types';

interface CaseTimelineViewProps {
  events: TimelineEvent[];
  onAddEvent?: (event: Partial<TimelineEvent>) => void;
}

export const CaseTimelineView: React.FC<CaseTimelineViewProps> = ({ events, onAddEvent }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 16));

  const filterOptions = [
    { label: 'All Milestones', value: 'ALL' },
    { label: 'Case Creation', value: 'CASE_CREATED' },
    { label: 'Evidence Ingestion', value: 'EVIDENCE_UPLOADED' },
    { label: 'AI Extracted Events', value: 'EXTRACTED_EVENT' },
    { label: 'Status Shifts', value: 'STATUS_CHANGED' },
    { label: 'Notes', value: 'NOTE_ADDED' }
  ];

  const filteredEvents = events.filter(e => {
    if (filterType === 'ALL') return true;
    return e.event_type === filterType;
  });

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'CASE_CREATED':
        return <FolderPlus className="h-4 w-4 text-emerald-600" />;
      case 'EVIDENCE_UPLOADED':
        return <FileCheck className="h-4 w-4 text-sky-600" />;
      case 'EXTRACTED_EVENT':
        return <Sparkles className="h-4 w-4 text-amber-600" />;
      case 'STATUS_CHANGED':
        return <Activity className="h-4 w-4 text-purple-600" />;
      case 'NOTE_ADDED':
        return <MessageSquare className="h-4 w-4 text-slate-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !onAddEvent) return;
    onAddEvent({
      title: newTitle,
      description: newDesc,
      timestamp: new Date(newDate).toISOString(),
      event_type: 'EXTRACTED_EVENT'
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        {/* Interactive filter tabs adhering to zero-pill constitution */}
        <div className="flex flex-wrap items-center gap-1">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilterType(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                filterType === opt.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {onAddEvent && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Timeline Event</span>
          </button>
        )}
      </div>

      {/* Timeline List */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            No events match the selected filter.
          </div>
        ) : (
          <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filteredEvents.map(evt => (
              <div key={evt.id} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-8 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-300 shadow-xs">
                  {getEventIcon(evt.event_type)}
                </div>

                {/* Event Card */}
                <div className="bg-slate-50/70 hover:bg-slate-50 rounded-lg p-4 border border-slate-200/90 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-semibold text-slate-900">{evt.title}</h4>
                    <time className="text-[11px] font-mono text-slate-500">
                      {new Date(evt.timestamp).toLocaleString()}
                    </time>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{evt.event_type.replace(/_/g, ' ')}</span>
                    <span className="text-slate-500">Logged by: {evt.actor_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Add Case Timeline Event</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g., Grand Jury Subpoena Served"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Timestamp</label>
                <input
                  type="datetime-local"
                  required
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Contextual details, officer notes..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Record Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
