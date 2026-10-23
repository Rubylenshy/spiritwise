// Backend origin. Set VITE_API_BASE_URL to the backend root (no trailing /api),
// e.g. https://spiritwise-backend.fly.dev. Left unset it resolves to '' so every
// URL below stays relative and rides the dev proxy in vite.config.js.
export const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

// Everything the Django project serves lives under /api/ — see
// ../spiritwise-backend/spiritwise/urls.py
export const API_BASE_URL = `${API_ORIGIN}/api`

// The dev proxy only forwards /api, so the admin link needs a real origin.
export const ADMIN_URL = `${API_ORIGIN || 'http://localhost:8000'}/admin`

// OAuth 2.0 Web client ID for "Sign in with Google" — the same one the backend
// verifies against (GOOGLE_OAUTH_CLIENT_ID). Unset hides the Google button.
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
