import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const PAGE_TITLES = {
  '/': 'Good morning',
  '/sermons': 'Sermon Library',
  '/series': 'Series',
  '/leaderboard': 'Leaderboard',
  '/profile': 'Your Profile',
}

export default function RootLayout() {
  const { pathname } = useLocation()

  // Match dynamic routes like /sermons/:id
  const baseTitle =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith('/sermons/') ? 'Now Playing' : 'SpiritWise')

  return (
    <div className="flex min-h-screen bg-spirit-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={baseTitle} />
        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
