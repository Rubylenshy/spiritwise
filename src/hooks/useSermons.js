import { useCallback } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'
import useRewardStore from '../store/rewardStore'

// ─── Query keys ──────────────────────────────────────────────────────────────
export const KEYS = {
  sermons: (params) => ['sermons', params],
  sermonsInfinite: (params) => ['sermons', 'infinite', params],
  sermon: (id) => ['sermon', id],
  series: () => ['series'],
  seriesList: (all) => ['series', 'list', { all }],
  seriesDetail: (id) => ['series', 'detail', id],
  speakers: () => ['speakers'],
  tags: () => ['tags'],
  library: () => ['library'],
  favorites: () => ['library', 'favorites'],
  favoriteState: (sermonId) => ['favorite-state', sermonId],
  playlists: (sermonId) => ['library', 'playlists', sermonId ?? null],
  playlist: (id) => ['library', 'playlist', id],
  playlistItems: (id) => ['library', 'playlist', id, 'items'],
  stats: () => ['engagement', 'stats'],
  leaderboard: (period) => ['leaderboard', period],
  answers: () => ['answers'],
  badges: () => ['badges'],
}

// ─── Pagination ──────────────────────────────────────────────────────────────

// "Load more" over a DRF PageNumberPagination endpoint. Flattened rows are in
// `items`, the total in `count`.
function usePagedList(queryKey, url, params = {}, { enabled = true, pageSize = 20 } = {}) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get(url, { params: { ...params, page: pageParam, page_size: pageSize } })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    enabled,
  })
  const items = query.data?.pages.flatMap((p) => p.results) ?? []
  const count = query.data?.pages[0]?.count ?? 0
  return { ...query, items, count }
}

// ─── Sermons ─────────────────────────────────────────────────────────────────

export function useSermons(params = {}) {
  return useQuery({
    queryKey: KEYS.sermons(params),
    queryFn: async () => {
      const { data } = await api.get('/sermons/', { params })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useSermon(id) {
  return useQuery({
    queryKey: KEYS.sermon(id),
    queryFn: async () => {
      const { data } = await api.get(`/sermons/${id}/`)
      return data
    },
    enabled: !!id,
    staleTime: 0,              // always fresh — token embedded in audio URL
    gcTime: 1000 * 60 * 5,
    refetchOnMount: 'always',  // get fresh token every time player page opens
  })
}

// Sermons matching `params` (e.g. { series }), paged with "Load more".
export function useSermonsInfinite(params = {}, options) {
  return usePagedList(KEYS.sermonsInfinite(params), '/sermons/', params, options)
}

// Series with published sermons; `{ all: true }` includes empty ones (import page).
export function useSeries({ all = false } = {}) {
  return useQuery({
    queryKey: KEYS.seriesList(all),
    queryFn: async () => {
      const { data } = await api.get('/sermons/series/', { params: all ? { all: 1 } : {} })
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useSeriesDetail(id) {
  return useQuery({
    queryKey: KEYS.seriesDetail(id),
    queryFn: async () => {
      const { data } = await api.get(`/sermons/series/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useSpeakers() {
  return useQuery({
    queryKey: KEYS.speakers(),
    queryFn: async () => {
      const { data } = await api.get('/sermons/speakers/')
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useTags() {
  return useQuery({
    queryKey: KEYS.tags(),
    queryFn: async () => {
      const { data } = await api.get('/sermons/tags/')
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}

// ─── Rewards (XP + badges) ────────────────────────────────────────────────────

/**
 * Applies the reward fields that XP-awarding endpoints return
 * (`xp_awarded`, `xp_points`, `new_badges`): updates the XP balance everywhere
 * it's shown and announces what was earned. No-op when nothing was awarded.
 */
export function useApplyReward() {
  const queryClient = useQueryClient()
  const announce = useRewardStore((s) => s.announce)

  return useCallback((data) => {
    if (!data?.xp_awarded && !data?.new_badges?.length) return
    const { user, setUser } = useAuthStore.getState()
    if (user && data.xp_points != null) setUser({ ...user, xp_points: data.xp_points })
    queryClient.invalidateQueries({ queryKey: KEYS.stats() })
    queryClient.invalidateQueries({ queryKey: KEYS.badges() })
    queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    announce(data)
  }, [queryClient, announce])
}

// ─── Engagement ───────────────────────────────────────────────────────────────

export function useEngagementStats() {
  return useQuery({
    queryKey: KEYS.stats(),
    queryFn: async () => {
      const { data } = await api.get('/engagement/stats/')
      return data
    },
    staleTime: 1000 * 30,
  })
}

export function useLeaderboard(period = 'weekly') {
  return useQuery({
    queryKey: KEYS.leaderboard(period),
    queryFn: async () => {
      const { data } = await api.get('/engagement/leaderboard/', { params: { period } })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient()
  const applyReward = useApplyReward()

  return useMutation({
    mutationFn: async ({ questionId, sermonId, answerText }) => {
      const { data } = await api.post('/engagement/answers/', {
        question: questionId,
        sermon: sermonId,
        answer_text: answerText,
      })
      return data
    },
    onSuccess: (data) => {
      applyReward(data)
      queryClient.invalidateQueries({ queryKey: KEYS.answers() })
    },
  })
}

// ─── Bulk import ──────────────────────────────────────────────────────────────

export function useBulkImportCsv() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('csv_file', file)
      const { data } = await api.post('/imports/bulk-csv/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
      queryClient.invalidateQueries({ queryKey: KEYS.series() })
      queryClient.invalidateQueries({ queryKey: KEYS.speakers() })
      queryClient.invalidateQueries({ queryKey: KEYS.tags() })
    },
  })
}

// Uploads one audio file + metadata. The file goes straight from the browser
// to R2 via a presigned PUT (the API server never streams the bytes), then
// /imports/finalize/ reads its tags and creates the sermon. `fields` uses the
// form field names (sermon_title, sermon_speaker, sermon_series or
// sermon_series_title, …); empty values are dropped so the backend falls back
// to the file's own tags (the album tag for the series).
// Pass the `r2Key` reported via `onStored` to retry only the finalize step.
export function useUploadSermon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, fields, r2Key, onProgress, onStored }) => {
      let key = r2Key
      if (!key) {
        const { data: target } = await api.post('/imports/presign/', { filename: file.name })
        // bare axios, not `api` — R2 must not receive our bearer token
        await axios.put(target.upload_url, file, {
          headers: { 'Content-Type': target.content_type },
          onUploadProgress: e => onProgress?.(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
        })
        key = target.key
        onStored?.(key)
      }
      const payload = Object.fromEntries(Object.entries(fields).filter(([, v]) => v))
      const { data } = await api.post('/imports/finalize/', { ...payload, r2_key: key })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons'] })
      queryClient.invalidateQueries({ queryKey: KEYS.series() })
      queryClient.invalidateQueries({ queryKey: KEYS.speakers() })
      queryClient.invalidateQueries({ queryKey: KEYS.tags() })
    },
  })
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export function useBadges() {
  return useQuery({
    queryKey: KEYS.badges(),
    queryFn: async () => {
      const { data } = await api.get('/auth/badges/')
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Library: favorites ───────────────────────────────────────────────────────

export function useFavorites() {
  return usePagedList(KEYS.favorites(), '/library/favorites/')
}

// Rewrites every cached copy of a sermon (lists, pages, playlist rows, the
// player's detail) in place. Used instead of invalidating so the playing
// sermon's detail query is never refetched — that would mint a new
// audio_signed_url and reset playback.
function patchCachedSermon(queryClient, sermonId, patch) {
  const walk = (node) => {
    if (Array.isArray(node)) return node.map(walk)
    if (!node || typeof node !== 'object') return node
    const next = {}
    for (const [k, v] of Object.entries(node)) next[k] = walk(v)
    return next.id === sermonId && 'is_favorited' in next ? { ...next, ...patch } : next
  }
  for (const key of [['sermons'], ['sermon'], KEYS.library()]) {
    queryClient.setQueriesData({ queryKey: key }, (data) => (data === undefined ? data : walk(data)))
  }
}

// The favorite state toggled this session, per sermon. Hearts read this first
// so copies the cache walk can't reach (the global player's snapshot of the
// playing sermon) stay in sync. Never fetched — only written by toggles.
export function useIsFavorited(sermon) {
  const { data } = useQuery({
    queryKey: KEYS.favoriteState(sermon?.id),
    queryFn: () => null,
    enabled: false,
    gcTime: Infinity,
  })
  return data ?? !!sermon?.is_favorited
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  const apply = (sermonId, favorited) => {
    queryClient.setQueryData(KEYS.favoriteState(sermonId), favorited)
    patchCachedSermon(queryClient, sermonId, { is_favorited: favorited })
  }

  return useMutation({
    mutationFn: async ({ sermonId, favorited }) => {
      const { data } = favorited
        ? await api.put(`/library/favorites/${sermonId}/`)
        : await api.delete(`/library/favorites/${sermonId}/`)
      return data
    },
    onMutate: ({ sermonId, favorited }) => apply(sermonId, favorited),
    onError: (_err, { sermonId, favorited }) => apply(sermonId, !favorited),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.favorites() })
    },
  })
}

// ─── Library: playlists ───────────────────────────────────────────────────────

// All of the user's playlists. With `sermonId`, each carries `has_sermon`
// (for "Add to playlist" menus).
export function usePlaylists(sermonId, { enabled = true } = {}) {
  return useQuery({
    queryKey: KEYS.playlists(sermonId),
    queryFn: async () => {
      const { data } = await api.get('/library/playlists/', { params: sermonId ? { sermon: sermonId } : {} })
      return data
    },
    enabled,
  })
}

export function usePlaylist(id) {
  return useQuery({
    queryKey: KEYS.playlist(id),
    queryFn: async () => {
      const { data } = await api.get(`/library/playlists/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function usePlaylistItems(id) {
  return usePagedList(KEYS.playlistItems(id), `/library/playlists/${id}/items/`, {}, { enabled: !!id })
}

// Every playlist mutation refreshes the playlist list(s) and, when given, that
// playlist's detail and items.
function usePlaylistMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['library', 'playlists'] })
      if (vars?.playlistId) queryClient.invalidateQueries({ queryKey: KEYS.playlist(vars.playlistId) })
    },
  })
}

export function useCreatePlaylist() {
  return usePlaylistMutation(async ({ name, sermonId }) => {
    const { data } = await api.post('/library/playlists/', { name, sermon_id: sermonId })
    return data
  })
}

export function useRenamePlaylist() {
  return usePlaylistMutation(async ({ playlistId, name }) => {
    const { data } = await api.patch(`/library/playlists/${playlistId}/`, { name })
    return data
  })
}

export function useDeletePlaylist() {
  return usePlaylistMutation(async ({ playlistId }) => {
    await api.delete(`/library/playlists/${playlistId}/`)
  })
}

export function useAddToPlaylist() {
  return usePlaylistMutation(async ({ playlistId, sermonId }) => {
    const { data } = await api.post(`/library/playlists/${playlistId}/items/`, { sermon_id: sermonId })
    return data
  })
}

export function useRemoveFromPlaylist() {
  return usePlaylistMutation(async ({ playlistId, sermonId }) => {
    await api.delete(`/library/playlists/${playlistId}/items/${sermonId}/`)
  })
}

export function useMovePlaylistItem() {
  return usePlaylistMutation(async ({ playlistId, sermonId, direction }) => {
    await api.post(`/library/playlists/${playlistId}/items/${sermonId}/move/`, { direction })
  })
}
