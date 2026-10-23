import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

// ─── Query keys ──────────────────────────────────────────────────────────────
export const KEYS = {
  sermons: (params) => ['sermons', params],
  sermonsInfinite: (params) => ['sermons', 'infinite', params],
  manage: (kind, params) => ['manage', kind, params],
  sermon: (id) => ['sermon', id],
  series: () => ['series'],
  seriesDetail: (id) => ['series', id],
  tags: () => ['tags'],
  stats: () => ['engagement', 'stats'],
  leaderboard: (period) => ['leaderboard', period],
  answers: () => ['answers'],
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

// DRF page-number pagination as an infinite list: page N+1 while `next` is set
const nextPage = (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined)

/** Sermons page by page for scroll-to-load lists; flatten with `data.pages`. */
export function useInfiniteSermons(params = {}) {
  return useInfiniteQuery({
    queryKey: KEYS.sermonsInfinite(params),
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get('/sermons/', { params: { ...params, page: pageParam } })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: nextPage,
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

export function useSeries() {
  return useQuery({
    queryKey: KEYS.series(),
    queryFn: async () => {
      const { data } = await api.get('/sermons/series/')
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

// ─── Progress tracking ────────────────────────────────────────────────────────

export function useUpdateProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sermonId, progressSeconds, completed }) => {
      const { data } = await api.post(`/sermons/${sermonId}/progress/`, {
        progress_seconds: progressSeconds,
        completed,
      })
      return data
    },
    onSuccess: (data) => {
      // NEVER invalidate sermon detail — new src resets the audio and stops playback
      // Only refresh engagement stats when XP is actually awarded (sermon completed)
      if (data.xp_awarded > 0) {
        queryClient.invalidateQueries({ queryKey: KEYS.stats() })
      }
    },
  })
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

  return useMutation({
    mutationFn: async ({ questionId, sermonId, answerText }) => {
      const { data } = await api.post('/engagement/answers/', {
        question: questionId,
        sermon: sermonId,
        answer_text: answerText,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.stats() })
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
      queryClient.invalidateQueries({ queryKey: KEYS.tags() })
    },
  })
}

// ─── Admin dashboard (staff only — /sermons/manage/) ──────────────────────────

/** Every sermon, drafts included, newest upload first. */
export function useManageSermons(params = {}) {
  return useInfiniteQuery({
    queryKey: KEYS.manage('sermons', params),
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get('/sermons/manage/sermons/', { params: { ...params, page: pageParam } })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: nextPage,
  })
}

/** One sermon with every editable field, for the edit form. */
export function useManagedSermon(id) {
  return useQuery({
    queryKey: KEYS.manage('sermon', id),
    queryFn: async () => {
      const { data } = await api.get(`/sermons/manage/sermons/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

/** Every series or tag ('series' | 'tags'), each with its sermon_count. */
export function useManageList(kind) {
  return useQuery({
    queryKey: KEYS.manage(kind),
    queryFn: async () => {
      const { data } = await api.get(`/sermons/manage/${kind}/`)
      return data
    },
  })
}

// An edit can show up anywhere a sermon, series or tag is listed. Sermon
// detail is left alone (it refetches on mount, and a refetch resets playback).
function invalidateLibrary(queryClient) {
  for (const queryKey of [['manage'], ['sermons'], KEYS.series(), KEYS.tags()]) {
    queryClient.invalidateQueries({ queryKey })
  }
}

/** Create (no id) or update ({ id, ...fields }) a sermon, series or tag. */
export function useSaveManaged(kind) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const url = `/sermons/manage/${kind}/`
      const { data } = id ? await api.patch(`${url}${id}/`, fields) : await api.post(url, fields)
      return data
    },
    onSuccess: () => invalidateLibrary(queryClient),
  })
}

/** Delete a series or tag by id (sermons are unpublished instead). */
export function useDeleteManaged(kind) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/sermons/manage/${kind}/${id}/`),
    onSuccess: () => invalidateLibrary(queryClient),
  })
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data } = await api.get('/auth/badges/')
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}
