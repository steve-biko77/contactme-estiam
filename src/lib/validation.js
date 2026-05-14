export function sanitize(str) {
  return String(str).replace(/<[^>]*>/g, '').trim()
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone) {
  return /^[\d\s\-+().]{6,20}$/.test(phone)
}

export function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
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
