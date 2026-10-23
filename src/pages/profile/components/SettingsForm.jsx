import { useState } from 'react'
import { Check } from 'lucide-react'
import useAuthStore from '../../../store/authStore'
import api from '../../../lib/axios'
import { Spinner } from '../../../components/ui'

export default function SettingsForm({ user, onSaved }) {
  const setUser = useAuthStore((s) => s.setUser)
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    daily_goal_minutes: user?.daily_goal_minutes ?? 30,
    email_reminders: user?.email_reminders ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: val }))
    setSaved(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data } = await api.patch('/auth/profile/', form)
      setUser(data)
      setSaved(true)
      onSaved?.()
    } catch {
      setError('Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-4 sm:p-6">
      <p className="label mb-5">Settings</p>
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="label" htmlFor="first_name">First name</label>
            <input id="first_name" name="first_name" type="text" value={form.first_name} onChange={handleChange} className="input-field" />
          </div>
          <div className="space-y-1.5">
            <label className="label" htmlFor="last_name">Last name</label>
            <input id="last_name" name="last_name" type="text" value={form.last_name} onChange={handleChange} className="input-field" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="label" htmlFor="daily_goal_minutes">Daily listening goal (minutes)</label>
          <div className="flex items-center gap-4">
            <input
              type="range" id="daily_goal_minutes" name="daily_goal_minutes"
              min={5} max={120} step={5}
              value={form.daily_goal_minutes} onChange={handleChange}
              className="flex-1 accent-accent-500"
            />
            <span className="text-accent-400 font-mono text-sm w-12 text-right">{form.daily_goal_minutes} min</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-spirit-700">
          <div>
            <p className="text-spirit-200 text-sm font-medium">Daily streak reminders</p>
            <p className="text-spirit-500 text-xs mt-0.5">Get an email if you haven&apos;t listened by 6pm</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="email_reminders"
              checked={form.email_reminders}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-spirit-700 peer-focus:outline-none rounded-full peer peer-checked:bg-accent-500 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"></div>
          </label>
        </div>

        {error && (
          <p className="text-flame-400 text-sm bg-flame-500/10 border border-flame-500/20 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <Spinner className="w-4 h-4" />}
            Save changes
          </button>
          {saved && <span className="text-accent-400 text-sm animate-fade-in flex items-center gap-1"><Check className="w-4 h-4" /> Saved</span>}
        </div>
      </form>
    </div>
  )
}
