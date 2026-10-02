import {
  Case,
  EvidenceItem,
  ChainOfCustodyEvent,
  TimelineEvent,
  CaseNote,
  DashboardStatistics,
  User,
  DuplicateConflictError
} from '../types';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  code: string;
  details?: any;
  status: number;

  constructor(message: string, code: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('courtlens_auth_token');
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = data.error || {};
    throw new ApiError(
      err.message || response.statusText || 'An unexpected error occurred.',
      err.code || 'UNKNOWN_ERROR',
      response.status,
      err
    );
  }

  return data;
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; system: string; ai_provider: string }>('/health'),

  // Auth
  login: async (email: string) => {
    const res = await request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    localStorage.setItem('courtlens_auth_token', res.token);
    return res;
  },

  getCurrentUser: () => request<{ success: boolean; user: User }>('/auth/me'),

  getUsers: () => request<{ success: boolean; users: User[] }>('/auth/users'),

  // Dashboard
  getDashboardStats: () => request<{ success: boolean; data: DashboardStatistics }>('/dashboard/statistics'),

  // Cases
  getCases: (params?: { status?: string; priority?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; data: Case[]; total: number }>(`/cases${qs}`);
  },

  getCase: (id: string) =>
    request<{
      success: boolean;
      data: Case & {
        evidence: EvidenceItem[];
        timeline: TimelineEvent[];
        notes: CaseNote[];
      };
    }>(`/cases/${id}`),

  createCase: (data: Partial<Case>) =>
    request<{ success: boolean; data: Case }>('/cases', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateCase: (id: string, data: Partial<Case>) =>
    request<{ success: boolean; data: Case }>(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteCase: (id: string) =>
    request<{ success: boolean; message: string; data: Case }>(`/cases/${id}`, {
      method: 'DELETE'
    }),

  // Evidence
  getEvidenceList: (params?: { category?: string; file_type?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.file_type) query.set('file_type', params.file_type);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; data: EvidenceItem[]; total: number }>(`/evidence${qs}`);
  },

  getCaseEvidence: (caseId: string) =>
    request<{ success: boolean; data: EvidenceItem[]; total: number }>(`/cases/${caseId}/evidence`),

  getEvidenceItem: (id: string) =>
    request<{ success: boolean; data: EvidenceItem }>(`/evidence/${id}`),

  uploadEvidence: async (
    caseId: string,
    file: File,
    metadata: {
      description?: string;
      category?: string;
      source?: string;
      uploaded_by?: string;
      uploaded_by_name?: string;
      force_duplicate?: boolean;
    }
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.category) formData.append('category', metadata.category);
    if (metadata.source) formData.append('source', metadata.source);
    if (metadata.uploaded_by) formData.append('uploaded_by', metadata.uploaded_by);
    if (metadata.uploaded_by_name) formData.append('uploaded_by_name', metadata.uploaded_by_name);
    if (metadata.force_duplicate) formData.append('force_duplicate', 'true');

    return request<{ success: boolean; message: string; data: EvidenceItem }>(`/cases/${caseId}/evidence`, {
      method: 'POST',
      body: formData
    });
  },

  triggerAIAnalysis: (evidenceId: string) =>
    request<{ success: boolean; data: EvidenceItem['ai_summary'] }>(`/evidence/${evidenceId}/analyze`, {
      method: 'POST'
    }),

  getEvidenceCustody: (evidenceId: string) =>
    request<{ success: boolean; data: ChainOfCustodyEvent[]; total: number }>(`/evidence/${evidenceId}/custody`),

  // Timeline
  getCaseTimeline: (caseId: string) =>
    request<{ success: boolean; data: TimelineEvent[]; total: number }>(`/cases/${caseId}/timeline`),

  createTimelineEvent: (caseId: string, data: Partial<TimelineEvent>) =>
    request<{ success: boolean; data: TimelineEvent }>(`/cases/${caseId}/timeline`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Notes
  getCaseNotes: (caseId: string) =>
    request<{ success: boolean; data: CaseNote[]; total: number }>(`/cases/${caseId}/notes`),

  createCaseNote: (caseId: string, content: string, user_name?: string, user_role?: string) =>
    request<{ success: boolean; data: CaseNote }>(`/cases/${caseId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content, user_name, user_role })
    }),

  // Search
  searchGlobal: (query: string, category?: string, caseId?: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (caseId) params.set('case_id', caseId);
    return request<{
      success: boolean;
      query: string;
      total_results: number;
      results: { cases: Case[]; evidence: EvidenceItem[] };
    }>(`/search?${params.toString()}`);
  },

  // Audit Logs
  getAuditLogs: () =>
    request<{ success: boolean; data: ChainOfCustodyEvent[]; total: number }>('/audit/logs')
};
