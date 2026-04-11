import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    try {
      setError('')
      const payload = await apiRequest('/users/me')
      setUser(payload.data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function login(values) {
    setError('')
    const payload = await apiRequest('/users/auth/login', {
      method: 'POST',
      body: values
    })
    setUser(payload.data.user)
  }

  async function register(values) {
    setError('')
    await apiRequest('/users/auth/register', {
      method: 'POST',
      body: values
    })
  }

  async function logout() {
    await apiRequest('/users/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return {
    user,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    refresh
  }
}
