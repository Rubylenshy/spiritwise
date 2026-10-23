import { useState } from 'react'
import api from '../../../lib/axios'
import BibleVerseCard from './BibleVerseCard'

export default function ResultCard({ initial }) {
  const [result, setResult] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleVersionChange = async (newVersion) => {
    if (newVersion === result.version) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/wordlookup/lookup/', {
        reference: initial.reference,
        versions: [newVersion],
      })
      if (data.results?.length) {
        setResult({ ...data.results[0], ai_reasoning: initial.ai_reasoning })
      } else {
        setError(`${newVersion} translation not available for this passage.`)
        setTimeout(() => setError(null), 3000)
      }
    } catch {
      setError('Could not load this version.')
      setTimeout(() => setError(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BibleVerseCard
      reference={result.reference}
      version={result.version}
      verseText={result.text}
      source={result.source}
      matchType={result.match_type}
      confidence={result.confidence ?? 1}
      aiReasoning={result.ai_reasoning ?? initial.ai_reasoning ?? ''}
      loading={loading}
      error={error}
      onVersionChange={handleVersionChange}
    />
  )
}
