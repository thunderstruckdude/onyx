export function formatCurrency(value, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(Number(value || 0))
  } catch {
    return `${currency} ${Number(value || 0).toFixed(2)}`
  }
}

export function formatTimeLeft(endTime) {
  const ms = new Date(endTime).getTime() - Date.now()
  if (ms <= 0) return 'Ended'
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
