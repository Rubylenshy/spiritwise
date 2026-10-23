import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AudioProvider } from './context/AudioContext'
import { ThemeProvider } from './context/ThemeContext'

import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import AdminRoute from './components/AdminRoute'
import RootLayout from './components/layout/RootLayout'
import { NotFoundPage, StatusLayout } from './pages/StatusPages'

// Auth
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'

// Public landing page (own layout — no sidebar, no player)
import LandingPage from './pages/landing/LandingPage'

// Authenticated app pages
import HomePage from './pages/home/HomePage'
import SermonLibraryPage from './pages/sermons/SermonLibraryPage'
import SermonPlayerPage from './pages/sermons/SermonPlayerPage'
import SeriesListPage from './pages/series/SeriesListPage'
import SeriesDetailPage from './pages/series/SeriesDetailPage'
import LeaderboardPage from './pages/leaderboard/LeaderboardPage'
import UserProfilePage from './pages/profile/UserProfilePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'

// LP4 — WordLookUp shell (mic + BibleVerseCard layout, non-functional)
// Feature logic (useMicrophone, Bible API, AI resolver) added in WL1–WL4
import WordLookUpPage from './pages/wordlookup/WordLookUpPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AudioProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <RootLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
              </Route>

              {/* All other authenticated routes live inside RootLayout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RootLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="sermons" element={<SermonLibraryPage />} />
                <Route path="sermons/:id" element={<SermonPlayerPage />} />
                <Route path="series" element={<SeriesListPage />} />
                <Route path="series/:id" element={<SeriesDetailPage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                {/* The import page became the dashboard's Sermons tab */}
                <Route path="import" element={<Navigate to="/dashboard" replace />} />

                {/* LP4: WordLookUp shell — route + visual layout ready for WL1 */}
                <Route path="wordlookup" element={<WordLookUpPage />} />
              </Route>

              {/* Catch-all 404: inside the app chrome when signed in, standalone otherwise */}
              <Route element={<StatusLayout />}>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AudioProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
