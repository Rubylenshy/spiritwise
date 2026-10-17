import { useCallback, useState } from 'react'

const MODES = ['grid', 'list']
const keyFor = (scope) => `spiritwise-view:${scope}`

/** Grid / list choice for one kind of list (`scope`), remembered per browser. */
export function useViewMode(scope, fallback = 'grid') {
  const [mode, setMode] = useState(() => {
    try {
      const stored = localStorage.getItem(keyFor(scope))
      return MODES.includes(stored) ? stored : fallback
    } catch {
      return fallback
    }
  })

  const change = useCallback((next) => {
    setMode(next)
    try { localStorage.setItem(keyFor(scope), next) } catch { /* not persisted */ }
  }, [scope])

  return [mode, change]
}
