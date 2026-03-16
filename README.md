# SpiritWise — Frontend

React + Vite frontend for SpiritWise, a sermon library and daily Bible engagement app.

## Tech stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool + dev server |
| React Router v6 | Client-side routing |
| Zustand | Auth state (persisted to localStorage) |
| TanStack Query | Server state + caching (Phase 3) |
| Axios | HTTP client with JWT interceptors |
| Tailwind CSS | Utility-first styling |

## Getting started

```bash
# Install dependencies
npm install

# Start dev server (proxies /api → http://localhost:8000)
npm run dev

# Build for production
npm run build
```

Open http://localhost:5173

> **Note:** The app expects a Django backend running at `http://localhost:8000`.  
> Until Phase 2 is complete, placeholder data is used throughout.

## Project structure

```
src/
├── components/
│   ├── layout/
│   │   ├── RootLayout.jsx   # Sidebar + Navbar wrapper
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   └── Navbar.jsx       # Top bar (streak, XP)
│   └── ProtectedRoute.jsx   # Auth guard
├── lib/
│   └── axios.js             # Axios instance + JWT interceptors
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── SignUpPage.jsx
│   ├── HomePage.jsx         # Dashboard (streak, daily goal, recent)
│   ├── SermonLibraryPage.jsx
│   ├── SermonPlayerPage.jsx
│   └── StubPages.jsx        # Placeholder pages (Phase 3+)
├── store/
│   └── authStore.js         # Zustand auth store
├── App.jsx                  # Router + QueryClientProvider
├── main.jsx                 # Entry point
└── index.css                # Tailwind + component classes
```

## Auth flow

1. User visits any protected route → redirected to `/login`
2. On login: Django returns `{ access, refresh, user }` → stored in Zustand (persisted)
3. Axios request interceptor attaches `Authorization: Bearer <access>` to every request
4. On 401: Axios response interceptor silently refreshes using the refresh token
5. If refresh fails: store is cleared → user redirected to `/login`

## Environment variables

Create a `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Roadmap

- **Phase 2** — Wire auth pages to live Django API (`/api/auth/register/`, `/api/auth/login/`)
- **Phase 3** — Replace stub data with `useQuery` calls to Sermon + Series APIs; add audio streaming
- **Phase 4** — Streak tracking, XP awards, leaderboard, follow-up question engine
