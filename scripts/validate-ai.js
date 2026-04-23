/* ============================================================
 * PrimeSetu — AI Output Validator
 * Mirrors validator.js from Kutumbly pipeline
 * © 2026 — All Rights Reserved
 * ============================================================ */

const fs   = require('fs')
const path = require('path')

const REQUIRED = ['Understanding', 'Plan', 'Code', 'Test Cases', 'Notes']

function validate(output) {
  const missing = REQUIRED.filter(s => !output.includes(s))
  if (missing.length > 0) {
    console.error('❌ PROTOCOL VIOLATION — Missing sections:', missing.join(', '))
    process.exit(1)
  }
  console.log('✅ AI output is protocol-compliant. All 5 sections present.')
  return true
}

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: node scripts/validate-ai.js <path-to-ai-output.txt>')
  process.exit(1)
}

const output = fs.readFileSync(path.resolve(filePath), 'utf-8')
validate(output)
