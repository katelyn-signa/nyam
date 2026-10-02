# CourtLens REST API Reference (v1)

Base URL: `/api/v1`

## Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/login` | Login and obtain JWT token | None |
| `POST` | `/auth/register` | Register new user account | None |
| `GET` | `/auth/me` | Fetch active user credentials | Bearer Token |

## Cases
| Method | Endpoint | Description | Role |
|---|---|---|---|
| `GET` | `/cases` | Query cases with status/priority filters | Viewer+ |
| `POST` | `/cases` | Docket a new legal case | Investigator+ |
| `GET` | `/cases/{id}` | Retrieve complete case dossier | Viewer+ |
| `PUT` | `/cases/{id}` | Update case metadata / status | Investigator+ |
| `DELETE` | `/cases/{id}` | Delete case | Admin |

## Evidence
| Method | Endpoint | Description | Role |
|---|---|---|---|
| `GET` | `/evidence` | Query evidence items across cases | Viewer+ |
| `POST` | `/cases/{id}/evidence` | Upload evidence (computes SHA-256) | Investigator+ |
| `GET` | `/evidence/{id}` | Retrieve evidence metadata (logs VIEW) | Viewer+ |
| `GET` | `/evidence/{id}/download` | Download raw original file | Viewer+ |
| `GET` | `/evidence/{id}/preview` | Preview parsed text / CSV / JSON | Viewer+ |
| `POST` | `/evidence/{id}/analyze` | Trigger Gemini AI re-analysis | Investigator+ |
| `GET` | `/evidence/{id}/custody` | Fetch chain of custody audit events | Viewer+ |

## Timeline & Notes
| Method | Endpoint | Description | Role |
|---|---|---|---|
| `GET` | `/cases/{id}/timeline` | Retrieve chronological case milestones | Viewer+ |
| `POST` | `/cases/{id}/timeline` | Add timeline milestone | Investigator+ |
| `GET` | `/cases/{id}/notes` | Retrieve investigator notes | Viewer+ |
| `POST` | `/cases/{id}/notes` | Add investigator case note | Investigator+ |

## Search & Dashboard
| Method | Endpoint | Description | Role |
|---|---|---|---|
| `GET` | `/search?q=...` | Cross-case search by keyword & hash | Viewer+ |
| `GET` | `/dashboard/statistics` | High-level repository metrics | Viewer+ |
| `GET` | `/audit/logs` | Full system audit trail | Admin |
| `GET` | `/health` | System health check | Public |
