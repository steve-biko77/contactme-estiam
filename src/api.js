import { getToken } from './lib/auth.js'

const API_URL = '/api/contacts'

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(contact),
  })
  if (!res.ok) throw new Error('Erreur lors de la modification du contact')
  return res.json()
}

export async function deleteContact(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erreur lors de la suppression du contact')
  return res.json()
}
