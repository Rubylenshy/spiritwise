import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, AudioWaveform, Loader2 } from 'lucide-react'
import VideoBackground from '../../components/VideoBackground'
import ThemeToggle from '../../components/ThemeToggle'
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
    <div className="isolate relative min-h-screen flex">
      <VideoBackground />
      <ThemeToggle className="absolute top-4 right-4 z-10" />

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 glass-chrome border-r border-black/5 dark:border-white/5">
        <Link to="/" className="focus-ring flex items-center gap-2 rounded-lg self-start">
          <AudioWaveform className="w-6 h-6 text-accent-400" />
          <span className="text-xl font-semibold tracking-tight text-spirit-100">SpiritWise</span>
        </Link>

        <div className="space-y-6">
          <blockquote className="font-display text-4xl text-spirit-100 leading-snug tracking-tighter">
            &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
          </blockquote>
          <p className="text-spirit-400 text-sm font-sans">— Psalm 119:105</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-medium tracking-tight text-spirit-100">2.4k+</p>
            <p className="text-xs text-spirit-500 uppercase tracking-widest mt-1">Sermons</p>
          </div>
          <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-medium tracking-tight text-spirit-100">18k+</p>
            <p className="text-xs text-spirit-500 uppercase tracking-widest mt-1">Listeners</p>
          </div>
          <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-medium tracking-tight text-spirit-100">365</p>
            <p className="text-xs text-spirit-500 uppercase tracking-widest mt-1">Days of Content</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="card w-full max-w-sm p-8 space-y-8 animate-slide-up">
          {/* Mobile logo */}
          <Link to="/" className="focus-ring flex lg:hidden items-center gap-2 justify-center rounded-lg">
            <AudioWaveform className="w-6 h-6 text-accent-400" />
            <span className="text-lg font-semibold tracking-tight text-spirit-100">SpiritWise</span>
          </Link>

          <div>
            <h2 className="font-display text-3xl text-spirit-100">Welcome back</h2>
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-spirit-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-accent-400 hover:text-accent-300 transition-colors">
              Create one
            </Link>
          </p>

          <p className="text-center text-sm">
            <Link to="/" className="focus-ring rounded inline-flex items-center gap-1.5 text-spirit-500 hover:text-spirit-100 transition-colors text-xs">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
