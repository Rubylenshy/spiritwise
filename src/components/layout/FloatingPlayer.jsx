import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  AudioWaveform, ListMusic, Loader2, Maximize2, Pause, Play, RotateCcw, RotateCw, SkipForward,
} from 'lucide-react'
import { useAudio } from '../../context/AudioContext'
import { useDismiss } from '../../hooks/useDismiss'
import useQueueStore from '../../store/queueStore'
import SeekBar from '../SeekBar'
import { FavoriteButton } from '../SermonRow'
import PlaybackRateButton from '../PlaybackRateButton'
import QueuePanel from '../QueuePanel'
import { formatDuration } from '../../lib/format'

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
    loading,
    togglePlay,
    seek,
    skip,
    playFromQueue,
  } = useAudio()
  const queueLength = useQueueStore((s) => s.items.length)
  const [queueOpen, setQueueOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, queueOpen, () => setQueueOpen(false))

  // Hide on the player page itself — that page has its own full controls
  const isPlayerPage = pathname.startsWith('/sermons/') && pathname !== '/sermons'
  if (isPlayerPage) return null

  const hasSermon = !!currentSermon

  return (
    // Mobile: sits on top of the BottomNav (h-14 + safe area); desktop: flush, right of the sidebar
    <div ref={ref} className="fixed inset-x-0 z-30 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-0 lg:left-64">
      {queueOpen && (
        <div className="absolute bottom-full right-2 sm:right-4 mb-3 w-[calc(100vw-1rem)] max-w-sm card p-4 animate-fade-in">
          <QueuePanel />
        </div>
      )}

      {/* Progress bar — a 4px track along the top edge, with a taller
          transparent hit area overhanging it so it's grabbable on touch */}
      <SeekBar
        currentTime={currentTime}
        duration={duration}
        onSeek={seek}
        disabled={!hasSermon}
        className="h-5 -mt-4 items-end"
        trackClassName="h-1"
      />

      {/* Main bar */}
      <div className="glass-chrome border-t border-black/5 dark:border-white/5 px-4 py-2 flex items-center gap-2 sm:gap-3">

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
            <span>{formatDuration(currentTime)}</span>
            <span className="text-spirit-700">/</span>
            <span>{formatDuration(duration)}</span>
          </div>
        )}

        {hasSermon && <FavoriteButton sermon={currentSermon} className="w-8 h-8" />}

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

          {queueLength > 0 && (
            <button
              type="button"
              onClick={() => playFromQueue()}
              aria-label="Play next in queue"
              title="Play next in queue"
              className="focus-ring rounded-lg w-8 h-8 hidden sm:flex items-center justify-center text-spirit-400 hover:text-spirit-100 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasSermon && <PlaybackRateButton className="hidden sm:flex shrink-0" />}

        {/* Queue */}
        <button
          type="button"
          onClick={() => setQueueOpen((o) => !o)}
          aria-label={`Queue${queueLength ? `, ${queueLength} sermons` : ''}`}
          aria-expanded={queueOpen}
          title="Queue"
          className={`focus-ring relative rounded-lg w-8 h-8 flex items-center justify-center shrink-0 transition-colors ${
            queueOpen ? 'text-accent-400' : 'text-spirit-500 hover:text-spirit-100'
          }`}
        >
          <ListMusic className="w-4 h-4" />
          {queueLength > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-1 rounded-full bg-accent-500 text-white text-[10px] font-mono leading-4 text-center">
              {queueLength}
            </span>
          )}
        </button>

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
