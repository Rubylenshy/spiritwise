import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, AudioWaveform, ChevronDown, ChevronRight, Flame, LayoutDashboard,
  LogOut, Menu, ScanSearch, Sparkles, User, X,
} from 'lucide-react'
import useAuthStore from '../../../store/authStore'
import ThemeToggle from '../../../components/ThemeToggle'
import UserAvatar from '../../../components/UserAvatar'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Leaders', href: '#leaders' },
  { label: 'Pricing', href: '#pricing' },
]

const navLinkClass =
  'lp-focus px-4 py-2 text-sm text-lp-fg/70 hover:text-lp-fg transition-colors rounded-lg hover:bg-lp-fg/5'

function displayName(user) {
  return user?.first_name || user?.username || 'Friend'
}

/** Closes `open` state when clicking outside `ref` or pressing Escape. */
function useDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, open, onClose])
}

function Dropdown({ open, align = 'center', className = '', children }) {
  const position = align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
  return (
    <div
      className={`absolute top-full ${position} pt-3 transition-all duration-200 ${
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
      } ${className}`}
    >
      <div className="rounded-2xl overflow-hidden backdrop-blur-lg bg-white/95 dark:bg-[#171717]/95 border border-black/10 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,.5)]">
        {children}
      </div>
    </div>
  )
}

function ProductDropdown({ open }) {
  return (
    <Dropdown open={open} className="w-72">
      <Link to="/wordlookup" className="lp-focus flex items-start gap-4 p-5 hover:bg-lp-fg/5 transition-colors group">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
          <ScanSearch className="w-5 h-5 text-lp-accent-soft" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-lp-fg font-medium text-sm">WordLookUp</p>
            <ArrowRight className="w-4 h-4 text-lp-fg/60 group-hover:text-lp-accent-soft transition-colors" />
          </div>
          <p className="text-lp-fg/60 text-xs mt-1 leading-relaxed">
            Hear a scripture in a sermon? Tap once — get the full passage instantly.
          </p>
        </div>
      </Link>
      <div className="mx-5 border-t border-black/5 dark:border-white/5" />
      <div className="px-5 py-3">
        <p className="text-lp-fg/60 text-xs uppercase tracking-widest">More coming soon</p>
      </div>
    </Dropdown>
  )
}

function ProfileMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, open, () => setOpen(false))

  const itemClass =
    'lp-focus w-full flex items-center gap-3 px-4 py-2.5 text-sm text-lp-fg/70 hover:text-lp-fg hover:bg-lp-fg/5 transition-colors'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="lp-focus flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-black/10 dark:border-white/10 hover:bg-lp-fg/5 transition-colors"
      >
        <UserAvatar user={user} />
        <span className="text-sm text-lp-fg max-w-[8rem] truncate">{displayName(user)}</span>
        <ChevronDown className={`w-4 h-4 text-lp-fg/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <Dropdown open={open} align="right" className="w-64">
        <div role="menu">
          <div className="px-4 py-4 border-b border-black/5 dark:border-white/5">
            <p className="text-sm font-medium text-lp-fg truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user?.username}
            </p>
            {user?.username && <p className="text-xs text-lp-fg/60 truncate">@{user.username}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5 text-flame-400">
                <Flame className="w-4 h-4" />
                {user?.current_streak ?? 0} day streak
              </span>
              <span className="flex items-center gap-1.5 text-lp-accent-soft">
                <Sparkles className="w-4 h-4" />
                {(user?.xp_points ?? 0).toLocaleString()} XP
              </span>
            </div>
          </div>
          <div className="py-1">
            <Link to="/home" role="menuitem" className={itemClass}>
              <LayoutDashboard className="w-4 h-4" /> Go to dashboard
            </Link>
            <Link to="/profile" role="menuitem" className={itemClass}>
              <User className="w-4 h-4" /> Profile
            </Link>
          </div>
          <div className="py-1 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); onSignOut() }}
              className={itemClass}
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </Dropdown>
    </div>
  )
}

export default function LandingNav() {
  const [productOpen, setProductOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const productRef = useRef(null)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  useDismiss(productRef, productOpen, () => setProductOpen(false))

  const scrollTo = (hash) => {
    setMobileOpen(false)
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
  }

  const signOut = () => {
    setMobileOpen(false)
    logout()
  }

  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur-lg bg-white/70 dark:bg-[#171717]/70 border-b border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="lp-focus flex items-center gap-2 shrink-0 rounded-lg">
              <AudioWaveform className="w-6 h-6 text-lp-accent-soft" />
              <span className="text-lg font-semibold tracking-tight text-lp-fg">SpiritWise</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <button key={label} type="button" onClick={() => scrollTo(href)} className={navLinkClass}>
                  {label}
                </button>
              ))}

              <div
                ref={productRef}
                className="relative"
                onMouseEnter={() => setProductOpen(true)}
                onMouseLeave={() => setProductOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setProductOpen((v) => !v)}
                  aria-expanded={productOpen}
                  className={`${navLinkClass} flex items-center gap-1`}
                >
                  Product
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${productOpen ? 'rotate-180' : ''}`} />
                </button>
                <ProductDropdown open={productOpen} />
              </div>
            </nav>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              {isAuthenticated ? (
                <ProfileMenu user={user} onSignOut={signOut} />
              ) : (
                <>
                  <Link to="/login" className={navLinkClass}>Sign in</Link>
                  <Link to="/signup" className="lp-btn-primary group">
                    Get started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile actions */}
            <div className="lg:hidden flex items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lp-icon-btn w-9 h-9"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                {isAuthenticated ? <UserAvatar user={user} className="w-7 h-7 text-xs" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

        <div
          className={`absolute top-0 right-0 w-72 max-w-[85vw] h-full flex flex-col backdrop-blur-lg bg-white/90 dark:bg-[#171717]/90 border-l border-black/10 dark:border-white/10 transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-black/5 dark:border-white/5">
            <span className="flex items-center gap-2 text-lp-fg font-medium">
              <AudioWaveform className="w-5 h-5 text-lp-accent-soft" /> Menu
            </span>
            <button type="button" onClick={() => setMobileOpen(false)} className="lp-icon-btn w-9 h-9" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>

          {isAuthenticated && (
            <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
              <UserAvatar user={user} className="w-10 h-10 text-sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-lp-fg truncate">{displayName(user)}</p>
                <p className="text-xs text-lp-fg/60">
                  {user?.current_streak ?? 0} day streak · {(user?.xp_points ?? 0).toLocaleString()} XP
                </p>
              </div>
            </div>
          )}

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={label}
                type="button"
                onClick={() => scrollTo(href)}
                className="lp-focus w-full text-left px-4 py-3 text-sm text-lp-fg/70 hover:text-lp-fg hover:bg-lp-fg/5 rounded-xl transition-colors"
              >
                {label}
              </button>
            ))}
            <p className="px-4 pt-3 pb-1 text-lp-fg/60 text-xs uppercase tracking-widest">Product</p>
            <Link
              to="/wordlookup"
              onClick={() => setMobileOpen(false)}
              className="lp-focus flex items-center gap-3 px-4 py-3 text-sm text-lp-fg/70 hover:text-lp-fg hover:bg-lp-fg/5 rounded-xl transition-colors"
            >
              <ScanSearch className="w-4 h-4 text-lp-accent-soft" />
              WordLookUp
            </Link>
          </nav>

          <div className="px-4 py-5 border-t border-black/5 dark:border-white/5 space-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/home" className="lp-btn-primary w-full">
                  <LayoutDashboard className="w-4 h-4" /> Go to dashboard
                </Link>
                <Link to="/profile" className="lp-btn-glass w-full">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button type="button" onClick={signOut} className="lp-focus w-full flex items-center justify-center gap-2 py-2.5 text-sm text-lp-fg/60 hover:text-lp-fg transition-colors rounded-xl">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="lp-btn-glass w-full">
                  Sign in
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="lp-btn-primary w-full">
                  Get started free <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
