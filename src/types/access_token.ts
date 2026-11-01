/**
 * Personal access tokens (PAT) issued by the signed-in user.
 *
 * The backend contract is `server/handles/token.go` plus
 * `internal/model/access_token.go`:
 *   GET  /api/me/token/list?page=&per_page=
 *   POST /api/me/token/create   { name, scopes, expires_in }
 *   POST /api/me/token/revoke?id=
 *
 * Two shapes of `scopes` exist and both are handled here: the stored
 * AccessToken serialises scopes as one comma-separated string, while the
 * creation response returns them as an array.
 */

/** Scopes a personal access token may be granted. */
export const ACCESS_TOKEN_SCOPES = [
  "fs:read",
  "fs:write",
  "share:read",
  "task:read",
  "task:write",
] as const

export type AccessTokenScope = (typeof ACCESS_TOKEN_SCOPES)[number]

/** Prefix every raw token starts with. */
export const ACCESS_TOKEN_PREFIX = "obk_"

export interface AccessToken {
  id: number
  name: string
  /** Display-only prefix, e.g. `obk_a1b2c3d4`. */
  prefix: string
  /** Comma-separated on list, array on create — normalise with tokenScopes(). */
  scopes: string | string[]
  expires_at: string | null
  last_used_time: string
  created_at: string
  revoked_at: string | null
}

/** Payload of a successful create; the raw token is only ever sent once. */
export interface CreatedAccessToken {
  token: string
  id: number
  name: string
  prefix: string
  scopes: string[]
  expires_at: string | null
}

/** Flatten the two scope shapes the backend can send. */
export const tokenScopes = (scopes: string | string[] | undefined): string[] =>
  (Array.isArray(scopes) ? scopes.join(",") : scopes || "")
    .split(",")
    .map((scope) => scope.trim())
    .filter((scope) => !!scope)

/** A token can still authenticate only when neither revoked nor expired. */
export const tokenIsActive = (token: AccessToken): boolean => {
  if (token.revoked_at) return false
  if (token.expires_at && new Date(token.expires_at).getTime() < Date.now())
    return false
  return true
}
