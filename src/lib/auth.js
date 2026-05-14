const TOKEN_KEY = 'auth_token'
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
