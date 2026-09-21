/** Round avatar — the user's photo, or their first initial on an accent tint. */
export default function UserAvatar({ user, className = 'w-8 h-8 text-sm' }) {
  const initial = (user?.first_name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase()
  return (
    <span
      className={`rounded-full overflow-hidden shrink-0 flex items-center justify-center font-medium bg-blue-500/15 border border-blue-500/30 text-accent-400 ${className}`}
    >
      {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : initial}
    </span>
  )
}
