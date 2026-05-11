import ContactItem from './ContactItem.jsx'

const T = {
  card: 'rgba(255,255,255,0.72)',
  cardBorder: 'rgba(255,255,255,0.9)',
  text: '#2d3436',
  textMuted: '#636e72',
  shadow: '0 8px 32px rgba(108,92,231,0.10), 0 2px 8px rgba(0,0,0,0.04)',
}

export default function ContactList({ contacts, onEdit, onDelete }) {
  if (contacts.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '48px 20px', background: T.card,
        backdropFilter: 'blur(20px)', borderRadius: 18,
        border: `1px solid ${T.cardBorder}`, boxShadow: T.shadow,
      }}>
        <div style={{ fontSize: 48, marginBottom: 12, animation: 'float 5s ease-in-out infinite' }}>👥</div>
        <p style={{ fontSize: 17, fontWeight: 600, color: T.text, margin: '0 0 6px' }}>Aucun contact trouvé</p>
        <p style={{ fontSize: 14, color: T.textMuted, margin: 0 }}>Ajoutez votre premier contact ci-dessus !</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {contacts.map((c, i) => (
        <div key={c.id} className="contact-enter" style={{ animationDelay: `${i * 50}ms` }}>
          <ContactItem contact={c} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  )
}
