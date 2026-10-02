import React, { useState } from 'react';
import {
  BookOpen,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  FileCode,
  Terminal,
  Layers,
  ExternalLink
} from 'lucide-react';

export const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'api' | 'db' | 'ai' | 'setup'>('architecture');

  const sections = [
    { id: 'architecture', label: '1. Architecture & Design', icon: Layers },
    { id: 'api', label: '2. REST API Documentation', icon: Server },
    { id: 'db', label: '3. Database & Schemas', icon: Database },
    { id: 'ai', label: '4. AI Service Layer', icon: Cpu },
    { id: 'setup', label: '5. Docker & Production Setup', icon: Terminal }
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          CourtLens System Architecture & Technical Specifications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Full technical blueprint, REST endpoints, database schemas, cryptographic integrity protocols, and deployment documentation.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1 p-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        {sections.map(sec => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs text-slate-700 leading-relaxed">
        {activeSection === 'architecture' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">High-Level System Architecture</h2>
            <p>
              CourtLens is structured as an enterprise-grade legal intelligence platform adhering to clean hexagonal architecture.
              The system isolates the domain entities (Cases, Evidence, Custody Records) from external persistence, cryptographic hashing engines, and AI foundation model providers.
            </p>

            <div className="p-4 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-1">
              <div className="text-amber-400 font-bold">// CourtLens Monorepo Structure</div>
              <div>courtlens/</div>
              <div>├── backend/                  # Python FastAPI, SQLAlchemy, Alembic, Pydantic</div>
              <div>│   ├── app/</div>
              <div>│   │   ├── api/routes/       # REST endpoints (auth, cases, evidence, search, timeline)</div>
              <div>│   │   ├── core/             # JWT security, config, role-based access control</div>
              <div>│   │   ├── models/           # SQLAlchemy 2.0 relational models</div>
              <div>│   │   ├── schemas/          # Pydantic validation schemas</div>
              <div>│   │   ├── services/         # Business logic (case, evidence, custody, hashing)</div>
              <div>│   │   ├── ai/               # AI Provider abstraction (Gemini + Local heuristic fallback)</div>
              <div>│   │   └── storage/          # Storage abstraction (Local filesystem / AWS S3)</div>
              <div>├── frontend/                 # React SPA (Vite, TypeScript, Tailwind CSS)</div>
              <div>├── database/                 # init.sql schema & fictional seed migrations</div>
              <div>├── docs/                     # Full technical manuals (architecture, api, db, ai)</div>
              <div>├── uploads/                  # Secure local evidence vault directory</div>
              <div>└── docker-compose.yml        # PostgreSQL + Backend + Frontend multi-container config</div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 pt-2">Forensic Integrity Guarantees</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>Server-Side SHA-256 Hashing:</strong> Every uploaded byte stream is hashed immediately on the server before persisting. Frontend-supplied hashes are never trusted.
              </li>
              <li>
                <strong>Duplicate Collision Prevention:</strong> Uploading a byte-identical file triggers a 409 Conflict with details pointing to the existing evidence ID and docket.
              </li>
              <li>
                <strong>Immutable Chain of Custody:</strong> Every access event (view, download, AI extraction, metadata edit) writes an append-only audit event storing timestamp, user ID, role, and IP address.
              </li>
              <li>
                <strong>Legal Advice Disclaimer:</strong> All AI outputs are strictly designated as assistance tools to preserve evidentiary admissibility and judicial neutrality.
              </li>
            </ul>
          </div>
        )}

        {activeSection === 'api' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">REST API Specification (v1)</h2>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5">Endpoint</th>
                    <th className="p-2.5">Auth Role</th>
                    <th className="p-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-700">POST</td>
                    <td className="p-2.5">/api/v1/auth/login</td>
                    <td className="p-2.5">Public</td>
                    <td className="p-2.5">Authenticate user and obtain JWT bearer token</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-sky-700">GET</td>
                    <td className="p-2.5">/api/v1/cases</td>
                    <td className="p-2.5">Viewer+</td>
                    <td className="p-2.5">Query legal cases with status/priority filtering</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-700">POST</td>
                    <td className="p-2.5">/api/v1/cases</td>
                    <td className="p-2.5">Investigator+</td>
                    <td className="p-2.5">Docket a new legal case with jurisdiction and dates</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-700">POST</td>
                    <td className="p-2.5">/api/v1/cases/:id/evidence</td>
                    <td className="p-2.5">Investigator+</td>
                    <td className="p-2.5">Upload multipart evidence; SHA-256 computed & duplicate checked</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-sky-700">GET</td>
                    <td className="p-2.5">/api/v1/evidence/:id/preview</td>
                    <td className="p-2.5">Viewer+</td>
                    <td className="p-2.5">Fetch parsed content preview (CSV/JSON/Text) with metadata</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-700">POST</td>
                    <td className="p-2.5">/api/v1/evidence/:id/analyze</td>
                    <td className="p-2.5">Investigator+</td>
                    <td className="p-2.5">Execute Gemini AI legal summarization & entity extraction</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-sky-700">GET</td>
                    <td className="p-2.5">/api/v1/search</td>
                    <td className="p-2.5">Viewer+</td>
                    <td className="p-2.5">Cross-case search by keyword, SHA-256 hash, and extracted text</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-sky-700">GET</td>
                    <td className="p-2.5">/api/v1/audit/logs</td>
                    <td className="p-2.5">Admin</td>
                    <td className="p-2.5">Retrieve complete system chain-of-custody audit logs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'db' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Normalized Relational Database Schema</h2>
            <p>
              Built for PostgreSQL with UUID primary keys, foreign key constraints, and btree indices on hashes and timestamps.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">cases</div>
                <div className="font-mono text-[10px] text-slate-600 space-y-0.5">
                  <div>id: UUID (PK)</div>
                  <div>case_number: VARCHAR(64) UNIQUE NOT NULL</div>
                  <div>title: VARCHAR(255) NOT NULL</div>
                  <div>description: TEXT</div>
                  <div>status: case_status_enum NOT NULL</div>
                  <div>priority: case_priority_enum NOT NULL</div>
                  <div>jurisdiction: VARCHAR(128)</div>
                  <div>incident_date: TIMESTAMP WITH TIME ZONE</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">evidence</div>
                <div className="font-mono text-[10px] text-slate-600 space-y-0.5">
                  <div>id: UUID (PK)</div>
                  <div>case_id: UUID (FK -&gt; cases.id) NOT NULL</div>
                  <div>original_filename: VARCHAR(255) NOT NULL</div>
                  <div>mime_type: VARCHAR(128) NOT NULL</div>
                  <div>file_size: BIGINT NOT NULL</div>
                  <div>storage_path: VARCHAR(512) NOT NULL</div>
                  <div>sha256_hash: CHAR(64) NOT NULL (INDEXED)</div>
                  <div>evidence_category: evidence_category_enum</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">evidence_audit_events (Custody)</div>
                <div className="font-mono text-[10px] text-slate-600 space-y-0.5">
                  <div>id: UUID (PK)</div>
                  <div>evidence_id: UUID (FK -&gt; evidence.id)</div>
                  <div>user_id: UUID (FK -&gt; users.id)</div>
                  <div>action: custody_action_enum NOT NULL</div>
                  <div>timestamp: TIMESTAMP WITH TIME ZONE NOT NULL</div>
                  <div>ip_address: INET / VARCHAR(45)</div>
                  <div>sha256_hash: CHAR(64) NOT NULL</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">case_timeline_events</div>
                <div className="font-mono text-[10px] text-slate-600 space-y-0.5">
                  <div>id: UUID (PK)</div>
                  <div>case_id: UUID (FK -&gt; cases.id) NOT NULL</div>
                  <div>title: VARCHAR(255) NOT NULL</div>
                  <div>description: TEXT</div>
                  <div>event_type: timeline_event_type_enum</div>
                  <div>timestamp: TIMESTAMP WITH TIME ZONE NOT NULL</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'ai' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">AI Intelligence Architecture</h2>
            <p>
              CourtLens leverages an extensible AI provider interface (<code>AIProvider</code>).
              It communicates with Google's Gemini generative model (<code>gemini-3.8-flash</code> via <code>@google/genai</code>) when an API key is available, and transparently engages a rule-based legal NLP parser if offline.
            </p>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1.5">
              <div className="font-semibold text-amber-950">Ethical AI & Judicial Neutrality Protocols:</div>
              <p>
                Under ABA Model Rules of Professional Conduct and forensic standards, AI models are never allowed to evaluate guilt, liability, or make judicial rulings. All extracted information is labeled with an evidentiary disclaimer requiring independent human attorney corroboration.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'setup' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Local Development & Docker Run Guide</h2>
            <p>
              The repository includes a ready-to-run <code>docker-compose.yml</code> file orchestrating PostgreSQL, the FastAPI backend, and the React frontend.
            </p>
            <div className="p-4 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-2">
              <div># 1. Clone repository and start Docker services</div>
              <div className="text-emerald-400">docker-compose up -d --build</div>
              <br />
              <div># 2. Run database migrations with Alembic</div>
              <div className="text-emerald-400">docker-compose exec backend alembic upgrade head</div>
              <br />
              <div># 3. Seed safe fictional demo cases</div>
              <div className="text-emerald-400">docker-compose exec backend python -m app.services.seed</div>
              <br />
              <div># 4. Open in browser</div>
              <div className="text-emerald-400">Frontend: http://localhost:3000</div>
              <div className="text-emerald-400">FastAPI Swagger Docs: http://localhost:8000/docs</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
