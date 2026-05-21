import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const NAV = [
  {
    label: 'Home',
    to: '/home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Sermons',
    to: '/sermons',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <path d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Series',
    to: '/series',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Leaderboard',
    to: '/leaderboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

// Tools section — shown for all users
const TOOLS_NAV = [
  {
    label: 'WordLookUp',
    to: '/wordlookup',
    badge: 'beta',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        <path d="M11 8v6M8 11h6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const IMPORT_NAV = {
  label: 'Import',
  to: '/import',
  icon: (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

function NavItem({ item, onClose }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/home'}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
        ${isActive
          ? 'bg-spirit-700 text-gold-400 border border-spirit-600'
          : 'text-spirit-400 hover:text-spirit-200 hover:bg-spirit-800'
        }`
      }
    >
      {item.icon}
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-500 font-medium leading-none">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

export default function Sidebar({ onClose }) {
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const isStaff = user?.is_staff || user?.is_superuser

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 h-full min-h-screen flex flex-col bg-spirit-900 border-r border-spirit-800">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-spirit-800 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="text-2xl font-display text-gold-400 italic">✦</span>
          <span className="font-display text-xl text-spirit-100 tracking-wide">SpiritWise</span>
        </NavLink>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-spirit-500 hover:text-spirit-200 transition-colors p-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
        {/* Main navigation */}
        {NAV.map((item) => (
          <NavItem key={item.to} item={item} onClose={onClose} />
        ))}

        {/* ── Tools section ────────────────────────────────────── */}
        <div className="pt-4 pb-1">
          <div className="flex items-center gap-2 px-3">
            <div className="flex-1 h-px bg-spirit-800" />
            <span className="text-spirit-600 text-xs uppercase tracking-[0.15em] shrink-0">Tools</span>
            <div className="flex-1 h-px bg-spirit-800" />
          </div>
        </div>

        {TOOLS_NAV.map((item) => (
          <NavItem key={item.to} item={item} onClose={onClose} />
        ))}

        {/* Admin-only import */}
        {isStaff && (
          <>
            <div className="pt-4 pb-1">
              <div className="flex items-center gap-2 px-3">
                <div className="flex-1 h-px bg-spirit-800" />
                <span className="text-spirit-600 text-xs uppercase tracking-[0.15em] shrink-0">Admin</span>
                <div className="flex-1 h-px bg-spirit-800" />
              </div>
            </div>
            <NavItem item={IMPORT_NAV} onClose={onClose} />
          </>
        )}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-spirit-800 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-spirit-600 flex items-center justify-center text-gold-400 font-display text-sm font-semibold shrink-0">
            {user?.first_name?.[0] ?? user?.username?.[0] ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-spirit-200 font-medium truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user?.username ?? 'User'}
            </p>
            <p className="text-xs text-spirit-500 truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-spirit-400 hover:text-flame-400 hover:bg-spirit-800 transition-all duration-150"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
