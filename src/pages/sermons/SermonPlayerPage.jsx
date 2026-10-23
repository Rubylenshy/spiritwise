import { useState, useEffect, useRef } from 'react'
import { SkipForward, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSermon } from '../../hooks/useSermons'
import { useAudio } from '../../context/AudioContext'
import { PageLoader, ErrorState } from '../../components/ui'
import SeekBar from '../../components/SeekBar'
import { AddToPlaylistButton, FavoriteButton } from '../../components/SermonRow'
import PlaybackRateButton from '../../components/PlaybackRateButton'
import QueuePanel from '../../components/QueuePanel'
import useQueueStore from '../../store/queueStore'
import CoverArt from '../../components/CoverArt'
import { formatDuration } from '../../lib/format'
import ReflectionQuestion from './components/ReflectionQuestion'
import NextSermonCard from './components/NextSermonCard'

export default function SermonPlayerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: sermon, isLoading, error, refetch } = useSermon(id)

  const {
    currentSermon,
    playing,
    currentTime,
    duration,
    progress,
    loading: audioLoading,
    loadSermon,
    togglePlay,
    seek,
    skip,
    volume,
    muted,
    volumeControllable,
    changeVolume,
    toggleMute,
    playFromQueue,
  } = useAudio()
  const queueLength = useQueueStore((s) => s.items.length)

  const [showQuestions, setShowQuestions] = useState(false)

  const isThisSermon = currentSermon?.id === sermon?.id
  const effectiveDuration = isThisSermon ? duration : (sermon?.duration_seconds ?? 0)
  const effectiveTime = isThisSermon ? currentTime : (sermon?.user_progress?.progress_seconds ?? 0)
  const effectiveProgress = effectiveDuration > 0 ? effectiveTime / effectiveDuration : 0
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  // Load sermon into global player when page opens
  useEffect(() => {
    if (!sermon?.audio_signed_url) return
    const resumeAt = sermon.user_progress?.progress_seconds ?? 0

    // Only auto-load if not already playing this sermon
    if (currentSermon?.id !== sermon.id) {
      loadSermon(sermon, resumeAt)
    }
  }, [sermon?.id, sermon?.audio_signed_url])

  // Show questions when 80% complete. The completion XP (at 90%) is announced
  // by the global player once the server confirms it — see AudioContext.
  useEffect(() => {
    if (effectiveProgress >= 0.8 && !showQuestions && sermon) setShowQuestions(true)
  }, [effectiveProgress, showQuestions, sermon])

  // Questions start shown only if this sermon is already completed. Reset per
  // sermon — the page stays mounted when moving between sermons.
  useEffect(() => {
    setShowQuestions(!!sermon?.user_progress?.completed)
  }, [sermon?.id])

  const prevPlayingIdRef = useRef(currentSermon?.id)
  useEffect(() => {
    const prevId = prevPlayingIdRef.current
    prevPlayingIdRef.current = currentSermon?.id
    if (currentSermon && prevId === sermon?.id && currentSermon.id !== sermon?.id) {
      navigate(`/sermons/${currentSermon.id}`)
    }
  }, [currentSermon, sermon?.id, navigate])

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message="Could not load this sermon." onRetry={refetch} />

  // Seeking a sermon that isn't loaded yet starts it at that point, rather
  // than moving whatever else is currently in the global player
  const handleSeek = (seconds) => {
    if (isThisSermon) seek(seconds)
    else if (sermon.audio_signed_url) loadSermon(sermon, seconds)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up w-full">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-spirit-500">
        <Link to="/sermons" className="hover:text-spirit-300 transition-colors">Sermons</Link>
        <span>›</span>
        {sermon.series && (
          <>
            <Link to={`/series/${sermon.series.id}`} className="hover:text-spirit-300 transition-colors">
              {sermon.series.title}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-spirit-400 truncate max-w-[180px]">{sermon.title}</span>
      </div>

      {/* Player card — raised while its playlist popover has focus, so the
          cards below (own stacking contexts via backdrop-blur) can't cover it */}
      <div className="card relative focus-within:z-20 p-4 sm:p-8 space-y-6">
        {/* Artwork — large, like Now Playing in Apple Music */}
        <CoverArt
          src={sermon.thumbnail}
          seed={sermon.series?.title || sermon.title}
          rounded="rounded-2xl"
          className={`w-56 sm:w-72 mx-auto shadow-[0_30px_70px_-25px_rgba(0,0,0,.7)] transition-transform duration-500 ${
            isThisSermon && !playing ? 'scale-[0.94]' : 'scale-100'
          }`}
        />

        {/* Info */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-spirit-100">{sermon.title}</h2>
          <p className="text-spirit-400 text-sm mt-1">{sermon.speaker}</p>
          <p className="text-spirit-500 text-xs mt-0.5">
            {sermon.series?.title}
            {sermon.sermon_date && ` · ${new Date(sermon.sermon_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </p>
          {sermon.scripture_reference && (
            <p className="text-accent-500/70 text-xs mt-1 italic">{sermon.scripture_reference}</p>
          )}
          <div className="flex items-center justify-center gap-1 mt-3">
            <FavoriteButton sermon={sermon} />
            <AddToPlaylistButton sermon={sermon} align="left" />
          </div>
        </div>

        {!sermon.audio_signed_url && (
          <div className="bg-spirit-800 border border-spirit-700 rounded-xl px-4 py-3 text-center">
            <p className="text-spirit-400 text-sm">Audio not available yet.</p>
          </div>
        )}

        {/* Progress bar */}
        <div className="space-y-1.5">
          <SeekBar
            currentTime={effectiveTime}
            duration={effectiveDuration}
            onSeek={handleSeek}
            disabled={!sermon.audio_signed_url}
            className="h-6 items-center rounded-full"
          />
          <div className="flex justify-between text-xs font-mono text-spirit-500">
            <span>{formatDuration(effectiveTime)}</span>
            <span>{formatDuration(effectiveDuration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <PlaybackRateButton className="w-12" />

          <button onClick={() => skip(-15)} className="text-spirit-400 hover:text-spirit-200 transition-colors">
            <svg viewBox="0 0 36 36" className="w-8 h-8" fill="none">
              <path d="M18 6 A12 12 0 0 0 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <polyline points="6,12 6,18 12,18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="14" y="26" fontSize="9" fill="currentColor" fontFamily="sans-serif">15</text>
            </svg>
          </button>

          <button
            onClick={() => {
              if (!isThisSermon && sermon?.audio_signed_url) {
                loadSermon(sermon, sermon.user_progress?.progress_seconds ?? 0)
              } else {
                togglePlay()
              }
            }}
            disabled={!sermon.audio_signed_url || audioLoading}
            className="w-14 h-14 rounded-full bg-accent-500 hover:bg-accent-400 flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-accent-500/20"
          >
            {audioLoading && isThisSermon ? (
              <svg className="w-6 h-6 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
              </svg>
            ) : playing && isThisSermon ? (
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white ml-0.5" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button onClick={() => skip(15)} className="text-spirit-400 hover:text-spirit-200 transition-colors">
            <svg viewBox="0 0 36 36" className="w-8 h-8" fill="none">
              <path d="M18 6 A12 12 0 0 1 30 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <polyline points="30,12 30,18 24,18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="14" y="26" fontSize="9" fill="currentColor" fontFamily="sans-serif">15</text>
            </svg>
          </button>

          <button
            type="button"
            onClick={() => playFromQueue()}
            disabled={!queueLength}
            aria-label="Play next in queue"
            title="Play next in queue"
            className="focus-ring rounded-lg w-12 h-8 flex items-center justify-center text-spirit-400 hover:text-spirit-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            aria-pressed={muted}
            className="focus-ring rounded-lg w-8 h-8 -ml-2 flex items-center justify-center text-spirit-500 hover:text-spirit-100 transition-colors shrink-0"
          >
            <VolumeIcon className="w-4 h-4" />
          </button>
          {volumeControllable ? (
            <input
              type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              aria-label="Volume"
              className="flex-1 accent-accent-500 h-6 cursor-pointer"
            />
          ) : (
            // iOS only allows volume via the hardware buttons
            <p className="text-spirit-500 text-xs">Use your device&apos;s volume buttons to adjust volume</p>
          )}
        </div>
      </div>

      {/* Description */}
      {sermon.description && (
        <div className="card p-5">
          <p className="label mb-2">About this sermon</p>
          <p className="text-spirit-300 text-sm leading-relaxed">{sermon.description}</p>
        </div>
      )}

      {/* Tags */}
      {sermon.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {sermon.tags.map((tag) => (
            <span key={tag.id} className="text-xs px-3 py-1.5 rounded-full border border-spirit-600 text-spirit-400">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Play queue */}
      {queueLength > 0 && <QueuePanel className="card p-5" />}

      {/* Next sermon */}
      {showQuestions && sermon.next_sermon && (
        <NextSermonCard nextSermon={sermon.next_sermon} />
      )}

      {/* Reflection questions */}
      {showQuestions && sermon.questions?.length > 0 && (
        <div className="card p-6 border-l-2 border-l-accent-500 rounded-r-2xl rounded-l-none animate-slide-up space-y-5">
          <div>
            <p className="label mb-1">Reflection questions</p>
            <p className="text-spirit-500 text-xs">Each answer earns +10 XP</p>
          </div>
          <div className="space-y-6 divide-y divide-spirit-700">
            {sermon.questions.map((q, i) => (
              <div key={q.id} className={i > 0 ? 'pt-5' : ''}>
                <ReflectionQuestion question={q} sermonId={sermon.id} index={i} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
