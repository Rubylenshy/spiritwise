import useAuthStore from '../store/authStore'
import { ForbiddenPage } from '../pages/StatusPages'

/**
 * Guards staff-only routes. Nest inside ProtectedRoute (it assumes a signed-in
 * user). Non-staff users see the 403 page in place — the URL is kept so the
 * address bar still shows what they tried to open. The backend enforces the
 * same rule on every /imports/ endpoint; this only keeps the UI honest.
 */
export default function AdminRoute({ children }) {
  const user = useAuthStore(s => s.user)
  const isStaff = user?.is_staff || user?.is_superuser

  if (!isStaff) return <ForbiddenPage />

  return children
}
