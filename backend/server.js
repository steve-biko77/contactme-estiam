import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

// Base de données en mémoire
let contacts = [
  { id: 1, firstName: 'Marie', lastName: 'Curie', email: 'marie.curie@science.fr', phone: '+33 1 23 45 67 89' },
  { id: 2, firstName: 'Thomas', lastName: 'Pesquet', email: 'thomas@esa.int', phone: '+33 6 98 76 54 32' },
  { id: 3, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@computing.uk', phone: '+44 20 7946 0958' },
]
let nextId = 4

// GET /api/contacts — Récupérer tous les contacts
app.get('/api/contacts', (req, res) => {
  res.json(contacts)
})

// GET /api/contacts/:id — Récupérer un contact
app.get('/api/contacts/:id', (req, res) => {
  const contact = contacts.find((c) => c.id === parseInt(req.params.id))
  if (!contact) return res.status(404).json({ error: 'Contact non trouvé' })
  res.json(contact)
})

// POST /api/contacts — Créer un contact
app.post('/api/contacts', (req, res) => {
  const { firstName, lastName, email, phone } = req.body

  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ error: 'Tous les champs sont requis' })
  }

  const newContact = { id: nextId++, firstName, lastName, email, phone }
  contacts.unshift(newContact)
  res.status(201).json(newContact)
})

// PUT /api/contacts/:id — Modifier un contact
app.put('/api/contacts/:id', (req, res) => {
  const index = contacts.findIndex((c) => c.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Contact non trouvé' })

  const { firstName, lastName, email, phone } = req.body
  contacts[index] = { ...contacts[index], firstName, lastName, email, phone }
  res.json(contacts[index])
})

// DELETE /api/contacts/:id — Supprimer un contact
app.delete('/api/contacts/:id', (req, res) => {
  const index = contacts.findIndex((c) => c.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Contact non trouvé' })

  const deleted = contacts.splice(index, 1)[0]
  res.json(deleted)
})

app.listen(PORT, () => {
  console.log(` Backend démarré sur http://localhost:${PORT}`)
})
