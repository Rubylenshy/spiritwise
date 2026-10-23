import { Link, Outlet, useNavigate } from 'react-router-dom'
import { AudioWaveform, Compass, ShieldAlert } from 'lucide-react'
import useAuthStore from '../store/authStore'
import VideoBackground from '../components/VideoBackground'
import ThemeToggle from '../components/ThemeToggle'
import RootLayout from '../components/layout/RootLayout'

function StatusPage({ Icon, code, title, message }) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card max-w-md w-full p-8 sm:p-10 text-center space-y-5 animate-slide-up">
        <div className="w-14 h-14 mx-auto rounded-2xl glass border border-black/10 dark:border-white/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-accent-400" />
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs text-spirit-500 tracking-widest">{code}</p>
          <h1 className="font-display text-3xl text-spirit-100">{title}</h1>
          <p className="text-spirit-400 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1 text-sm">
            Go back
          </button>
          <Link to={isAuthenticated ? '/home' : '/'} className="btn-primary flex-1 text-sm text-center">
            {isAuthenticated ? 'Go to home' : 'Go to SpiritWise'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <StatusPage
      Icon={Compass}
      code="404"
      title="Page not found"
      message="The page you're looking for doesn't exist or may have moved."
    />
  )
}

export function ForbiddenPage() {
  return (
    <StatusPage
      Icon={ShieldAlert}
      code="403"
      title="You don't have permission"
      message="This area is only available to SpiritWise admins. If you think you should have access, ask an admin to update your account."
    />
  )
}

// Standalone shell for signed-out visitors — mirrors the auth pages (video + glass, no sidebar/player).
function PublicShell() {
  return (
    <div className="isolate relative min-h-screen flex flex-col p-4 sm:p-6">
      <VideoBackground />
      <div className="flex items-center justify-between">
        <Link to="/" className="focus-ring flex items-center gap-2 rounded-lg">
          <AudioWaveform className="w-6 h-6 text-accent-400" />
          <span className="text-xl font-semibold tracking-tight text-spirit-100">SpiritWise</span>
        </Link>
        <ThemeToggle />
      </div>
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  )
}

/** Layout for the catch-all route: the app chrome when signed in, the public shell otherwise. */
export function StatusLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <RootLayout /> : <PublicShell />
}
