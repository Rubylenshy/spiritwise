import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// Mock transcript showing detected references highlighted
const TRANSCRIPT_LINES = [
  { text: 'And when Jesus saw the crowds, he went up on the mountain, and when he sat down, his disciples came to him.', highlight: false },
  { text: 'This is what we call ', highlight: false, inline: 'the beatitudes' },
  { text: ' — found right there in ', highlight: false },
  { text: 'Matthew chapter five', highlight: true, ref: 'Matthew 5:1-12' },
  { text: '. Now what he says next is the foundation of everything. Blessed are the poor in spirit — this is a radical inversion of the world\'s values.', highlight: false },
  { text: ' Remember also what Paul wrote in ', highlight: false },
  { text: 'Philippians four verse thirteen', highlight: true, ref: 'Philippians 4:13' },
  { text: ': I can do all things through him who strengthens me.', highlight: false },
]

const VERSE_RESULTS = [
  {
    reference: 'Matthew 5:3-6',
    version: 'ESV',
    text: '"Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the meek, for they shall inherit the earth. Blessed are those who hunger and thirst for righteousness, for they shall be satisfied."',
    confidence: 'exact',
  },
]

function MockTranscript() {
  const [activeRef, setActiveRef] = useState(null)

  return (
    <div className="relative">
      {/* Transcript box */}
      <div className="bg-spirit-900 border border-spirit-700 rounded-xl p-4 text-sm text-spirit-300 leading-relaxed font-sans">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-spirit-800">
          <div className="w-2 h-2 rounded-full bg-flame-500 animate-pulse" />
          <span className="text-spirit-500 text-xs uppercase tracking-widest">Live transcript</span>
        </div>
        <p>
          And when Jesus saw the crowds, he went up on the mountain, and when he sat down, his disciples came to him. This is what we call the beatitudes — found right there in{' '}
          <button
            onClick={() => setActiveRef(activeRef === 0 ? null : 0)}
            className="text-gold-400 bg-gold-500/15 border border-gold-500/30 px-1.5 py-0.5 rounded font-medium hover:bg-gold-500/25 transition-colors cursor-pointer"
          >
            Matthew chapter five
          </button>
          . Now what he says next is the foundation of everything. Blessed are the poor in spirit — this is a radical inversion of the world's values. Remember also what Paul wrote in{' '}
          <button
            onClick={() => setActiveRef(activeRef === 1 ? null : 1)}
            className="text-gold-400 bg-gold-500/15 border border-gold-500/30 px-1.5 py-0.5 rounded font-medium hover:bg-gold-500/25 transition-colors cursor-pointer"
          >
            Philippians four verse thirteen
          </button>
          : I can do all things through him who strengthens me.
        </p>
      </div>

      {/* Verse result card — appears when a reference is clicked */}
      <div
        className={`mt-3 transition-all duration-300 ${
          activeRef !== null ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-spirit-800 border border-gold-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-spirit-100 font-medium text-sm">
                {activeRef === 0 ? 'Matthew 5:3–6' : 'Philippians 4:13'}
              </span>
              <span className="text-xs text-gold-500 bg-gold-500/10 border border-gold-500/20 px-2 py-0.5 rounded-full">ESV</span>
            </div>
            <div className="flex gap-2">
              <button className="text-xs text-spirit-400 hover:text-spirit-200 transition-colors px-2 py-1 rounded-lg hover:bg-spirit-700">Copy</button>
            </div>
          </div>
          <p className="text-spirit-300 text-sm leading-relaxed italic">
            {activeRef === 0
              ? '"Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the meek, for they shall inherit the earth."'
              : '"I can do all things through him who strengthens me."'}
          </p>
          <div className="mt-3 pt-3 border-t border-spirit-700 flex items-center justify-between">
            <span className="text-spirit-600 text-xs">Bible Gateway · ESV</span>
            <span className="text-xs text-spirit-500 bg-spirit-700 px-2 py-0.5 rounded-full">exact match</span>
          </div>
        </div>
      </div>

      {/* Instruction hint */}
      {activeRef === null && (
        <p className="text-center text-spirit-600 text-xs mt-3">
          ↑ Click a highlighted reference to look it up
        </p>
      )}
    </div>
  )
}

export default function WordLookUpSpotlight() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative py-24 lg:py-32 bg-spirit-800/30 overflow-hidden">
      {/* Decorative background */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #C9A84C 0%, transparent 70%)' }}
      />

      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>

          {/* Left: description */}
          <div className="space-y-6 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-400 text-xs font-medium tracking-wider uppercase">
              <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={1.8}>
                <polygon points="8 1 10 6 15 6 11 10 13 15 8 12 3 15 5 10 1 6 6 6"/>
              </svg>
              Introducing WordLookUp
            </div>

            <h2 className="font-display text-[clamp(2rem,3.5vw,3rem)] text-spirit-100 italic leading-tight">
              Every scripture,
              <br />
              <span className="text-gold-400">one tap away.</span>
            </h2>

            <p className="text-spirit-400 text-base leading-relaxed">
              Preachers move fast. WordLookUp keeps up. While you listen, it transcribes the sermon in real time and highlights every scripture reference the moment it's spoken.
            </p>

            <ul className="space-y-4">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-gold-400" stroke="currentColor" strokeWidth={1.7}>
                      <path d="M10 3a7 7 0 100 14A7 7 0 0010 3zm0 4v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                  text: 'Real-time microphone transcription via Web Speech API — nothing sent to a server',
                },
                {
                  icon: (
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-gold-400" stroke="currentColor" strokeWidth={1.7}>
                      <circle cx="9" cy="9" r="6"/><path d="M17 17l-3-3" strokeLinecap="round"/>
                    </svg>
                  ),
                  text: 'Detects explicit references (John 3:16) and thematic phrases (the prodigal son)',
                },
                {
                  icon: (
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-gold-400" stroke="currentColor" strokeWidth={1.7}>
                      <path d="M4 6h12M4 10h12M4 14h7" strokeLinecap="round"/>
                    </svg>
                  ),
                  text: 'Full passage in your preferred version — ESV, NIV, KJV, NLT, NKJV',
                },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    {icon}
                  </div>
                  <p className="text-spirit-300 text-sm leading-relaxed">{text}</p>
                </li>
              ))}
            </ul>

            <Link
              to="/wordlookup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-spirit-900 font-medium rounded-xl transition-all duration-200 active:scale-95 text-sm"
            >
              Try WordLookUp
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* Right: interactive mock UI */}
          <div className="relative">
            {/* Glow behind the mock */}
            <div
              className="absolute inset-0 rounded-3xl opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(ellipse, #C9A84C 0%, transparent 70%)' }}
            />
            <div className="relative bg-spirit-900 border border-spirit-700 rounded-2xl p-5 shadow-2xl shadow-spirit-950/60">
              {/* Fake toolbar */}
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-spirit-800">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gold-400" stroke="currentColor" strokeWidth={1.6}>
                    <circle cx="7" cy="7" r="5"/><path d="M13 13l-2-2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="font-display text-spirit-100 italic text-sm">WordLookUp</span>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-spirit-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
                  Listening
                </div>
              </div>

              {/* The interactive transcript */}
              <MockTranscript />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
