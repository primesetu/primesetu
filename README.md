# PrimeSetu — Shoper9-Based Retail OS

> Sovereign · AI-Governed · Zero-Cost Phase 1

## Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TypeScript + Tailwind |
| Database | Supabase PostgreSQL (cloud) |
| Auth | Supabase Auth (JWT + RBAC) |
| API Phase 1 | Supabase PostgREST (auto) |
| API Phase 2+ | Python 3.12 + FastAPI |
| Edge AI | Supabase Edge Functions (Deno) |
| Hosting | Cloudflare Pages |
| CI/CD | GitHub Actions |
| IDE | Antigravity VSCode OSS 1.107.0 (Windows 11) |

## Phase Roadmap
| Phase | API Layer | Cost |
|-------|-----------|------|
| 1 — Validate | PostgREST | ₹0/month |
| 2 — Revenue | FastAPI on Railway | ~₹500/month |
| 3 — Scale | FastAPI + Celery + Redis | ~₹3000/month |

## Quick Start
```bash
cd frontend
npm install
cp .env.example .env.local
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## AI Protocol
All AI output is governed by CLAUDE.md · AGENTS.md · aiprotocol.md · AI_GUIDELINES.md
Every AI response MUST have 5 sections: Understanding · Plan · Code · Test Cases · Notes
