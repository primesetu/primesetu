# PrimeSetu — Developer Setup Guide

## Prerequisites
- Antigravity VSCode OSS 1.107.0 (Windows 11)
- Node.js 22.21.1 (already installed)
- Git

## Step 1 — Supabase (direct cloud, no Docker)
1. Create project at supabase.com → Region: ap-south-1 (Mumbai)
2. Go to SQL Editor → run migrations in order:
   - supabase/migrations/001_core_schema.sql
   - supabase/migrations/002_rls_policies.sql
   - supabase/migrations/003_indexes_triggers.sql
3. Copy Project URL + anon key from Settings → API

## Step 2 — Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```
Open: http://localhost:5173

## Step 3 — GitHub + Cloudflare Pages
1. Push to GitHub
2. Cloudflare Pages → Connect to GitHub → select primesetu
3. Build command: cd frontend && npm run build
4. Build output: frontend/dist
5. Add env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

## Step 4 — Edge Functions (AI Pipeline)
Set in Supabase Dashboard → Edge Functions → Secrets:
- ANTHROPIC_API_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Phase 2 (FastAPI) — when ready
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## AI Protocol
All development MUST follow: aitdl.md → AGENTS.md → aiprotocol.md → AI_GUIDELINES.md
