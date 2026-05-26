/**
 * bibleParser.js — WL1
 *
 * Client-side Bible reference extractor.
 * Runs entirely in the browser — no API calls.
 *
 * Detects three types:
 *   'explicit'  → "John 3:16", "Genesis 1 verse 1", "the book of Romans chapter 8"
 *   'book'      → "the book of Psalms", "turn to Isaiah"
 *   'thematic'  → "the beatitudes", "the prodigal son", "the feeding of five thousand"
 *
 * Returns:
 *   Array of {
 *     type:      'explicit' | 'book' | 'thematic',
 *     raw:       string,          // the matched text as it appeared
 *     book:      string | null,   // canonical book name
 *     chapter:   number | null,
 *     verse:     number | null,
 *     verseEnd:  number | null,   // for ranges like "verses 3 to 7"
 *     query:     string,          // what to send to the Bible API
 *   }
 */

// ── Book name table ───────────────────────────────────────────────────────────
// Maps every common spoken/written variant to a canonical name.

const BOOK_MAP = {
  // Old Testament
  genesis: 'Genesis', gen: 'Genesis',
  exodus: 'Exodus', exo: 'Exodus', exod: 'Exodus',
  leviticus: 'Leviticus', lev: 'Leviticus',
  numbers: 'Numbers', num: 'Numbers',
  deuteronomy: 'Deuteronomy', deut: 'Deuteronomy', deu: 'Deuteronomy',
  joshua: 'Joshua', josh: 'Joshua',
  judges: 'Judges', judg: 'Judges',
  ruth: 'Ruth',
  'first samuel': '1 Samuel', '1 samuel': '1 Samuel', '1samuel': '1 Samuel',
  'second samuel': '2 Samuel', '2 samuel': '2 Samuel', '2samuel': '2 Samuel',
  'first kings': '1 Kings', '1 kings': '1 Kings',
  'second kings': '2 Kings', '2 kings': '2 Kings',
  'first chronicles': '1 Chronicles', '1 chronicles': '1 Chronicles',
  'second chronicles': '2 Chronicles', '2 chronicles': '2 Chronicles',
  ezra: 'Ezra',
  nehemiah: 'Nehemiah', neh: 'Nehemiah',
  esther: 'Esther', esth: 'Esther',
  job: 'Job',
  psalms: 'Psalms', psalm: 'Psalms', psa: 'Psalms', ps: 'Psalms',
  proverbs: 'Proverbs', prov: 'Proverbs', pro: 'Proverbs',
  ecclesiastes: 'Ecclesiastes', eccl: 'Ecclesiastes', ecc: 'Ecclesiastes',
  'song of solomon': 'Song of Solomon', 'song of songs': 'Song of Solomon',
  'songs': 'Song of Solomon',
  isaiah: 'Isaiah', isa: 'Isaiah',
  jeremiah: 'Jeremiah', jer: 'Jeremiah',
  lamentations: 'Lamentations', lam: 'Lamentations',
  ezekiel: 'Ezekiel', ezek: 'Ezekiel',
  daniel: 'Daniel', dan: 'Daniel',
  hosea: 'Hosea', hos: 'Hosea',
  joel: 'Joel',
  amos: 'Amos',
  obadiah: 'Obadiah', obad: 'Obadiah',
  jonah: 'Jonah', jon: 'Jonah',
  micah: 'Micah', mic: 'Micah',
  nahum: 'Nahum', nah: 'Nahum',
  habakkuk: 'Habakkuk', hab: 'Habakkuk',
  zephaniah: 'Zephaniah', zeph: 'Zephaniah',
  haggai: 'Haggai', hag: 'Haggai',
  zechariah: 'Zechariah', zech: 'Zechariah',
  malachi: 'Malachi', mal: 'Malachi',

  // New Testament
  matthew: 'Matthew', matt: 'Matthew', mat: 'Matthew',
  mark: 'Mark', mrk: 'Mark',
  luke: 'Luke', luk: 'Luke',
  john: 'John', jn: 'John',
  acts: 'Acts',
  romans: 'Romans', rom: 'Romans',
  'first corinthians': '1 Corinthians', '1 corinthians': '1 Corinthians',
  'second corinthians': '2 Corinthians', '2 corinthians': '2 Corinthians',
  galatians: 'Galatians', gal: 'Galatians',
  ephesians: 'Ephesians', eph: 'Ephesians',
  philippians: 'Philippians', phil: 'Philippians', php: 'Philippians',
  colossians: 'Colossians', col: 'Colossians',
  'first thessalonians': '1 Thessalonians', '1 thessalonians': '1 Thessalonians',
  'second thessalonians': '2 Thessalonians', '2 thessalonians': '2 Thessalonians',
  'first timothy': '1 Timothy', '1 timothy': '1 Timothy',
  'second timothy': '2 Timothy', '2 timothy': '2 Timothy',
  titus: 'Titus', tit: 'Titus',
  philemon: 'Philemon', phlm: 'Philemon',
  hebrews: 'Hebrews', heb: 'Hebrews',
  james: 'James', jas: 'James',
  'first peter': '1 Peter', '1 peter': '1 Peter',
  'second peter': '2 Peter', '2 peter': '2 Peter',
  'first john': '1 John', '1 john': '1 John',
  'second john': '2 John', '2 john': '2 John',
  'third john': '3 John', '3 john': '3 John',
  jude: 'Jude',
  revelation: 'Revelation', rev: 'Revelation',
}

// Sorted longest-first so multi-word names match before abbreviations
const BOOK_KEYS_SORTED = Object.keys(BOOK_MAP).sort((a, b) => b.length - a.length)

function canonicalBook(raw) {
  const cleaned = raw.toLowerCase().replace(/\s+/g, ' ').trim()
  return BOOK_MAP[cleaned] || null
}

// ── Number word → integer ─────────────────────────────────────────────────────
const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100, 'hundred and': 100,
}

function wordToNum(str) {
  if (!str) return null
  const n = parseInt(str, 10)
  if (!isNaN(n)) return n
  return NUMBER_WORDS[str.toLowerCase()] ?? null
}

// ── Thematic phrase dictionary ─────────────────────────────────────────────────
// Maps spoken phrases to a Bible API query string.
const THEMATIC = [
  { phrase: /\bthe (?:sermon on the mount|beatitudes)\b/i, query: 'Matthew 5:1-12', book: 'Matthew', chapter: 5, verse: 1 },
  { phrase: /\bthe prodigal son\b/i,                        query: 'Luke 15:11-32',  book: 'Luke',    chapter: 15, verse: 11 },
  { phrase: /\bfeeding (?:of )?(?:the )?five thousand\b/i,  query: 'Matthew 14:13-21', book: 'Matthew', chapter: 14, verse: 13 },
  { phrase: /\bthe good samaritan\b/i,                      query: 'Luke 10:25-37', book: 'Luke',    chapter: 10, verse: 25 },
  { phrase: /\bthe lord(?:'s)? prayer\b/i,                  query: 'Matthew 6:9-13', book: 'Matthew', chapter: 6, verse: 9 },
  { phrase: /\bthe ten commandments\b/i,                    query: 'Exodus 20:1-17', book: 'Exodus',  chapter: 20, verse: 1 },
  { phrase: /\bthe valley of (?:the )?shadow\b/i,           query: 'Psalm 23',       book: 'Psalms',  chapter: 23, verse: null },
  { phrase: /\bthe shepherd(?:'s)? psalm\b/i,               query: 'Psalm 23',       book: 'Psalms',  chapter: 23, verse: null },
  { phrase: /\bthe armou?r of god\b/i,                      query: 'Ephesians 6:10-18', book: 'Ephesians', chapter: 6, verse: 10 },
  { phrase: /\bfaith (?:the size of (?:a )?)mustard seed\b/i, query: 'Matthew 17:20', book: 'Matthew', chapter: 17, verse: 20 },
  { phrase: /\bwalking on (?:the )?water\b/i,               query: 'Matthew 14:22-33', book: 'Matthew', chapter: 14, verse: 22 },
  { phrase: /\blazarus\b/i,                                 query: 'John 11:1-44',   book: 'John',    chapter: 11, verse: 1 },
  { phrase: /\bthe (?:great )?commission\b/i,               query: 'Matthew 28:16-20', book: 'Matthew', chapter: 28, verse: 16 },
  { phrase: /\bthe last supper\b/i,                         query: 'Luke 22:14-20',  book: 'Luke',    chapter: 22, verse: 14 },
  { phrase: /\bthe transfiguration\b/i,                     query: 'Matthew 17:1-9', book: 'Matthew', chapter: 17, verse: 1 },
  { phrase: /\bthe (?:great )?flood\b/i,                    query: 'Genesis 6:9-22', book: 'Genesis', chapter: 6, verse: 9 },
  { phrase: /\bthe (?:burning bush|burning)\b/i,            query: 'Exodus 3:1-6',   book: 'Exodus',  chapter: 3, verse: 1 },
  { phrase: /\bthe resurrection\b/i,                        query: 'John 20:1-18',   book: 'John',    chapter: 20, verse: 1 },
  { phrase: /\bthe (?:nativity|birth of jesus)\b/i,         query: 'Luke 2:1-20',    book: 'Luke',    chapter: 2, verse: 1 },
]

// ── Build book-detection regex from table ─────────────────────────────────────
// Matches patterns like: "John 3:16", "John chapter 3 verse 16",
// "the book of John 3", "turn to Romans 8"
function buildExplicitPattern() {
  // Escape special regex chars in book names
  const bookAlts = BOOK_KEYS_SORTED
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')

  // Number pattern: digits OR number words
  const numPat = '(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty(?:[- ]?\\w+)?|thirty(?:[- ]?\\w+)?|forty(?:[- ]?\\w+)?|fifty(?:[- ]?\\w+)?|sixty(?:[- ]?\\w+)?|seventy(?:[- ]?\\w+)?|eighty(?:[- ]?\\w+)?|ninety(?:[- ]?\\w+)?)'

  // Full pattern with optional "the book of", optional "chapter X", optional "verse Y[-Z]"
  const src = `(?:(?:the )?book of |turn to |found in |(?:it(?:'s| is) (?:in|found in) ))?` +
    `(${bookAlts})` +
    `(?:\\s+(?:chapter\\s+)?(${numPat}))?` +
    `(?:\\s*[:.]\\s*|\\s+verse(?:s)?\\s+)(${numPat})` +
    `(?:\\s*[-–—]\\s*|\\s+(?:to|through|thru)\\s+)?(${numPat})?`

  return new RegExp(src, 'gi')
}

const EXPLICIT_RE = buildExplicitPattern()

// Book-only pattern: "the book of Romans", "turn to Hebrews"
function buildBookOnlyPattern() {
  const bookAlts = BOOK_KEYS_SORTED
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  const src = `(?:(?:the )?book of |turn to |(?:found in |over in |back in ))(${bookAlts})(?:\\s+chapter\\s+(\\d+))?(?!\\s*\\d)`
  return new RegExp(src, 'gi')
}

const BOOK_ONLY_RE = buildBookOnlyPattern()

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * extractReferences(text)
 *
 * @param {string} text
 * @returns {Array<{type, raw, book, chapter, verse, verseEnd, query, index}>}
 *
 * Results are deduplicated and sorted by position in text.
 */
export function extractReferences(text) {
  if (!text) return []

  const results = []
  const seen = new Set()

  const addIfNew = (ref) => {
    const key = ref.query
    if (!seen.has(key)) {
      seen.add(key)
      results.push(ref)
    }
  }

  // ── 1. Thematic phrases ────────────────────────────────────────────────────
  for (const { phrase, query, book, chapter, verse } of THEMATIC) {
    const m = phrase.exec(text)
    if (m) {
      addIfNew({
        type: 'thematic',
        raw: m[0],
        book,
        chapter,
        verse,
        verseEnd: null,
        query,
        index: m.index,
      })
    }
  }

  // Reset lastIndex on global regexes
  EXPLICIT_RE.lastIndex = 0

  // ── 2. Explicit references ─────────────────────────────────────────────────
  let m
  while ((m = EXPLICIT_RE.exec(text)) !== null) {
    const [full, rawBook, rawChapter, rawVerse, rawVerseEnd] = m
    const book = canonicalBook(rawBook)
    if (!book) continue

    const chapter = wordToNum(rawChapter)
    const verse = wordToNum(rawVerse)
    const verseEnd = wordToNum(rawVerseEnd)

    const query = verse
      ? `${book} ${chapter ?? 1}:${verse}${verseEnd ? `-${verseEnd}` : ''}`
      : chapter
      ? `${book} ${chapter}`
      : book

    addIfNew({
      type: 'explicit',
      raw: full.trim(),
      book,
      chapter,
      verse,
      verseEnd,
      query,
      index: m.index,
    })
  }

  BOOK_ONLY_RE.lastIndex = 0

  // ── 3. Book-only references ────────────────────────────────────────────────
  while ((m = BOOK_ONLY_RE.exec(text)) !== null) {
    const [full, rawBook, rawChapter] = m
    const book = canonicalBook(rawBook)
    if (!book) continue

    const chapter = rawChapter ? parseInt(rawChapter, 10) : null
    const query = chapter ? `${book} ${chapter}` : book

    addIfNew({
      type: 'book',
      raw: full.trim(),
      book,
      chapter,
      verse: null,
      verseEnd: null,
      query,
      index: m.index,
    })
  }

  return results.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
}

/**
 * highlightTranscript(text, refs)
 *
 * Returns an array of segments for rendering highlighted transcript text.
 * Each segment: { text: string, highlighted: boolean, ref?: object }
 */
export function highlightTranscript(text, refs) {
  if (!text || !refs.length) return [{ text, highlighted: false }]

  // Build spans sorted by index
  const spans = refs
    .filter(r => r.index != null && r.raw)
    .map(r => ({ start: r.index, end: r.index + r.raw.length, ref: r }))
    .sort((a, b) => a.start - b.start)

  const segments = []
  let cursor = 0

  for (const span of spans) {
    if (span.start > cursor) {
      segments.push({ text: text.slice(cursor, span.start), highlighted: false })
    }
    if (span.start >= cursor) {
      segments.push({
        text: text.slice(span.start, span.end),
        highlighted: true,
        ref: span.ref,
      })
      cursor = span.end
    }
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false })
  }

  return segments
}
