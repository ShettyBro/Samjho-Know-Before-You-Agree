import { useEffect, useState } from 'react'
import { fetchCurrentUser, loginAccount, logoutAccount, registerAccount } from '../api/auth.js'
import type { PublicUser } from '../api/types.js'

export function useAuth() {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchCurrentUser().then((result) => {
      if (cancelled) return
      setUser(result.ok ? result.value.user : null)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function login(email: string, password: string): Promise<boolean> {
    setPending(true)
    setError(null)
    const result = await loginAccount(email, password)
    setPending(false)
    if (!result.ok) {
      setError(result.error.message)
      return false
    }
    setUser(result.value.user)
    return true
  }

  async function register(email: string, password: string): Promise<boolean> {
    setPending(true)
    setError(null)
    const result = await registerAccount(email, password)
    setPending(false)
    if (!result.ok) {
      setError(result.error.message)
      return false
    }
    setUser(result.value.user)
    return true
  }

  async function logout(): Promise<void> {
    await logoutAccount()
    setUser(null)
  }

  return { user, loading, pending, error, login, register, logout }
}
