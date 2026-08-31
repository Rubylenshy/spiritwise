# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SpiritWise frontend — a React + Vite SPA for a sermon library and daily Bible engagement app (streaks, XP, leaderboard, AI-assisted scripture lookup while listening to a sermon). This repo is the frontend only; it expects a Django REST backend at `http://localhost:8000` (proxied through `/api` in dev — see `vite.config.js`). Until the backend is fully wired up, some pages use placeholder/stub data.

The backend lives in the sibling directory [`../spiritwise-backend`](../spiritwise-backend) (same parent folder as this repo). Check there for API endpoint definitions, serializers, and models when the shape of an API response is unclear.

## Commands

```bash
npm install       # install deps
npm run dev        # start dev server at http://localhost:5173, proxies /api → localhost:8000
npm run build       # production build
npm run preview      # preview the production build
npm run lint        # eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0
```

There is no test runner configured in this repo.

Environment: create `.env.local` with `VITE_API_BASE_URL=http://localhost:8000` if needed outside the dev proxy.

## Architecture

**Routing (`src/App.jsx`)** — Two route trees share `RootLayout` under `ProtectedRoute`: `/home` and everything else (`/sermons`, `/series`, `/leaderboard`, `/profile`, `/import`, `/wordlookup`). `/`, `/login`, `/signup` are public; `/` renders the marketing `LandingPage` (own layout, no sidebar/player). Unmatched paths redirect to `/`.

**Auth** — `src/store/authStore.js` is a Zustand store (persisted to localStorage under key `spiritwise-auth`) holding `user`, `accessToken`, `refreshToken`, `isAuthenticated`. `src/lib/axios.js` wraps a single `api` axios instance (`baseURL: /api`): a request interceptor attaches the bearer token, a response interceptor auto-refreshes on 401 (queuing concurrent requests during refresh) and force-logs-out + redirects to `/login` if refresh fails. `useAuthSync` (`src/hooks/useAuthSync.js`), called once from `RootLayout`, fetches `/auth/me/` on mount to hydrate fresh user fields (xp, streak, badges) into the store.

**Server state** — TanStack Query. All query/mutation hooks live centrally in `src/hooks/useSermons.js` (sermons, series, tags, progress, engagement stats, leaderboard, answers, badges) with query keys under the `KEYS` object — add new server-state hooks here rather than inlining `useQuery` in page components. Note the `useUpdateProgress` mutation deliberately never invalidates the sermon detail query (a new `audio_signed_url` would reset playback); it only invalidates engagement stats when XP was actually awarded.

**Global audio player (`src/context/AudioContext.jsx`)** — A single `<audio>` element lives in `AudioProvider` (wrapping the whole app in `App.jsx`, outside the router) and never unmounts, so playback survives navigation. `FloatingPlayer` (rendered in `RootLayout`) is the persistent mini-player UI; the full player page (`/sermons/:id`) reads from the same context via `useAudio()`. Progress is synced to the backend every 15s while playing and on pause/seek/end via `syncProgress`.

**WordLookUp feature (mic → AI-assisted scripture lookup)** — this is the most actively developed feature (see the WL1/WL2/WL3 markers in code comments):
- `src/hooks/useMicrophone.js` wraps the browser `SpeechRecognition` API (Chrome/Edge only) for continuous live transcription, plus a Web Audio `AnalyserNode` for the waveform visualiser. Falls back to a file-upload → Whisper transcription flow (`FileFallback` in `WordLookUpPage.jsx`) when unsupported.
- `src/lib/bibleParser.js` is a pure client-side regex/dictionary engine that extracts Bible references from raw transcript text — three types: `explicit` ("John 3:16"), `book` ("the book of Romans"), `thematic` (named passages like "the prodigal son", matched against a hardcoded phrase table). No network calls.
- Exact/book/explicit references resolve directly; thematic phrases and free-text manual search go through the backend AI resolver at `POST /wordlookup/lookup/` (Claude identifies the passage, the Bible API supplies the text) — the UI surfaces this distinction via an "AI suggested" badge + confidence bar + collapsible reasoning.
- `src/pages/WordLookUpPage.jsx` composes all of the above; it's a large single-file page — most of its exported/internal pieces (`BibleVerseCard`, `MicButton`, `FrequencyVisualiser`, etc.) are only used there.

**Landing page** — `src/pages/landing/` is a self-contained marketing page tree (`LandingPage.jsx` + `components/*Section.jsx`) with its own nav/footer, deliberately not sharing `RootLayout`.

**Shared UI** — `src/components/ui.jsx` holds small cross-page primitives (`Spinner`, `PageLoader`, `ErrorState`, `EmptyState`, `TagPill`, `XPToast`). Prefer reusing these over rebuilding loading/error/empty states per page.

## Styling conventions

Tailwind CSS with a custom design system defined in `tailwind.config.js`:
- Color scales: `spirit` (dark navy neutrals, 100–950), `gold` (accent, 100–600), `flame` (error/alert, 400–500).
- Fonts: `font-display` (Cormorant Garamond, serif — used for headings/italic emphasis), `font-sans` (DM Sans, body), `font-mono` (JetBrains Mono).
- Reusable component classes (`card`, `btn-primary`, `btn-outline`, `btn-ghost`, `input-field`, `label`) are defined in `src/index.css` — use these instead of rebuilding button/card styles inline.
- Custom animations: `animate-fade-in`, `animate-slide-up`, `animate-pulse-slow`, `animate-flame`.

ESLint config (`.eslintrc.cjs`) disables `react/prop-types` — this codebase does not use PropTypes or TypeScript for prop validation.
