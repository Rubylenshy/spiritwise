/**
 * WordLookUpPage — WL3
 *
 * Changes from WL2:
 *   ✓ Phrase lookups now go through the AI resolver on the backend —
 *     the UI shows an "AI suggested" badge + reasoning tooltip for inferred results
 *   ✓ Confidence bar shown on BibleVerseCard when confidence < 1.0
 *   ✓ Multiple results displayed in ranked order (up to 3)
 *   ✓ Full lookup history page — paginated, searchable, re-lookup on tap
 *   ✓ Manual phrase search box — lets users type a phrase even without mic
 *   ✓ AI lookup loading state shows a distinct "Asking AI…" indicator
 *   ✓ Version switcher fires a real lookup and replaces card text inline
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useMicrophone } from '../hooks/useMicrophone'
import { extractReferences, highlightTranscript } from '../lib/bibleParser'
import api from '../lib/axios'

// ─────────────────────────────────────────────────────────────────────────────
// ── BibleVerseCard ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const VERSIONS = ['ESV', 'NIV', 'KJV', 'NKJV', 'NLT']

export function BibleVerseCard({
  reference = '',
  version: initialVersion = 'ESV',
  verseText = '',
  source = '',
  matchType = 'exact',
  confidence = 1,
  aiReasoning = '',
  onVersionChange,
  placeholder = false,
  loading = false,
  loadingLabel = 'Loading verse…',
  error = null,
}) {
  const [version, setVersion] = useState(initialVersion)
  const [copied, setCopied] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)

  useEffect(() => { setVersion(initialVersion) }, [initialVersion])

  const handleVersionChange = (v) => {
    setVersion(v)
    onVersionChange?.(v)
  }

  const handleCopy = () => {
    const text = `${reference} (${version})\n\n${verseText}\n\n— Found with SpiritWise WordLookUp`
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const bibleGatewayUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=${version}`

  // ── Placeholder / loading ──────────────────────────────────────────────────
  if (placeholder || loading) {
    return (
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 bg-spirit-700 rounded-lg animate-pulse" />
          <div className="h-5 w-12 bg-spirit-700 rounded-full animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-spirit-700 rounded w-full animate-pulse" />
          <div className="h-3 bg-spirit-700 rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-spirit-700 rounded w-4/6 animate-pulse" />
        </div>
        {loading && loadingLabel !== 'Loading verse…' && (
          <div className="flex items-center gap-2 pt-1">
            <svg className="w-3.5 h-3.5 animate-spin text-gold-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            <span className="text-spirit-500 text-xs">{loadingLabel}</span>
          </div>
        )}
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="card p-5 border-flame-500/25">
        <p className="text-flame-400 text-sm font-medium">{reference || 'Lookup failed'}</p>
        <p className="text-spirit-500 text-xs mt-1">{error}</p>
      </div>
    )
  }

  const isInferred = matchType === 'inferred'
  const confidencePct = Math.round(confidence * 100)

  return (
    <div className={`card p-5 space-y-4 border transition-all duration-200 ${
      isInferred
        ? 'border-gold-500/25 bg-gold-500/[0.02]'
        : 'border-spirit-700'
    }`}>

      {/* ── Header row ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-spirit-100 font-medium text-sm shrink-0">{reference}</span>

          {/* Match type badge */}
          {isInferred ? (
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-500 shrink-0">
                AI suggested
              </span>
              {/* Confidence bar */}
              {confidence < 1 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-spirit-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        confidence > 0.8 ? 'bg-gold-500' :
                        confidence > 0.6 ? 'bg-gold-600' : 'bg-spirit-500'
                      }`}
                      style={{ width: `${confidencePct}%` }}
                    />
                  </div>
                  <span className="text-spirit-600 text-xs font-mono">{confidencePct}%</span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-spirit-700 border border-spirit-600 text-spirit-400 shrink-0">
              exact match
            </span>
          )}
        </div>

        {/* Version switcher */}
        <div className="flex items-center gap-1 flex-wrap shrink-0">
          {VERSIONS.map((v) => (
            <button
              key={v}
              onClick={() => handleVersionChange(v)}
              className={`text-xs px-2 py-1 rounded-lg transition-all duration-150 ${
                version === v
                  ? 'bg-spirit-600 text-spirit-100 border border-spirit-500'
                  : 'text-spirit-500 hover:text-spirit-300 hover:bg-spirit-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── AI reasoning (collapsible) ───────────────────────────────────────── */}
      {isInferred && aiReasoning && (
        <div>
          <button
            onClick={() => setShowReasoning(v => !v)}
            className="flex items-center gap-1.5 text-xs text-spirit-600 hover:text-spirit-400 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={1.6}>
              <circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5.5v.5" strokeLinecap="round"/>
            </svg>
            {showReasoning ? 'Hide reasoning' : 'Why this passage?'}
          </button>
          {showReasoning && (
            <p className="text-spirit-500 text-xs mt-1.5 leading-relaxed italic pl-4 border-l border-spirit-700">
              {aiReasoning}
            </p>
          )}
        </div>
      )}

      {/* ── Verse text ──────────────────────────────────────────────────────── */}
      <blockquote className="font-display text-lg text-spirit-200 italic leading-relaxed border-l-2 border-l-gold-500/60 pl-4">
        {verseText || (
          <span className="text-spirit-500 not-italic text-sm font-sans">
            No text returned for this version.
          </span>
        )}
      </blockquote>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 border-t border-spirit-700/50 flex-wrap gap-2">
        <span className="text-spirit-600 text-xs">{source}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!verseText}
            className="flex items-center gap-1.5 text-xs text-spirit-400 hover:text-spirit-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-spirit-700"
          >
            {copied ? (
              <><svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-gold-400" stroke="currentColor" strokeWidth={2}><path d="M3 8l4 4 6-7" strokeLinecap="round" strokeLinejoin="round"/></svg><span className="text-gold-400">Copied</span></>
            ) : (
              <><svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={1.6}><rect x="5" y="5" width="8" height="9" rx="1.5"/><path d="M3 10V3.5A1.5 1.5 0 014.5 2H11" strokeLinecap="round"/></svg>Copy</>
            )}
          </button>
          <a
            href={bibleGatewayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-spirit-400 hover:text-gold-400 transition-colors px-2 py-1 rounded-lg hover:bg-spirit-700"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={1.6}><path d="M10 3h3v3M13 3l-6 6M7 4H4a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Open in Bible
          </a>
        </div>
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// ── ResultCard — version-switchable wrapper ────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function ResultCard({ initial }) {
  const [result, setResult] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleVersionChange = async (newVersion) => {
    if (newVersion === result.version) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/wordlookup/lookup/', {
        reference: initial.reference,
        versions: [newVersion],
      })
      if (data.results?.length) {
        setResult({ ...data.results[0], ai_reasoning: initial.ai_reasoning })
      } else {
        setError(`${newVersion} translation not available for this passage.`)
        setTimeout(() => setError(null), 3000)
      }
    } catch {
      setError('Could not load this version.')
      setTimeout(() => setError(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BibleVerseCard
      reference={result.reference}
      version={result.version}
      verseText={result.text}
      source={result.source}
      matchType={result.match_type}
      confidence={result.confidence ?? 1}
      aiReasoning={result.ai_reasoning ?? initial.ai_reasoning ?? ''}
      loading={loading}
      error={error}
      onVersionChange={handleVersionChange}
    />
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// ── Microphone button ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const MIC_META = {
  idle:       { label: 'Tap to start listening',  pulse: false, color: 'border-spirit-600 bg-spirit-800 text-spirit-400 hover:border-gold-500/50 hover:text-gold-400 hover:bg-spirit-700' },
  requesting: { label: 'Requesting microphone…',  pulse: false, color: 'border-gold-500/40 bg-gold-500/5 text-gold-400' },
  listening:  { label: 'Listening — tap to stop', pulse: true,  color: 'border-flame-500/60 bg-flame-500/8 text-flame-400' },
  processing: { label: 'Finalising…',             pulse: false, color: 'border-gold-500/60 bg-gold-500/8 text-gold-400' },
  error:      { label: 'Tap to retry',            pulse: false, color: 'border-flame-500/40 bg-flame-500/5 text-flame-400' },
}

function MicButton({ state, onClick }) {
  const meta = MIC_META[state] ?? MIC_META.idle
  const isProcessing = state === 'processing' || state === 'requesting'

  return (
    <div className="relative flex items-center justify-center">
      {meta.pulse && (
        <>
          <span className="absolute w-32 h-32 rounded-full border border-flame-500/30 animate-ping" style={{ animationDuration: '1.8s' }} />
          <span className="absolute w-24 h-24 rounded-full border border-flame-500/20 animate-ping" style={{ animationDuration: '1.4s', animationDelay: '0.2s' }} />
        </>
      )}
      <button
        onClick={onClick}
        className={`relative w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 active:scale-95 ${meta.color}`}
        aria-label={meta.label}
      >
        {isProcessing ? (
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" stroke="currentColor" strokeWidth={1.6}>
            <rect x="9" y="2" width="6" height="11" rx="3"/>
            <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// ── Frequency visualiser ──────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function FrequencyVisualiser({ analyserNode, active }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const BAR_COUNT = 16

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (!active || !analyserNode) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const barW = canvas.width / BAR_COUNT
      const gap = 2
      ctx.fillStyle = 'rgba(90, 122, 168, 0.2)'
      for (let i = 0; i < BAR_COUNT; i++) {
        ctx.fillRect(i * barW + gap / 2, canvas.height - 3, barW - gap, 3)
      }
      return
    }

    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyserNode.getByteFrequencyData(dataArray)
      const ctx = canvas.getContext('2d')
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)
      const barW = width / BAR_COUNT
      const gap = 2
      for (let i = 0; i < BAR_COUNT; i++) {
        const dataIdx = Math.floor((i / BAR_COUNT) * (bufferLength * 0.5))
        const value = dataArray[dataIdx] / 255
        const barH = Math.max(3, value * height)
        const gradient = ctx.createLinearGradient(0, height - barH, 0, height)
        gradient.addColorStop(0, `rgba(201, 168, 76, ${0.4 + value * 0.6})`)
        gradient.addColorStop(1, `rgba(201, 168, 76, 0.2)`)
        ctx.fillStyle = gradient
        const x = i * barW + gap / 2
        ctx.beginPath()
        ctx.roundRect?.(x, height - barH, barW - gap, barH, 2)
        ctx.fill()
      }
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [analyserNode, active])

  return (
    <canvas ref={canvasRef} width={200} height={40} className="opacity-80"
            style={{ imageRendering: 'pixelated' }} />
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// ── Highlighted transcript ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function HighlightedTranscript({ transcript, interimTranscript, refs, onRefClick, wordCount, onClear }) {
  const segments = highlightTranscript(transcript, refs)
  const isEmpty = !transcript && !interimTranscript

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-spirit-700 bg-spirit-800/50">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-spirit-500" stroke="currentColor" strokeWidth={1.6}>
            <path d="M2 4h12M2 8h9M2 12h6" strokeLinecap="round"/>
          </svg>
          <span className="text-spirit-500 text-xs uppercase tracking-widest">Transcript</span>
          {refs.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-500">
              {refs.length} reference{refs.length !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {wordCount > 0 && (
            <span className="text-spirit-600 text-xs font-mono">{wordCount} words</span>
          )}
          {!isEmpty && (
            <button onClick={onClear}
              className="text-xs text-spirit-500 hover:text-spirit-300 transition-colors px-2 py-0.5 rounded-lg hover:bg-spirit-700">
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="min-h-36 max-h-60 overflow-y-auto p-4 text-sm leading-relaxed font-sans">
        {isEmpty ? (
          <p className="text-spirit-600 italic">
            Start listening — your transcript will appear here. Detected scripture references
            will be highlighted in gold. Tap any highlight to look it up.
          </p>
        ) : (
          <p>
            {segments.map((seg, i) =>
              seg.highlighted ? (
                <button key={i} onClick={() => onRefClick(seg.ref)}
                  className="text-gold-400 bg-gold-500/15 border border-gold-500/30 px-1.5 py-0.5 rounded font-medium hover:bg-gold-500/25 transition-colors cursor-pointer mx-0.5"
                  title={`Look up: ${seg.ref.query}`}>
                  {seg.text}
                </button>
              ) : (
                <span key={i} className="text-spirit-200">{seg.text}</span>
              )
            )}
            {interimTranscript && (
              <span className="text-spirit-500 italic"> {interimTranscript}</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// ── Results panel ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function ResultsPanel({ results, isLoading, isAiLoading }) {
  if (results.length === 0 && !isLoading && !isAiLoading) {
    return (
      <div className="card p-8 text-center space-y-3 border-dashed">
        <div className="w-12 h-12 rounded-2xl bg-spirit-800 border border-spirit-700 flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-spirit-600" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-spirit-400 font-medium text-sm">No references found yet</p>
          <p className="text-spirit-600 text-xs mt-1 leading-relaxed">
            Tap a highlighted reference, or search a phrase like{' '}
            <span className="text-spirit-400 italic">"the part about the prodigal son"</span>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* AI lookup loading indicator */}
      {isAiLoading && (
        <div className="card p-4 flex items-center gap-3 border-gold-500/20 bg-gold-500/3">
          <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gold-400" stroke="currentColor" strokeWidth={1.5}>
              <polygon points="8 1 10 6 15 6 11 10 13 15 8 12 3 15 5 10 1 6 6 6"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-gold-400 text-xs font-medium">Asking Claude to identify this passage…</p>
            <p className="text-spirit-500 text-xs mt-0.5">Claude identifies references — the Bible API fetches the text</p>
          </div>
          <svg className="w-4 h-4 animate-spin text-gold-500 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
          </svg>
        </div>
      )}

      {/* Standard loading skeleton */}
      {isLoading && !isAiLoading && <BibleVerseCard loading />}

      {results.map((r, i) => (
        <ResultCard key={`${r.reference}-${i}`} initial={r} />
      ))}
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// ── Phrase search box ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function PhraseSearchBox({ onSearch, loading }) {
  const [phrase, setPhrase] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (phrase.trim()) onSearch(phrase.trim())
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-spirit-700 bg-spirit-800/50 flex items-center gap-2">
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-spirit-500" stroke="currentColor" strokeWidth={1.5}>
          <polygon points="8 1 10 6 15 6 11 10 13 15 8 12 3 15 5 10 1 6 6 6"/>
        </svg>
        <span className="text-spirit-500 text-xs uppercase tracking-widest">Search phrase or reference</span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 p-3">
        <input
          type="text"
          value={phrase}
          onChange={e => setPhrase(e.target.value)}
          placeholder="e.g. John 3:16 or the part about feeding 5000"
          className="input-field text-sm flex-1"
        />
        <button
          type="submit"
          disabled={!phrase.trim() || loading}
          className="btn-primary text-sm px-4 shrink-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="7" cy="7" r="5"/><path d="M13 13l-3-3" strokeLinecap="round"/>
            </svg>
          )}
          Look up
        </button>
      </form>
      <p className="text-spirit-600 text-xs px-4 pb-3 -mt-1 leading-relaxed">
        Exact references (John 3:16) are instant. Descriptive phrases are resolved by AI — Claude identifies the passage, then the Bible fetches the actual text.
      </p>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// ── Lookup history panel ──────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function LookupHistoryPanel({ onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['wordlookup-history', search],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: pageParam, page_size: 10 })
      if (search) params.set('q', search)
      const { data } = await api.get(`/wordlookup/history/?${params}`)
      return data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      const url = new URL(lastPage.next)
      return parseInt(url.searchParams.get('page') || '2', 10)
    },
    staleTime: 1000 * 30,
  })

  const allItems = data?.pages.flatMap(p => p.results ?? []) ?? []
  const totalCount = data?.pages[0]?.count ?? 0

  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="label">Recent lookups</p>
        <div className="card p-4 animate-pulse space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="h-4 w-24 bg-spirit-700 rounded" />
              <div className="h-4 flex-1 bg-spirit-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (allItems.length === 0 && !search) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="label">Recent lookups {totalCount > 0 && <span className="normal-case font-mono text-spirit-600">({totalCount})</span>}</p>
        {allItems.length > 3 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs text-spirit-500 hover:text-spirit-300 transition-colors"
          >
            {expanded ? 'Show less' : `Show all ${totalCount}`}
          </button>
        )}
      </div>

      {/* Search within history */}
      {(expanded || totalCount > 5) && (
        <div className="relative">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-spirit-500 pointer-events-none" stroke="currentColor" strokeWidth={1.6}>
            <circle cx="7" cy="7" r="5"/><path d="M13 13l-3-3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lookups…"
            className="input-field text-xs pl-8 py-2"
          />
        </div>
      )}

      <div className="card overflow-hidden divide-y divide-spirit-700/60">
        {(expanded ? allItems : allItems.slice(0, 3)).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.reference_found || item.query)}
            className="w-full flex items-start justify-between px-4 py-3.5 hover:bg-spirit-700/30 transition-colors text-left gap-4 group"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-spirit-200 text-sm font-medium truncate">
                  {item.reference_found || item.query}
                </p>
                {item.match_type === 'inferred' && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 shrink-0">
                    AI
                  </span>
                )}
              </div>
              {item.verse_snippet && (
                <p className="text-spirit-500 text-xs mt-0.5 line-clamp-1 italic">
                  {item.verse_snippet}
                </p>
              )}
              <p className="text-spirit-700 text-xs mt-1">
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              <span className="text-xs text-spirit-600 bg-spirit-800 border border-spirit-700 px-2 py-0.5 rounded-full">
                {item.version}
              </span>
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-spirit-700 group-hover:text-spirit-500 transition-colors" stroke="currentColor" strokeWidth={1.6}>
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        ))}

        {/* Load more */}
        {expanded && hasNextPage && (
          <div className="px-4 py-3 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-xs text-spirit-400 hover:text-spirit-200 transition-colors flex items-center gap-2"
            >
              {isFetchingNextPage ? (
                <><svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/></svg>Loading…</>
              ) : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// ── File fallback (Whisper) ───────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function FileFallback({ onTranscript }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('audio_file', file)
      const { data } = await api.post('/wordlookup/transcribe/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onTranscript(data.transcript)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Transcription failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="card p-5 border-dashed space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gold-400" stroke="currentColor" strokeWidth={1.6}>
            <path d="M8 2v8M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-spirit-200 text-sm font-medium">Upload a sermon audio file</p>
          <p className="text-spirit-500 text-xs mt-0.5 leading-relaxed">
            Your browser doesn't support the microphone API. Upload an audio file and we'll
            transcribe it using Whisper instead.
          </p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept=".mp3,.m4a,.aac,.ogg,.opus,.wav,.flac"
             onChange={handleFile} className="hidden" />
      {error && (
        <p className="text-flame-400 text-xs bg-flame-500/10 border border-flame-500/20 rounded-xl px-3 py-2">{error}</p>
      )}
      <button onClick={() => fileRef.current?.click()} disabled={uploading}
        className="btn-outline text-sm flex items-center gap-2 w-full justify-center">
        {uploading ? (
          <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/></svg>Transcribing…</>
        ) : 'Choose audio file'}
      </button>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// ── WordLookUpPage ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export default function WordLookUpPage() {
  const {
    start, stop,
    transcript, interimTranscript,
    isListening, state: micState,
    error: micError,
    isSupported,
    analyserNode,
    clearTranscript,
  } = useMicrophone({ continuous: true })

  const [displayTranscript, setDisplayTranscript] = useState('')
  const [displayInterim, setDisplayInterim] = useState('')
  const [detectedRefs, setDetectedRefs] = useState([])
  const [results, setResults] = useState([])
  const [lookingUp, setLookingUp] = useState(false)
  const [isAiLookup, setIsAiLookup] = useState(false)
  const [lookupError, setLookupError] = useState(null)

  // Sync transcript state
  useEffect(() => { if (transcript) setDisplayTranscript(transcript) }, [transcript])
  useEffect(() => { setDisplayInterim(interimTranscript) }, [interimTranscript])

  // Re-run reference detection whenever text changes
  useEffect(() => {
    const fullText = (displayTranscript + ' ' + displayInterim).trim()
    setDetectedRefs(extractReferences(fullText))
  }, [displayTranscript, displayInterim])

  // ── Lookup a detected reference (from mic transcript or history) ──────────
  const handleRefClick = useCallback(async (ref) => {
    if (results.some(r => r.reference?.toLowerCase() === ref.query?.toLowerCase())) return

    setLookingUp(true)
    setIsAiLookup(false)
    setLookupError(null)

    // Detect if this is a thematic phrase (will need AI)
    const isThematic = ref.type === 'thematic' || ref.type === 'book'
    if (isThematic) setIsAiLookup(true)

    try {
      const payload = ref.type === 'thematic'
        ? { phrase: ref.query, versions: ['ESV'] }
        : { reference: ref.query, versions: ['ESV'] }

      const { data } = await api.post('/wordlookup/lookup/', payload)

      if (data.results?.length) {
        setResults(prev => [...data.results, ...prev])
      } else {
        setLookupError(`No verse found for "${ref.query}".`)
        setTimeout(() => setLookupError(null), 4000)
      }
    } catch (err) {
      setLookupError(err.response?.data?.detail ?? 'Lookup failed. Check your connection.')
      setTimeout(() => setLookupError(null), 4000)
    } finally {
      setLookingUp(false)
      setIsAiLookup(false)
    }
  }, [results])

  // ── Manual phrase/reference search ────────────────────────────────────────
  const handleManualSearch = useCallback(async (input) => {
    setLookingUp(true)
    setIsAiLookup(false)
    setLookupError(null)

    // Determine if it looks like an exact reference or a phrase
    const looksLikeRef = /^\d?\s*[A-Za-z]+\s+\d+[:.]?\d*/.test(input.trim())
    if (!looksLikeRef) setIsAiLookup(true)

    try {
      const payload = looksLikeRef
        ? { reference: input, versions: ['ESV'] }
        : { phrase: input, versions: ['ESV'] }

      const { data } = await api.post('/wordlookup/lookup/', payload)

      if (data.results?.length) {
        setResults(prev => [...data.results, ...prev])
      } else {
        setLookupError(`No passage found for "${input}". Try rephrasing or use an exact reference.`)
        setTimeout(() => setLookupError(null), 5000)
      }
    } catch (err) {
      setLookupError(err.response?.data?.detail ?? 'Lookup failed.')
      setTimeout(() => setLookupError(null), 4000)
    } finally {
      setLookingUp(false)
      setIsAiLookup(false)
    }
  }, [])

  // ── History re-select ─────────────────────────────────────────────────────
  const handleHistorySelect = useCallback(async (referenceStr) => {
    setLookingUp(true)
    setIsAiLookup(false)
    setLookupError(null)
    try {
      const { data } = await api.post('/wordlookup/lookup/', {
        reference: referenceStr,
        versions: ['ESV'],
      })
      if (data.results?.length) {
        setResults(prev => [...data.results, ...prev])
      }
    } catch {
      // silently ignore
    } finally {
      setLookingUp(false)
    }
  }, [])

  const wordCount = displayTranscript.trim()
    ? displayTranscript.trim().split(/\s+/).length : 0

  const handleMicToggle = () => { isListening ? stop() : start() }

  const handleClear = () => {
    clearTranscript()
    setDisplayTranscript('')
    setDisplayInterim('')
    setDetectedRefs([])
    setResults([])
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-3xl text-spirit-100 italic">WordLookUp</h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-500 font-medium">beta</span>
        </div>
        <p className="text-spirit-400 text-sm">
          Tap the mic while listening to a sermon. Detected scripture references appear instantly.
          Descriptive phrases identifies the passage, the Bible API fetches the text.
        </p>
      </div>

      {/* ── Mic or file fallback ─────────────────────────────────────────────── */}
      {isSupported ? (
        <div className="card p-8 flex flex-col items-center gap-5">
          <MicButton state={micState} onClick={handleMicToggle} />
          <FrequencyVisualiser analyserNode={analyserNode} active={isListening} />
          <p className={`text-sm text-center transition-colors duration-300 ${
            isListening              ? 'text-flame-400' :
            micState === 'processing' ? 'text-gold-400'  :
            micState === 'error'      ? 'text-flame-400' : 'text-spirit-500'
          }`}>
            {micState === 'idle'       && 'Tap to start listening'}
            {micState === 'requesting' && 'Requesting microphone…'}
            {micState === 'listening'  && 'Listening — tap to stop'}
            {micState === 'processing' && 'Finalising transcript…'}
            {micState === 'error'      && 'Microphone error — tap to retry'}
          </p>
          {micError && (
            <p className="text-xs text-flame-400 bg-flame-500/10 border border-flame-500/20 rounded-xl px-4 py-2.5 text-center max-w-sm leading-relaxed">
              {micError}
            </p>
          )}
        </div>
      ) : (
        <FileFallback onTranscript={setDisplayTranscript} />
      )}

      {/* ── Manual phrase search ─────────────────────────────────────────────── */}
      <PhraseSearchBox onSearch={handleManualSearch} loading={lookingUp} />

      {/* ── Transcript ───────────────────────────────────────────────────────── */}
      <HighlightedTranscript
        transcript={displayTranscript}
        interimTranscript={displayInterim}
        refs={detectedRefs}
        onRefClick={handleRefClick}
        wordCount={wordCount}
        onClear={handleClear}
      />

      {/* ── Detected refs quick-tap list ──────────────────────────────────────── */}
      {detectedRefs.length > 0 && (
        <div className="space-y-2">
          <p className="label">Detected references</p>
          <div className="flex flex-wrap gap-2">
            {detectedRefs.map((ref, i) => (
              <button key={i} onClick={() => handleRefClick(ref)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                  results.some(r => r.reference?.toLowerCase() === ref.query?.toLowerCase())
                    ? 'bg-gold-500/15 border-gold-500/40 text-gold-400'
                    : 'border-spirit-600 text-spirit-400 hover:border-gold-500/40 hover:text-gold-400 hover:bg-gold-500/8'
                }`}>
                {ref.type === 'thematic' && <span className="mr-1 opacity-60 text-gold-500">✦</span>}
                {ref.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Lookup error ─────────────────────────────────────────────────────── */}
      {lookupError && (
        <p className="text-flame-400 text-sm bg-flame-500/10 border border-flame-500/20 rounded-xl px-4 py-3">
          {lookupError}
        </p>
      )}

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="label">
            {results.length > 0
              ? `${results.length} passage${results.length !== 1 ? 's' : ''} found`
              : 'Results'}
          </p>
          {results.length > 0 && (
            <button onClick={() => setResults([])}
              className="text-xs text-spirit-500 hover:text-spirit-300 transition-colors">
              Clear results
            </button>
          )}
        </div>
        <ResultsPanel results={results} isLoading={lookingUp && !isAiLookup} isAiLoading={isAiLookup} />
      </div>

      {/* ── Lookup history (WL3 — full paginated panel) ───────────────────────── */}
      <LookupHistoryPanel onSelect={handleHistorySelect} />

      {/* ── Saved verses (WL4 stub) ───────────────────────────────────────────── */}
      <div className="card p-5 flex items-center gap-4 border-dashed opacity-50 cursor-not-allowed">
        <div className="w-9 h-9 rounded-xl bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-spirit-400" stroke="currentColor" strokeWidth={1.6}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-spirit-300 text-sm font-medium">Saved verses</p>
          <p className="text-spirit-500 text-xs mt-0.5">Bookmark verses to your collection — coming in WL4</p>
        </div>
      </div>

    </div>
  )
}
