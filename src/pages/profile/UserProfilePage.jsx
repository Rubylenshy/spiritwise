import useAuthStore from '../../store/authStore'
import { Spinner } from '../../components/ui'
import AvatarEditor from '../../components/AvatarEditor'
import { useBadges, useEngagementStats } from '../../hooks/useSermons'
import BadgeShelf, { isNewBadge } from './components/BadgeShelf'
import StreakFreezeCard from './components/StreakFreezeCard'
import SettingsForm from './components/SettingsForm'

export default function UserProfilePage() {
  const user = useAuthStore((s) => s.user)

  const { data: badges, isLoading: badgesLoading } = useBadges()
  const { data: stats } = useEngagementStats()
  const recentBadges = (stats?.recent_badges ?? []).filter((b) => isNewBadge(b.earned_at))

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ''}`.trim()
    : user?.username

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6 animate-slide-up">

      {/* Avatar + name */}
      <div className="card p-6 flex items-center gap-5">
        <AvatarEditor user={user} />
        <div className="min-w-0">
          <p className="font-display text-xl text-spirit-100">{displayName}</p>
          <p className="text-spirit-400 text-sm">{user?.email}</p>
          <p className="text-spirit-500 text-xs mt-0.5">@{user?.username}</p>
          <p className="text-spirit-600 text-xs mt-1">Tap your photo to view, replace or remove it</p>
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
            <p className="font-display text-2xl text-accent-400">{value}</p>
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

      {/* Recently earned badges — from stats, only those earned in the last week */}
      {recentBadges.length > 0 && (
        <div className="card p-5 border-l-2 border-l-accent-500 rounded-r-2xl rounded-l-none animate-slide-up">
          <p className="label mb-3">Recently earned</p>
          <div className="flex gap-3 flex-wrap">
            {recentBadges.map((b) => (
              <div key={b.name} className="flex items-center gap-2 bg-accent-500/10 border border-accent-500/20 rounded-xl px-3 py-2">
                <span className="text-lg">{b.icon}</span>
                <div>
                  <p className="text-accent-400 text-xs font-medium">{b.name}</p>
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
        <BadgeShelf badges={badges} />
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
