/**
 * Client-side sermon metadata detection for the import page.
 *
 * Reads embedded audio tags (ID3 / MP4 / Vorbis) in the browser — only the
 * header bytes are touched, nothing is uploaded — and falls back to patterns in
 * the filename, e.g.
 *   "Abrahamic Algorithm_3_(1SV.11.01.2026).mp3"
 *     → title "Abrahamic Algorithm 3", date 2026-01-11
 *   "Apostle Jane Doe – The Blessing of Abraham - 18012026SundayService.mp3"
 *     → speaker "Apostle Jane Doe", title "The Blessing of Abraham", date 2026-01-18
 *
 * Numeric dates without a 4-digit-year-first layout are read day-first (DD.MM.YYYY).
 */

const HONORIFIC = /^(apostle|pastor|pst|rev(erend)?|(arch)?bishop|dr|prophet(ess)?|evangelist|elder|deacon(ess)?|minister|min|bro(ther)?|sis(ter)?|mr|mrs|ms|prof|father|fr|mother|rabbi)\.?\s/i

// Spaced dashes separate "Speaker – Title - Service"; unspaced ones are part of words.
const SEPARATOR = /\s+[-–—]\s+/

const DATE_PATTERNS = [
  { re: /(?<!\d)(\d{4})[-._](\d{1,2})[-._](\d{1,2})(?!\d)/, order: 'ymd' },
  { re: /(?<!\d)(\d{1,2})[-._](\d{1,2})[-._](\d{4})(?!\d)/, order: 'dmy' },
  { re: /(?<!\d)(20\d{2})(\d{2})(\d{2})(?!\d)/, order: 'ymd' },
  { re: /(?<!\d)(\d{2})(\d{2})(20\d{2})(?!\d)/, order: 'dmy' },
]

function isoDate(y, m, d) {
  const date = new Date(Date.UTC(+y, +m - 1, +d))
  if (date.getUTCFullYear() !== +y || date.getUTCMonth() !== +m - 1 || date.getUTCDate() !== +d) return ''
  return date.toISOString().slice(0, 10)
}

function findDate(text) {
  for (const { re, order } of DATE_PATTERNS) {
    const m = text.match(re)
    if (!m) continue
    const date = order === 'ymd' ? isoDate(m[1], m[2], m[3]) : isoDate(m[3], m[2], m[1])
    if (date) return { date, match: m[0] }
  }
  return { date: '', match: '' }
}

const tidy = s => s.replace(/_/g, ' ').replace(/\s+/g, ' ').replace(/^[\s.,-]+|[\s.,-]+$/g, '')

export function parseFilename(name) {
  const stem = name.replace(/\.[^/.]+$/, '')
  const { date, match } = findDate(stem)

  // Drop bracketed service codes like "(SS.04.01.2026)" — anything bracketed with a digit in it.
  const cleaned = stem.replace(/[([][^)\]]*\d[^)\]]*[)\]]/g, ' ')

  // Strip the date from its segment; a segment that's one token glued to the date
  // ("18012026SundayService") is a service code, not a title.
  const segments = cleaned.split(SEPARATOR)
    .map(tidy)
    .map(s => (match && s.includes(match) ? (/\s/.test(s) ? tidy(s.replace(match, ' ')) : '') : s))
    .filter(Boolean)

  let speaker = ''
  if (segments.length > 1 && HONORIFIC.test(segments[0])) speaker = segments.shift()

  let title = segments[0] ?? ''
  // Slug-style names ("walking-in-purpose") use dashes as spaces.
  if (!/\s/.test(title)) title = title.replace(/-/g, ' ')

  return { title: tidy(title) || tidy(stem), speaker, date }
}

async function readTags(file) {
  try {
    const { parseBlob } = await import('music-metadata')
    const { common } = await parseBlob(file, { duration: false, skipCovers: true })
    const tagDate = typeof common.date === 'string' ? common.date.slice(0, 10) : ''
    return {
      title: common.title?.trim() ?? '',
      speaker: common.artist?.trim() ?? '',
      // The album names the series the sermon belongs to.
      album: common.album?.trim() ?? '',
      // Year-only tags aren't useful for a sermon date.
      date: /^\d{4}-\d{2}-\d{2}$/.test(tagDate) ? tagDate : '',
    }
  } catch {
    return { title: '', speaker: '', album: '', date: '' }
  }
}

/**
 * Best-guess { title, speaker, album, date } for an audio file: tags first,
 * filename as fallback (album comes from tags only).
 */
export async function detectAudioMeta(file) {
  const fromName = parseFilename(file.name)
  const tags = await readTags(file)
  return {
    title: tags.title || fromName.title,
    speaker: tags.speaker || fromName.speaker,
    album: tags.album,
    date: tags.date || fromName.date,
  }
}
