import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'

function notifyAuthChanged () {
  window.dispatchEvent(new CustomEvent('auth:changed'))
}

function getReadableAuthError (err, fallback = 'Request failed') {
  if (Array.isArray(err?.details) && err.details.length > 0) {
    const first = err.details[0]
    if (first?.message) return first.message
  }
  return err?.message || fallback
}

export function useAuth () {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh () {
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

  async function login (values) {
    try {
      setError('')
      const payload = await apiRequest('/users/auth/login', {
        method: 'POST',
        body: values
      })
      setUser(payload.data.user)
      notifyAuthChanged()
    } catch (err) {
      setError(getReadableAuthError(err, 'Login failed'))
      throw err
    }
  }

  async function register (values) {
    try {
      setError('')
      const payload = await apiRequest('/users/auth/register', {
        method: 'POST',
        body: values
      })
      setUser(payload.data.user)
      notifyAuthChanged()
    } catch (err) {
      setError(getReadableAuthError(err, 'Registration failed'))
      throw err
    }
  }

  async function logout () {
    try {
      await apiRequest('/users/auth/logout', { method: 'POST' })
      setUser(null)
      notifyAuthChanged()
    } catch (err) {
      setError(getReadableAuthError(err, 'Logout failed'))
      throw err
    }
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
