/**
 * Seconds → "m:ss" under an hour, "h:mm:ss" from an hour up.
 * Used for sermon lengths and player times alike so the numbers always match.
 */
export function formatDuration(seconds) {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

/** "Good morning" / "Good afternoon" / "Good evening" for the browser's local time. */
export function greetingFor(date = new Date()) {
  const hour = date.getHours()
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}
