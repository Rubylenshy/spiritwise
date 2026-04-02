import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import { useAuthSync } from '../../hooks/useAuthSync'

const PAGE_TITLES = {
  '/': 'Good morning',
  '/sermons': 'Sermon Library',
  '/series': 'Series',
  '/leaderboard': 'Leaderboard',
  '/profile': 'Your Profile',
  '/import': 'Import Sermons',
}

export default function RootLayout() {
  useAuthSync()
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const baseTitle =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith('/sermons/') ? 'Now Playing'
    : pathname.startsWith('/series/') ? 'Series'
    : 'SpiritWise')

  return (
    <div className="flex min-h-screen bg-spirit-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-spirit-950/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, slide-in when open */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200
        lg:relative lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={baseTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  )
}
