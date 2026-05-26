/**
 * WordLookUpPage — WL1
 *
 * Fully wired:
 *   ✓ useMicrophone hook (Web Speech API, continuous mode)
 *   ✓ Live transcription display (final text + italic interim)
 *   ✓ Bible reference extractor (bibleParser.js)
 *   ✓ Gold highlighting of detected references in transcript
 *   ✓ Clicking a highlight triggers a lookup (queues ref → result panel)
 *   ✓ Frequency visualiser via Web Audio API AnalyserNode
 *   ✓ File upload fallback for unsupported browsers → POST /api/wordlookup/transcribe/
 *
 * WL2 stub: lookup endpoint not yet live — detected references shown with
 * "Pending API connection" placeholder. BibleVerseCard still exported for reuse.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useMicrophone } from '../hooks/useMicrophone'
import { extractReferences, highlightTranscript } from '../lib/bibleParser'
import api from '../lib/axios'

// ── BibleVerseCard ─────────────────────────────────────────────────────────────

const VERSIONS = ['ESV', 'NIV', 'KJV', 'NKJV', 'NLT']

export function BibleVerseCard({
  reference = 'John 3:16',
  version: initialVersion = 'ESV',
  verseText = '',
  source = 'api.bible',
  matchType = 'exact',
  confidence = 1,
  onVersionChange,
  placeholder = false,
  loading = false,
}) {
  const [version, setVersion] = useState(initialVersion)
  const [copied, setCopied] = useState(false)

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

  if (placeholder || loading) {
    return (
      <div className="card p-5 space-y-3 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 bg-spirit-700 rounded-lg" />
          <div className="h-5 w-12 bg-spirit-700 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-spirit-700 rounded w-full" />
          <div className="h-3 bg-spirit-700 rounded w-5/6" />
          <div className="h-3 bg-spirit-700 rounded w-4/6" />
        </div>
        <div className="h-3 bg-spirit-800 rounded w-24" />
      </div>
    )
  }

  return (
    <div className={`card p-5 space-y-4 border transition-all duration-200 ${
      matchType === 'inferred'
        ? 'border-gold-500/25 bg-gold-500/3'
        : 'border-spirit-700'
    }`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-spirit-100 font-medium text-sm">{reference}</span>
          {matchType === 'inferred' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-500">
              suggested
            </span>
          )}
          {matchType === 'exact' && confidence === 1 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-spirit-700 border border-spirit-600 text-spirit-400">
              exact match
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
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

      <blockquote className="font-display text-lg text-spirit-200 italic leading-relaxed border-l-2 border-l-gold-500/60 pl-4">
        {verseText || (
          <span className="text-spirit-500 not-italic text-sm font-sans">
            Bible API connection coming in WL2 — reference detected: <strong className="text-gold-400">{reference}</strong>
          </span>
        )}
      </blockquote>

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

// ── MicButton ─────────────────────────────────────────────────────────────────

const MIC_META = {
  idle:       { label: 'Tap to start listening',  pulse: false, color: 'border-spirit-600 bg-spirit-800 text-spirit-400 hover:border-gold-500/50 hover:text-gold-400 hover:bg-spirit-700' },
  requesting: { label: 'Requesting microphone…',  pulse: false, color: 'border-gold-500/40 bg-gold-500/5 text-gold-400' },
  listening:  { label: 'Listening… tap to stop',  pulse: true,  color: 'border-flame-500/60 bg-flame-500/8 text-flame-400' },
  processing: { label: 'Finalising…',             pulse: false, color: 'border-gold-500/60 bg-gold-500/8 text-gold-400' },
  error:      { label: 'Tap to retry',             pulse: false, color: 'border-flame-500/40 bg-flame-500/5 text-flame-400' },
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

// ── FrequencyVisualiser ───────────────────────────────────────────────────────
// Reads live data from the Web Audio AnalyserNode every animation frame.

function FrequencyVisualiser({ analyserNode, active }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const BAR_COUNT = 16

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (!active || !analyserNode) {
      // Draw flat idle bars
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
        // Sample from the lower half of the spectrum (voice range)
        const dataIdx = Math.floor((i / BAR_COUNT) * (bufferLength * 0.5))
        const value = dataArray[dataIdx] / 255
        const barH = Math.max(3, value * height)

        // Gradient: gold at peak, muted at base
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
    <canvas
      ref={canvasRef}
      width={200}
      height={40}
      className="opacity-80"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

// ── HighlightedTranscript ─────────────────────────────────────────────────────

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
            <button
              onClick={onClear}
              className="text-xs text-spirit-500 hover:text-spirit-300 transition-colors px-2 py-0.5 rounded-lg hover:bg-spirit-700"
            >
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
                <button
                  key={i}
                  onClick={() => onRefClick(seg.ref)}
                  className="text-gold-400 bg-gold-500/15 border border-gold-500/30 px-1.5 py-0.5 rounded font-medium hover:bg-gold-500/25 transition-colors cursor-pointer mx-0.5"
                  title={`Look up: ${seg.ref.query}`}
                >
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

// ── ResultsPanel ──────────────────────────────────────────────────────────────

function ResultsPanel({ results, loadingRef }) {
  if (results.length === 0 && !loadingRef) {
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
            Tap a highlighted reference in the transcript to look it up, or say something like{' '}
            <span className="text-spirit-400 italic">"John three sixteen"</span>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {loadingRef && <BibleVerseCard loading />}
      {results.map((r, i) => (
        <BibleVerseCard key={`${r.reference}-${i}`} {...r} />
      ))}
    </div>
  )
}

// ── FileFallback ──────────────────────────────────────────────────────────────
// Shown when Web Speech API is unavailable. Posts audio to Django Whisper endpoint.

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
      const msg = err.response?.data?.detail ?? 'Transcription failed. Please try again.'
      setError(msg)
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

      <input
        ref={fileRef}
        type="file"
        accept=".mp3,.m4a,.aac,.ogg,.opus,.wav,.flac"
        onChange={handleFile}
        className="hidden"
      />

      {error && (
        <p className="text-flame-400 text-xs bg-flame-500/10 border border-flame-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="btn-outline text-sm flex items-center gap-2 w-full justify-center"
      >
        {uploading ? (
          <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/></svg>Transcribing…</>
        ) : (
          <>Choose audio file</>
        )}
      </button>
    </div>
  )
}

// ── WordLookUpPage ─────────────────────────────────────────────────────────────

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

  // All text in the box (could come from mic or file upload)
  const [displayTranscript, setDisplayTranscript] = useState('')
  const [displayInterim, setDisplayInterim] = useState('')

  // Keep displayTranscript in sync with mic transcript
  useEffect(() => {
    if (transcript) setDisplayTranscript(transcript)
  }, [transcript])

  useEffect(() => {
    setDisplayInterim(interimTranscript)
  }, [interimTranscript])

  // Detected references from the full transcript
  const [detectedRefs, setDetectedRefs] = useState([])

  // Re-run parser whenever transcript changes
  useEffect(() => {
    const fullText = displayTranscript + ' ' + displayInterim
    const refs = extractReferences(fullText.trim())
    setDetectedRefs(refs)
  }, [displayTranscript, displayInterim])

  // Looked-up results (stub until WL2 wires the API)
  const [results, setResults] = useState([])
  const [lookingUp, setLookingUp] = useState(false)

  // Called when user taps a highlighted reference
  const handleRefClick = useCallback(async (ref) => {
    // Prevent duplicate
    if (results.some(r => r.reference === ref.query)) return

    setLookingUp(true)

    // WL2 will replace this with a real API call to POST /api/wordlookup/lookup/
    // For now, show the reference in the card with a note that the API is pending
    setTimeout(() => {
      setResults(prev => [
        {
          reference: ref.query,
          version: 'ESV',
          verseText: '',  // WL2 fills this in
          source: 'api.bible — connected in WL2',
          matchType: ref.type === 'thematic' ? 'inferred' : 'exact',
          confidence: ref.type === 'thematic' ? 0.85 : 1,
        },
        ...prev,
      ])
      setLookingUp(false)
    }, 400)
  }, [results])

  const wordCount = displayTranscript.trim()
    ? displayTranscript.trim().split(/\s+/).length
    : 0

  const handleMicToggle = () => {
    if (isListening) {
      stop()
    } else {
      start()
    }
  }

  const handleClear = () => {
    clearTranscript()
    setDisplayTranscript('')
    setDisplayInterim('')
    setDetectedRefs([])
    setResults([])
  }

  // File upload fallback: inject Whisper transcript into the same UI
  const handleWhisperTranscript = (text) => {
    setDisplayTranscript(text)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">

      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-3xl text-spirit-100 italic">WordLookUp</h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-500 font-medium">
            beta
          </span>
        </div>
        <p className="text-spirit-400 text-sm">
          Tap the mic while listening to a sermon. Detected scripture references appear instantly.
        </p>
      </div>

      {/* ── Mic / file-fallback ── */}
      {isSupported ? (
        <div className="card p-8 flex flex-col items-center gap-5">
          <MicButton state={micState} onClick={handleMicToggle} />

          {/* Frequency visualiser */}
          <FrequencyVisualiser analyserNode={analyserNode} active={isListening} />

          {/* Status */}
          <p className={`text-sm text-center transition-colors duration-300 ${
            isListening      ? 'text-flame-400' :
            micState === 'processing' ? 'text-gold-400' :
            micState === 'error'      ? 'text-flame-400' :
                              'text-spirit-500'
          }`}>
            {micState === 'idle' && 'Tap to start listening'}
            {micState === 'requesting' && 'Requesting microphone…'}
            {micState === 'listening' && 'Listening… tap to stop'}
            {micState === 'processing' && 'Finalising transcript…'}
            {micState === 'error' && 'Microphone error — tap to retry'}
          </p>

          {/* Error detail */}
          {micError && (
            <p className="text-xs text-flame-400 bg-flame-500/10 border border-flame-500/20 rounded-xl px-4 py-2.5 text-center max-w-sm leading-relaxed">
              {micError}
            </p>
          )}
        </div>
      ) : (
        // Browser doesn't support Web Speech API
        <FileFallback onTranscript={handleWhisperTranscript} />
      )}

      {/* ── Transcript with highlighted references ── */}
      <HighlightedTranscript
        transcript={displayTranscript}
        interimTranscript={displayInterim}
        refs={detectedRefs}
        onRefClick={handleRefClick}
        wordCount={wordCount}
        onClear={handleClear}
      />

      {/* Detected refs quick list — shows even before user taps them */}
      {detectedRefs.length > 0 && (
        <div className="space-y-2">
          <p className="label">Detected references</p>
          <div className="flex flex-wrap gap-2">
            {detectedRefs.map((ref, i) => (
              <button
                key={i}
                onClick={() => handleRefClick(ref)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                  results.some(r => r.reference === ref.query)
                    ? 'bg-gold-500/15 border-gold-500/40 text-gold-400'
                    : 'border-spirit-600 text-spirit-400 hover:border-gold-500/40 hover:text-gold-400 hover:bg-gold-500/8'
                }`}
              >
                {ref.type === 'thematic' && (
                  <span className="mr-1 opacity-60">~</span>
                )}
                {ref.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="label">
            {results.length > 0
              ? `${results.length} passage${results.length !== 1 ? 's' : ''} found`
              : 'Results'}
          </p>
          {results.length > 0 && (
            <button
              onClick={() => setResults([])}
              className="text-xs text-spirit-500 hover:text-spirit-300 transition-colors"
            >
              Clear results
            </button>
          )}
        </div>
        <ResultsPanel results={results} loadingRef={lookingUp} />
      </div>

      {/* ── Saved verses tab stub (WL4) ── */}
      <div className="card p-5 flex items-center gap-4 border-dashed opacity-50">
        <div className="w-9 h-9 rounded-xl bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-spirit-400" stroke="currentColor" strokeWidth={1.6}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-spirit-300 text-sm font-medium">Saved verses</p>
          <p className="text-spirit-500 text-xs mt-0.5">Bookmark verses to your collection — coming in WL4</p>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="card p-5 border-l-2 border-l-gold-500 rounded-r-2xl rounded-l-none space-y-3">
        <p className="label">How it works</p>
        <div className="space-y-2.5 text-sm text-spirit-400 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <span className="text-gold-500 shrink-0 mt-0.5 font-medium">1.</span>
            <span>Your browser transcribes the sermon audio in real time — nothing is sent to a server.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-gold-500 shrink-0 mt-0.5 font-medium">2.</span>
            <span>Detected references (explicit like <em>John 3:16</em> or thematic like <em>the prodigal son</em>) are highlighted in gold. A <span className="text-spirit-300">~</span> prefix means it's a thematic match.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-gold-500 shrink-0 mt-0.5 font-medium">3.</span>
            <span>Tap any reference to look it up. Bible API integration arrives in WL2.</span>
          </div>
        </div>
      </div>

    </div>
  )
}
