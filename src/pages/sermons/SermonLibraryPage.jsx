import { useState, useCallback } from 'react'
import { useTags } from '../../hooks/useSermons'
import { useDebounce } from '../../hooks/useDebounce'
import { TagPill } from '../../components/ui'
import InfiniteSermonList from '../../components/InfiniteSermonList'

const PAGE_SIZE = 20

export default function SermonLibraryPage() {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  const debouncedQuery = useDebounce(query, 400)

  const { data: tagsData } = useTags()

  const handleSearch = useCallback((e) => {
    setQuery(e.target.value)
  }, [])

  const handleTag = useCallback((slug) => {
    setActiveTag((prev) => prev === slug ? null : slug)
  }, [])

  const tags = tagsData ?? []

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

      <InfiniteSermonList
        params={{
          q: debouncedQuery || undefined,
          tag: activeTag || undefined,
          page_size: PAGE_SIZE,
        }}
        emptySubtitle="Try a different search or tag filter."
      />
    </div>
  )
}
