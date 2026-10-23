import { useState, useRef } from 'react'
import api from '../../../lib/axios'

export default function FileFallback({ onTranscript }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('audio_file', file)
      const { data } = await api.post('/wordlookup/transcribe/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onTranscript(data.transcript)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Transcription failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="card p-5 border-dashed space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-accent-400" stroke="currentColor" strokeWidth={1.6}>
            <path d="M8 2v8M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-spirit-200 text-sm font-medium">Upload a sermon audio file</p>
          <p className="text-spirit-500 text-xs mt-0.5 leading-relaxed">
            Your browser doesn't support the microphone API. Upload an audio file and we'll
            transcribe it using Whisper instead.
          </p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept=".mp3,.m4a,.aac,.ogg,.opus,.wav,.flac"
             onChange={handleFile} className="hidden" />
      {error && (
        <p className="text-flame-400 text-xs bg-flame-500/10 border border-flame-500/20 rounded-xl px-3 py-2">{error}</p>
      )}
      <button onClick={() => fileRef.current?.click()} disabled={uploading}
        className="btn-outline text-sm flex items-center gap-2 w-full justify-center">
        {uploading ? (
          <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/></svg>Transcribing…</>
        ) : 'Choose audio file'}
      </button>
    </div>
  )
}
