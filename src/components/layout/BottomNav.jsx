import { NavLink } from 'react-router-dom'
import { Home, Layers, Library, Trophy, User } from 'lucide-react'

// Mobile keeps a Profile tab — the sidebar's user card is off-screen in the drawer
const TABS = [
  { to: '/home', label: 'Home', Icon: Home },
  { to: '/sermons', label: 'Sermons', Icon: Library },
  { to: '/series', label: 'Series', Icon: Layers },
  { to: '/leaderboard', label: 'Ranks', Icon: Trophy },
  { to: '/profile', label: 'Profile', Icon: User },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 glass-chrome border-t border-black/5 dark:border-white/5 safe-area-inset-bottom">
      <div className="flex items-center">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/home'}
            className={({ isActive }) =>
              `focus-ring flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                isActive ? 'text-accent-400' : 'text-spirit-500 hover:text-spirit-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
