import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { sanitize, validateLoginForm } from '../lib/validation.js'

const T = {
  bg: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 30%, #fef6fb 60%, #f5f0ff 100%)',
  accent: '#6C5CE7',
  accentLight: '#a29bfe',
  accentGlow: 'rgba(108,92,231,0.25)',
  card: 'rgba(255,255,255,0.82)',
  cardBorder: 'rgba(255,255,255,0.9)',
  shadow: '0 8px 32px rgba(108,92,231,0.12), 0 2px 8px rgba(0,0,0,0.04)',
  text: '#2d3436',
  textMuted: '#636e72',
  danger: '#ff6b6b',
}

export default function Login() {
  const { login, isAuth } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (isAuth) return <Navigate to="/" replace />

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setApiError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleaned = { username: sanitize(form.username), password: form.password }
    const errs = validateLoginForm(cleaned)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError('')
    try {
      await login(cleaned.username, cleaned.password)
      navigate('/', { replace: true })
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} />
      <div style={s.card}>
        <div style={s.iconWrap}>🔐</div>
        <h1 style={s.title}>Connexion</h1>
        <p style={s.subtitle}>Gestionnaire de Contacts ESTIAM</p>

        <form onSubmit={handleSubmit} noValidate style={s.form}>
          <div style={s.fieldGroup}>
            <label htmlFor="username" style={s.label}>Identifiant</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              value={form.username}
              onChange={handleChange}
              placeholder="admin"
              maxLength={50}
              style={{ ...s.input, ...(errors.username ? s.inputError : {}) }}
              aria-describedby={errors.username ? 'username-err' : undefined}
            />
            {errors.username && (
              <span id="username-err" style={s.fieldError}>{errors.username}</span>
            )}
          </div>

          <div style={s.fieldGroup}>
            <label htmlFor="password" style={s.label}>Mot de passe</label>
            <div style={s.passwordWrap}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                maxLength={128}
                style={{ ...s.input, paddingRight: 44, ...(errors.password ? s.inputError : {}) }}
                aria-describedby={errors.password ? 'password-err' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={s.eyeBtn}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <span id="password-err" style={s.fieldError}>{errors.password}</span>
            )}
          </div>

          {apiError && <div style={s.apiError} role="alert">⚠️ {apiError}</div>}

          <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={s.hint}>Compte démo : <strong>admin</strong> / <strong>Admin1234!</strong></p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit','Sora',sans-serif", position: 'relative', overflow: 'hidden', padding: 16 },
  blob1: { position: 'fixed', top: '-120px', right: '-80px', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(108,92,231,0.12) 0%,transparent 70%)', pointerEvents: 'none', animation: 'float 6s ease-in-out infinite' },
  blob2: { position: 'fixed', bottom: '-100px', left: '-60px', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,184,148,0.10) 0%,transparent 70%)', pointerEvents: 'none', animation: 'float 8s ease-in-out infinite 1s' },
  card: { background: T.card, backdropFilter: 'blur(20px)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: T.shadow, border: `1px solid ${T.cardBorder}`, position: 'relative', zIndex: 1 },
  iconWrap: { fontSize: 40, textAlign: 'center', marginBottom: 12, animation: 'float 4s ease-in-out infinite', display: 'block' },
  title: { fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 700, margin: '0 0 6px', textAlign: 'center', background: `linear-gradient(135deg,${T.accent},${T.accentLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: T.textMuted, fontSize: 14, fontWeight: 300, margin: '0 0 28px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: '0.2px' },
  input: { padding: '12px 16px', borderRadius: 12, border: `2px solid rgba(108,92,231,0.15)`, background: 'rgba(255,255,255,0.7)', fontSize: 15, fontFamily: "'Outfit',sans-serif", color: T.text, outline: 'none', transition: 'border-color .2s', width: '100%', boxSizing: 'border-box' },
  inputError: { borderColor: T.danger },
  fieldError: { fontSize: 12, color: T.danger, fontWeight: 500 },
  passwordWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 4 },
  apiError: { background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b', textAlign: 'center' },
  submitBtn: { marginTop: 8, padding: '14px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${T.accent},${T.accentLight})`, color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: "'Outfit',sans-serif", cursor: 'pointer', boxShadow: `0 4px 14px ${T.accentGlow}`, transition: 'opacity .2s' },
  hint: { marginTop: 20, fontSize: 12, color: T.textMuted, textAlign: 'center' },
}
