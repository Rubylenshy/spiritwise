import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSermon, useSubmitAnswer } from '../hooks/useSermons'
import { useAudio } from '../context/AudioContext'
import { PageLoader, ErrorState, Spinner, XPToast } from '../components/ui'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function ReflectionQuestion({ question, sermonId, index }) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [xpToast, setXpToast] = useState(false)
  const submitAnswer = useSubmitAnswer()

  const handleSubmit = async () => {
    if (!answer.trim()) return
    const result = await submitAnswer.mutateAsync({
      questionId: question.id,
      sermonId,
      answerText: answer,
    })
    setSubmitted(true)
    if (result.xp_awarded > 0) {
      setXpToast(true)
      setTimeout(() => setXpToast(false), 3000)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <span className="font-display text-gold-500 text-lg leading-none shrink-0 mt-0.5">{index + 1}.</span>
        <p className="text-spirit-300 text-sm leading-relaxed">{question.text}</p>
      </div>
      {!submitted ? (
        <div className="ml-6 space-y-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your reflection…"
            rows={3}
            className="input-field resize-none text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || submitAnswer.isPending}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {submitAnswer.isPending ? <Spinner className="w-4 h-4" /> : null}
            Submit +10 XP
          </button>
        </div>
      ) : (
        <div className="ml-6 bg-spirit-800/50 border border-spirit-700 rounded-xl px-4 py-3">
          <p className="text-spirit-300 text-sm">{answer}</p>
          <p className="text-gold-500 text-xs mt-2">✦ Saved</p>
        </div>
      )}
      <XPToast xp={10} show={xpToast} />
    </div>
  )
}

function NextSermonCard({ nextSermon }) {
  const { loadSermon } = useAudio()
  const { data: next } = useSermon(nextSermon?.id)

  if (!nextSermon) return null
  return (
    <div className="card p-5 flex items-center gap-4 animate-slide-up">
      <div className="w-10 h-10 rounded-xl bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0 overflow-hidden">
        {nextSermon.thumbnail
          ? <img src={nextSermon.thumbnail} alt="" className="w-full h-full object-cover" />
          : <span className="text-gold-400 font-display text-sm italic">✦</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="label mb-0.5">Up next in series</p>
        <p className="text-spirit-100 font-medium text-sm truncate">{nextSermon.title}</p>
        <p className="text-spirit-400 text-xs">{nextSermon.speaker} · {nextSermon.duration_display}</p>
      </div>
      <Link to={`/sermons/${nextSermon.id}`} className="btn-primary text-sm shrink-0">
        Play →
      </Link>
    </div>
  )
}

export default function SermonPlayerPage() {
  const { id } = useParams()
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
    changeVolume,
  } = useAudio()

  const [showQuestions, setShowQuestions] = useState(false)
  const [xpToast, setXpToast] = useState(false)

  const isThisSermon = currentSermon?.id === sermon?.id
  const effectiveDuration = isThisSermon ? duration : (sermon?.duration_seconds ?? 0)
  const effectiveTime = isThisSermon ? currentTime : (sermon?.user_progress?.progress_seconds ?? 0)
  const effectiveProgress = effectiveDuration > 0 ? effectiveTime / effectiveDuration : 0

  // Load sermon into global player when page opens
  useEffect(() => {
    if (!sermon?.audio_signed_url) return
    const resumeAt = sermon.user_progress?.progress_seconds ?? 0

    // Only auto-load if not already playing this sermon
    if (currentSermon?.id !== sermon.id) {
      loadSermon(sermon, resumeAt)
    }
  }, [sermon?.id, sermon?.audio_signed_url])

  // Show questions when 80% complete
  useEffect(() => {
    if (effectiveProgress >= 0.8 && !showQuestions && sermon) {
      setShowQuestions(true)
      if (!sermon.user_progress?.completed) {
        setXpToast(true)
        setTimeout(() => setXpToast(false), 3000)
      }
    }
  }, [effectiveProgress, showQuestions, sermon])

  // Show questions if already completed
  useEffect(() => {
    if (sermon?.user_progress?.completed) setShowQuestions(true)
  }, [sermon?.id])

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message="Could not load this sermon." onRetry={refetch} />

  const handleSeekClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seek(ratio * effectiveDuration)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up w-full">
      <XPToast xp={50} show={xpToast} />

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

      {/* Player card */}
      <div className="card p-4 sm:p-8 space-y-6">
        {/* Artwork */}
        <div className="w-24 h-24 rounded-2xl bg-spirit-700 border border-spirit-600 flex items-center justify-center mx-auto overflow-hidden">
          {sermon.thumbnail
            ? <img src={sermon.thumbnail} alt="" className="w-full h-full object-cover" />
            : <span className="font-display text-4xl text-gold-400 italic">✦</span>
          }
        </div>

        {/* Info */}
        <div className="text-center">
          <h2 className="font-display text-2xl text-spirit-100 italic">{sermon.title}</h2>
          <p className="text-spirit-400 text-sm mt-1">{sermon.speaker}</p>
          <p className="text-spirit-500 text-xs mt-0.5">
            {sermon.series?.title}
            {sermon.sermon_date && ` · ${new Date(sermon.sermon_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </p>
          {sermon.scripture_reference && (
            <p className="text-gold-500/70 text-xs mt-1 italic">{sermon.scripture_reference}</p>
          )}
        </div>

        {!sermon.audio_signed_url && (
          <div className="bg-spirit-800 border border-spirit-700 rounded-xl px-4 py-3 text-center">
            <p className="text-spirit-400 text-sm">Audio not available yet.</p>
          </div>
        )}

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div
            className="h-1.5 bg-spirit-700 rounded-full cursor-pointer group relative"
            onClick={handleSeekClick}
          >
            <div
              className="h-full bg-gold-500 rounded-full transition-all duration-100 relative"
              style={{ width: `${effectiveProgress * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gold-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-xs font-mono text-spirit-500">
            <span>{formatTime(effectiveTime)}</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
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
            className="w-14 h-14 rounded-full bg-gold-500 hover:bg-gold-400 flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-gold-500/20"
          >
            {audioLoading && isThisSermon ? (
              <svg className="w-6 h-6 animate-spin text-spirit-900" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
              </svg>
            ) : playing && isThisSermon ? (
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-spirit-900" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-spirit-900 ml-0.5" fill="currentColor">
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
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-spirit-500 shrink-0" stroke="currentColor" strokeWidth={1.8}>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            {volume > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />}
            {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" />}
          </svg>
          <input
            type="range" min={0} max={1} step={0.05} value={volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            className="flex-1 accent-gold-500 h-1 cursor-pointer"
          />
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

      {/* Next sermon */}
      {showQuestions && sermon.next_sermon && (
        <NextSermonCard nextSermon={sermon.next_sermon} />
      )}

      {/* Reflection questions */}
      {showQuestions && sermon.questions?.length > 0 && (
        <div className="card p-6 border-l-2 border-l-gold-500 rounded-r-2xl rounded-l-none animate-slide-up space-y-5">
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
