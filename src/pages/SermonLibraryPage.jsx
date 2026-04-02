import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSermons, useTags } from '../hooks/useSermons'
import { useDebounce } from '../hooks/useDebounce'
import { PageLoader, ErrorState, EmptyState, TagPill } from '../components/ui'

function SermonRow({ sermon }) {
  const tag = sermon.tags?.[0]

  return (
    <Link to={`/sermons/${sermon.id}`} className="card-hover px-5 py-4 flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-full bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0 group-hover:bg-gold-500 group-hover:border-gold-400 transition-all duration-200">
        <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:text-spirit-900 text-gold-400 transition-colors" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-spirit-100 font-medium text-sm truncate">{sermon.title}</p>
        <p className="text-spirit-400 text-xs mt-0.5 truncate">{sermon.speaker} · {sermon.series_title}</p>
        {sermon.scripture_reference && (
          <p className="text-spirit-600 text-xs mt-0.5 italic">{sermon.scripture_reference}</p>
        )}
      </div>

      {tag && (
        <span className="hidden sm:block shrink-0">
          <TagPill tag={tag} />
        </span>
      )}

      <span className="text-spirit-500 text-xs font-mono shrink-0 w-12 text-right">
        {sermon.duration_display}
      </span>
    </Link>
  )
}

function Pagination({ count, pageSize, currentPage, onPage }) {
  const totalPages = Math.ceil(count / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={() => onPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-ghost text-sm px-3 py-2 disabled:opacity-30"
      >
        ← Prev
      </button>
      <span className="text-spirit-400 text-sm px-2">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-ghost text-sm px-3 py-2 disabled:opacity-30"
      >
        Next →
      </button>
    </div>
  )
}

export default function SermonLibraryPage() {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 10
  const debouncedQuery = useDebounce(query, 400)

  const { data: tagsData } = useTags()

  const { data, isLoading, error, refetch } = useSermons({
    q: debouncedQuery || undefined,
    tag: activeTag || undefined,
    page,
    page_size: PAGE_SIZE,
  })

  const handleSearch = useCallback((e) => {
    setQuery(e.target.value)
    setPage(1)
  }, [])

  const handleTag = useCallback((slug) => {
    setActiveTag((prev) => prev === slug ? null : slug)
    setPage(1)
  }, [])

  const tags = tagsData ?? []
  const sermons = data?.results ?? []
  const count = data?.count ?? 0

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 animate-slide-up">
      {/* Search */}
      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
          className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-spirit-500 pointer-events-none">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={handleSearch}
          placeholder="Search sermons, speakers, series…"
          className="input-field pl-10"
        />
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleTag(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
              !activeTag
                ? 'bg-gold-500 border-gold-400 text-spirit-900 font-medium'
                : 'border-spirit-600 text-spirit-400 hover:border-spirit-500 hover:text-spirit-200'
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <TagPill
              key={tag.id}
              tag={tag}
              active={activeTag === tag.slug}
              onClick={() => handleTag(tag.slug)}
            />
          ))}
        </div>
      )}

      {/* Count */}
      {!isLoading && (
        <p className="label">{count} sermon{count !== 1 ? 's' : ''}</p>
      )}

      {/* List */}
      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message="Could not load sermons." onRetry={refetch} />
      ) : sermons.length === 0 ? (
        <EmptyState title="No sermons found" subtitle="Try a different search or tag filter." />
      ) : (
        <>
          <div className="space-y-2">
            {sermons.map((s) => <SermonRow key={s.id} sermon={s} />)}
          </div>
          <Pagination
            count={count}
            pageSize={PAGE_SIZE}
            currentPage={page}
            onPage={setPage}
          />
        </>
      )}
    </div>
  )
}
