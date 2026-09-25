import { NavLink, useNavigate } from 'react-router-dom'
import {
  AudioWaveform, ChevronRight, Headphones, Home, Layers, Library, LogOut, ScanSearch, Trophy, Upload, X,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useSignOut } from '../../hooks/useSignOut'
import UserAvatar from '../UserAvatar'

// Profile isn't listed here — it's reached from the user card at the bottom
const NAV = [
  { label: 'Home', to: '/home', Icon: Home },
  { label: 'Sermons', to: '/sermons', Icon: Headphones },
  { label: 'Series', to: '/series', Icon: Layers },
  { label: 'Library', to: '/library', Icon: Library },
  { label: 'Leaderboard', to: '/leaderboard', Icon: Trophy },
]

// Tools section — shown for all users
const TOOLS_NAV = [
  { label: 'WordLookUp', to: '/wordlookup', badge: 'beta', Icon: ScanSearch },
]

const IMPORT_NAV = { label: 'Import', to: '/import', Icon: Upload }

const itemClass = (isActive) =>
  `focus-ring flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
    isActive
      ? 'bg-blue-500/10 text-accent-400 ring-1 ring-blue-500/25'
      : 'text-spirit-400 hover:text-spirit-100 hover:bg-spirit-100/5'
  }`

function NavItem({ item, onClose }) {
  const { Icon } = item
  return (
    <NavLink
      to={item.to}
      end={item.to === '/home'}
      onClick={onClose}
      className={({ isActive }) => itemClass(isActive)}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-accent-400 font-medium leading-none">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="pt-4 pb-1">
      <div className="flex items-center gap-2 px-3">
        <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
        <span className="text-spirit-500 text-xs uppercase tracking-[0.15em] shrink-0">{children}</span>
        <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
      </div>
    </div>
  )
}

export default function Sidebar({ onClose }) {
  const signOut = useSignOut()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const isStaff = user?.is_staff || user?.is_superuser
  const fullName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ''}`.trim()
    : user?.username ?? 'User'

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  return (
    <aside className="w-64 h-full min-h-screen flex flex-col glass-chrome border-r border-black/5 dark:border-white/5">
      {/* Logo */}
      <div className="px-5 h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
        <NavLink to="/" className="focus-ring flex items-center gap-2 rounded-lg">
          <AudioWaveform className="w-6 h-6 text-accent-400" />
          <span className="text-lg font-semibold tracking-tight text-spirit-100">SpiritWise</span>
        </NavLink>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden focus-ring rounded-lg text-spirit-400 hover:text-spirit-100 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
        {NAV.map((item) => (
          <NavItem key={item.to} item={item} onClose={onClose} />
        ))}

        <SectionLabel>Tools</SectionLabel>
        {TOOLS_NAV.map((item) => (
          <NavItem key={item.to} item={item} onClose={onClose} />
        ))}

        {isStaff && (
          <>
            <SectionLabel>Admin</SectionLabel>
            <NavItem item={IMPORT_NAV} onClose={onClose} />
          </>
        )}
      </nav>

      {/* User card → profile, then sign out */}
      <div className="px-3 py-4 border-t border-black/5 dark:border-white/5 space-y-1">
        <NavLink
          to="/profile"
          onClick={onClose}
          title="View your profile"
          className={({ isActive }) =>
            `group focus-ring flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 ${
              isActive ? 'bg-blue-500/10 ring-1 ring-blue-500/25' : 'hover:bg-spirit-100/5'
            }`
          }
        >
          <UserAvatar user={user} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-spirit-100 font-medium truncate">{fullName}</p>
            <p className="text-xs text-spirit-500 truncate">{user?.email ?? 'View profile'}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-spirit-500 group-hover:text-spirit-100 group-hover:translate-x-0.5 transition-all shrink-0" />
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="focus-ring w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-spirit-400 hover:text-flame-400 hover:bg-spirit-100/5 transition-all duration-150"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
