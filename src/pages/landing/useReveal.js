import { useEffect, useRef, useState } from 'react'

/**
 * Staggered entry animation for landing sections.
 *
 * Elements start at `opacity-0 translate-y-6` and settle once the section
 * scrolls into view (or immediately with `immediate`, used above the fold).
 * Stagger: 80ms between shells (section-level blocks), 90ms between
 * sub-elements inside a shell.
 */

export const SHELL_STEP_MS = 80
export const ITEM_STEP_MS = 90

export function useReveal({ threshold = 0.1, immediate = false } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (immediate || typeof IntersectionObserver === 'undefined') {
      const id = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(id)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, immediate])

  return [ref, visible]
}

/** Classes for a revealing element. Put hover transitions on a child, not here — the delay would apply to them too. */
export function revealClass(visible) {
  return `transition-all duration-700 ease-out motion-reduce:transition-none ${
    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
  }`
}

export function revealDelay(index, step = ITEM_STEP_MS) {
  return { transitionDelay: `${index * step}ms` }
}
