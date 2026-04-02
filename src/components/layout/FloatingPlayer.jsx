import { Link, useLocation } from 'react-router-dom'
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
          className={`w-0.5 rounded-full bg-gold-400 transition-all ${
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
    <div className={`
      fixed bottom-0 inset-x-0 z-40
      lg:bottom-0 lg:left-64
      mb-0 lg:mb-0
    `}>
      {/* Progress bar — sits above the bar */}
      <div
        className="h-0.5 bg-spirit-700 cursor-pointer"
        onClick={(e) => {
          if (!hasSermon) return
          const rect = e.currentTarget.getBoundingClientRect()
          seek(((e.clientX - rect.left) / rect.width) * duration)
        }}
      >
        <div
          className="h-full bg-gold-500 transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Main bar */}
      <div className="bg-spirit-900 border-t border-spirit-700 px-4 py-2 flex items-center gap-3">

        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg bg-spirit-800 border border-spirit-700 flex items-center justify-center shrink-0 overflow-hidden">
          {currentSermon?.thumbnail ? (
            <img src={currentSermon.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-gold-400 text-sm italic">✦</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {hasSermon ? (
            <Link to={`/sermons/${currentSermon.id}`} className="block">
              <p className="text-spirit-100 text-sm font-medium truncate leading-tight hover:text-gold-400 transition-colors">
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
          {/* Skip back */}
          <button
            onClick={() => skip(-15)}
            disabled={!hasSermon}
            className="w-8 h-8 flex items-center justify-center text-spirit-400 hover:text-spirit-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
              <path d="M12.5 4C7.81 4 4 7.81 4 12.5S7.81 21 12.5 21 21 17.19 21 12.5" strokeLinecap="round"/>
              <path d="M12.5 4L10 1.5M12.5 4L10 6.5" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="8.5" y="14.5" fontSize="5.5" fill="currentColor" stroke="none" fontFamily="sans-serif">15</text>
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            disabled={!hasSermon || loading}
            className="w-10 h-10 rounded-full bg-gold-500 hover:bg-gold-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin text-spirit-900" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
              </svg>
            ) : playing ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-spirit-900" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-spirit-900 ml-0.5" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            )}
          </button>

          {/* Skip forward */}
          <button
            onClick={() => skip(15)}
            disabled={!hasSermon}
            className="w-8 h-8 flex items-center justify-center text-spirit-400 hover:text-spirit-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
              <path d="M11.5 4C16.19 4 20 7.81 20 12.5S16.19 21 11.5 21 3 17.19 3 12.5" strokeLinecap="round"/>
              <path d="M11.5 4L14 1.5M11.5 4L14 6.5" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="7.5" y="14.5" fontSize="5.5" fill="currentColor" stroke="none" fontFamily="sans-serif">15</text>
            </svg>
          </button>
        </div>

        {/* Open player link */}
        {hasSermon && (
          <Link
            to={`/sermons/${currentSermon.id}`}
            className="hidden sm:flex w-8 h-8 items-center justify-center text-spirit-500 hover:text-gold-400 transition-colors shrink-0"
            title="Open full player"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}
