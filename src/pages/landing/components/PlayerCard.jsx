import { useEffect, useState } from 'react'
import {
  BookmarkPlus, Heart, Info, MoreHorizontal, Pause, Play, Repeat, Shuffle,
  SkipBack, SkipForward, Volume2, VolumeX,
} from 'lucide-react'
import { DEMO_SERIES, DEMO_SERMONS, formatTime } from '../landingData'

const VOLUME = 72

/**
 * Demo "Now Playing" card for the hero. Purely presentational — it simulates
 * playback with a timer and never touches the real AudioContext player.
 */
export default function PlayerCard({ className = '', style }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [position, setPosition] = useState(1062)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(true)
  const [liked, setLiked] = useState(false)

  const current = DEMO_SERMONS[currentIndex]
  const upNext = DEMO_SERMONS.filter((_, i) => i !== currentIndex).slice(0, 4)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setPosition((p) => (p + 1 >= current.duration ? 0 : p + 1))
    }, 1000)
    return () => clearInterval(id)
  }, [playing, current.duration])

  const selectSermon = (index) => {
    setCurrentIndex(index)
    setPosition(0)
    setPlaying(true)
  }
  const step = (delta) =>
    selectSermon((currentIndex + delta + DEMO_SERMONS.length) % DEMO_SERMONS.length)

  return (
    <div className={`lp-card p-5 sm:p-6 ${className}`} style={style}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-medium text-lp-fg">Now Playing</p>
          <p className="text-xs text-lp-fg/60 mt-0.5">
            Series · {DEMO_SERIES.sermonCount} Sermons
          </p>
        </div>
        <button type="button" aria-label="About this sermon" className="lp-icon-btn w-8 h-8">
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Current sermon */}
      <div className="flex items-center gap-4">
        <div className="group shrink-0">
          <img
            src={current.art}
            alt=""
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-black/10 dark:border-white/10 transition-all duration-300 group-hover:rotate-3 group-hover:border-blue-500/60 group-hover:shadow-[0_10px_40px_-8px_rgba(59,130,246,.7)]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-medium text-lp-fg tracking-tight truncate">{current.title}</p>
          <p className="text-sm text-lp-fg/70 truncate">{current.speaker}</p>
          <p className="text-xs text-lp-accent-soft mt-1">{current.scripture}</p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            aria-label={liked ? 'Unlike sermon' : 'Like sermon'}
            aria-pressed={liked}
            className="lp-icon-btn w-8 h-8"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-blue-500 text-blue-500' : ''}`} />
          </button>
          <button type="button" aria-label="Save to library" className="lp-icon-btn w-8 h-8">
            <BookmarkPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Seek bar */}
      <div className="mt-5">
        <input
          type="range"
          min={0}
          max={current.duration}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label="Seek"
          className="w-full h-1 cursor-pointer accent-blue-500/90 lp-focus rounded-full"
        />
        <div className="flex justify-between text-xs font-mono text-lp-fg/60 mt-1">
          <span>{formatTime(position)}</span>
          <span>{formatTime(current.duration)}</span>
        </div>
      </div>

      {/* Transport */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setShuffle((v) => !v)}
            aria-label="Shuffle"
            aria-pressed={shuffle}
            className={`lp-icon-btn w-9 h-9 ${shuffle ? '!text-lp-accent-soft' : ''}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => step(-1)} aria-label="Previous sermon" className="lp-icon-btn w-9 h-9">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? 'Pause' : 'Play'}
            className="lp-focus w-12 h-12 rounded-full flex items-center justify-center bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:scale-105 active:scale-95 transition-transform focus-visible:ring-4 focus-visible:ring-blue-500/40"
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next sermon" className="lp-icon-btn w-9 h-9">
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setRepeat((v) => !v)}
            aria-label="Repeat"
            aria-pressed={repeat}
            className={`lp-icon-btn w-9 h-9 ${repeat ? '!text-lp-accent-soft' : ''}`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMuted((v) => !v)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="lp-icon-btn h-9 px-2 gap-1.5"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="text-xs font-mono w-8 text-left">{muted ? '0%' : `${VOLUME}%`}</span>
        </button>
      </div>

      {/* Up next */}
      <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5">
        <p className="text-xs uppercase tracking-widest text-lp-fg/60 mb-2">Up next</p>
        <ul className="space-y-0.5">
          {upNext.map((sermon) => {
            const index = DEMO_SERMONS.indexOf(sermon)
            return (
              <li key={sermon.id} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 hover:bg-lp-fg/5 transition-colors">
                <button
                  type="button"
                  onClick={() => selectSermon(index)}
                  className="lp-focus flex items-center gap-3 flex-1 min-w-0 text-left rounded-md"
                >
                  <img src={sermon.art} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-lp-fg truncate">{sermon.title}</span>
                    <span className="block text-xs text-lp-fg/60 truncate">{sermon.speaker}</span>
                  </span>
                  <span className="text-xs font-mono text-lp-fg/60 shrink-0">{formatTime(sermon.duration)}</span>
                </button>
                <button
                  type="button"
                  aria-label={`More options for ${sermon.title}`}
                  className="lp-icon-btn w-7 h-7 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
