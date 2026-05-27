import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as authApi from '../modules/auth/api.js'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  const refreshUser = useCallback(async () => {
    const u = await authApi.restoreSession()
    setUser(u)
    setReady(true)
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (username, password) => {
    const { user: nextUser } = await authApi.login(username, password)
    setUser(nextUser)
    return nextUser
  }, [])

  const register = useCallback(async (username, password, options) => {
    const { user: nextUser } = await authApi.register(username, password, options)
    if (nextUser) setUser(nextUser)
    return nextUser
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, ready, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}
