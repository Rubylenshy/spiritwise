import { AudioWaveform } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSermon } from '../../../hooks/useSermons'
import { useAudio } from '../../../context/AudioContext'

export default function NextSermonCard({ nextSermon }) {
  const { loadSermon } = useAudio()
  const { data: next } = useSermon(nextSermon?.id)

  if (!nextSermon) return null
  return (
    <div className="card p-5 flex items-center gap-4 animate-slide-up">
      <div className="w-10 h-10 rounded-xl bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0 overflow-hidden">
        {nextSermon.thumbnail
          ? <img src={nextSermon.thumbnail} alt="" className="w-full h-full object-cover" />
          : <AudioWaveform className="w-5 h-5 text-accent-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="label mb-0.5">Up next in series</p>
        <p className="text-spirit-100 font-medium text-sm truncate">{nextSermon.title}</p>
        <p className="text-spirit-400 text-xs">{nextSermon.speaker} · {nextSermon.duration_display}</p>
      </div>
      <Link to={`/sermons/${nextSermon.id}`} className="btn-primary text-sm shrink-0">
        Play →
      </Link>
    </div>
  )
}
