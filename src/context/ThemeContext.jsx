import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * ThemeProvider — light / dark / system theme, persisted to localStorage.
 *
 * Toggles the `dark` class on <html> (Tailwind `darkMode: 'class'`). An inline
 * script in index.html applies the same class before first paint, so keep the
 * storage key and default in sync with it.
 *
 * Scope: only the landing page uses `dark:` variants and renders the toggle;
 * app pages (RootLayout tree) are dark-only until they migrate to the tokens.
 */

const STORAGE_KEY = 'spiritwise-theme'
const DEFAULT_THEME = 'dark'
const THEMES = ['light', 'dark', 'system']

const ThemeContext = createContext(null)

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme)
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches)

  useEffect(() => {
    const mq = darkQuery()
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage unavailable (private mode etc.) — theme still applies for this session
    }
  }, [])

  const toggle = useCallback(
    () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    [resolvedTheme, setTheme]
  )

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggle }),
    [theme, resolvedTheme, setTheme, toggle]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
