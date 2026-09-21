import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Mic, ScanSearch, Sparkles } from 'lucide-react'
import { useReveal, revealClass, revealDelay } from '../useReveal'

const VERSES = [
  {
    reference: 'Matthew 5:3–6',
    text: '"Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the meek, for they shall inherit the earth."',
  },
  {
    reference: 'Philippians 4:13',
    text: '"I can do all things through him who strengthens me."',
  },
]

const POINTS = [
  { Icon: Mic, text: 'Real-time microphone transcription via Web Speech API — nothing sent to a server' },
  { Icon: ScanSearch, text: 'Detects explicit references (John 3:16) and thematic phrases (the prodigal son)' },
  { Icon: BookOpen, text: 'Full passage in your preferred version — ESV, NIV, KJV, NLT, NKJV' },
]

function RefButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`lp-focus px-1.5 py-0.5 rounded font-medium border transition-colors ${
        active
          ? 'text-white bg-blue-500 border-blue-500'
          : 'text-lp-accent-soft bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
      }`}
    >
      {children}
    </button>
  )
}

function MockTranscript() {
  const [activeRef, setActiveRef] = useState(null)
  const toggle = (i) => setActiveRef(activeRef === i ? null : i)
  const verse = activeRef !== null ? VERSES[activeRef] : null

  return (
    <div>
      <div className="rounded-xl p-4 text-sm text-lp-fg/70 leading-relaxed bg-lp-fg/[0.03] border border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-black/5 dark:border-white/5">
          <div className="w-2 h-2 rounded-full bg-flame-500 animate-pulse" />
          <span className="text-lp-fg/60 text-xs uppercase tracking-widest">Live transcript</span>
        </div>
        <p>
          And when Jesus saw the crowds, he went up on the mountain, and when he sat down, his disciples came to him. This is what we call the beatitudes — found right there in{' '}
          <RefButton active={activeRef === 0} onClick={() => toggle(0)}>Matthew chapter five</RefButton>
          . Now what he says next is the foundation of everything. Blessed are the poor in spirit — this is a radical inversion of the world&apos;s values. Remember also what Paul wrote in{' '}
          <RefButton active={activeRef === 1} onClick={() => toggle(1)}>Philippians four verse thirteen</RefButton>
          : I can do all things through him who strengthens me.
        </p>
      </div>

      {/* Verse result — appears when a reference is clicked */}
      <div
        className={`mt-3 transition-all duration-300 ${
          verse ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="rounded-xl p-4 bg-blue-500/[0.06] border border-blue-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lp-fg font-medium text-sm">{verse?.reference ?? VERSES[0].reference}</span>
              <span className="text-xs text-lp-accent-soft bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">ESV</span>
            </div>
            <button type="button" className="lp-focus text-xs text-lp-fg/60 hover:text-lp-fg transition-colors px-2 py-1 rounded-lg hover:bg-lp-fg/5">
              Copy
            </button>
          </div>
          <p className="text-lp-fg/70 text-sm leading-relaxed italic">{verse?.text ?? VERSES[0].text}</p>
          <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="text-lp-fg/60 text-xs">Bible Gateway · ESV</span>
            <span className="text-xs text-lp-fg/60 bg-lp-fg/5 px-2 py-0.5 rounded-full">exact match</span>
          </div>
        </div>
      </div>

      {activeRef === null && (
        <p className="text-center text-lp-fg/60 text-xs mt-3">↑ Click a highlighted reference to look it up</p>
      )}
    </div>
  )
}

export default function WordLookUpSpotlight() {
  const [ref, visible] = useReveal()

  return (
    <section className="relative py-24 lg:py-32">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Description */}
        <div className="space-y-6 lg:pr-8">
          <div className={revealClass(visible)}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-lp-accent-soft text-xs font-medium tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              Introducing WordLookUp
            </span>
          </div>

          <h2 className={`lp-h2 ${revealClass(visible)}`} style={revealDelay(1)}>
            Every scripture,
            <br />
            <span className="text-lp-accent-soft">one tap away.</span>
          </h2>

          <p className={`text-lp-fg/70 text-base leading-relaxed ${revealClass(visible)}`} style={revealDelay(2)}>
            Preachers move fast. WordLookUp keeps up. While you listen, it transcribes the sermon in real time and highlights every scripture reference the moment it&apos;s spoken.
          </p>

          <ul className="space-y-4">
            {POINTS.map(({ Icon, text }, i) => (
              <li key={text} className={`flex items-start gap-3 ${revealClass(visible)}`} style={revealDelay(i + 3)}>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-lp-accent-soft" />
                </div>
                <p className="text-lp-fg/70 text-sm leading-relaxed pt-1.5">{text}</p>
              </li>
            ))}
          </ul>

          <div className={revealClass(visible)} style={revealDelay(6)}>
            <Link to="/wordlookup" className="lp-btn-primary group">
              Try WordLookUp
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Interactive mock */}
        <div className={revealClass(visible)} style={revealDelay(2)}>
          <div className="lp-card p-5">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-black/5 dark:border-white/5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <ScanSearch className="w-4 h-4 text-lp-accent-soft" />
              </div>
              <span className="text-lp-fg font-medium text-sm">WordLookUp</span>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-lp-fg/60">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Listening
              </div>
            </div>
            <MockTranscript />
          </div>
        </div>
      </div>
    </section>
  )
}
