import { useState } from 'react'
import useAuthStore from '../store/authStore'
import api from '../lib/axios'
import { Spinner, PageLoader } from '../components/ui'
import { useBadges, useEngagementStats } from '../hooks/useSermons'

// ── Badge shelf ───────────────────────────────────────────────────────────────

function BadgeShelf({ badges, recentBadges }) {
  const [showAll, setShowAll] = useState(false)

  const allBadges = badges ?? []
  const displayed = showAll ? allBadges : allBadges.slice(0, 6)

  if (!allBadges.length) return (
    <div className="card p-5">
      <p className="label mb-3">Badges</p>
      <p className="text-spirit-500 text-sm">
        No badges yet — complete sermons and build streaks to earn them.
      </p>
    </div>
  )

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="label">Badges earned — {allBadges.length}</p>
        {allBadges.length > 6 && (
          <button onClick={() => setShowAll(v => !v)} className="text-gold-400 text-xs hover:text-gold-300 transition-colors">
            {showAll ? 'Show less' : `Show all ${allBadges.length}`}
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {displayed.map((ub) => {
          const isNew = recentBadges?.some(r => r.name === ub.badge.name)
          return (
            <div
              key={ub.id}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                isNew
                  ? 'bg-gold-500/10 border-gold-500/30'
                  : 'bg-spirit-800 border-spirit-700'
              }`}
            >
              {isNew && (
                <span className="absolute -top-1.5 -right-1.5 text-xs bg-gold-500 text-spirit-900 font-medium px-1.5 py-0.5 rounded-full">
                  new
                </span>
              )}
              <span className="text-2xl leading-none">{ub.badge.icon}</span>
              <p className="text-spirit-200 text-xs font-medium text-center leading-tight">{ub.badge.name}</p>
              <p className="text-spirit-500 text-xs text-center leading-tight">{ub.badge.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Streak freeze card ────────────────────────────────────────────────────────

function StreakFreezeCard({ freezeAvailable, freezeEarnedAt, currentStreak }) {
  const nextFreezeAt = Math.ceil(currentStreak / 7) * 7
  const daysToNext = nextFreezeAt - currentStreak

  return (
    <div className={`card p-5 flex items-start gap-4 ${freezeAvailable ? 'border-spirit-500/40 bg-spirit-700/30' : ''}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
        freezeAvailable ? 'bg-spirit-600/40 border border-spirit-500/40' : 'bg-spirit-800 border border-spirit-700'
      }`}>
        🧊
      </div>
      <div className="flex-1 min-w-0">
        <p className="label mb-0.5">Streak freeze</p>
        {freezeAvailable ? (
          <>
            <p className="text-spirit-100 font-medium text-sm">Freeze available</p>
            <p className="text-spirit-400 text-xs mt-1 leading-relaxed">
              Your streak is protected. If you miss a day, your freeze will activate automatically
              and your streak will survive.
            </p>
            {freezeEarnedAt && (
              <p className="text-spirit-500 text-xs mt-1">
                Earned {new Date(freezeEarnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-spirit-400 text-sm">No freeze available</p>
            <p className="text-spirit-500 text-xs mt-1 leading-relaxed">
              {currentStreak === 0
                ? 'Start a streak to earn your first freeze at 7 days.'
                : daysToNext === 0
                  ? 'You just earned a freeze!'
                  : `${daysToNext} more day${daysToNext !== 1 ? 's' : ''} to earn your next freeze at ${nextFreezeAt} days.`
              }
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ── Settings form ─────────────────────────────────────────────────────────────

function SettingsForm({ user, onSaved }) {
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
              className="flex-1 accent-gold-500"
            />
            <span className="text-gold-400 font-mono text-sm w-12 text-right">{form.daily_goal_minutes} min</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-spirit-700">
          <div>
            <p className="text-spirit-200 text-sm font-medium">Daily streak reminders</p>
            <p className="text-spirit-500 text-xs mt-0.5">Get an email if you haven't listened by 6pm</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="email_reminders"
              checked={form.email_reminders}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-spirit-700 peer-focus:outline-none rounded-full peer peer-checked:bg-gold-500 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"></div>
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
          {saved && <span className="text-gold-400 text-sm animate-fade-in">✦ Saved</span>}
        </div>
      </form>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const user = useAuthStore((s) => s.user)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const { data } = await api.post('/auth/avatar/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUser(data)
    } catch {
      // silently fail — user stays unchanged
    } finally {
      setAvatarUploading(false)
    }
  }

  const { data: badges, isLoading: badgesLoading } = useBadges()
  const { data: stats } = useEngagementStats()

  const initials = (user?.first_name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase()
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ''}`.trim()
    : user?.username

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6 animate-slide-up">

      {/* Avatar + name */}
      <div className="card p-6 flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full bg-spirit-600 border-2 border-spirit-500 flex items-center justify-center overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              : <span className="font-display text-2xl text-gold-400">{initials}</span>
            }
          </div>
          <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center cursor-pointer hover:bg-gold-400 transition-colors">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-spirit-900" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 4v16m8-8H4" strokeLinecap="round"/>
            </svg>
          </label>
          {avatarUploading && (
            <div className="absolute inset-0 rounded-full bg-spirit-900/60 flex items-center justify-center">
              <svg className="w-5 h-5 animate-spin text-gold-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-display text-xl text-spirit-100 italic">{displayName}</p>
          <p className="text-spirit-400 text-sm">{user?.email}</p>
          <p className="text-spirit-500 text-xs mt-0.5">@{user?.username}</p>
          <p className="text-spirit-600 text-xs mt-1">Tap the + to change photo</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: 'XP earned',       value: (user?.xp_points ?? 0).toLocaleString() },
          { label: 'Best streak',     value: `${user?.longest_streak ?? 0}d` },
          { label: 'Badges',          value: badges?.length ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="font-display text-2xl text-gold-400">{value}</p>
            <p className="label mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Streak freeze */}
      <StreakFreezeCard
        freezeAvailable={user?.streak_freeze_available ?? false}
        freezeEarnedAt={user?.streak_freeze_earned_at}
        currentStreak={user?.current_streak ?? 0}
      />

      {/* Recently earned badges — from stats */}
      {stats?.recent_badges?.length > 0 && (
        <div className="card p-5 border-l-2 border-l-gold-500 rounded-r-2xl rounded-l-none animate-slide-up">
          <p className="label mb-3">Recently earned</p>
          <div className="flex gap-3 flex-wrap">
            {stats.recent_badges.map((b) => (
              <div key={b.name} className="flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-xl px-3 py-2">
                <span className="text-lg">{b.icon}</span>
                <div>
                  <p className="text-gold-400 text-xs font-medium">{b.name}</p>
                  <p className="text-spirit-500 text-xs">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full badge shelf */}
      {badgesLoading ? (
        <div className="card p-8 flex justify-center"><Spinner className="w-6 h-6" /></div>
      ) : (
        <BadgeShelf badges={badges} recentBadges={stats?.recent_badges} />
      )}

      {/* Settings */}
      <SettingsForm user={user} />

      <p className="text-spirit-600 text-xs text-center pb-4">
        Member since {user?.date_joined
          ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : '—'}
      </p>
    </div>
  )
}
