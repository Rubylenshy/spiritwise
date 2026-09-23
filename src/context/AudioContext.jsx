import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'
import api from '../lib/axios'

const AudioContext = createContext(null)

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

  const [currentSermon, setCurrentSermon] = useState(null)  // full sermon object
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [loading, setLoading] = useState(false)

  // ── Sync progress to backend ────────────────────────────────────────────────
  const syncProgress = useCallback((completed = false) => {
    if (!currentSermon || !audioRef.current) return
    const secs = Math.floor(audioRef.current.currentTime)
    if (secs < 3) return
    api.post(`/sermons/${currentSermon.id}/progress/`, {
      progress_seconds: secs,
      completed,
    }).catch(() => {})
  }, [currentSermon])

  // Auto-sync every 15s while playing
  useEffect(() => {
    if (playing) {
      progressTimerRef.current = setInterval(() => syncProgress(false), 15000)
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
    if (currentSermon) syncProgress(false)

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
      syncProgress(false)
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
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          syncProgress(true)
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
