import { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import { sermonQuery, useApplyReward } from '../hooks/useSermons'
import useQueueStore from '../store/queueStore'

const AudioContext = createContext(null)
// Just what's playing, and the actions to change it. Changes only when the
// sermon or play state does — not on every timeupdate like AudioContext — so
// whole grids of tiles can read it without re-rendering several times a second.
const NowPlayingContext = createContext(null)

// Fraction of a sermon that must be played for it to count as completed (and
// earn XP). Keep in sync with COMPLETION_THRESHOLD in the backend's sermons/views.py.
export const COMPLETION_THRESHOLD = 0.9

// iOS/iPadOS Safari ignores writes to media.volume (it always reads back 1) —
// volume there is hardware-only, but `muted` still works.
const VOLUME_CONTROLLABLE = (() => {
  const probe = document.createElement('audio')
  probe.volume = 0.5
  return probe.volume === 0.5
})()

// Speeds the rate button cycles through. The chosen one is remembered per browser.
export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2]
const RATE_KEY = 'spiritwise-playback-rate'

function storedRate() {
  try {
    const rate = parseFloat(localStorage.getItem(RATE_KEY))
    return PLAYBACK_RATES.includes(rate) ? rate : 1
  } catch {
    return 1
  }
}

export function AudioProvider({ children }) {
  const audioRef = useRef(null)
  const progressTimerRef = useRef(null)
  const syncTimeoutRef = useRef(null)
  const completionSentRef = useRef(false)  // completion synced for the current sermon
  const applyReward = useApplyReward()
  const queryClient = useQueryClient()

  const [currentSermon, setCurrentSermon] = useState(null)  // full sermon object
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(storedRate)

  // load() resets playbackRate to defaultPlaybackRate, so setting both keeps
  // the chosen speed across sermons
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.defaultPlaybackRate = playbackRate
    audio.playbackRate = playbackRate
  }, [playbackRate])

  // ── Sync progress to backend ────────────────────────────────────────────────
  // `completed` is sent whenever playback is past the threshold; the server
  // re-checks it, keeps completion sticky and only pays XP the first time.
  const syncProgress = useCallback(() => {
    const audio = audioRef.current
    if (!currentSermon || !audio) return
    const secs = Math.floor(audio.currentTime)
    if (secs < 3) return
    const total = Number.isFinite(audio.duration) ? audio.duration : currentSermon.duration_seconds
    const completed = audio.ended || (total > 0 && audio.currentTime >= total * COMPLETION_THRESHOLD)
    api.post(`/sermons/${currentSermon.id}/progress/`, {
      progress_seconds: secs,
      completed,
    })
      .then(({ data }) => applyReward(data))
      .catch(() => {})
  }, [currentSermon, applyReward])

  // Sync the moment playback crosses the threshold, so the XP lands right
  // away instead of on the next 15s tick (or never, if the listener leaves).
  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
    if (
      !completionSentRef.current &&
      audio.duration > 0 &&
      audio.currentTime >= audio.duration * COMPLETION_THRESHOLD
    ) {
      completionSentRef.current = true
      syncProgress()
    }
  }

  // Auto-sync every 15s while playing
  useEffect(() => {
    if (playing) {
      progressTimerRef.current = setInterval(syncProgress, 15000)
    } else {
      clearInterval(progressTimerRef.current)
    }
    return () => clearInterval(progressTimerRef.current)
  }, [playing, syncProgress])

  // ── Load a sermon into the player ──────────────────────────────────────────
  const loadSermon = useCallback((sermon, startTime = 0) => {
    if (!sermon?.audio_signed_url) return

    const audio = audioRef.current
    if (!audio) return

    // Same sermon — just seek and resume
    if (currentSermon?.id === sermon.id) {
      if (startTime > 0) audio.currentTime = startTime
      audio.play().catch(() => {})
      setPlaying(true)
      return
    }

    // New sermon — sync old one first
    if (currentSermon) syncProgress()
    completionSentRef.current = false
    useQueueStore.getState().remove(sermon.id)

    setCurrentSermon(sermon)
    setCurrentTime(startTime)
    setDuration(sermon.duration_seconds || 0)
    setLoading(true)
    setPlaying(false)

    audio.src = sermon.audio_signed_url
    audio.load()

    const onReady = () => {
      if (startTime > 0) audio.currentTime = startTime
      setDuration(audio.duration || sermon.duration_seconds || 0)
      setLoading(false)
      audio.play().catch(() => {})
      setPlaying(true)
      audio.removeEventListener('loadedmetadata', onReady)
    }
    audio.addEventListener('loadedmetadata', onReady)
  }, [currentSermon, syncProgress])

  // ── Queue ──────────────────────────────────────────────────────────────────
  // Plays a sermon by id — a queued one (the front of the queue by default),
  // or any other, e.g. from a tile's play button. Its detail is fetched only now, and seeded into the query cache so the player page
  // reuses it rather than counting a second play.
  const playFromQueue = useCallback(async (id = useQueueStore.getState().items[0]?.id) => {
    if (id == null) return
    try {
      const sermon = await queryClient.fetchQuery({ ...sermonQuery(id), staleTime: 0 })
      // A finished sermon starts over rather than resuming at its end
      const resumeAt = sermon.user_progress?.completed ? 0 : (sermon.user_progress?.progress_seconds ?? 0)
      loadSermon(sermon, resumeAt)
    } catch {
      // Unpublished or unreachable — drop it so the queue doesn't stall on it
      useQueueStore.getState().remove(id)
    }
  }, [queryClient, loadSermon])

  // ── Playback controls ──────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentSermon) return
    if (playing) {
      audio.pause()
      syncProgress()
    } else {
      audio.play().catch(() => {})
    }
  }, [playing, currentSermon, syncProgress])

  const seek = useCallback((seconds) => {
    const audio = audioRef.current
    if (!audio || !audio.src) return
    // Before metadata loads audio.duration is NaN — fall back to the known
    // duration instead of clamping every seek to 0.
    const max = Number.isFinite(audio.duration) ? audio.duration : (duration || seconds)
    const target = Math.max(0, Math.min(seconds, max))
    audio.currentTime = target
    // Update immediately so the seek bar doesn't snap back until timeupdate fires
    setCurrentTime(target)
  }, [duration])

  const skip = useCallback((delta) => {
    const audio = audioRef.current
    if (!audio) return
    seek(audio.currentTime + delta)
  }, [seek])

  const changeVolume = useCallback((v) => {
    setVolume(v)
    const audio = audioRef.current
    if (!audio) return
    audio.volume = v
    // Dragging the slider up from zero should also bring sound back
    if (v > 0 && audio.muted) {
      audio.muted = false
      setMuted(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }, [])

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRate((rate) => {
      const next = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(rate) + 1) % PLAYBACK_RATES.length]
      try { localStorage.setItem(RATE_KEY, String(next)) } catch { /* not persisted */ }
      return next
    })
  }, [])

  // ── Wire up the single global <audio> element ──────────────────────────────
  const progress = duration > 0 ? currentTime / duration : 0

  const currentId = currentSermon?.id ?? null
  const nowPlaying = useMemo(
    () => ({ currentId, playing, togglePlay, playFromQueue }),
    [currentId, playing, togglePlay, playFromQueue],
  )

  return (
    <AudioContext.Provider value={{
      audioRef,
      currentSermon,
      playing,
      currentTime,
      duration,
      progress,
      volume,
      muted,
      volumeControllable: VOLUME_CONTROLLABLE,
      loading,
      loadSermon,
      togglePlay,
      seek,
      skip,
      syncProgress,
      changeVolume,
      toggleMute,
      playbackRate,
      cyclePlaybackRate,
      playFromQueue,
    }}>
      {/* Single global audio element — never unmounts */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          syncProgress()
          playFromQueue()
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
      />
      <NowPlayingContext.Provider value={nowPlaying}>
        {children}
      </NowPlayingContext.Provider>
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used inside AudioProvider')
  return ctx
}

/** { currentId, playing, togglePlay, playFromQueue } — cheap to read from list items. */
export function useNowPlaying() {
  const ctx = useContext(NowPlayingContext)
  if (!ctx) throw new Error('useNowPlaying must be used inside AudioProvider')
  return ctx
}
