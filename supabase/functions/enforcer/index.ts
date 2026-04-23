/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * System Architect   :  Jawahar R. M. | © 2026
 * "Memory, Not Code."
 * ============================================================ */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const protocol = `
## AI PROTOCOL — PrimeSetu STRICT ENFORCEMENT
1. Understanding  2. Plan  3. Code  4. Test Cases  5. Notes
Every response MUST contain all 5 sections.
Stack: React + Vite + Supabase + Cloudflare Pages
Never use Firebase, Prisma, or any cloud DB other than Supabase.
Always derive store_id from Supabase auth context.
`

serve(async (req) => {
  const { userInput } = await req.json()

  const enforcedPrompt = `
You are an AI Agent in STRICT MODE inside PrimeSetu Retail OS.
Follow ALL rules below WITHOUT EXCEPTION:
${protocol}
User Command:
${userInput}
`
  return new Response(JSON.stringify({ prompt: enforcedPrompt }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
