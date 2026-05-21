/**
 * WordLookUpPage — LP4 shell
 *
 * This is the static visual shell only. No microphone or API calls.
 * All interactivity (useMicrophone, Bible API, AI resolver) is added in WL1–WL4.
 *
 * Exports:
 *   - default WordLookUpPage   — the full page
 *   - BibleVerseCard           — reusable result card (used in WL phases)
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'

// ── BibleVerseCard ─────────────────────────────────────────────────────────────
// Reusable result card. In WL phases this receives live data; here it shows
// static demo content so the layout is validated before the API is wired.

const VERSIONS = ['ESV', 'NIV', 'KJV', 'NKJV', 'NLT']

export function BibleVerseCard({
  reference = 'John 3:16',
  version: initialVersion = 'ESV',
  verseText = '',
  source = 'api.bible',
  matchType = 'exact',      // 'exact' | 'inferred'
  confidence = 1,
  onVersionChange,          // (newVersion) => void — called by WL3
  placeholder = false,      // true = show skeleton / empty state
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

  if (placeholder) {
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
      {/* Header row */}
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

        {/* Version switcher */}
        <div className="flex items-center gap-1">
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

      {/* Verse text */}
      <blockquote className="font-display text-lg text-spirit-200 italic leading-relaxed border-l-2 border-l-gold-500/60 pl-4">
        {verseText || (
          <span className="text-spirit-500 not-italic text-sm font-sans">
            Verse text will appear here once the Bible API is connected in WL2.
          </span>
        )}
      </blockquote>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-spirit-700/50 flex-wrap gap-2">
        <span className="text-spirit-600 text-xs">{source}</span>

        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={!verseText}
            className="flex items-center gap-1.5 text-xs text-spirit-400 hover:text-spirit-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-spirit-700"
          >
            {copied ? (
              <>
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-gold-400" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 8l4 4 6-7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-gold-400">Copied</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={1.6}>
                  <rect x="5" y="5" width="8" height="9" rx="1.5"/><path d="M3 10V3.5A1.5 1.5 0 014.5 2H11" strokeLinecap="round"/>
                </svg>
                Copy
              </>
            )}
          </button>

          {/* Open in Bible Gateway */}
          <a
            href={bibleGatewayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-spirit-400 hover:text-gold-400 transition-colors px-2 py-1 rounded-lg hover:bg-spirit-700"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={1.6}>
              <path d="M10 3h3v3M13 3l-6 6M7 4H4a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Open in Bible
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Mic button states ─────────────────────────────────────────────────────────

const MIC_STATES = {
  idle:       { label: 'Tap to start listening',       color: 'border-spirit-600 bg-spirit-800 text-spirit-400 hover:border-gold-500/50 hover:text-gold-400 hover:bg-spirit-700' },
  listening:  { label: 'Listening… tap to stop',       color: 'border-flame-500/60 bg-flame-500/8 text-flame-400' },
  processing: { label: 'Looking up references…',       color: 'border-gold-500/60 bg-gold-500/8 text-gold-400' },
}

function MicButton({ state, onClick }) {
  const { color } = MIC_STATES[state]
  const isListening  = state === 'listening'
  const isProcessing = state === 'processing'

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings — visible only while listening */}
      {isListening && (
        <>
          <span className="absolute w-32 h-32 rounded-full border border-flame-500/30 animate-ping" style={{ animationDuration: '1.8s' }} />
          <span className="absolute w-24 h-24 rounded-full border border-flame-500/20 animate-ping" style={{ animationDuration: '1.4s', animationDelay: '0.2s' }} />
        </>
      )}

      <button
        onClick={onClick}
        className={`relative w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 active:scale-95 ${color}`}
        aria-label={MIC_STATES[state].label}
      >
        {isProcessing ? (
          /* Spinner */
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
          </svg>
        ) : (
          /* Microphone icon */
          <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" stroke="currentColor" strokeWidth={1.6}>
            <rect x="9" y="2" width="6" height="11" rx="3"/>
            <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  )
}

// ── Frequency visualiser (decorative — Web Audio API wired in WL1) ────────────

function FrequencyBars({ active }) {
  const heights = [4, 8, 14, 20, 14, 8, 20, 14, 8, 4, 8, 14, 20, 14, 8]
  return (
    <div className="flex items-end justify-center gap-0.5 h-6">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${active ? 'bg-flame-400' : 'bg-spirit-700'}`}
          style={{
            height: active ? `${h}px` : '3px',
            animation: active ? `wlWave ${0.6 + i * 0.08}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes wlWave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
      `}</style>
    </div>
  )
}

// ── TranscriptBox ─────────────────────────────────────────────────────────────

function TranscriptBox({ transcript = '', interim = '', wordCount = 0, onClear }) {
  const isEmpty = !transcript && !interim

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-spirit-700 bg-spirit-800/50">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-spirit-500" stroke="currentColor" strokeWidth={1.6}>
            <path d="M2 4h12M2 8h9M2 12h6" strokeLinecap="round"/>
          </svg>
          <span className="text-spirit-500 text-xs uppercase tracking-widest">Transcript</span>
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

      {/* Content */}
      <div className="min-h-36 max-h-56 overflow-y-auto p-4 text-sm leading-relaxed font-sans">
        {isEmpty ? (
          <p className="text-spirit-600 italic">
            Start listening — your transcript will appear here. Detected scripture references will be highlighted in gold.
          </p>
        ) : (
          <>
            <span className="text-spirit-200">{transcript}</span>
            {interim && (
              <span className="text-spirit-500 italic"> {interim}</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── ResultsPanel ──────────────────────────────────────────────────────────────

function ResultsPanel({ results = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        <BibleVerseCard placeholder />
        <BibleVerseCard placeholder />
      </div>
    )
  }

  if (results.length === 0) {
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
            Detected scripture references will appear here as you listen.
            <br />
            Try saying <span className="text-spirit-400 italic">"John three sixteen"</span> or <span className="text-spirit-400 italic">"the beatitudes"</span>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {results.map((r, i) => (
        <BibleVerseCard key={i} {...r} />
      ))}
    </div>
  )
}

// ── Recent Lookups (stub — populated by WL3 backend history endpoint) ─────────

function RecentLookups({ history = [] }) {
  if (history.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="label">Recent lookups</p>
      {history.map((item, i) => (
        <div
          key={i}
          className="card-hover px-4 py-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-gold-500" stroke="currentColor" strokeWidth={1.6}>
              <circle cx="7" cy="7" r="5"/><path d="M13 13l-2-2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-spirit-200 text-sm font-medium truncate">{item.reference}</p>
            <p className="text-spirit-500 text-xs truncate mt-0.5">{item.snippet}</p>
          </div>
          <span className="text-spirit-600 text-xs shrink-0">{item.date}</span>
        </div>
      ))}
    </div>
  )
}

// ── DEMO state cycling (LP4 only — removed when WL1 wires real logic) ─────────

const DEMO_CYCLE = ['idle', 'listening', 'processing', 'idle']

// ── WordLookUpPage ────────────────────────────────────────────────────────────

export default function WordLookUpPage() {
  // LP4: local state drives the visual demo. WL1 replaces this with useMicrophone.
  const [micState, setMicState] = useState('idle')
  const [demoStep, setDemoStep] = useState(0)

  // Demo results shown after "processing" to give the layout a workout
  const [demoResults, setDemoResults] = useState([])

  const DEMO_RESULT = {
    reference: 'John 3:16',
    version: 'ESV',
    verseText: '"For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."',
    source: 'api.bible (ESV)',
    matchType: 'exact',
    confidence: 1,
  }

  const handleMicClick = () => {
    // Cycle through states so the UI can be reviewed without real audio
    const next = (demoStep + 1) % DEMO_CYCLE.length
    setDemoStep(next)
    const nextState = DEMO_CYCLE[next]
    setMicState(nextState)

    if (nextState === 'processing') {
      // Simulate a 1.2s lookup then show result
      setTimeout(() => {
        setMicState('idle')
        setDemoResults([DEMO_RESULT])
        setDemoStep(0)
      }, 1200)
    }

    if (nextState === 'idle' && demoStep > 0) {
      setDemoResults([])
    }
  }

  const isListening  = micState === 'listening'
  const isProcessing = micState === 'processing'

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

      {/* ── Mic card ── */}
      <div className="card p-8 flex flex-col items-center gap-6">

        {/* Mic button */}
        <MicButton state={micState} onClick={handleMicClick} />

        {/* Frequency visualiser */}
        <FrequencyBars active={isListening} />

        {/* Status text */}
        <p className={`text-sm text-center transition-colors duration-300 ${
          isListening  ? 'text-flame-400' :
          isProcessing ? 'text-gold-400' :
                         'text-spirit-500'
        }`}>
          {MIC_STATES[micState].label}
        </p>

        {/* Demo hint — remove once WL1 wires real mic */}
        <p className="text-spirit-700 text-xs text-center -mt-2">
          Shell preview — click to cycle states · mic functionality added in WL1
        </p>
      </div>

      {/* ── Transcript box ── */}
      <TranscriptBox
        transcript={demoResults.length > 0 ? 'For God so loved the world, that he gave his only Son…' : ''}
        interim={isListening ? 'and whoever believes in him…' : ''}
        wordCount={demoResults.length > 0 ? 14 : 0}
        onClear={() => setDemoResults([])}
      />

      {/* ── Results ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="label">
            {demoResults.length > 0 ? `${demoResults.length} reference found` : 'Results'}
          </p>
          {demoResults.length > 0 && (
            <button
              onClick={() => setDemoResults([])}
              className="text-xs text-spirit-500 hover:text-spirit-300 transition-colors"
            >
              Clear results
            </button>
          )}
        </div>
        <ResultsPanel results={demoResults} loading={isProcessing} />
      </div>

      {/* ── Saved verses tab (stub — WL4) ── */}
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

      {/* ── Lookup history (stub — WL3) ── */}
      <RecentLookups history={[]} />

      {/* ── How it works callout ── */}
      <div className="card p-5 border-l-2 border-l-gold-500 rounded-r-2xl rounded-l-none space-y-3">
        <p className="label">How it works</p>
        <div className="space-y-2.5 text-sm text-spirit-400 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <span className="text-gold-500 shrink-0 mt-0.5 font-medium">1.</span>
            <span>Your browser transcribes the sermon audio in real time — nothing is sent to a server.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-gold-500 shrink-0 mt-0.5 font-medium">2.</span>
            <span>Detected references (explicit like <em>John 3:16</em> or thematic like <em>the prodigal son</em>) are highlighted in gold.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-gold-500 shrink-0 mt-0.5 font-medium">3.</span>
            <span>Tap any highlight to fetch the full passage in your preferred Bible version.</span>
          </div>
        </div>
      </div>

    </div>
  )
}
