import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { io } from 'socket.io-client'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../hooks/use-auth'

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/finished', label: 'Finished' },
  { to: '/profile', label: 'Profile' },
  { to: '/seller-studio', label: 'Seller Studio' },
  { to: '/live', label: 'Live' }
]

export function SiteNav () {
  const [busy, setBusy] = useState(false)
  const [alerts, setAlerts] = useState([])
  const { user, refresh } = useAuth()

  useEffect(() => {
    function handleAuthChanged () {
      void refresh()
    }
    window.addEventListener('auth:changed', handleAuthChanged)
    return () => window.removeEventListener('auth:changed', handleAuthChanged)
  }, [refresh])

  useEffect(() => {
    if (!user) {
      setAlerts([])
      return undefined
    }

    const socket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socket.on('bid:outbid', (event) => {
      const alert = {
        id: `${event.auctionId}:${Date.now()}`,
        title: 'You were outbid',
        message: `Your bid on ${event.auction?.title || 'an auction'} was passed.`,
        value: event.newBidAmount,
        currency: event.auction?.currency || 'ONX'
      }

      setAlerts((prev) => [alert, ...prev].slice(0, 3))

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Onyx Auction', { body: alert.message })
      }

      window.setTimeout(() => {
        setAlerts((prev) => prev.filter((item) => item.id !== alert.id))
      }, 7000)
    })

    return () => socket.close()
  }, [user])

  const initials = useMemo(() => {
    if (!user?.fullName) return 'U'
    return user.fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [user])

  async function handleLogout () {
    try {
      setBusy(true)
      await apiRequest('/users/auth/logout', { method: 'POST' })
      window.dispatchEvent(new CustomEvent('auth:changed'))
      window.location.href = '/live'
    } catch {
      // no-op
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-cyan-400/20 bg-[#05040c]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.95)]" />
          <span className="font-display text-sm font-semibold tracking-wide text-white">ONYX</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'rounded-full px-3 py-1.5 text-xs tracking-wide transition',
                  isActive ? 'bg-cyan-400/20 text-cyan-100' : 'text-slate-300 hover:bg-white/10'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'admin' ? (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                clsx(
                  'rounded-full px-3 py-1.5 text-xs tracking-wide transition',
                  isActive ? 'bg-rose-400/20 text-rose-100' : 'text-rose-200 hover:bg-white/10'
                )
              }
            >
              Admin
            </NavLink>
          ) : null}
          {user ? (
            <div className="ml-2 flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-2 py-1">
              <Link to="/profile" className="flex items-center gap-2">
                {user.profile?.avatarUrl ? (
                  <img src={user.profile.avatarUrl} alt={user.fullName} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-400/20 text-[10px] font-semibold text-cyan-100">
                    {initials}
                  </span>
                )}
                <span className="max-w-[7rem] truncate text-xs text-slate-200">{user.fullName}</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={busy}
                className="rounded-full px-2 py-1 text-[11px] text-slate-300 transition hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" className="ml-2 rounded-full border border-cyan-300/30 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-400/10">
              Sign in
            </Link>
          )}
        </nav>
        </div>
      </header>

      {alerts.length > 0 ? (
        <div className="pointer-events-none fixed right-4 top-20 z-40 flex w-[22rem] flex-col gap-3">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className="rounded-2xl border border-rose-400/30 bg-[#09060f]/95 p-4 shadow-2xl shadow-black/30"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-rose-200">{alert.title}</p>
              <p className="mt-2 text-sm text-slate-200">{alert.message}</p>
              <p className="mt-2 text-xs text-slate-400">
                New high bid: {alert.value?.toLocaleString?.() || alert.value} {alert.currency}
              </p>
            </motion.div>
          ))}
        </div>
      ) : null}
    </>
  )
}
