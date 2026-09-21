import { Link, useLocation } from 'react-router-dom'
import { AudioWaveform, Loader2, Maximize2, Pause, Play, RotateCcw, RotateCw } from 'lucide-react'
import { useAudio } from '../../context/AudioContext'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function Waveform({ playing }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[3, 5, 8, 5, 3, 6, 4].map((h, i) => (
        <div
          key={i}
          className={`w-0.5 rounded-full bg-accent-400 transition-all ${
            playing ? 'animate-pulse-slow' : 'opacity-40'
          }`}
          style={{
            height: `${h}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.8 + i * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function FloatingPlayer() {
  const { pathname } = useLocation()
  const {
    currentSermon,
    playing,
    currentTime,
    duration,
    progress,
    loading,
    togglePlay,
    seek,
    skip,
  } = useAudio()

  // Hide on the player page itself — that page has its own full controls
  const isPlayerPage = pathname.startsWith('/sermons/') && pathname !== '/sermons'
  if (isPlayerPage) return null

  const hasSermon = !!currentSermon

  return (
    // Mobile: sits on top of the BottomNav (h-14 + safe area); desktop: flush, right of the sidebar
    <div className="fixed inset-x-0 z-40 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-0 lg:left-64">
      {/* Progress bar — sits above the bar */}
      <div
        className="h-1 bg-spirit-100/10 cursor-pointer"
        onClick={(e) => {
          if (!hasSermon) return
          const rect = e.currentTarget.getBoundingClientRect()
          seek(((e.clientX - rect.left) / rect.width) * duration)
        }}
      >
        <div
          className="h-full bg-accent-500 transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Main bar */}
      <div className="glass-chrome border-t border-black/5 dark:border-white/5 px-4 py-2 flex items-center gap-3">

        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0 overflow-hidden">
          {currentSermon?.thumbnail ? (
            <img src={currentSermon.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <AudioWaveform className="w-5 h-5 text-accent-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {hasSermon ? (
            <Link to={`/sermons/${currentSermon.id}`} className="block">
              <p className="text-spirit-100 text-sm font-medium truncate leading-tight hover:text-accent-400 transition-colors">
                {currentSermon.title}
              </p>
              <p className="text-spirit-500 text-xs truncate">
                {currentSermon.speaker}
              </p>
            </Link>
          ) : (
            <div>
              <p className="text-spirit-500 text-sm">No sermon playing</p>
              <p className="text-spirit-600 text-xs">Browse the library to start listening</p>
            </div>
          )}
        </div>

        {/* Waveform — visible when playing */}
        {playing && (
          <div className="hidden sm:block shrink-0">
            <Waveform playing={playing} />
          </div>
        )}

        {/* Time */}
        {hasSermon && (
          <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-spirit-500 shrink-0">
            <span>{formatTime(currentTime)}</span>
            <span className="text-spirit-700">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => skip(-15)}
            disabled={!hasSermon}
            aria-label="Back 15 seconds"
            className="focus-ring rounded-lg w-8 h-8 flex items-center justify-center text-spirit-400 hover:text-spirit-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            disabled={!hasSermon || loading}
            aria-label={playing ? 'Pause' : 'Play'}
            className="focus-ring w-10 h-10 rounded-full flex items-center justify-center bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 transition-transform active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : playing ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => skip(15)}
            disabled={!hasSermon}
            aria-label="Forward 15 seconds"
            className="focus-ring rounded-lg w-8 h-8 flex items-center justify-center text-spirit-400 hover:text-spirit-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Open player link */}
        {hasSermon && (
          <Link
            to={`/sermons/${currentSermon.id}`}
            className="focus-ring rounded-lg hidden sm:flex w-8 h-8 items-center justify-center text-spirit-500 hover:text-accent-400 transition-colors shrink-0"
            title="Open full player"
          >
            <Maximize2 className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
