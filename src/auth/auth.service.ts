import { SIGNIN_URL, TOKEN_KEY } from '../config'
import { isTokenExpired } from './jwt'

/** the platform signs in over HTTP Basic and answers with a bare JWT string. */

/**
 * a design choice i made is using sessionStorage over localStorage. so if you switch the tab,
 * the token does not carry over to the next tab. it makes it easier if you wanna test it out a bunch of users
 * without opening incognito or another browser or logging out, y'know
 */
export async function login(identifier: string, password: string): Promise<string> {
  const response = await fetch(SIGNIN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${identifier}:${password}`)}` },
  })
  if (!response.ok) throw new Error('invalid username/email or password.')

  const token = (await response.json()) as string
  sessionStorage.setItem(TOKEN_KEY, token)
  return token
}

export function logout(): void {
  sessionStorage.removeItem(TOKEN_KEY)
}

/**
 * this returns null and also clears storage if the stored token is missing or expired
 * this also works for if someone changes or tweaks the token in the storage tab
 */

export function getToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY)
  if (!token || isTokenExpired(token)) {
    logout()
    return null
  }
  return token
}

/**
 * goes through getToken() rather than reading sessionStorage directly,
 * so an expired or tampered token is cleared and counts as logged out.
 */
export const isAuthenticated = (): boolean => getToken() !== null
