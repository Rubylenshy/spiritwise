import { highlightTranscript } from '../../../lib/bibleParser'

export default function HighlightedTranscript({ transcript, interimTranscript, refs, onRefClick, wordCount, onClear }) {
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
      <div className="min-h-36 max-h-60 overflow-y-auto p-4 text-sm leading-relaxed font-sans">
        {isEmpty ? (
          <p className="text-spirit-600 italic">
            Start listening — your transcript will appear here. Detected scripture references
            will be highlighted in blue. Tap any highlight to look it up.
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
    </div>
  )
}
