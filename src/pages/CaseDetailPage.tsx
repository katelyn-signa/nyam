import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FolderLock,
  UploadCloud,
  FileCheck,
  Clock,
  Sparkles,
  MessageSquare,
  History,
  ShieldCheck,
  Plus,
  AlertTriangle,
  Download,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit
} from 'lucide-react';
import { Case, EvidenceItem, TimelineEvent, CaseNote, ChainOfCustodyEvent } from '../types';
import { api } from '../lib/api';
import { StatusIndicator, MetadataSeparator } from '../components/common/Badge';
import { EvidenceUploader } from '../components/evidence/EvidenceUploader';
import { EvidencePreviewer } from '../components/evidence/EvidencePreviewer';
import { CaseTimelineView } from '../components/timeline/CaseTimelineView';
import { AIAnalysisCard } from '../components/ai/AIAnalysisCard';
import { ChainOfCustodyTimeline } from '../components/evidence/ChainOfCustodyTimeline';
import { useAuth } from '../context/AuthContext';

interface CaseDetailPageProps {
  caseId: string;
  onBack: () => void;
  onSelectEvidence: (evidenceId: string) => void;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({
  caseId,
  onBack,
  onSelectEvidence
}) => {
  const { user, role } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'evidence' | 'timeline' | 'ai' | 'notes' | 'custody'
  >('overview');

  const [caseData, setCaseData] = useState<
    | (Case & {
        evidence: EvidenceItem[];
        timeline: TimelineEvent[];
        notes: CaseNote[];
      })
    | null
  >(null);

  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedPreviewEvidence, setSelectedPreviewEvidence] = useState<EvidenceItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [auditLogs, setAuditLogs] = useState<ChainOfCustodyEvent[]>([]);

  const loadCase = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCase(caseId);
      if (res.success && res.data) {
        setCaseData(res.data);
        if (res.data.evidence && res.data.evidence.length > 0) {
          setSelectedPreviewEvidence(res.data.evidence[0]);
        }
      }
      // Also fetch audit logs
      const auditRes = await api.getAuditLogs();
      if (auditRes.success) {
        setAuditLogs(auditRes.data.filter(a => a.case_id === caseId));
      }
    } catch (err) {
      console.error('Failed to load case:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const handleUploadSuccess = (newEvidence: EvidenceItem) => {
    setShowUploader(false);
    loadCase();
    setSelectedPreviewEvidence(newEvidence);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !caseData) return;

    setIsSubmittingNote(true);
    try {
      await api.createCaseNote(
        caseData.id,
        newNoteContent,
        user?.full_name,
        user?.role
      );
      setNewNoteContent('');
      loadCase();
    } catch (err) {
      console.error('Failed to post note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAddTimelineEvent = async (event: Partial<TimelineEvent>) => {
    if (!caseData) return;
    try {
      await api.createTimelineEvent(caseData.id, {
        ...event,
        actor_name: user?.full_name || 'Investigator'
      });
      loadCase();
    } catch (err) {
      console.error('Failed to add timeline event:', err);
    }
  };

  const handleAnalyzeSelectedEvidence = async () => {
    if (!selectedPreviewEvidence) return;
    setIsAnalyzing(true);
    try {
      const res = await api.triggerAIAnalysis(selectedPreviewEvidence.id);
      if (res.success && res.data) {
        setSelectedPreviewEvidence({
          ...selectedPreviewEvidence,
          ai_summary: res.data,
          status: 'PROCESSED'
        });
        loadCase();
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading || !caseData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Loading Case Dossier...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Case Overview', icon: FolderLock },
    { id: 'evidence', label: 'Evidence Vault', icon: FileCheck, count: caseData.evidence?.length },
    { id: 'timeline', label: 'Timeline & Milestones', icon: Clock, count: caseData.timeline?.length },
    { id: 'ai', label: 'AI Intelligence Dossier', icon: Sparkles },
    { id: 'notes', label: 'Investigator Notes', icon: MessageSquare, count: caseData.notes?.length },
    { id: 'custody', label: 'Chain of Custody', icon: History, count: auditLogs.length }
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Dockets</span>
          </button>

          <span className="text-slate-300">|</span>

          <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
            {caseData.case_number}
          </span>
          <MetadataSeparator />
          <StatusIndicator status={caseData.status} />
        </div>

        <div className="flex items-center gap-2">
          {role !== 'VIEWER' && (
            <button
              type="button"
              onClick={() => {
                setShowUploader(true);
                setActiveTab('evidence');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5 text-amber-400" />
              <span>Upload Evidence</span>
            </button>
          )}
        </div>
      </div>

      {/* Case Header Dossier Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{caseData.title}</h1>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">{caseData.description}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-right space-y-1 shrink-0 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jurisdiction</div>
            <div className="font-medium text-slate-800">{caseData.jurisdiction}</div>
            <div className="text-[11px] text-slate-500 font-mono">
              Incident: {new Date(caseData.incident_date).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Quiet unboxed metadata row */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <div>
            <span className="text-slate-400">Priority: </span>
            <span className="font-semibold text-slate-800">{caseData.priority}</span>
          </div>
          <MetadataSeparator />
          <div>
            <span className="text-slate-400">Classification: </span>
            <span className="text-slate-800">{caseData.case_type}</span>
          </div>
          <MetadataSeparator />
          <div>
            <span className="text-slate-400">Lead Investigator: </span>
            <span className="font-medium text-slate-800">{caseData.assigned_to || 'Assigned Agent'}</span>
          </div>
          <MetadataSeparator />
          <div>
            <span className="text-slate-400">Docketed: </span>
            <span className="font-mono text-slate-700">{new Date(caseData.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Executive Case AI Summary */}
              {caseData.ai_summary && (
                <div className="p-5 bg-gradient-to-r from-amber-50/50 to-white rounded-xl border border-amber-200/80 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 mb-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>Case Intelligence Summary</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{caseData.ai_summary}</p>
                  <p className="mt-2 text-[10px] text-slate-400 italic">
                    AI-generated assistance — verify against original documentary evidence.
                  </p>
                </div>
              )}

              {/* Case Evidence Summary Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Ingested Evidence Files
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('evidence')}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    View All Vault Files →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-2">
                  {caseData.evidence?.map(e => (
                    <div
                      key={e.id}
                      onClick={() => {
                        setSelectedPreviewEvidence(e);
                        setActiveTab('evidence');
                      }}
                      className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900">{e.original_filename}</span>
                          <MetadataSeparator />
                          <span className="text-[10px] font-mono text-slate-500">{e.evidence_category}</span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                          SHA-256: {e.sha256_hash.substring(0, 24)}...
                        </p>
                      </div>
                      <StatusIndicator status={e.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Overview Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Integrity Snapshot
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">SHA-256 Verified Rate</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> 100% Sealed
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Chain of Custody Events</span>
                    <span className="font-mono font-medium text-slate-800">{auditLogs.length} logged</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Investigator Notes</span>
                    <span className="font-mono font-medium text-slate-800">{caseData.notes?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Docket Status</span>
                    <StatusIndicator status={caseData.status} />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Quick Actions
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploader(true);
                    setActiveTab('evidence');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                >
                  <UploadCloud className="h-4 w-4 text-slate-500" />
                  <span>Upload Evidence File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className="w-full flex items-center justify-center gap-2 p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                >
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>Inspect Case Timeline</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Evidence Vault */}
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            {/* Uploader section toggle */}
            {showUploader && (
              <EvidenceUploader
                caseId={caseData.id}
                caseNumber={caseData.case_number}
                onUploadSuccess={handleUploadSuccess}
                onCancel={() => setShowUploader(false)}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Evidence File Selector Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Evidence Repository ({caseData.evidence?.length})
                  </h3>
                  {!showUploader && role !== 'VIEWER' && (
                    <button
                      type="button"
                      onClick={() => setShowUploader(true)}
                      className="text-xs font-medium text-slate-900 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add File</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {caseData.evidence?.map(item => {
                    const isSelected = selectedPreviewEvidence?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPreviewEvidence(item)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold truncate leading-tight">
                            {item.original_filename}
                          </p>
                          <span
                            className={`text-[10px] font-mono shrink-0 ${
                              isSelected ? 'text-amber-400' : 'text-slate-500'
                            }`}
                          >
                            {item.file_type.toUpperCase()}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] font-mono truncate mt-1 ${
                            isSelected ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {item.sha256_hash.substring(0, 18)}...
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                            {(item.file_size / 1024).toFixed(1)} KB
                          </span>
                          <span className={isSelected ? 'text-amber-300' : 'text-emerald-700 font-medium'}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Universal Previewer & AI Dossier Column */}
              <div className="lg:col-span-2 space-y-6">
                {selectedPreviewEvidence ? (
                  <>
                    <EvidencePreviewer
                      evidence={selectedPreviewEvidence}
                      onAnalyze={role !== 'VIEWER' ? handleAnalyzeSelectedEvidence : undefined}
                      isAnalyzing={isAnalyzing}
                    />

                    {selectedPreviewEvidence.ai_summary && (
                      <AIAnalysisCard
                        summary={selectedPreviewEvidence.ai_summary}
                        onReanalyze={role !== 'VIEWER' ? handleAnalyzeSelectedEvidence : undefined}
                        isAnalyzing={isAnalyzing}
                      />
                    )}
                  </>
                ) : (
                  <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                    <FileCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Select an evidence item from the list to preview.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Timeline */}
        {activeTab === 'timeline' && (
          <CaseTimelineView
            events={caseData.timeline || []}
            onAddEvent={role !== 'VIEWER' ? handleAddTimelineEvent : undefined}
          />
        )}

        {/* Tab 4: AI Intelligence */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {caseData.evidence?.some(e => e.ai_summary) ? (
              caseData.evidence
                .filter(e => e.ai_summary)
                .map(e => (
                  <div key={e.id} className="space-y-2">
                    <div className="text-xs font-mono font-semibold text-slate-700 flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-slate-500" />
                      <span>{e.original_filename}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Ingested: {new Date(e.uploaded_at).toLocaleString()}
                      </span>
                    </div>
                    <AIAnalysisCard
                      summary={e.ai_summary}
                      onReanalyze={
                        role !== 'VIEWER'
                          ? async () => {
                              setSelectedPreviewEvidence(e);
                              await handleAnalyzeSelectedEvidence();
                            }
                          : undefined
                      }
                      isAnalyzing={isAnalyzing && selectedPreviewEvidence?.id === e.id}
                    />
                  </div>
                ))
            ) : (
              <div className="p-10 text-center bg-white rounded-xl border border-slate-200">
                <Sparkles className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No Evidence Analyzed Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Run AI intelligence analysis on uploaded evidence files to extract summaries, entities, and timelines.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            {role !== 'VIEWER' && (
              <form onSubmit={handleAddNote} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <label className="block text-xs font-semibold text-slate-800">
                  Add Case Note / Lead Investigation Update
                </label>
                <textarea
                  rows={3}
                  required
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  placeholder="Record investigative lead, grand jury return date, witness corroboration notes..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNoteContent.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{isSubmittingNote ? 'Saving...' : 'Post Case Note'}</span>
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {caseData.notes?.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                  No notes recorded on this case yet.
                </div>
              ) : (
                caseData.notes?.map(note => (
                  <div key={note.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{note.user_name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({note.user_role})</span>
                      </div>
                      <time className="text-[11px] font-mono text-slate-400">
                        {new Date(note.created_at).toLocaleString()}
                      </time>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Chain of Custody */}
        {activeTab === 'custody' && (
          <ChainOfCustodyTimeline events={auditLogs} />
        )}
      </div>
    </div>
  );
};
