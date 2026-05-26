/**
 * useMicrophone — WL1
 *
 * Wraps window.SpeechRecognition (+ webkit prefix) for continuous
 * real-time sermon transcription.
 *
 * States:
 *   idle        → ready, not listening
 *   requesting  → asking for mic permission
 *   listening   → actively transcribing
 *   processing  → stopped, results being finalized
 *   error       → permission denied or API unsupported
 *
 * Returns:
 *   {
 *     start, stop,
 *     transcript,        // final confirmed text (accumulates)
 *     interimTranscript, // current partial result (resets each phrase)
 *     isListening,
 *     state,
 *     error,
 *     isSupported,
 *     analyserNode,      // Web Audio API AnalyserNode for the visualiser
 *     clearTranscript,
 *   }
 */

import { useState, useRef, useCallback, useEffect } from 'react'

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

export function useMicrophone({ lang = 'en-US', continuous = true } = {}) {
  const [state, setState] = useState('idle')         // idle | requesting | listening | processing | error
  const [transcript, setTranscript] = useState('')   // accumulated final text
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)
  const [analyserNode, setAnalyserNode] = useState(null)

  const recognitionRef = useRef(null)
  const audioCtxRef = useRef(null)
  const streamRef = useRef(null)
  const finalBufferRef = useRef('')  // mirrors transcript state for use inside callbacks

  const isSupported = !!SpeechRecognition

  // ── Tear down Web Audio resources ──────────────────────────────────────────
  const teardownAudio = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    setAnalyserNode(null)
  }, [])

  // ── Build the Web Audio analyser (powers the frequency visualiser) ─────────
  const setupAnalyser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      audioCtxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)

      setAnalyserNode(analyser)
    } catch {
      // Non-fatal — visualiser just won't animate
      setAnalyserNode(null)
    }
  }, [])

  // ── start ──────────────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge, or use the file upload fallback below.')
      setState('error')
      return
    }

    if (state === 'listening') return

    setState('requesting')
    setError(null)

    // Build analyser (gets mic permission as a side effect)
    await setupAnalyser()

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => {
      setState('listening')
    }

    recognition.onresult = (event) => {
      let interim = ''
      let newFinal = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          newFinal += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (newFinal) {
        const updated = finalBufferRef.current
          ? finalBufferRef.current + ' ' + newFinal.trim()
          : newFinal.trim()
        finalBufferRef.current = updated
        setTranscript(updated)
      }

      setInterimTranscript(interim)
    }

    recognition.onerror = (event) => {
      const msg =
        event.error === 'not-allowed'
          ? 'Microphone access was denied. Please allow microphone access and try again.'
          : event.error === 'no-speech'
          ? null  // silence is fine — don't surface as error
          : `Speech recognition error: ${event.error}`

      if (msg) {
        setError(msg)
        setState('error')
        teardownAudio()
      }
    }

    recognition.onend = () => {
      // Restart automatically in continuous mode unless we asked to stop
      if (recognitionRef.current && state !== 'idle') {
        try {
          recognition.start()
        } catch {
          // Already stopped intentionally
          setState('idle')
          teardownAudio()
        }
      }
      setInterimTranscript('')
    }

    try {
      recognition.start()
    } catch (e) {
      setError('Could not start speech recognition. Please try again.')
      setState('error')
      teardownAudio()
    }
  }, [isSupported, state, lang, continuous, setupAnalyser, teardownAudio])

  // ── stop ───────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    setState('processing')
    if (recognitionRef.current) {
      recognitionRef.current.onend = null  // prevent auto-restart
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setInterimTranscript('')
    teardownAudio()
    // Brief "processing" state then back to idle
    setTimeout(() => setState('idle'), 600)
  }, [teardownAudio])

  // ── clearTranscript ────────────────────────────────────────────────────────
  const clearTranscript = useCallback(() => {
    finalBufferRef.current = ''
    setTranscript('')
    setInterimTranscript('')
  }, [])

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      teardownAudio()
    }
  }, [teardownAudio])

  return {
    start,
    stop,
    transcript,
    interimTranscript,
    isListening: state === 'listening',
    state,
    error,
    isSupported,
    analyserNode,
    clearTranscript,
  }
}
