import { useState } from 'react'

const T = {
  card: 'rgba(255,255,255,0.72)',
  cardBorder: 'rgba(255,255,255,0.9)',
  accent: '#6C5CE7',
  danger: '#ff6b6b',
  dangerGlow: 'rgba(255,107,107,0.2)',
  text: '#2d3436',
  textMuted: '#636e72',
  shadow: '0 8px 32px rgba(108,92,231,0.10), 0 2px 8px rgba(0,0,0,0.04)',
  shadowHover: '0 12px 40px rgba(108,92,231,0.18), 0 4px 12px rgba(0,0,0,0.06)',
}

const COLORS = ['#6C5CE7', '#00b894', '#e17055', '#0984e3', '#d63031', '#00cec9', '#e84393', '#fdcb6e']

export default function ContactItem({ contact, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const [exiting, setExiting] = useState(false)

  const initials = (contact.firstName[0] + contact.lastName[0]).toUpperCase()
  const color = COLORS[contact.id % COLORS.length]

  const handleDelete = () => {
    setExiting(true)
    setTimeout(() => onDelete(contact.id), 300)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
        borderRadius: 14, background: T.card, backdropFilter: 'blur(20px)',
        border: `1px solid ${T.cardBorder}`, cursor: 'default',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateX(40px) scale(0.95)' : hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? T.shadowHover : T.shadow,
        transition: 'all .3s cubic-bezier(.4,0,.2,1)',
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: "'Sora',sans-serif",
        flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
      }}>
        {initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>
          {contact.firstName} {contact.lastName}
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          ✉ {contact.email}
        </div>
        <div style={{ fontSize: 13, color: T.textMuted }}>
          ☎ {contact.phone}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'all .25s ease' }}>
        <button onClick={() => onEdit(contact)} title="Modifier" style={{
          width: 34, height: 34, borderRadius: 10, border: 'none',
          background: 'rgba(108,92,231,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all .25s ease',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button onClick={handleDelete} title="Supprimer" style={{
          width: 34, height: 34, borderRadius: 10, border: 'none',
          background: T.dangerGlow, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all .25s ease',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
