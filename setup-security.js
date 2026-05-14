// Script de setup - lance avec: node setup-security.js
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const files = {
  'src/context/AuthContext.jsx': `import { createContext, useContext, useState, useCallback } from 'react'
import { saveSession, clearSession, getUser, isAuthenticated } from '../lib/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => isAuthenticated() ? getUser() : null)

  const login = useCallback(async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || 'Identifiants incorrects')
    }
    const { token, user: userData } = await res.json()
    saveSession(token, userData)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
`,

  'src/lib/auth.js': `const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export function saveSession(token, user) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  const raw = sessionStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function isAuthenticated() {
  const token = getToken()
  if (!token) return false
  try {
    const [, payload] = token.split('.')
    const decoded = JSON.parse(atob(payload))
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}
`,

  'src/lib/validation.js': `export function sanitize(str) {
  return String(str).replace(/<[^>]*>/g, '').trim()
}

export function validateEmail(email) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)
}

export function validatePhone(phone) {
  return /^[\\d\\s\\-+().]{6,20}$/.test(phone)
}

export function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/.test(password)
}

export function validateLoginForm({ username, password }) {
  const errors = {}
  if (!username || username.trim().length < 3) {
    errors.username = 'Identifiant requis (min. 3 caractères)'
  }
  if (!password || password.length < 8) {
    errors.password = 'Mot de passe requis (min. 8 caractères)'
  }
  return errors
}
`,

  'src/components/ProtectedRoute.jsx': `import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuth } = useAuth()
  if (!isAuth) return <Navigate to="/login" replace />
  return children
}
`,

  'src/page/Login.jsx': `import { useState } from 'react'
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
  card: { background: T.card, backdropFilter: 'blur(20px)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: T.shadow, border: \`1px solid \${T.cardBorder}\`, position: 'relative', zIndex: 1 },
  iconWrap: { fontSize: 40, textAlign: 'center', marginBottom: 12, animation: 'float 4s ease-in-out infinite', display: 'block' },
  title: { fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 700, margin: '0 0 6px', textAlign: 'center', background: \`linear-gradient(135deg,\${T.accent},\${T.accentLight})\`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: T.textMuted, fontSize: 14, fontWeight: 300, margin: '0 0 28px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: '0.2px' },
  input: { padding: '12px 16px', borderRadius: 12, border: \`2px solid rgba(108,92,231,0.15)\`, background: 'rgba(255,255,255,0.7)', fontSize: 15, fontFamily: "'Outfit',sans-serif", color: T.text, outline: 'none', transition: 'border-color .2s', width: '100%', boxSizing: 'border-box' },
  inputError: { borderColor: T.danger },
  fieldError: { fontSize: 12, color: T.danger, fontWeight: 500 },
  passwordWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 4 },
  apiError: { background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b', textAlign: 'center' },
  submitBtn: { marginTop: 8, padding: '14px', borderRadius: 12, border: 'none', background: \`linear-gradient(135deg,\${T.accent},\${T.accentLight})\`, color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: "'Outfit',sans-serif", cursor: 'pointer', boxShadow: \`0 4px 14px \${T.accentGlow}\`, transition: 'opacity .2s' },
  hint: { marginTop: 20, fontSize: 12, color: T.textMuted, textAlign: 'center' },
}
`,

  'src/page/Home.jsx': `import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ContactForm from '../components/ContactForm.jsx'
import ContactList from '../components/ContactList.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import * as api from '../api.js'

const T = {
  bg: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 30%, #fef6fb 60%, #f5f0ff 100%)',
  card: 'rgba(255,255,255,0.72)',
  cardBorder: 'rgba(255,255,255,0.9)',
  accent: '#6C5CE7',
  accentLight: '#a29bfe',
  accentGlow: 'rgba(108,92,231,0.25)',
  success: '#00b894',
  text: '#2d3436',
  textMuted: '#636e72',
  textLight: '#b2bec3',
  shadow: '0 8px 32px rgba(108,92,231,0.10), 0 2px 8px rgba(0,0,0,0.04)',
}

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [contacts, setContacts] = useState([])
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.fetchContacts()
      .then((data) => { setContacts(data); setLoading(false) })
      .catch(() => {
        setContacts([
          { id: 1, firstName: 'Marie', lastName: 'Curie', email: 'marie.curie@science.fr', phone: '+33 1 23 45 67 89' },
          { id: 2, firstName: 'Thomas', lastName: 'Pesquet', email: 'thomas@esa.int', phone: '+33 6 98 76 54 32' },
          { id: 3, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@computing.uk', phone: '+44 20 7946 0958' },
        ])
        setError('Backend non connecté — mode local activé')
        setLoading(false)
      })
  }, [])

  const addContact = async (data) => {
    try {
      const created = await api.createContact(data)
      setContacts([created, ...contacts])
    } catch {
      setContacts([{ ...data, id: Date.now() }, ...contacts])
    }
  }

  const updateContact = async (data) => {
    try {
      const updated = await api.updateContact(editing.id, data)
      setContacts(contacts.map((c) => (c.id === editing.id ? updated : c)))
    } catch {
      setContacts(contacts.map((c) => (c.id === editing.id ? { ...data, id: editing.id } : c)))
    }
    setEditing(null)
  }

  const deleteContact = async (id) => {
    try { await api.deleteContact(id) } catch { /* continue en local */ }
    setContacts(contacts.filter((c) => c.id !== id))
    if (editing?.id === id) setEditing(null)
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const filtered = contacts
    .filter((c) => {
      const q = search.toLowerCase()
      return c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) || c.phone.includes(q)
    })
    .sort((a, b) => {
      const cmp = a.lastName.localeCompare(b.lastName)
      return sortAsc ? cmp : -cmp
    })

  if (loading) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: T.textMuted, fontSize: 18 }}>Chargement...</p>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.blob3} />
      <div style={s.container}>
        <header style={s.header}>
          <div style={s.headerTop}>
            <div style={{ flex: 1 }} />
            <div style={s.userBadge}>
              <span style={s.userIcon}>👤</span>
              <span style={s.userName}>{user?.username}</span>
              <button onClick={handleLogout} style={s.logoutBtn}>Déconnexion</button>
            </div>
          </div>
          <div style={s.headerIcon}>👥</div>
          <h1 style={s.title}>Gestionnaire de Contacts</h1>
          <p style={s.subtitle}>Organisez vos contacts avec élégance</p>
        </header>

        {error && <div style={s.errorBanner}>⚠️ {error}</div>}

        <div style={s.statsBar}>
          <div style={s.statItem}>
            <span style={s.statNumber}>{contacts.length}</span>
            <span style={s.statLabel}>Contacts</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={s.searchWrapper}>
            <span style={s.searchIcon}>🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." style={s.searchInput} />
          </div>
          <button onClick={() => setSortAsc(!sortAsc)} style={s.sortBtn}>{sortAsc ? 'A→Z' : 'Z→A'}</button>
        </div>

        <ContactForm onSubmit={editing ? updateContact : addContact} editingContact={editing} onCancelEdit={() => setEditing(null)} />

        <div style={{ marginTop: 20 }}>
          <ContactList contacts={filtered} onEdit={setEditing} onDelete={deleteContact} />
        </div>

        <footer style={s.footer}>ESTIAM · Gestionnaire de Contacts · React + Vite + NodeJS</footer>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: T.bg, fontFamily: "'Outfit','Sora',sans-serif", position: 'relative', overflow: 'hidden', padding: '40px 16px 60px' },
  blob1: { position:'fixed',top:'-120px',right:'-80px',width:340,height:340,borderRadius:'50%',background:'radial-gradient(circle,rgba(108,92,231,0.12) 0%,transparent 70%)',pointerEvents:'none',animation:'float 6s ease-in-out infinite' },
  blob2: { position:'fixed',bottom:'-100px',left:'-60px',width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,184,148,0.10) 0%,transparent 70%)',pointerEvents:'none',animation:'float 8s ease-in-out infinite 1s' },
  blob3: { position:'fixed',top:'40%',left:'60%',width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,107,107,0.08) 0%,transparent 70%)',pointerEvents:'none',animation:'float 7s ease-in-out infinite .5s' },
  container: { maxWidth: 620, margin: '0 auto', position: 'relative', zIndex: 1 },
  header: { textAlign: 'center', marginBottom: 24 },
  headerTop: { display: 'flex', justifyContent: 'flex-end', marginBottom: 8 },
  userBadge: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '6px 14px', border: '1px solid rgba(108,92,231,0.15)' },
  userIcon: { fontSize: 14 },
  userName: { fontSize: 13, fontWeight: 600, color: T.text },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: T.textMuted, fontFamily: "'Outfit',sans-serif", padding: '2px 6px', borderRadius: 8, transition: 'color .2s' },
  headerIcon: { fontSize: 40, marginBottom: 8, animation: 'float 4s ease-in-out infinite', display: 'inline-block' },
  title: { fontFamily:"'Sora',sans-serif",fontSize:32,fontWeight:700,margin:'0 0 6px',letterSpacing:'-0.5px',background:\`linear-gradient(135deg,\${T.accent},\${T.accentLight},\${T.success})\`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundSize:'200% auto',animation:'shimmer 3s linear infinite' },
  subtitle: { color:T.textMuted,fontSize:15,fontWeight:300,margin:0 },
  errorBanner: { background:'rgba(253,203,110,0.2)',border:'1px solid rgba(253,203,110,0.5)',borderRadius:12,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#636e72',textAlign:'center' },
  statsBar: { display:'flex',alignItems:'center',gap:12,background:T.card,backdropFilter:'blur(20px)',borderRadius:16,padding:'12px 18px',marginBottom:20,boxShadow:T.shadow,border:\`1px solid \${T.cardBorder}\`,flexWrap:'wrap' },
  statItem: { display:'flex',flexDirection:'column',alignItems:'center',minWidth:55 },
  statNumber: { fontSize:22,fontWeight:700,color:T.accent,lineHeight:1 },
  statLabel: { fontSize:11,color:T.textMuted,fontWeight:400,marginTop:3,textTransform:'uppercase',letterSpacing:'0.5px' },
  searchWrapper: { position:'relative',flex:1,minWidth:140 },
  searchIcon: { position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' },
  searchInput: { width:'100%',padding:'10px 14px 10px 36px',borderRadius:12,border:'2px solid transparent',background:'rgba(255,255,255,0.6)',fontSize:14,fontFamily:"'Outfit',sans-serif",color:T.text,transition:'all .3s ease' },
  sortBtn: { padding:'10px 16px',borderRadius:12,border:'none',background:\`linear-gradient(135deg,\${T.accent},\${T.accentLight})\`,color:'#fff',fontSize:13,fontWeight:600,fontFamily:"'Outfit',sans-serif",cursor:'pointer',boxShadow:\`0 2px 10px \${T.accentGlow}\`,transition:'all .3s ease',whiteSpace:'nowrap' },
  footer: { textAlign:'center',marginTop:32,fontSize:12,color:T.textLight,fontWeight:400,letterSpacing:'0.5px' },
}
`,

  'src/App.jsx': `import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './page/Login.jsx'
import Home from './page/Home.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
`,

  'src/api.js': `import { getToken } from './lib/auth.js'

const API_URL = '/api/contacts'

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
  }
}

export async function fetchContacts() {
  const res = await fetch(API_URL, { headers: authHeaders() })
  if (!res.ok) throw new Error('Erreur lors du chargement des contacts')
  return res.json()
}

export async function createContact(contact) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(contact),
  })
  if (!res.ok) throw new Error('Erreur lors de la création du contact')
  return res.json()
}

export async function updateContact(id, contact) {
  const res = await fetch(\`\${API_URL}/\${id}\`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(contact),
  })
  if (!res.ok) throw new Error('Erreur lors de la modification du contact')
  return res.json()
}

export async function deleteContact(id) {
  const res = await fetch(\`\${API_URL}/\${id}\`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erreur lors de la suppression du contact')
  return res.json()
}
`,

  'backend/server.js': `import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const app = express()
const PORT = 5000
const JWT_SECRET = 'estiam-contacts-secret-2024'
const JWT_EXPIRES_IN = '8h'

app.use(cors())
app.use(express.json())

const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('Admin1234!', 10),
    role: 'admin',
  },
]

let contacts = [
  { id: 1, firstName: 'Marie', lastName: 'Curie', email: 'marie.curie@science.fr', phone: '+33 1 23 45 67 89' },
  { id: 2, firstName: 'Thomas', lastName: 'Pesquet', email: 'thomas@esa.int', phone: '+33 6 98 76 54 32' },
  { id: 3, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@computing.uk', phone: '+44 20 7946 0958' },
]
let nextId = 4

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' })
  }
  const token = authHeader.slice(7)
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' })
  }
  const user = users.find((u) => u.username === username)
  if (!user) return res.status(401).json({ error: 'Identifiants incorrects' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' })

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } })
})

app.get('/api/contacts', authMiddleware, (req, res) => res.json(contacts))

app.get('/api/contacts/:id', authMiddleware, (req, res) => {
  const contact = contacts.find((c) => c.id === parseInt(req.params.id))
  if (!contact) return res.status(404).json({ error: 'Contact non trouvé' })
  res.json(contact)
})

app.post('/api/contacts', authMiddleware, (req, res) => {
  const { firstName, lastName, email, phone } = req.body
  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ error: 'Tous les champs sont requis' })
  }
  const newContact = { id: nextId++, firstName, lastName, email, phone }
  contacts.unshift(newContact)
  res.status(201).json(newContact)
})

app.put('/api/contacts/:id', authMiddleware, (req, res) => {
  const index = contacts.findIndex((c) => c.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Contact non trouvé' })
  const { firstName, lastName, email, phone } = req.body
  contacts[index] = { ...contacts[index], firstName, lastName, email, phone }
  res.json(contacts[index])
})

app.delete('/api/contacts/:id', authMiddleware, (req, res) => {
  const index = contacts.findIndex((c) => c.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Contact non trouvé' })
  res.json(contacts.splice(index, 1)[0])
})

app.listen(PORT, () => console.log(\` Backend démarré sur http://localhost:\${PORT}\`))
`,
}

// Crée les dossiers et écrit les fichiers
for (const [filePath, content] of Object.entries(files)) {
  const dir = filePath.split('/').slice(0, -1).join('/')
  if (dir) mkdirSync(dir, { recursive: true })
  writeFileSync(filePath, content, 'utf8')
  console.log(`✓ ${filePath}`)
}

console.log('\nFichiers créés. Lance maintenant:')
console.log('  npm install react-router-dom')
console.log('  cd backend && npm install jsonwebtoken bcryptjs && cd ..')
console.log('  git add .')
console.log('  git commit -m "feat: context auth + routes sécurisées + login"')
console.log('  git push -u origin claude/react-context-login-security-xVMzF')
