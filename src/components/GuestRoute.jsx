import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

/**
 * Guards guest-only routes (/login, /signup).
 * Sends an already signed-in user to /home. Auth state is captured on mount
 * only, so a user who signs in on the page itself still sees its own
 * post-auth flow (e.g. the signup success step) before it navigates away.
 */
export default function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [wasAuthenticated] = useState(isAuthenticated)

  if (wasAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return children
}
