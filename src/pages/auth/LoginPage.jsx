import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../../lib/axios'
import useAuthStore from '../../store/authStore'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const location = useLocation()

  // If user was redirected here from a protected route, send them back there.
  // Otherwise send to /home (the authenticated dashboard), not / (the landing page).
  const from = location.state?.from?.pathname ?? '/home'

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login/', form)
      setAuth({
        user: data.user,
        accessToken: data.access,
        refreshToken: data.refresh,
      })
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail ?? 'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-spirit-900 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-radial-spirit border-r border-spirit-800">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="text-3xl font-display text-gold-400 italic">✦</span>
          <span className="font-display text-2xl text-spirit-100 tracking-wide">SpiritWise</span>
        </Link>

        <div className="space-y-6">
          <blockquote className="font-display text-4xl text-spirit-100 italic leading-snug">
            ``Your word is a lamp to my feet and a light to my path.``
          </blockquote>
          <p className="text-spirit-400 text-sm font-sans">— Psalm 119:105</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="font-display text-2xl text-gold-400">2.4k+</p>
            <p className="text-xs text-spirit-500 uppercase tracking-widest mt-1">Sermons</p>
          </div>
          <div className="w-px h-8 bg-spirit-700" />
          <div className="text-center">
            <p className="font-display text-2xl text-gold-400">18k+</p>
            <p className="text-xs text-spirit-500 uppercase tracking-widest mt-1">Listeners</p>
          </div>
          <div className="w-px h-8 bg-spirit-700" />
          <div className="text-center">
            <p className="font-display text-2xl text-gold-400">365</p>
            <p className="text-xs text-spirit-500 uppercase tracking-widest mt-1">Days of Content</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8 animate-slide-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <span className="text-2xl font-display text-gold-400 italic">✦</span>
            <span className="font-display text-xl text-spirit-100">SpiritWise</span>
          </div>

          <div>
            <h2 className="font-display text-3xl text-spirit-100 italic">Welcome back</h2>
            <p className="text-spirit-400 text-sm mt-1">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="label" htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                className="input-field"
                placeholder="your_username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-flame-400 text-sm bg-flame-500/10 border border-flame-500/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-spirit-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-gold-400 hover:text-gold-300 transition-colors">
              Create one
            </Link>
          </p>

          <p className="text-center text-sm">
            <Link to="/" className="text-spirit-600 hover:text-spirit-400 transition-colors text-xs">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
