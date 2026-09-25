import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { useSermons, useTags } from '../hooks/useSermons'
import { useDebounce } from '../hooks/useDebounce'
import { PageLoader, ErrorState, EmptyState, TagPill } from '../components/ui'
import { SermonRow } from '../components/SermonRow'

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
  // ?speaker= comes from the Library's Speakers tab
  const [searchParams, setSearchParams] = useSearchParams()
  const speaker = searchParams.get('speaker') || null

  const PAGE_SIZE = 10
  const debouncedQuery = useDebounce(query, 400)

  const { data: tagsData } = useTags()

  const { data, isLoading, error, refetch } = useSermons({
    q: debouncedQuery || undefined,
    tag: activeTag || undefined,
    speaker: speaker || undefined,
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

  const clearSpeaker = () => {
    setSearchParams({})
    setPage(1)
  }

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
                ? 'bg-accent-500 border-accent-400 text-white font-medium'
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

      {speaker && (
        <div className="flex items-center gap-2">
          <span className="glass rounded-full pl-3 pr-1 py-1 text-xs text-spirit-200 flex items-center gap-1">
            Speaker: <span className="font-medium">{speaker}</span>
            <button
              type="button"
              onClick={clearSpeaker}
              aria-label="Clear speaker filter"
              className="focus-ring rounded-full p-1 text-spirit-500 hover:text-spirit-100 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
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
