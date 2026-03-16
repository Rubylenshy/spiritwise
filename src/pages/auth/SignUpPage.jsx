import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import useAuthStore from '../../store/authStore'

const STEPS = ['Account', 'Profile', 'Done']

export default function SignUpPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  const validateStep0 = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required.'
    else if (form.username.length < 3) errs.username = 'Must be at least 3 characters.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.'
    if (!form.password) errs.password = 'Password is required.'
    else if (form.password.length < 8) errs.password = 'Must be at least 8 characters.'
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match.'
    return errs
  }

  const handleNext = () => {
    if (step === 0) {
      const errs = validateStep0()
      if (Object.keys(errs).length) { setErrors(errs); return }
    }
    setStep((s) => s + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
        confirm_password: form.confirm_password,
        first_name: form.first_name,
        last_name: form.last_name,
      })
      setAuth({ user: data.user, accessToken: data.access, refreshToken: data.refresh })
      setStep(2)
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      const data = err.response?.data ?? {}
      const fieldErrs = {}
      Object.entries(data).forEach(([k, v]) => {
        fieldErrs[k] = Array.isArray(v) ? v[0] : v
      })
      setErrors(fieldErrs)
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  const FieldError = ({ name }) =>
    errors[name] ? (
      <p className="text-flame-400 text-xs mt-1">{errors[name]}</p>
    ) : null

  return (
    <div className="min-h-screen bg-spirit-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-10">
          <span className="text-2xl font-display text-gold-400 italic">✦</span>
          <span className="font-display text-xl text-spirit-100">SpiritWise</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  i < step
                    ? 'bg-gold-500 text-spirit-900'
                    : i === step
                    ? 'bg-spirit-700 border border-gold-500 text-gold-400'
                    : 'bg-spirit-800 border border-spirit-600 text-spirit-500'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px ${i < step ? 'bg-gold-500' : 'bg-spirit-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl text-spirit-100 italic">Create account</h2>
                <p className="text-spirit-400 text-sm mt-1">Start your daily scripture journey</p>
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="username">Username</label>
                <input id="username" name="username" type="text" value={form.username} onChange={handleChange} className="input-field" placeholder="faithful_reader" />
                <FieldError name="username" />
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
                <FieldError name="email" />
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="password">Password</label>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Min. 8 characters" />
                <FieldError name="password" />
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="confirm_password">Confirm password</label>
                <input id="confirm_password" name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} className="input-field" placeholder="••••••••" />
                <FieldError name="confirm_password" />
              </div>

              <button onClick={handleNext} className="btn-primary w-full">Continue</button>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="font-display text-2xl text-spirit-100 italic">About you</h2>
                <p className="text-spirit-400 text-sm mt-1">Optional — helps personalise your experience</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="label" htmlFor="first_name">First name</label>
                  <input id="first_name" name="first_name" type="text" value={form.first_name} onChange={handleChange} className="input-field" placeholder="Grace" />
                </div>
                <div className="space-y-1.5">
                  <label className="label" htmlFor="last_name">Last name</label>
                  <input id="last_name" name="last_name" type="text" value={form.last_name} onChange={handleChange} className="input-field" placeholder="Okonkwo" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(0)} className="btn-ghost flex-1">Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                      </svg>
                      Creating…
                    </>
                  ) : 'Create account'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="text-center py-6 space-y-4">
              <div className="text-5xl animate-pulse-slow">✦</div>
              <h2 className="font-display text-2xl text-gold-400 italic">Welcome aboard!</h2>
              <p className="text-spirit-400 text-sm">Redirecting to your dashboard…</p>
            </div>
          )}
        </div>

        {step < 2 && (
          <p className="text-center text-sm text-spirit-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
