import { hmac } from '@noble/hashes/hmac.js'
import { sha256 } from '@noble/hashes/sha2.js'

/**
 * Zustand `persist` storage that writes each value to localStorage as an
 * HS256-signed JWT instead of plain JSON.
 *
 * This hides values from casual inspection and makes hand-edits fail
 * verification (the store then starts empty). It is NOT encryption or a
 * security boundary: the signing key ships in the JS bundle, so anyone who can
 * run script on the page can decode and re-sign. Signing is synchronous on
 * purpose — persisted state must be ready on first render for the route guards.
 */

const SECRET = new TextEncoder().encode(
  import.meta.env.VITE_STORAGE_JWT_SECRET || 'spiritwise-local-state-signing-key-v1'
)
const HEADER = { alg: 'HS256', typ: 'JWT' }

const toBase64Url = (bytes) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const fromBase64Url = (str) =>
  Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

const encodeJson = (value) => toBase64Url(new TextEncoder().encode(JSON.stringify(value)))
const decodeJson = (str) => JSON.parse(new TextDecoder().decode(fromBase64Url(str)))
const sign = (input) => toBase64Url(hmac(sha256, SECRET, new TextEncoder().encode(input)))

export function encodeJwt(payload) {
  const unsigned = `${encodeJson(HEADER)}.${encodeJson({ ...payload, iat: Math.floor(Date.now() / 1000) })}`
  return `${unsigned}.${sign(unsigned)}`
}

/** The payload if the signature checks out, else null. */
export function decodeJwt(token) {
  const parts = typeof token === 'string' ? token.split('.') : []
  if (parts.length !== 3) return null
  const [header, payload, signature] = parts
  if (sign(`${header}.${payload}`) !== signature) return null
  try {
    return decodeJson(payload)
  } catch {
    return null
  }
}

export const jwtStorage = {
  getItem: (name) => {
    const raw = localStorage.getItem(name)
    if (raw === null) return null
    const payload = decodeJwt(raw)
    if (payload) return { state: payload.state, version: payload.version }
    // One-time upgrade: values written before this storage existed are plain
    // JSON. Read them once; the next write re-saves them as a JWT.
    try {
      const legacy = JSON.parse(raw)
      return legacy && typeof legacy === 'object' && 'state' in legacy ? legacy : null
    } catch {
      return null // tampered or unreadable — start from a clean store
    }
  },
  setItem: (name, value) => {
    localStorage.setItem(name, encodeJwt({ state: value.state, version: value.version }))
  },
  removeItem: (name) => localStorage.removeItem(name),
}
