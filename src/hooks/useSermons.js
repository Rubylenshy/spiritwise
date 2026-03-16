import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

// ─── Query keys ──────────────────────────────────────────────────────────────
export const KEYS = {
  sermons: (params) => ['sermons', params],
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

export function useSermon(id) {
  return useQuery({
    queryKey: KEYS.sermon(id),
    queryFn: async () => {
      const { data } = await api.get(`/sermons/${id}/`)
      return data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // audio signed URLs expire — refresh more often
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
    onSuccess: (data, variables) => {
      // Refresh sermon detail (user_progress field) and engagement stats
      queryClient.invalidateQueries({ queryKey: KEYS.sermon(variables.sermonId) })
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
    staleTime: 1000 * 30, // refresh every 30s — streak + XP change frequently
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
