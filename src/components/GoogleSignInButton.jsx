import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { GOOGLE_CLIENT_ID } from '../lib/config'
import useAuthStore from '../store/authStore'
import { useTheme } from '../context/ThemeContext'
import { Spinner } from './ui'

const GIS_SRC = 'https://accounts.google.com/gsi/client'
let gisPromise = null

// Google Identity Services, loaded once on first use
function loadGis() {
  gisPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.onload = () => resolve(window.google)
    script.onerror = () => { gisPromise = null; reject(new Error('Could not load Google sign-in')) }
    document.head.appendChild(script)
  })
  return gisPromise
}

/**
 * Google's own "Sign in with Google" button. The ID token it returns goes to
 * POST /auth/google/, which signs in (or creates) the account with that email.
 * Renders nothing when VITE_GOOGLE_CLIENT_ID is unset.
 */
export default function GoogleSignInButton({ text = 'signin_with', redirectTo = '/home' }) {
  const ref = useRef(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()

  // The credential callback is registered once; keep it pointed at fresh props
  const onCredential = useRef(null)
  onCredential.current = async ({ credential }) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/google/', { credential })
      setAuth({ user: data.user, accessToken: data.access, refreshToken: data.refresh })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Google sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false
    loadGis()
      .then((google) => {
        if (cancelled || !ref.current) return
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res) => onCredential.current(res),
          ux_mode: 'popup',
        })
        ref.current.replaceChildren()  // re-rendered when the theme flips
        google.accounts.id.renderButton(ref.current, {
          type: 'standard',
          theme: resolvedTheme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          shape: 'pill',
          text,
          width: ref.current.offsetWidth || 320,
        })
      })
      .catch((err) => !cancelled && setError(err.message))
    return () => { cancelled = true }
  }, [text, resolvedTheme])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
        <span className="text-spirit-500 text-xs uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
      </div>
      <div className="relative">
        {/* Google draws its button into this box; fixed height avoids a jump while it loads */}
        <div ref={ref} className={`h-11 flex justify-center ${loading ? 'opacity-40 pointer-events-none' : ''}`} />
        {loading && <div className="absolute inset-0 flex items-center justify-center"><Spinner /></div>}
      </div>
      {error && (
        <p className="text-flame-400 text-sm bg-flame-500/10 border border-flame-500/20 rounded-xl px-4 py-2.5">{error}</p>
      )}
    </div>
  )
}
