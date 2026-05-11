import { useState, useEffect, useRef } from 'react'

const T = {
  card: 'rgba(255,255,255,0.72)',
  cardBorder: 'rgba(255,255,255,0.9)',
  accent: '#6C5CE7',
  accentLight: '#a29bfe',
  accentGlow: 'rgba(108,92,231,0.25)',
  danger: '#ff6b6b',
  warn: '#fdcb6e',
  text: '#2d3436',
  textMuted: '#636e72',
  textLight: '#b2bec3',
  shadow: '0 8px 32px rgba(108,92,231,0.10), 0 2px 8px rgba(0,0,0,0.04)',
}

const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
const validatePhone = (p) => /^[\d\s\-+().]{6,20}$/.test(p)

export default function ContactForm({ onSubmit, editingContact, onCancelEdit }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const firstRef = useRef(null)

  useEffect(() => {
    if (editingContact) {
      setForm({ ...editingContact })
      firstRef.current?.focus()
    } else {
      setForm({ firstName: '', lastName: '', email: '', phone: '' })
    }
    setErrors({})
  }, [editingContact])

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Prénom requis'
    if (!form.lastName.trim()) e.lastName = 'Nom requis'
    if (!form.email.trim()) e.email = 'Email requis'
    else if (!validateEmail(form.email)) e.email = 'Email invalide'
    if (!form.phone.trim()) e.phone = 'Téléphone requis'
    else if (!validatePhone(form.phone)) e.phone = 'Téléphone invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    })
    if (!editingContact) {
      setForm({ firstName: '', lastName: '', email: '', phone: '' })
      firstRef.current?.focus()
    }
  }

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const isEditing = !!editingContact

  return (
    <div style={{ ...s.formCard, borderLeft: isEditing ? `4px solid ${T.warn}` : `4px solid ${T.accentLight}` }}>
      <h2 style={s.formTitle}>{isEditing ? '✏️ Modifier le contact' : '➕ Nouveau contact'}</h2>
      <div style={s.formGrid}>
        {[
          { key: 'firstName', label: 'Prénom', placeholder: 'Jean', ref: firstRef },
          { key: 'lastName', label: 'Nom', placeholder: 'Dupont' },
          { key: 'email', label: 'Email', placeholder: 'jean@email.com', type: 'email' },
          { key: 'phone', label: 'Téléphone', placeholder: '+33 6 12 34 56 78', type: 'tel' },
        ].map(({ key, label, placeholder, type, ref }) => (
          <div key={key} style={s.fieldGroup}>
            <label style={s.label}>{label}</label>
            <input
              ref={ref || undefined}
              type={type || 'text'}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
              style={{ ...s.input, borderColor: errors[key] ? T.danger : 'transparent' }}
            />
            {errors[key] && <span style={s.error}>{errors[key]}</span>}
          </div>
        ))}
      </div>
      <div style={s.formActions}>
        <button onClick={handleSubmit} style={s.submitBtn}>
          {isEditing ? 'Enregistrer' : 'Ajouter le contact'}
        </button>
        {isEditing && (
          <button onClick={onCancelEdit} style={s.cancelBtn}>Annuler</button>
        )}
      </div>
    </div>
  )
}

const s = {
  formCard: { background:T.card,backdropFilter:'blur(20px)',borderRadius:18,padding:'22px 24px',boxShadow:T.shadow,border:`1px solid ${T.cardBorder}` },
  formTitle: { fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:600,color:T.text,margin:'0 0 16px' },
  formGrid: { display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px 16px' },
  fieldGroup: { display:'flex',flexDirection:'column',gap:4 },
  label: { fontSize:12,fontWeight:500,color:T.textMuted,textTransform:'uppercase',letterSpacing:'0.5px' },
  input: { padding:'11px 14px',borderRadius:12,border:'2px solid transparent',background:'rgba(255,255,255,0.7)',fontSize:14,fontFamily:"'Outfit',sans-serif",color:T.text,boxShadow:'0 2px 8px rgba(0,0,0,0.03)',transition:'all .3s ease' },
  error: { fontSize:11,color:T.danger,fontWeight:500 },
  formActions: { display:'flex',gap:10,marginTop:16 },
  submitBtn: { padding:'12px 24px',borderRadius:14,border:'none',background:`linear-gradient(135deg,${T.accent},${T.accentLight})`,color:'#fff',fontSize:14,fontWeight:600,fontFamily:"'Outfit',sans-serif",cursor:'pointer',boxShadow:`0 4px 16px ${T.accentGlow}`,transition:'all .3s ease' },
  cancelBtn: { padding:'12px 20px',borderRadius:14,border:`2px solid ${T.textLight}`,background:'transparent',color:T.textMuted,fontSize:14,fontWeight:500,fontFamily:"'Outfit',sans-serif",cursor:'pointer',transition:'all .3s ease' },
}
