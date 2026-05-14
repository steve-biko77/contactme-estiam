import express from 'express'
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

app.listen(PORT, () => console.log(` Backend démarré sur http://localhost:${PORT}`))
