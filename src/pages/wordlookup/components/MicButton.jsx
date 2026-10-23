const MIC_META = {
  idle:       { label: 'Tap to start listening',  pulse: false, color: 'border-spirit-600 bg-spirit-800 text-spirit-400 hover:border-accent-500/50 hover:text-accent-400 hover:bg-spirit-700' },
  requesting: { label: 'Requesting microphone…',  pulse: false, color: 'border-accent-500/40 bg-accent-500/5 text-accent-400' },
  listening:  { label: 'Listening — tap to stop', pulse: true,  color: 'border-flame-500/60 bg-flame-500/[0.08] text-flame-400' },
  processing: { label: 'Finalising…',             pulse: false, color: 'border-accent-500/60 bg-accent-500/[0.08] text-accent-400' },
  error:      { label: 'Tap to retry',            pulse: false, color: 'border-flame-500/40 bg-flame-500/5 text-flame-400' },
}

export default function MicButton({ state, onClick }) {
  const meta = MIC_META[state] ?? MIC_META.idle
  const isProcessing = state === 'processing' || state === 'requesting'

  return (
    <div className="relative flex items-center justify-center">
      {meta.pulse && (
        <>
          <span className="absolute w-32 h-32 rounded-full border border-flame-500/30 animate-ping" style={{ animationDuration: '1.8s' }} />
          <span className="absolute w-24 h-24 rounded-full border border-flame-500/20 animate-ping" style={{ animationDuration: '1.4s', animationDelay: '0.2s' }} />
        </>
      )}
      <button
        onClick={onClick}
        className={`relative w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 active:scale-95 ${meta.color}`}
        aria-label={meta.label}
      >
        {isProcessing ? (
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" stroke="currentColor" strokeWidth={1.6}>
            <rect x="9" y="2" width="6" height="11" rx="3"/>
            <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  )
}
