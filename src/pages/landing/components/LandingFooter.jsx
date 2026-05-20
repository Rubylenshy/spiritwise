import { Link } from 'react-router-dom'

const FOOTER_LINKS = {
  Product: [
    { label: 'Sermons', to: '/sermons' },
    { label: 'Series', to: '/series' },
    { label: 'WordLookUp', to: '/wordlookup' },
    { label: 'Leaderboard', to: '/leaderboard' },
  ],
  Company: [
    { label: 'About', to: '#' },
    { label: 'Blog', to: '#' },
    { label: 'Careers', to: '#' },
  ],
  Legal: [
    { label: 'Privacy policy', to: '#' },
    { label: 'Terms of service', to: '#' },
    { label: 'Cookie settings', to: '#' },
  ],
}

const SOCIAL = [
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
  },
]

export default function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-spirit-900 border-t border-spirit-800 overflow-hidden">
      {/* Subtle top glow */}
      <div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="py-14 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="text-2xl font-display text-gold-400 italic leading-none">✦</span>
              <span className="font-display text-xl text-spirit-100 tracking-wide">SpiritWise</span>
            </Link>

            <p className="text-spirit-500 text-sm leading-relaxed max-w-[200px]">
              Your daily scripture journey, elevated by the Word.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {SOCIAL.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-spirit-800 border border-spirit-700 flex items-center justify-center text-spirit-500 hover:text-spirit-200 hover:border-spirit-600 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Verse of the footer */}
            <div className="pt-2">
              <p className="font-display text-sm text-spirit-600 italic leading-relaxed">
                "Thy word is a lamp unto my feet."
              </p>
              <p className="text-spirit-700 text-xs mt-1">Psalm 119:105</p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <p className="text-spirit-300 text-xs font-medium uppercase tracking-widest">{category}</p>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-spirit-500 hover:text-spirit-200 text-sm transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-spirit-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-spirit-600 text-xs">
          <p>© {year} SpiritWise. All rights reserved.</p>
          <p>
            Built with faith for the global church.
            <span className="text-gold-500/50 ml-2">✦</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
