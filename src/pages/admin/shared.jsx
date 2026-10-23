// Small pieces shared by the admin dashboard tabs

/** DRF error body → { field: first message }; anything else lands under `detail`. */
export function apiErrors(err) {
  const data = err.response?.data
  if (!data || typeof data !== 'object') return { detail: 'Could not save. Please try again.' }
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]),
  )
}

export function FieldError({ errors, name }) {
  return errors[name] ? <p className="text-flame-400 text-xs">{errors[name]}</p> : null
}

/** Pill-style segmented control: `options` is [{ value, label }]. */
export function Segmented({ options, value, onChange, size = 'md' }) {
  const pad = size === 'sm' ? 'py-1.5 text-xs' : 'py-2 text-sm'
  return (
    <div className="flex gap-1 p-1 glass rounded-2xl" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`focus-ring flex-1 inline-flex items-center justify-center gap-2 px-3 rounded-xl font-medium transition-colors ${pad} ${
            value === o.value
              ? 'bg-blue-500/10 text-accent-400 ring-1 ring-blue-500/25'
              : 'text-spirit-400 hover:text-spirit-100'
          }`}
        >
          {o.Icon && <o.Icon className="w-4 h-4" />}
          {o.label}
        </button>
      ))}
    </div>
  )
}
