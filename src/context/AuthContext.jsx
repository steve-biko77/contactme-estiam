import { createContext, useContext, useState, useCallback } from 'react'
import { saveSession, clearSession, getUser, isAuthenticated } from '../lib/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => isAuthenticated() ? getUser() : null)

  const login = useCallback(async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || 'Identifiants incorrects')
    }
    const { token, user: userData } = await res.json()
    saveSession(token, userData)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
