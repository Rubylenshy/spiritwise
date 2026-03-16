import { useState } from 'react'
import useAuthStore from '../store/authStore'
import api from '../lib/axios'
import { Spinner } from '../components/ui'

export default function UserProfilePage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    daily_goal_minutes: user?.daily_goal_minutes ?? 30,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
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
    } catch (err) {
      setError('Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.first_name?.[0] ?? user?.username?.[0] ?? '?'
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ''}`.trim()
    : user?.username

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-slide-up">
      {/* Avatar + name */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-spirit-600 border-2 border-spirit-500 flex items-center justify-center shrink-0">
          <span className="font-display text-2xl text-gold-400">{initials.toUpperCase()}</span>
        </div>
        <div>
          <p className="font-display text-xl text-spirit-100 italic">{displayName}</p>
          <p className="text-spirit-400 text-sm">{user?.email}</p>
          <p className="text-spirit-500 text-xs mt-0.5">@{user?.username}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'XP earned', value: (user?.xp_points ?? 0).toLocaleString() },
          { label: 'Current streak', value: `${user?.current_streak ?? 0}d` },
          { label: 'Longest streak', value: `${user?.longest_streak ?? 0}d` },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="font-display text-2xl text-gold-400">{value}</p>
            <p className="label mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <p className="label mb-5">Edit profile</p>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="label" htmlFor="first_name">First name</label>
              <input
                id="first_name" name="first_name" type="text"
                value={form.first_name} onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label className="label" htmlFor="last_name">Last name</label>
              <input
                id="last_name" name="last_name" type="text"
                value={form.last_name} onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label" htmlFor="daily_goal_minutes">Daily goal (minutes)</label>
            <input
              id="daily_goal_minutes" name="daily_goal_minutes" type="number"
              min={5} max={120} step={5}
              value={form.daily_goal_minutes} onChange={handleChange}
              className="input-field w-32"
            />
            <p className="text-spirit-500 text-xs mt-1">How many minutes of sermons do you want to listen to each day?</p>
          </div>

          {error && (
            <p className="text-flame-400 text-sm bg-flame-500/10 border border-flame-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <Spinner className="w-4 h-4" />}
              Save changes
            </button>
            {saved && <span className="text-gold-400 text-sm">✦ Saved</span>}
          </div>
        </form>
      </div>

      {/* Member since */}
      <p className="text-spirit-600 text-xs text-center">
        Member since {user?.date_joined
          ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : '—'
        }
      </p>
    </div>
  )
}
