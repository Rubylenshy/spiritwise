// Backend origin. Set VITE_API_BASE_URL to the backend root (no trailing /api),
// e.g. https://spiritwise-backend.fly.dev. Left unset it resolves to '' so every
// URL below stays relative and rides the dev proxy in vite.config.js.
export const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

// Everything the Django project serves lives under /api/ — see
// ../spiritwise-backend/spiritwise/urls.py
export const API_BASE_URL = `${API_ORIGIN}/api`

// The dev proxy only forwards /api, so the admin link needs a real origin.
export const ADMIN_URL = `${API_ORIGIN || 'http://localhost:8000'}/admin`

// Image URLs from the API are absolute when the backend stores media on R2, but
// a local backend (USE_S3=False) returns relative /media/… paths — and the dev
// proxy only forwards /api. Resolve those against the backend origin.
export function mediaUrl(url) {
  if (!url) return null
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url)) return url
  return `${API_ORIGIN || 'http://localhost:8000'}${url.startsWith('/') ? '' : '/'}${url}`
}
