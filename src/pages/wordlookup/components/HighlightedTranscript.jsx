import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { highlightTranscript } from '../../../lib/bibleParser'

// Selections outside this range are ignored — a word or two is too vague even
// for the AI resolver, and long passages aren't a single reference.
const SELECTION_MIN = 3
const SELECTION_MAX = 300

// Words either side of a tapped word that a tap selects. Live transcripts
// rarely have punctuation, so a "sentence" is this window, cut short at any
// sentence break that is there.
const TAP_PHRASE_RADIUS = 6

function caretFromPoint(x, y) {
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y)
    return pos && { node: pos.offsetNode, offset: pos.offset }
  }
  const range = document.caretRangeFromPoint?.(x, y)
  return range && { node: range.startContainer, offset: range.startOffset }
}

/** Selects the phrase around the point (x, y) inside `container`, as a real selection. */
function selectPhraseAt(container, x, y) {
  const caret = caretFromPoint(x, y)
  if (!caret || caret.node.nodeType !== Node.TEXT_NODE || !container.contains(caret.node)) return

  // The container's text as one string, with where each text node starts in it
  const nodes = []
  let full = ''
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push({ node: n, start: full.length })
    full += n.textContent
  }
  const at = nodes.find((n) => n.node === caret.node).start + caret.offset

  // Bounded by the surrounding sentence breaks, if any…
  const before = full.slice(0, at)
  const prevBreak = Math.max(before.lastIndexOf('. '), before.lastIndexOf('? '), before.lastIndexOf('! '))
  const lo = prevBreak === -1 ? 0 : prevBreak + 2
  const nextBreak = /[.?!](\s|$)/.exec(full.slice(at))
  const sentenceEnd = nextBreak ? at + nextBreak.index + 1 : full.length

  // …then to TAP_PHRASE_RADIUS words either side of the tapped one
  const words = [...full.slice(lo, sentenceEnd).matchAll(/\S+/g)]
    .map((m) => ({ start: lo + m.index, end: lo + m.index + m[0].length }))
  if (!words.length) return
  let hit = words.findIndex((w) => at <= w.end)
  if (hit === -1) hit = words.length - 1
  const first = words[Math.max(0, hit - TAP_PHRASE_RADIUS)]
  const last = words[Math.min(words.length - 1, hit + TAP_PHRASE_RADIUS)]

  const point = (offset) => {
    const n = [...nodes].reverse().find((t) => t.start <= offset)
    return [n.node, Math.min(offset - n.start, n.node.textContent.length)]
  }
  const range = document.createRange()
  range.setStart(...point(first.start))
  range.setEnd(...point(last.end))
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}

// Half the "Look up selection" button's width, to keep it inside the card
const LOOKUP_BUTTON_HALF_WIDTH = 80

/**
 * Tracks a text selection inside `containerRef` and where to show the
 * "Look up" button for it (just above the selection, relative to the
 * container's offset parent, whose overflow would clip it below the last line). A collapsed selection doesn't clear it: on
 * touch, tapping the button collapses the selection before the click lands.
 */
function useTranscriptSelection(containerRef) {
  const [selection, setSelection] = useState(null)  // { text, top, left }

  useEffect(() => {
    const onChange = () => {
      const sel = window.getSelection()
      const container = containerRef.current
      if (!sel || sel.isCollapsed || !sel.rangeCount || !container) return
      const range = sel.getRangeAt(0)
      if (!container.contains(range.commonAncestorContainer)) return
      const text = sel.toString().replace(/\s+/g, ' ').trim()
      if (text.length < SELECTION_MIN || text.length > SELECTION_MAX) {
        setSelection(null)
        return
      }
      const rect = range.getBoundingClientRect()
      const parent = container.offsetParent?.getBoundingClientRect() ?? { top: 0, left: 0, width: window.innerWidth }
      const center = rect.left - parent.left + rect.width / 2
      setSelection({
        text,
        top: rect.top - parent.top - 6,
        left: Math.min(Math.max(center, LOOKUP_BUTTON_HALF_WIDTH), parent.width - LOOKUP_BUTTON_HALF_WIDTH),
      })
    }
    document.addEventListener('selectionchange', onChange)
    return () => document.removeEventListener('selectionchange', onChange)
  }, [containerRef])

  return [selection, setSelection]
}

export default function HighlightedTranscript({ transcript, interimTranscript, refs, onRefClick, onSelectionLookup, wordCount, onClear }) {
  const segments = highlightTranscript(transcript, refs)
  const isEmpty = !transcript && !interimTranscript
  const textRef = useRef(null)
  const buttonRef = useRef(null)
  const [selection, setSelection] = useTranscriptSelection(textRef)

  // Dismiss on a press anywhere but the button (a new selection re-opens it)
  useEffect(() => {
    if (!selection) return
    const onDown = (e) => { if (!buttonRef.current?.contains(e.target)) setSelection(null) }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [selection, setSelection])

  // A plain tap (not a drag-selection, not a highlighted reference) selects
  // the phrase around it, so a phone user never has to drag handles
  const handleTextClick = (e) => {
    if (e.target.closest('button')) return
    if (!window.getSelection()?.isCollapsed) return
    selectPhraseAt(textRef.current, e.clientX, e.clientY)
  }

  const lookUpSelection = () => {
    onSelectionLookup(selection.text)
    setSelection(null)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <div className="card overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-spirit-700 bg-spirit-800/50">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-spirit-500" stroke="currentColor" strokeWidth={1.6}>
            <path d="M2 4h12M2 8h9M2 12h6" strokeLinecap="round"/>
          </svg>
          <span className="text-spirit-500 text-xs uppercase tracking-widest">Transcript</span>
          {refs.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-500/10 border border-accent-500/25 text-accent-500">
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
      <div
        ref={textRef}
        onScroll={() => selection && setSelection(null)}
        onClick={isEmpty ? undefined : handleTextClick}
        className="min-h-36 max-h-60 overflow-y-auto p-4 text-sm leading-relaxed font-sans"
      >
        {isEmpty ? (
          <p className="text-spirit-600 italic">
            Start listening — your transcript will appear here. Detected scripture references
            will be highlighted in blue. Tap any highlight to look it up, or tap anywhere
            else in the transcript to look up that phrase.
          </p>
        ) : (
          <p>
            {segments.map((seg, i) =>
              seg.highlighted ? (
                <button key={i} onClick={() => onRefClick(seg.ref)}
                  className="text-accent-400 bg-accent-500/15 border border-accent-500/30 px-1.5 py-0.5 rounded font-medium hover:bg-accent-500/25 transition-colors cursor-pointer mx-0.5"
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

      {selection && (
        <button
          ref={buttonRef}
          type="button"
          // Keep the selection alive while pressing (desktop)
          onMouseDown={(e) => e.preventDefault()}
          onClick={lookUpSelection}
          style={{ top: selection.top, left: selection.left }}
          className="focus-ring absolute z-10 -translate-x-1/2 -translate-y-full max-w-[calc(100%-2rem)] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-500 text-white text-xs font-medium shadow-lg shadow-accent-500/20 animate-fade-in"
          title={`Look up: ${selection.text}`}
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="truncate">Look up selection</span>
        </button>
      )}
    </div>
  )
}
