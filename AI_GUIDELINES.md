/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

# AI Agent Coding Guidelines — PrimeSetu Sovereign Standard

## 1. The 4-Phase Workflow
Every task: Explore → Plan → Implement → Commit. No skipping.

## 2. Context Window Rule
If agent becomes repetitive or ignores rules — START A FRESH SESSION.

## 3. Verification is Non-Negotiable
- Unit tests for all business logic
- UI validated against primesetu-shoper9-ui.html reference
- `npm run build` must pass before any commit

## 4. Writer / Reviewer Pattern
Agent A writes. Agent B (fresh context) reviews. Prevents self-bias.

## 5. Human Review
Every AI change must be human-reviewed before merge.

> "Memory, Not Code." — Every line is a liability.

## 6. The Autonomous AI Orchestration Pipeline
PrimeSetu operates on a highly structured cognitive loop defined in `aitdl.md` as the AI Pipeline: `gap-engine → enforcer → validator → critic → improver → loop`. Any AI operating on this codebase must internalize and execute this loop to guarantee zero-defect commits.

### The 6-Step Pipeline Definition:
1. **Gap-Engine**: Scans the codebase to detect deltas between the current state and the required architecture (e.g., missing imports, undefined states, protocol violations).
2. **Enforcer**: Intercepts the proposed fix and forces it through the Sovereign Laws (`AGENTS.md`, `aiprotocol.md`). Rejects any approach violating the rules.
3. **Validator**: Executes structural checks (TypeScript compilation, SQL syntax, etc.) before assuming the code works.
4. **Critic**: Evaluates the code against institutional parity (Shoper 9 standards, Terminal Mode UX, Tailwind aesthetics).
5. **Improver**: Auto-refines and rewrites the code based on the Critic and Validator feedback.
6. **Loop**: If ANY stage fails, the process repeats. The loop breaks only upon 100% compliance.

### Case Study: The TS2741 Resolution
*How the pipeline self-corrected a deployment blocker:*
- **Gap-Engine**: Identified that the frontend deployment failed.
- **Validator**: Triggered `npm run build` and caught a TypeScript error (`TS2741: Property 'moduleName' is missing in type '{}'`).
- **Critic**: Recognized that injecting a hardcoded string would violate dynamic UI protocols, but leaving it undefined breaks the build.
- **Improver**: Refactored `ComingSoon.tsx` to make `moduleName` an optional parameter (`{ moduleName = 'Module' }`), perfectly satisfying both TypeScript strict mode and the UI requirements.
- **Loop Exit**: Ran `npm run build` again. Result: 0 errors. The AI officially reported the build as production-ready.
