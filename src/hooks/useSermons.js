import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'
import useRewardStore from '../store/rewardStore'

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
  badges: () => ['badges'],
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
      queryClient.invalidateQueries({ queryKey: KEYS.tags() })
    },
  })
}

// Uploads one audio file + metadata. The file goes straight from the browser
// to R2 via a presigned PUT (the API server never streams the bytes), then
// /imports/finalize/ reads its tags and creates the sermon. `fields` uses the
// form field names (sermon_title, sermon_speaker, sermon_series, …); empty
// values are dropped so the backend falls back to the file's own tags.
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
