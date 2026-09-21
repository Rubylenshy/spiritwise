import useAuthStore from '../../store/authStore'

const SIGNED_IN_CTA = { label: 'Go to your library', to: '/home' }

/**
 * Landing CTAs point guests at signup; a signed-in visitor gets sent to their
 * library instead. Returns `{ label, to, isAuthenticated }`.
 */
export function useSessionCta(guestCta) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return { ...(isAuthenticated ? SIGNED_IN_CTA : guestCta), isAuthenticated }
}
