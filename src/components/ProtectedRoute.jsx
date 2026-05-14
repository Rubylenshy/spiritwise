import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

/**
 * Guards authenticated routes.
 * Redirects unauthenticated users to /login with the intended path in state,
 * so after login they return to where they were trying to go.
 */
export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
