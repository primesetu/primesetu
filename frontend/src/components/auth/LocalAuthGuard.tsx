// ============================================================
// SMRITI-OS — Local Auth Guard
// [R1-D] Wraps the app to enforce authentication in LOCAL_POSTGRES mode
// ============================================================
// Behavior:
//   1. On mount: calls GET /api/v1/auth/local-status
//   2. If local_auth_enabled=false → renders children (CLOUD mode, handled elsewhere)
//   3. If local_auth_enabled=true and no valid token → shows LocalLoginScreen
//   4. If local_auth_enabled=true and token valid → renders children
// ============================================================

import React, { useEffect, useState } from 'react'
import { apiClient } from '@/api/client'
import { isLocalTokenValid } from '@/hooks/useLocalAuth'
import LocalLoginScreen from './LocalLoginScreen'

type GuardState = 'loading' | 'local-login' | 'ready'

interface LocalAuthGuardProps {
  children: React.ReactNode
}

const LocalAuthGuard: React.FC<LocalAuthGuardProps> = ({ children }) => {
  const [state, setState] = useState<GuardState>('loading')

  useEffect(() => {
    let cancelled = false

    const checkAuth = async () => {
      try {
        const res = await apiClient.get('/auth/local-status')
        if (cancelled) return

        const { local_auth_enabled } = res.data

        if (!local_auth_enabled) {
          // CLOUD or SOVEREIGN mode — auth is handled by Supabase elsewhere
          setState('ready')
          return
        }

        // LOCAL_POSTGRES mode: validate stored token
        if (isLocalTokenValid()) {
          setState('ready')
        } else {
          setState('local-login')
        }
      } catch {
        // If backend is unreachable, fall through to show login
        // (user may need to switch backend URL first via ConnectivityHub)
        if (!cancelled) setState('local-login')
      }
    }

    checkAuth()
    return () => { cancelled = true }
  }, [])

  if (state === 'loading') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100dvh', background: 'var(--color-bg, #0d0d0d)',
        color: 'var(--color-outline, #888)', fontSize: 13, fontFamily: 'var(--font-body, Inter, sans-serif)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        Initializing Node...
      </div>
    )
  }

  if (state === 'local-login') {
    return <LocalLoginScreen onSuccess={() => setState('ready')} />
  }

  return <>{children}</>
}

export default LocalAuthGuard
