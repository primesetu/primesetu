// ============================================================
// SMRITI-OS — Local Auth Hook
// [R1-D] Bootstrap authentication for LOCAL_POSTGRES mode
// ============================================================
// IMPORTANT: This is a temporary bootstrap auth layer.
// Per-user cashier auth is deferred to a future phase.
// See jwt_security_review.md for full limitation documentation.
// ============================================================

const TOKEN_KEY = 'smriti_local_token'

interface LocalJwtPayload {
  sub: string
  email: string
  role: string
  store_id: string
  full_name?: string
  exp: number
  iat: number
}

/** Decode JWT payload without signature verification (server verifies). */
function decodeLocalJwt(token: string): LocalJwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload as LocalJwtPayload
  } catch {
    return null
  }
}

/** Returns true if token exists and has not expired. */
export function isLocalTokenValid(token?: string | null): boolean {
  const t = token ?? localStorage.getItem(TOKEN_KEY)
  if (!t) return false
  const payload = decodeLocalJwt(t)
  if (!payload?.exp) return false
  // Add 30s buffer to avoid edge-case expiry during a request
  return payload.exp > Math.floor(Date.now() / 1000) + 30
}

/** Store a token from a successful local-login response. */
export function storeLocalToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/** Clear the token (logout). */
export function clearLocalToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/** Read the raw token string. */
export function getLocalToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/** Decode and return the current token's payload, or null. */
export function getLocalTokenPayload(): LocalJwtPayload | null {
  const t = getLocalToken()
  if (!t) return null
  return decodeLocalJwt(t)
}
