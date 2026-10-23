import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'
import api from '../lib/axios'
import { useApplyReward } from '../hooks/useSermons'

const AudioContext = createContext(null)

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

export function AudioProvider({ children }) {
  const audioRef = useRef(null)
  const progressTimerRef = useRef(null)
  const syncTimeoutRef = useRef(null)
  const completionSentRef = useRef(false)  // completion synced for the current sermon
  const applyReward = useApplyReward()

  const [currentSermon, setCurrentSermon] = useState(null)  // full sermon object
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [loading, setLoading] = useState(false)

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

  // ── Wire up the single global <audio> element ──────────────────────────────
  const progress = duration > 0 ? currentTime / duration : 0

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
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
      />
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used inside AudioProvider')
  return ctx
}
