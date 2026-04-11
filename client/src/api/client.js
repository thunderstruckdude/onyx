const API_PREFIX = '/api/v1'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_PREFIX}${path}`, {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload?.error?.message || 'Request failed'
    const error = new Error(message)
    error.status = response.status
    error.details = payload?.error?.details
    throw error
  }
  return payload
}
