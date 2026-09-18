import type { JWTClaims } from '../types'

/**
 * a JWT has a predefined structure, which contains the header.payload.signature. our token.split('.')[1]
 * gets the second segment, because the `sub`, `exp`, and Hasura claims are stored as claims inside the payload
 *
 * the header contains metada for signing which we are using for the verification
 */
export function decodeJWT(token: string): JWTClaims {
  // replace stuff here are merely because of the form the payload returns
  const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(payload)) as JWTClaims
}

/**
 * a token that cannot be decoded is treated as expired rather than trusted.
 * !note: if you want to find this, go to inspect element, then to sources, and you can find it next to main.ts
 *
 */
export function isTokenExpired(token: string): boolean {
  try {
    return Date.now() >= decodeJWT(token).exp * 1000
  } catch {
    return true
  }
}

export function getUserId(token: string): number | undefined {
  const claims = decodeJWT(token)
  // if claims.sub isnt null and claims.sub also isnt undefined, the use claims.sub
  const rawId = claims.sub ?? claims['https://hasura.io/jwt/claims']?.['x-hasura-user-id']
  return rawId !== undefined ? Number(rawId) : undefined
}
