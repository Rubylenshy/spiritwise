import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import FloatingPlayer from './FloatingPlayer'
import VideoBackground from '../VideoBackground'
import RewardToaster from '../RewardToaster'
import { useAuthSync } from '../../hooks/useAuthSync'

const PAGE_TITLES = {
  '/home': 'Good morning',
  '/sermons': 'Sermon Library',
  '/series': 'Series',
  '/leaderboard': 'Leaderboard',
  '/profile': 'Your Profile',
  '/import': 'Import Sermons',
  '/wordlookup': 'WordLookUp',
}

export default function RootLayout() {
  useAuthSync()
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isPlayerPage = pathname.startsWith('/sermons/') && pathname !== '/sermons'

  const baseTitle =
    PAGE_TITLES[pathname] ??
    (isPlayerPage ? 'Now Playing'
    : pathname.startsWith('/series/') ? 'Series'
    : 'SpiritWise')

  return (
    <div className="app-shell isolate flex min-h-screen">
      {/* Layer 1: fixed video background (z-[-10]) — cards/chrome are glass over it */}
      <VideoBackground dense />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={baseTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className={`
          flex-1 p-4 sm:p-6 animate-fade-in
          pb-32 lg:pb-24
        `}>
          <Outlet />
        </main>
      </div>

      {/* Floating audio player — hidden on the full player page */}
      <FloatingPlayer />

      {/* Bottom nav — mobile only */}
      <BottomNav />

      {/* XP / badge announcements, fired when the server awards them */}
      <RewardToaster />
    </div>
  )
}
