# Smriti Retail OS — Local JWT Security Review
**Scope:** LOCAL_POSTGRES node authentication (R1-B implementation)
**Status:** Bootstrap authentication layer — NOT final architecture

---

> [!IMPORTANT]
> This is a **temporary bootstrap auth layer** only. It is intentionally minimal
> to unblock R2 (transaction integrity). Per-user cashier auth, PIN rotation,
> and session governance are deferred to a future phase.

---

## 1. Token Expiry

| Property | Value |
|---|---|
| Duration | **8 hours** (`_TOKEN_EXPIRY_HOURS = 8` in `auth.py`) |
| Enforcement | Server-side — `verify_exp: True` in `_decode_token()` |
| Offline expiry | Token expires after 8h even if offline. No clock sync — uses server UTC at issuance time. |
| Behavior at expiry | `401 Unauthorized` on next request. Operator must re-login via `/api/v1/auth/local-login`. |

**Gap:** No refresh token. After 8h the cashier gets a 401 mid-shift if unattended. Recommend 12h or shift-linked expiry in a future phase.

---

## 2. Token Signing Algorithm

| Property | Value |
|---|---|
| Algorithm | **HS256** (HMAC-SHA256) |
| Secret source | `LOCAL_JWT_SECRET` env var |
| Fallback | Ephemeral `secrets.token_hex(32)` — logged as WARNING at startup |
| Ephemeral risk | Tokens are invalidated on server restart if `LOCAL_JWT_SECRET` not set |

**Required operator action:** Set `LOCAL_JWT_SECRET` in `.env` before going live.

---

## 3. Secret Rotation Behavior

| Scenario | Behavior |
|---|---|
| `LOCAL_JWT_SECRET` changed in `.env` | All existing tokens immediately invalidated on next restart |
| Ephemeral secret (not set) | New secret every server restart — all sessions cleared |
| Compromise detected | Operator changes `LOCAL_JWT_SECRET` in `.env` and restarts server |

**Gap:** No graceful rotation with overlap window. Rotation is hard-cutoff. Acceptable for single-node retail.

---

## 4. Refresh Token Behavior

**None implemented.** This is intentional for the bootstrap layer.

- No refresh token endpoint exists
- No sliding session
- Operator must re-login after 8h

Future phase: Add `POST /api/v1/auth/local-refresh` with shorter-lived access tokens + longer-lived refresh tokens stored in httpOnly cookie.

---

## 5. Node Binding Behavior

**Not implemented.** The JWT is NOT bound to a specific node.

- Any node that shares the same `LOCAL_JWT_SECRET` can verify tokens issued by another node
- For single-store LAN deployment this is acceptable
- For multi-node HO setups: tokens could be accepted cross-node

**Gap:** If multi-node deployment is required, add `node_id` claim to JWT payload and validate in `_decode_token()`.

---

## 6. Offline Expiration Handling

- Token `exp` is set at issuance time (UTC timestamp)
- Verification uses server clock — fully offline verification works correctly (no network call)
- If node is offline for >8h, cashier gets 401 on next online request

**Recommendation for future:** Store last-valid token time in localStorage. If backend is unreachable and token is <24h old, allow read-only operations.

---

## 7. Session Invalidation Behavior

**Not implemented server-side.** No token blacklist.

- Tokens cannot be revoked before expiry
- Logout is client-side only (clear localStorage)
- A stolen token is valid until 8h expiry

**Acceptable risk for LAN-only retail node.** Tokens are only transmitted on the LAN.

---

## 8. Logout Behavior

| Layer | Behavior |
|---|---|
| Client | Clear `smriti_local_token` from localStorage |
| Server | No action — no session state server-side |
| Effect | All subsequent API calls return 401 → login screen shown |

---

## 9. Token Storage Location

| Property | Value |
|---|---|
| Storage | `localStorage` key: `smriti_local_token` |
| Security | Accessible to JS (XSS risk) — acceptable for LAN-only PWA |
| Alternative | `httpOnly` cookie (future phase) |

**Rationale:** The system is a LAN-deployed PWA, not a public web app. XSS risk is low. `httpOnly` cookies can be added in a future phase without changing the JWT structure.

---

## 10. Audit Actor Extraction Logic

```python
# In security.py → _build_user()
user_id   = payload.get("sub")           # UUID string
store_id  = payload.get("store_id")      # "11" or actual store code
role      = payload.get("role")          # cashier | manager | admin
full_name = payload.get("full_name")     # for audit trail display
```

The `CurrentUser.user_id` (= `sub` claim) is the audit actor used in:
- `SmritiAuditLog.user_id`
- `Stktrndtls.vauid` (Shoper9 compatibility)
- `AuditEntry.vauid`

**Gap:** In admin bootstrap mode (`username: "admin"`), `user_id` is a fixed UUID (`00000000-...0001`). This means all admin actions appear from the same audit actor. Per-user accounts will resolve this.

---

## Known Gaps (Deferred to Future Phase)

| # | Gap | Impact | Priority |
|---|---|---|---|
| G-1 | No refresh token | Cashier session expires mid-shift | Medium |
| G-2 | No node binding | Cross-node token acceptance | Low (LAN only) |
| G-3 | No server-side revocation | Stolen token valid for 8h | Low (LAN only) |
| G-4 | Shared admin UUID in audit log | Reduces audit traceability | High (resolve in R2) |

---

## Bootstrap-Auth Limitation — Formal Statement

> The `POST /api/v1/auth/local-login` endpoint and `LOCAL_JWT_SECRET` signing pattern
> implemented in R1-B are a **temporary operational bootstrap** to replace the unconditional
> auth bypass.
>
> This implementation:
> - Does NOT provide per-cashier identity
> - Does NOT support PIN rotation without `.env` changes
> - Does NOT support concurrent multi-user session governance
> - Is ACCEPTABLE for single-store LAN operation during R2/R3 stabilization
>
> Future phases must implement:
> - Per-user hashed PIN in `User` model (`hashed_pin` column)
> - Per-user local JWT issuance with individual `sub` claims
> - Setup wizard PIN generation flow
> - Local session governance (shift-bound expiry)

---

*Review complete. No code changes required. Ready for R1-D implementation.*
