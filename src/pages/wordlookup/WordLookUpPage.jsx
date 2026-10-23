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
import { Sparkles } from 'lucide-react'
import { useMicrophone } from '../../hooks/useMicrophone'
import { extractReferences } from '../../lib/bibleParser'
import api from '../../lib/axios'
import MicButton from './components/MicButton'
import FrequencyVisualiser from './components/FrequencyVisualiser'
import HighlightedTranscript from './components/HighlightedTranscript'
import ResultsPanel from './components/ResultsPanel'
import PhraseSearchBox from './components/PhraseSearchBox'
import LookupHistoryPanel from './components/LookupHistoryPanel'
import FileFallback from './components/FileFallback'

const AUTO_LOOKUP_KEY = 'spiritwise-wl-auto-lookup'

function storedAutoLookup() {
  try { return localStorage.getItem(AUTO_LOOKUP_KEY) !== 'off' } catch { return true }
}

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
  const [pendingLookups, setPendingLookups] = useState(0)  // several can run at once (auto-lookup)
  const lookingUp = pendingLookups > 0
  const [autoLookup, setAutoLookup] = useState(storedAutoLookup)
  const autoFetchedRef = useRef(new Set())  // lower-cased queries auto-lookup already ran
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
  // `silent` (auto-lookup) skips the error banner — the user didn't ask for it
  const handleRefClick = useCallback(async (ref, { silent = false } = {}) => {
    if (results.some(r => r.reference?.toLowerCase() === ref.query?.toLowerCase())) return

    setPendingLookups((n) => n + 1)
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
      } else if (!silent) {
        setLookupError(`No verse found for "${ref.query}".`)
        setTimeout(() => setLookupError(null), 4000)
      }
    } catch (err) {
      if (!silent) {
        setLookupError(err.response?.data?.detail ?? 'Lookup failed. Check your connection.')
        setTimeout(() => setLookupError(null), 4000)
      }
    } finally {
      setPendingLookups((n) => n - 1)
      setIsAiLookup(false)
    }
  }, [results])

  // ── Manual phrase/reference search ────────────────────────────────────────
  const handleManualSearch = useCallback(async (input) => {
    setPendingLookups((n) => n + 1)
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
      setPendingLookups((n) => n - 1)
      setIsAiLookup(false)
    }
  }, [])

  // ── Auto-lookup ───────────────────────────────────────────────────────────
  // Exact references ("John 3:16") are fetched as soon as they're in the final
  // transcript — not the interim one, which would fetch "John 3:1" while
  // "John 3:16" is still being spoken. Books and thematic phrases stay
  // tap-to-look-up: a whole book is no useful result, and phrases can cost an
  // AI call each.
  const handleRefClickRef = useRef(handleRefClick)
  handleRefClickRef.current = handleRefClick
  useEffect(() => {
    if (!autoLookup) return
    for (const ref of extractReferences(displayTranscript)) {
      const key = ref.query.toLowerCase()
      if (ref.type !== 'explicit' || autoFetchedRef.current.has(key)) continue
      autoFetchedRef.current.add(key)
      handleRefClickRef.current(ref, { silent: true })
    }
  }, [displayTranscript, autoLookup])

  const toggleAutoLookup = () => {
    setAutoLookup((on) => {
      try { localStorage.setItem(AUTO_LOOKUP_KEY, on ? 'off' : 'on') } catch { /* not persisted */ }
      return !on
    })
  }

  // ── Lookup of text selected in the transcript ────────────────────────────
  // An exact reference inside the selection ("turn to John 3:16 with me")
  // resolves directly; anything else goes to the AI resolver as a phrase.
  const handleSelectionLookup = useCallback((text) => {
    const explicit = extractReferences(text).find((r) => r.type === 'explicit')
    return explicit ? handleRefClick(explicit) : handleManualSearch(text)
  }, [handleRefClick, handleManualSearch])

  // ── History re-select ─────────────────────────────────────────────────────
  const handleHistorySelect = useCallback(async (referenceStr) => {
    setPendingLookups((n) => n + 1)
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
      setPendingLookups((n) => n - 1)
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
    autoFetchedRef.current.clear()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-3xl text-spirit-100">WordLookUp</h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-accent-500/10 border border-accent-500/25 text-accent-500 font-medium">beta</span>
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
            micState === 'processing' ? 'text-accent-400'  :
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

      {/* ── Transcript ───────────────────────────────────────────────────────── */}
      <HighlightedTranscript
        transcript={displayTranscript}
        interimTranscript={displayInterim}
        refs={detectedRefs}
        onRefClick={handleRefClick}
        onSelectionLookup={handleSelectionLookup}
        wordCount={wordCount}
        onClear={handleClear}
      />

      {/* ── Auto-lookup switch ───────────────────────────────────────────────── */}
      <button
        type="button"
        role="switch"
        aria-checked={autoLookup}
        onClick={toggleAutoLookup}
        className="focus-ring rounded-xl w-full flex items-center justify-between gap-4 text-left -mt-4"
      >
        <span>
          <span className="block text-spirit-200 text-sm">Auto look up verses</span>
          <span className="block text-spirit-500 text-xs">Exact references like John 3:16 appear in Results as they&apos;re spoken</span>
        </span>
        <span className={`relative w-10 h-6 rounded-full shrink-0 transition-colors ${autoLookup ? 'bg-accent-500' : 'bg-spirit-700'}`}>
          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${autoLookup ? 'translate-x-4' : ''}`} />
        </span>
      </button>

      {/* ── Detected refs quick-tap list ──────────────────────────────────────── */}
      {detectedRefs.length > 0 && (
        <div className="space-y-2">
          <p className="label">Detected references</p>
          <div className="flex flex-wrap gap-2">
            {detectedRefs.map((ref, i) => (
              <button key={i} onClick={() => handleRefClick(ref)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                  results.some(r => r.reference?.toLowerCase() === ref.query?.toLowerCase())
                    ? 'bg-accent-500/15 border-accent-500/40 text-accent-400'
                    : 'border-spirit-600 text-spirit-400 hover:border-accent-500/40 hover:text-accent-400 hover:bg-accent-500/[0.08]'
                }`}>
                {ref.type === 'thematic' && <Sparkles className="inline w-3.5 h-3.5 mr-1 -mt-0.5 opacity-70 text-accent-500" />}
                {ref.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Manual phrase search ─────────────────────────────────────────────── */}
      <PhraseSearchBox onSearch={handleManualSearch} loading={lookingUp} />

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
        {lookupError && (
          <p className="text-flame-400 text-sm bg-flame-500/10 border border-flame-500/20 rounded-xl px-4 py-3">
            {lookupError}
          </p>
        )}
        <ResultsPanel results={results} isLoading={lookingUp} isAiLoading={isAiLookup} />
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
