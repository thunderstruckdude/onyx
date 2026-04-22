import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'

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
    } catch (err) {
      setError(err.message)
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
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  async function logout () {
    try {
      await apiRequest('/users/auth/logout', { method: 'POST' })
      setUser(null)
    } catch (err) {
      setError(err.message)
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
