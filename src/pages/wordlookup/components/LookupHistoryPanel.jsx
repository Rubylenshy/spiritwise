import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import api from '../../../lib/axios'

export default function LookupHistoryPanel({ onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['wordlookup-history', search],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: pageParam, page_size: 10 })
      if (search) params.set('q', search)
      const { data } = await api.get(`/wordlookup/history/?${params}`)
      return data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      const url = new URL(lastPage.next)
      return parseInt(url.searchParams.get('page') || '2', 10)
    },
    staleTime: 1000 * 30,
  })

  const allItems = data?.pages.flatMap(p => p.results ?? []) ?? []
  const totalCount = data?.pages[0]?.count ?? 0

  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="label">Recent lookups</p>
        <div className="card p-4 animate-pulse space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="h-4 w-24 bg-spirit-700 rounded" />
              <div className="h-4 flex-1 bg-spirit-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (allItems.length === 0 && !search) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="label">Recent lookups {totalCount > 0 && <span className="normal-case font-mono text-spirit-600">({totalCount})</span>}</p>
        {allItems.length > 3 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs text-spirit-500 hover:text-spirit-300 transition-colors"
          >
            {expanded ? 'Show less' : `Show all ${totalCount}`}
          </button>
        )}
      </div>

      {/* Search within history */}
      {(expanded || totalCount > 5) && (
        <div className="relative">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-spirit-500 pointer-events-none" stroke="currentColor" strokeWidth={1.6}>
            <circle cx="7" cy="7" r="5"/><path d="M13 13l-3-3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lookups…"
            className="input-field text-xs pl-8 py-2"
          />
        </div>
      )}

      <div className="card overflow-hidden divide-y divide-spirit-700/60">
        {(expanded ? allItems : allItems.slice(0, 3)).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.reference_found || item.query)}
            className="w-full flex items-start justify-between px-4 py-3.5 hover:bg-spirit-700/30 transition-colors text-left gap-4 group"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-spirit-200 text-sm font-medium truncate">
                  {item.reference_found || item.query}
                </p>
                {item.match_type === 'inferred' && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-500 shrink-0">
                    AI
                  </span>
                )}
              </div>
              {item.verse_snippet && (
                <p className="text-spirit-500 text-xs mt-0.5 line-clamp-1 italic">
                  {item.verse_snippet}
                </p>
              )}
              <p className="text-spirit-700 text-xs mt-1">
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              <span className="text-xs text-spirit-600 bg-spirit-800 border border-spirit-700 px-2 py-0.5 rounded-full">
                {item.version}
              </span>
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-spirit-700 group-hover:text-spirit-500 transition-colors" stroke="currentColor" strokeWidth={1.6}>
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        ))}

        {/* Load more */}
        {expanded && hasNextPage && (
          <div className="px-4 py-3 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-xs text-spirit-400 hover:text-spirit-200 transition-colors flex items-center gap-2"
            >
              {isFetchingNextPage ? (
                <><svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/></svg>Loading…</>
              ) : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
