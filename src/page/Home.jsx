import { useState, useEffect } from 'react'
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
  title: { fontFamily:"'Sora',sans-serif",fontSize:32,fontWeight:700,margin:'0 0 6px',letterSpacing:'-0.5px',background:`linear-gradient(135deg,${T.accent},${T.accentLight},${T.success})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundSize:'200% auto',animation:'shimmer 3s linear infinite' },
  subtitle: { color:T.textMuted,fontSize:15,fontWeight:300,margin:0 },
  errorBanner: { background:'rgba(253,203,110,0.2)',border:'1px solid rgba(253,203,110,0.5)',borderRadius:12,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#636e72',textAlign:'center' },
  statsBar: { display:'flex',alignItems:'center',gap:12,background:T.card,backdropFilter:'blur(20px)',borderRadius:16,padding:'12px 18px',marginBottom:20,boxShadow:T.shadow,border:`1px solid ${T.cardBorder}`,flexWrap:'wrap' },
  statItem: { display:'flex',flexDirection:'column',alignItems:'center',minWidth:55 },
  statNumber: { fontSize:22,fontWeight:700,color:T.accent,lineHeight:1 },
  statLabel: { fontSize:11,color:T.textMuted,fontWeight:400,marginTop:3,textTransform:'uppercase',letterSpacing:'0.5px' },
  searchWrapper: { position:'relative',flex:1,minWidth:140 },
  searchIcon: { position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' },
  searchInput: { width:'100%',padding:'10px 14px 10px 36px',borderRadius:12,border:'2px solid transparent',background:'rgba(255,255,255,0.6)',fontSize:14,fontFamily:"'Outfit',sans-serif",color:T.text,transition:'all .3s ease' },
  sortBtn: { padding:'10px 16px',borderRadius:12,border:'none',background:`linear-gradient(135deg,${T.accent},${T.accentLight})`,color:'#fff',fontSize:13,fontWeight:600,fontFamily:"'Outfit',sans-serif",cursor:'pointer',boxShadow:`0 2px 10px ${T.accentGlow}`,transition:'all .3s ease',whiteSpace:'nowrap' },
  footer: { textAlign:'center',marginTop:32,fontSize:12,color:T.textLight,fontWeight:400,letterSpacing:'0.5px' },
}
