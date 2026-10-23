import { useState } from 'react'

export default function PhraseSearchBox({ onSearch, loading }) {
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
