/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * System Architect   :  Jawahar R Mallah | © 2026
 * "Memory, Not Code."
 * ============================================================ */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const REQUIRED_SECTIONS = ['Understanding', 'Plan', 'Code', 'Test Cases', 'Notes']
const HIGH_SCORE_REGEX  = /Score:\s*(?:9|10)\b/i

async function callLLM(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

function validate(output: string): void {
  for (const section of REQUIRED_SECTIONS) {
    if (!output.includes(section)) {
      throw new Error(`Protocol violation: Missing section — ${section}`)
    }
  }
}

async function enforceWithRetry(prompt: string, maxRetry = 3): Promise<string> {
  for (let i = 0; i < maxRetry; i++) {
    const output = await callLLM(prompt)
    try {
      validate(output)
      return output
    } catch (err) {
      prompt += `\nPrevious response violated protocol. Fix strictly. Error: ${err}`
    }
  }
  throw new Error('Agent failed to comply with protocol after retries')
}

async function runLoop(output: string, maxLoops = 2): Promise<{ output: string; score: number; iterations: number }> {
  let current = output
  let finalScore = 0
  let iterations = 0

  for (let i = 0; i < maxLoops; i++) {
    iterations++
    const critiquePrompt = `
You are a STRICT AI auditor. Evaluate this output:
1. Protocol compliance (5 sections present)
2. Code correctness
3. Missing edge cases
4. Security risks

Give score (0-10). If <8 MUST improve.
Output format:
Score: X
Issues:
- ...
Fix:
- ...

Output to evaluate:
${current}
`
    const critique = await callLLM(critiquePrompt)
    const scoreMatch = critique.match(/Score:\s*(\d+(?:\.\d+)?)/i)
    finalScore = scoreMatch ? parseFloat(scoreMatch[1]) : 0

    if (HIGH_SCORE_REGEX.test(critique)) {
      try { validate(current); break } catch { /* force another pass */ }
    }

    const improvePrompt = `Improve this output using critique.\n\nOriginal:\n${current}\n\nCritique:\n${critique}\n\nReturn improved version with all 5 sections.`
    current = await callLLM(improvePrompt)
  }

  validate(current)
  return { output: current, score: finalScore, iterations }
}

serve(async (req) => {
  try {
    const { userInput, storeId } = await req.json()
    if (!userInput) return new Response(JSON.stringify({ error: 'userInput required' }), { status: 400 })

    const protocol = await Deno.readTextFile('./aiprotocol.md').catch(() => 'Follow 5-section output format.')

    const enforcedPrompt = `
You are an AI Agent in STRICT MODE inside PrimeSetu Retail OS.
Stack: React + Vite + TypeScript + Supabase + Cloudflare Pages.
${protocol}
User Command: ${userInput}
`
    const rawOutput   = await enforceWithRetry(enforcedPrompt)
    const { output, score, iterations } = await runLoop(rawOutput)

    if (storeId) {
      const sb = createClient(SUPABASE_URL, SUPABASE_KEY)
      await sb.from('ai_outputs').insert({
        store_id:        storeId,
        prompt_hash:     btoa(userInput).slice(0, 64),
        output,
        critic_score:    score,
        loop_iterations: iterations,
      })
    }

    return new Response(JSON.stringify({ output, score, iterations }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
