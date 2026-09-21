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

# Start dev server (proxies /api → the target in vite.config.js)
npm run dev

# Build for production
npm run build
```

Open http://localhost:5173

> **Note:** The app expects a Django backend. `vite.config.js` proxies `/api` to the
> deployed backend by default — point that target at `http://localhost:8000` to run
> against a local one.  
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

`VITE_API_BASE_URL` is the backend origin — the root, **without** a trailing `/api`.
See `.env.example`.

Leave it unset for local dev: API URLs stay relative (`/api/...`) and go through the
Vite proxy in `vite.config.js`, which avoids CORS entirely.

Set it for any build served without that proxy — Vercel, Netlify, `npm run preview`.
It is inlined at build time, so it must be present in the deploy's build environment,
not just at runtime:

```env
VITE_API_BASE_URL=https://spiritwise-backend.fly.dev
```

The backend must then list that frontend origin in its `CORS_ALLOWED_ORIGINS`.

## Roadmap

- **Phase 2** — Wire auth pages to live Django API (`/api/auth/register/`, `/api/auth/login/`)
- **Phase 3** — Replace stub data with `useQuery` calls to Sermon + Series APIs; add audio streaming
- **Phase 4** — Streak tracking, XP awards, leaderboard, follow-up question engine
