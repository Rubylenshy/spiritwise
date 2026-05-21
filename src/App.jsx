import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AudioProvider } from './context/AudioContext'

import ProtectedRoute from './components/ProtectedRoute'
import RootLayout from './components/layout/RootLayout'

// Auth
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'

// Public landing page (own layout — no sidebar, no player)
import LandingPage from './pages/landing/LandingPage'

// Authenticated app pages
import HomePage from './pages/HomePage'
import SermonLibraryPage from './pages/SermonLibraryPage'
import SermonPlayerPage from './pages/SermonPlayerPage'
import { SeriesListPage, SeriesDetailPage } from './pages/SeriesPages'
import LeaderboardPage from './pages/LeaderboardPage'
import UserProfilePage from './pages/UserProfilePage'
import CloudImportPage from './pages/CloudImportPage'

// LP4 — WordLookUp shell (mic + BibleVerseCard layout, non-functional)
// Feature logic (useMicrophone, Bible API, AI resolver) added in WL1–WL4
import WordLookUpPage from './pages/WordLookUpPage'

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
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
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
              <Route path="import" element={<CloudImportPage />} />

              {/* LP4: WordLookUp shell — route + visual layout ready for WL1 */}
              <Route path="wordlookup" element={<WordLookUpPage />} />
            </Route>

            {/* Catch-all: unauthenticated → landing, authenticated → dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AudioProvider>
    </QueryClientProvider>
  )
}
