import BibleVerseCard from './BibleVerseCard'
import ResultCard from './ResultCard'

export default function ResultsPanel({ results, isLoading, isAiLoading }) {
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
        <div className="card p-4 flex items-center gap-3 border-accent-500/20 bg-accent-500/[0.03]">
          <div className="w-8 h-8 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-accent-400" stroke="currentColor" strokeWidth={1.5}>
              <polygon points="8 1 10 6 15 6 11 10 13 15 8 12 3 15 5 10 1 6 6 6"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-accent-400 text-xs font-medium">Asking Claude to identify this passage…</p>
            <p className="text-spirit-500 text-xs mt-0.5">Claude identifies references — the Bible API fetches the text</p>
          </div>
          <svg className="w-4 h-4 animate-spin text-accent-500 shrink-0" viewBox="0 0 24 24" fill="none">
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
