import { useState, useEffect } from 'react'

const VERSIONS = ['ESV', 'NIV', 'KJV', 'NKJV', 'NLT']

export default function BibleVerseCard({
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
            <svg className="w-3.5 h-3.5 animate-spin text-accent-400" viewBox="0 0 24 24" fill="none">
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
        ? 'border-accent-500/25 bg-accent-500/[0.02]'
        : 'border-spirit-700'
    }`}>

      {/* ── Header row ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-spirit-100 font-medium text-sm shrink-0">{reference}</span>

          {/* Match type badge */}
          {isInferred ? (
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-500/10 border border-accent-500/25 text-accent-500 shrink-0">
                AI suggested
              </span>
              {/* Confidence bar */}
              {confidence < 1 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-spirit-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        confidence > 0.8 ? 'bg-accent-500' :
                        confidence > 0.6 ? 'bg-accent-600' : 'bg-spirit-500'
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
      <blockquote className="font-display text-lg text-spirit-200 leading-relaxed border-l-2 border-l-accent-500/60 pl-4">
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
              <><svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-accent-400" stroke="currentColor" strokeWidth={2}><path d="M3 8l4 4 6-7" strokeLinecap="round" strokeLinejoin="round"/></svg><span className="text-accent-400">Copied</span></>
            ) : (
              <><svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={1.6}><rect x="5" y="5" width="8" height="9" rx="1.5"/><path d="M3 10V3.5A1.5 1.5 0 014.5 2H11" strokeLinecap="round"/></svg>Copy</>
            )}
          </button>
          <a
            href={bibleGatewayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-spirit-400 hover:text-accent-400 transition-colors px-2 py-1 rounded-lg hover:bg-spirit-700"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={1.6}><path d="M10 3h3v3M13 3l-6 6M7 4H4a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Open in Bible
          </a>
        </div>
      </div>
    </div>
  )
}
