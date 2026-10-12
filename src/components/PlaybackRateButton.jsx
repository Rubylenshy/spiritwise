import { useAudio } from '../context/AudioContext'

/** Shows the playback speed; each press steps to the next one (wrapping at 2×). */
export default function PlaybackRateButton({ className = '' }) {
  const { playbackRate, cyclePlaybackRate } = useAudio()

  return (
    <button
      type="button"
      onClick={cyclePlaybackRate}
      aria-label={`Playback speed ${playbackRate}×, change`}
      title="Playback speed"
      className={`focus-ring rounded-lg h-8 min-w-[3rem] px-2 flex items-center justify-center text-xs font-mono transition-colors ${
        playbackRate === 1 ? 'text-spirit-500 hover:text-spirit-100' : 'text-accent-500 hover:text-accent-400'
      } ${className}`}
    >
      {playbackRate}×
    </button>
  )
}
