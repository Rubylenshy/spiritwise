import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Leaders', href: '#leaders' },
  { label: 'Pricing', href: '#pricing' },
]

function ProductDropdown({ open }) {
  return (
    <div
      className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 transition-all duration-200 ${
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
    >
      {/* Arrow */}
      <div className="flex justify-center -mb-px relative z-10">
        <div className="w-3 h-3 bg-spirit-800 border-l border-t border-spirit-700 rotate-45 -mt-1.5" />
      </div>

      <div className="bg-spirit-800 border border-spirit-700 rounded-2xl overflow-hidden shadow-2xl shadow-spirit-950/60">
        <Link
          to="/wordlookup"
          className="flex items-start gap-4 p-5 hover:bg-spirit-700/50 transition-colors group"
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0 group-hover:bg-gold-500/20 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gold-400" stroke="currentColor" strokeWidth={1.7}>
              <path d="M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z" strokeLinecap="round"/>
              <path d="M12 8v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.5 19.5l-2-2" strokeLinecap="round"/>
              <path d="M8 12c0-.5.1-1 .3-1.4M16 10a4 4 0 00-6.8-2" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-spirit-100 font-medium text-sm">WordLookUp</p>
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-spirit-500 group-hover:text-gold-400 transition-colors" stroke="currentColor" strokeWidth={1.5}>
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-spirit-400 text-xs mt-1 leading-relaxed">
              Hear a scripture in a sermon? Tap once — get the full passage instantly.
            </p>
          </div>
        </Link>

        <div className="mx-5 border-t border-spirit-700/60" />

        <div className="px-5 py-3">
          <p className="text-spirit-600 text-xs uppercase tracking-widest">More coming soon</p>
        </div>
      </div>
    </div>
  )
}

export default function LandingNav({ onWatchDemo }) {
  const [scrolled, setScrolled] = useState(false)
  const [productOpen, setProductOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const productRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (productRef.current && !productRef.current.contains(e.target)) {
        setProductOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const scrollTo = (hash) => {
    setMobileOpen(false)
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-spirit-900/95 backdrop-blur-sm border-b border-spirit-800 shadow-lg shadow-spirit-950/40'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <span className="text-2xl font-display text-gold-400 italic leading-none">✦</span>
              <span className="font-display text-xl text-spirit-100 tracking-wide">SpiritWise</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <button
                  key={label}
                  onClick={() => scrollTo(href)}
                  className="px-4 py-2 text-sm text-spirit-300 hover:text-spirit-100 transition-colors rounded-lg hover:bg-spirit-800/50"
                >
                  {label}
                </button>
              ))}

              {/* Product dropdown */}
              <div ref={productRef} className="relative">
                <button
                  onClick={() => setProductOpen(v => !v)}
                  onMouseEnter={() => setProductOpen(true)}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-spirit-300 hover:text-spirit-100 transition-colors rounded-lg hover:bg-spirit-800/50"
                >
                  Product
                  <svg
                    viewBox="0 0 16 16" fill="none"
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${productOpen ? 'rotate-180' : ''}`}
                    stroke="currentColor" strokeWidth={1.5}
                  >
                    <path d="M4 6l4 4 4-4" strokeLinecap="round"/>
                  </svg>
                </button>
                <div onMouseLeave={() => setProductOpen(false)}>
                  <ProductDropdown open={productOpen} />
                </div>
              </div>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-spirit-300 hover:text-spirit-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 text-sm font-medium bg-gold-500 hover:bg-gold-400 text-spirit-900 rounded-xl transition-all duration-200 active:scale-95"
              >
                Get started
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 text-spirit-300 hover:text-spirit-100 transition-colors"
              aria-label="Toggle menu"
            >
              <span className={`w-5 h-px bg-current transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
              <span className={`w-5 h-px bg-current transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`w-5 h-px bg-current transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-spirit-950/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 w-72 h-full bg-spirit-900 border-l border-spirit-800 flex flex-col transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-spirit-800">
            <span className="font-display text-gold-400 text-lg italic">✦ Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-spirit-500 hover:text-spirit-200 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => scrollTo(href)}
                className="w-full text-left px-4 py-3 text-spirit-300 hover:text-spirit-100 hover:bg-spirit-800 rounded-xl transition-colors text-sm"
              >
                {label}
              </button>
            ))}

            <div className="px-4 pt-2 pb-1">
              <p className="text-spirit-600 text-xs uppercase tracking-widest mb-2">Product</p>
            </div>
            <Link
              to="/wordlookup"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-spirit-300 hover:text-gold-400 hover:bg-spirit-800 rounded-xl transition-colors text-sm"
            >
              <span className="text-gold-500">✦</span>
              WordLookUp
            </Link>
          </nav>

          <div className="px-4 py-6 border-t border-spirit-800 space-y-3">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-5 py-3 text-sm text-spirit-300 border border-spirit-700 hover:border-spirit-500 hover:text-spirit-100 rounded-xl transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-5 py-3 text-sm font-medium bg-gold-500 hover:bg-gold-400 text-spirit-900 rounded-xl transition-all duration-200"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
