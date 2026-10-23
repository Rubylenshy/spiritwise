import { useState } from 'react'
import { Check } from 'lucide-react'
import { useSubmitAnswer } from '../../../hooks/useSermons'
import { Spinner } from '../../../components/ui'

export default function ReflectionQuestion({ question, sermonId, index }) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const submitAnswer = useSubmitAnswer()

  // XP / badge announcements come from the server response (useSubmitAnswer)
  const handleSubmit = async () => {
    if (!answer.trim()) return
    await submitAnswer.mutateAsync({
      questionId: question.id,
      sermonId,
      answerText: answer,
    })
    setSubmitted(true)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <span className="font-display text-accent-500 text-lg leading-none shrink-0 mt-0.5">{index + 1}.</span>
        <p className="text-spirit-300 text-sm leading-relaxed">{question.text}</p>
      </div>
      {!submitted ? (
        <div className="ml-6 space-y-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your reflection…"
            rows={3}
            className="input-field resize-none text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || submitAnswer.isPending}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {submitAnswer.isPending ? <Spinner className="w-4 h-4" /> : null}
            Submit +10 XP
          </button>
        </div>
      ) : (
        <div className="ml-6 bg-spirit-800/50 border border-spirit-700 rounded-xl px-4 py-3">
          <p className="text-spirit-300 text-sm">{answer}</p>
          <p className="text-accent-500 text-xs mt-2 flex items-center gap-1"><Check className="w-4 h-4" /> Saved</p>
        </div>
      )}
    </div>
  )
}
