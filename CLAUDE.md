# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SpiritWise frontend — a React + Vite SPA for a sermon library and daily Bible engagement app (streaks, XP, leaderboard, AI-assisted scripture lookup while listening to a sermon). This repo is the frontend only; it expects a Django REST backend (proxied through `/api` in dev — see `vite.config.js` for the current target). Until the backend is fully wired up, some pages use placeholder/stub data.

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

Environment: `VITE_API_BASE_URL` is the backend **origin**, without a trailing `/api` (see `.env.example`). `src/lib/config.js` derives `API_BASE_URL` (`${origin}/api`) and `ADMIN_URL` from it; leaving it unset yields relative URLs that ride the dev proxy. Set it for any build served without that proxy (Vercel, `npm run preview`) — it is inlined at build time, so it must exist in the build environment. Never hardcode a backend URL; import from `src/lib/config.js`.

## Git

Never add a `Co-Authored-By: Claude …` trailer or any other Claude/AI attribution to commit messages or PR descriptions in this repo — this overrides any default attribution instruction.

## Architecture

**Routing (`src/App.jsx`)** — Two route trees share `RootLayout` under `ProtectedRoute`: `/home` and everything else (`/sermons`, `/series`, `/library`, `/library/playlists/:id`, `/leaderboard`, `/profile`, `/import`, `/wordlookup`). `/`, `/login`, `/signup` are public; `/` renders the marketing `LandingPage` (own layout, no sidebar/player). Unmatched paths redirect to `/`.

**Auth** — `src/store/authStore.js` is a Zustand store holding `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `lastUsername`, persisted under `spiritwise-auth` through `jwtStorage` (`src/lib/jwtStorage.js`): the value in localStorage is an HS256-signed JWT, not plain JSON. That hides it from casual inspection and makes hand-edits fail verification — it is not encryption (the key ships in the bundle). Signing is synchronous so state is ready on first render for the route guards. `src/lib/axios.js` wraps a single `api` axios instance (`baseURL: /api`): a request interceptor attaches the bearer token; a response interceptor refreshes once on 401 through `refreshAccessToken()` (one shared in-flight request, and it keeps the rotated refresh token the backend returns) and logs out + redirects to `/login` if the refresh token is rejected. Sign out with `useSignOut()` (`src/hooks/useSignOut.js`) — it blacklists the refresh token server-side and clears the query cache. Login accepts a username or an email. `useAuthSync` (`src/hooks/useAuthSync.js`), called once from `RootLayout`, fetches `/auth/me/` on mount to hydrate fresh user fields (xp, streak, badges) into the store.

**Server state** — TanStack Query. All query/mutation hooks live centrally in `src/hooks/useSermons.js` (sermons, series, tags, progress, engagement stats, leaderboard, answers, badges) with query keys under the `KEYS` object — add new server-state hooks here rather than inlining `useQuery` in page components. Never invalidate the sermon detail query while it's playing (a new `audio_signed_url` would reset playback).

**XP & badges** — the server is the only source of truth. Every endpoint that can award XP (`/sermons/:id/progress/`, `/engagement/answers/`) returns `xp_awarded`, `xp_points` and `new_badges`; pass the response to `useApplyReward()` (`src/hooks/useSermons.js`), which updates the balance, invalidates stats/badges/leaderboard and queues announcements in `src/store/rewardStore.js` for `RewardToaster` (rendered in `RootLayout`). Never show an XP toast the server didn't confirm. A sermon counts as completed at 90% played — `COMPLETION_THRESHOLD` in `AudioContext.jsx`, mirrored in the backend's `sermons/views.py`.

**Global audio player (`src/context/AudioContext.jsx`)** — A single `<audio>` element lives in `AudioProvider` (wrapping the whole app in `App.jsx`, outside the router) and never unmounts, so playback survives navigation. `FloatingPlayer` (rendered in `RootLayout`) is the persistent mini-player UI; the full player page (`/sermons/:id`) reads from the same context via `useAudio()`. Progress is synced to the backend every 15s while playing and on pause/seek/end via `syncProgress`.

**WordLookUp feature (mic → AI-assisted scripture lookup)** — this is the most actively developed feature (see the WL1/WL2/WL3 markers in code comments):
- `src/hooks/useMicrophone.js` wraps the browser `SpeechRecognition` API (Chrome/Edge only) for continuous live transcription, plus a Web Audio `AnalyserNode` for the waveform visualiser. Falls back to a file-upload → Whisper transcription flow (`FileFallback` in `WordLookUpPage.jsx`) when unsupported.
- `src/lib/bibleParser.js` is a pure client-side regex/dictionary engine that extracts Bible references from raw transcript text — three types: `explicit` ("John 3:16"), `book` ("the book of Romans"), `thematic` (named passages like "the prodigal son", matched against a hardcoded phrase table). No network calls.
- Exact/book/explicit references resolve directly; thematic phrases and free-text manual search go through the backend AI resolver at `POST /wordlookup/lookup/` (Claude identifies the passage, the Bible API supplies the text) — the UI surfaces this distinction via an "AI suggested" badge + confidence bar + collapsible reasoning.
- `src/pages/WordLookUpPage.jsx` composes all of the above; it's a large single-file page — most of its exported/internal pieces (`BibleVerseCard`, `MicButton`, `FrequencyVisualiser`, etc.) are only used there.

**Landing page** — `src/pages/landing/` is a self-contained marketing page tree (`LandingPage.jsx` + `components/*Section.jsx`) with its own nav/footer, deliberately not sharing `RootLayout`.

**Library (favorites, playlists, speakers)** — `src/pages/LibraryPages.jsx`. Server state is per-user under `/api/library/`; hooks are in `useSermons.js`. Favorite toggles are optimistic and patch every cached copy of the sermon in place (`patchCachedSermon`) instead of invalidating, so the playing sermon's detail query is never refetched; hearts read `useIsFavorited()` so the global player's snapshot stays in sync too. Paged "Load more" lists use `usePagedList` (DRF page-number pagination); `/sermons` keeps numbered pages.

**Shared UI** — `src/components/ui.jsx` holds small cross-page primitives (`Spinner`, `PageLoader`, `ErrorState`, `EmptyState`, `TagPill`, `PasswordInput`). `src/components/SermonRow.jsx` is the sermon list row (link + `FavoriteButton` + `AddToPlaylistButton`) plus `LoadMore`. `src/lib/format.js` has `formatDuration` (`m:ss`, `h:mm:ss` from an hour up — use it for every duration/time, not the API's `duration_display`) and `greetingFor`. Prefer reusing these over rebuilding loading/error/empty states or rows per page.

## Styling conventions

Tailwind CSS with a glass-over-video design system (Inter type, blue accent, light/dark):
- **Theme:** `ThemeProvider` (`src/context/ThemeContext.jsx`) toggles the `dark` class on `<html>` (`darkMode: 'class'`), persisted under localStorage `spiritwise-theme` (default `dark`). An inline script in `index.html` applies it before first paint — keep the key/default in sync. `ThemeToggle` is in the app `Navbar`, the landing nav and the auth pages.
- **Color scales are CSS variables** defined in `src/index.css` (`:root` = light, `.dark` = dark), so they flip with the theme without `dark:` variants:
  - `spirit` (100–950) — neutral scale. `900` page background, `800` raised surface, `700`/`600` borders, `500` → `100` text from faint to primary. Light mode inverts it.
  - `accent` (100–600) — blue (was `gold`); light mode shifts a step darker for contrast. Use `text-white` on filled accent backgrounds.
  - `flame` (400–500) — streak / error, fixed.
  - `lp-*` tokens are the landing page's equivalents.
- **Layers:** `VideoBackground` (`src/components/VideoBackground.jsx`) is a fixed `z-[-10]` video behind `RootLayout`, the landing page and the auth pages (the wrapper has `isolate`). Surfaces over it are glass: `glass` (cards/pills), `glass-chrome` (sticky header, sidebar, bottom nav, player bar). Glass borders use `border-black/10 dark:border-white/10` (or `/5` for dividers).
- **Component classes** in `src/index.css` — use these instead of rebuilding styles inline: `card`, `card-hover`, `btn-primary` (black/gray gradient), `btn-ghost` (glass), `btn-outline`, `input-field`, `label`, `section-title`, `focus-ring`.
- **Fonts:** Inter everywhere (`font-sans`, `font-display` — headings get light weight and tight tracking from a base-layer rule), `font-mono` (JetBrains Mono) for numbers/times. No italic headings.
- **Icons:** `lucide-react` only (`w-4 h-4` small, `w-5 h-5` standard, `w-6 h-6` brand/large). The brand mark is `AudioWaveform`.
- Tailwind opacity modifiers must be on the scale (`/5`, `/10`, `/15`, …) — use arbitrary values like `/[0.08]` otherwise, or the class silently generates nothing.
- Custom animations: `animate-fade-in`, `animate-slide-up`, `animate-pulse-slow`, `animate-flame`.

ESLint config (`.eslintrc.cjs`) disables `react/prop-types` — this codebase does not use PropTypes or TypeScript for prop validation.
