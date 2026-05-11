const API_URL = '/api/contacts'

export async function fetchContacts() {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('Erreur lors du chargement des contacts')
  return res.json()
}

export async function createContact(contact) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact),
  })
  if (!res.ok) throw new Error('Erreur lors de la création du contact')
  return res.json()
}

export async function updateContact(id, contact) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact),
  })
  if (!res.ok) throw new Error('Erreur lors de la modification du contact')
  return res.json()
}

export async function deleteContact(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur lors de la suppression du contact')
  return res.json()
}
