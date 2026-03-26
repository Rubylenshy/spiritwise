import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ProtectedRoute from './components/ProtectedRoute'
import RootLayout from './components/layout/RootLayout'

import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import HomePage from './pages/HomePage'
import SermonLibraryPage from './pages/SermonLibraryPage'
import SermonPlayerPage from './pages/SermonPlayerPage'
import { SeriesListPage, SeriesDetailPage } from './pages/SeriesPages'
import LeaderboardPage from './pages/LeaderboardPage'
import UserProfilePage from './pages/UserProfilePage'
import CloudImportPage from './pages/CloudImportPage'

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
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RootLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="sermons" element={<SermonLibraryPage />} />
            <Route path="sermons/:id" element={<SermonPlayerPage />} />
            <Route path="series" element={<SeriesListPage />} />
            <Route path="series/:id" element={<SeriesDetailPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="import" element={<CloudImportPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
