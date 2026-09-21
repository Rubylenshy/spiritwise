import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { resolvedTheme, toggle } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`lp-icon-btn w-9 h-9 ${className}`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
