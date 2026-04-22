import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { io } from 'socket.io-client'
import { AuthPanel } from '../components/auth-panel'
import { LoadingScreen } from '../components/loading-screen'
import { AuctionImage } from '../components/auction-image'
import { useAuth } from '../hooks/use-auth'
import { apiRequest } from '../api/client'
import { formatCurrency, formatTimeLeft } from '../lib/format'
import { useSecondTick } from '../hooks/use-second-tick'

export function ProfilePage () {
  const nowMs = useSecondTick(true)
  const auth = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileInitialized, setProfileInitialized] = useState(false)
  const [profileValues, setProfileValues] = useState({
    fullName: '',
    avatarUrl: '',
    phone: ''
  })

  const loadDashboard = useCallback(async () => {
    if (!auth.user) return
    try {
      setError('')
      const payload = await apiRequest('/users/me/dashboard')
      setDashboard(payload.data)
    } catch (err) {
      setError(err.message)
    }
  }, [auth.user])

  useEffect(() => {
    void loadDashboard()
    const id = setInterval(() => void loadDashboard(), 5000)
    return () => clearInterval(id)
  }, [loadDashboard])

  useEffect(() => {
    if (!auth.user) return
    const socket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socket.on('auction:finalized', () => {
      void loadDashboard()
    })
    socket.on('bid:placed', () => {
      void loadDashboard()
    })

    return () => socket.close()
  }, [auth.user, loadDashboard])

  useEffect(() => {
    if (!dashboard?.user || profileInitialized) return
    setProfileValues({
      fullName: dashboard.user.fullName || '',
      avatarUrl: dashboard.user.profile?.avatarUrl || '',
      phone: dashboard.user.profile?.phone || ''
    })
    setProfileInitialized(true)
  }, [dashboard, profileInitialized])

  if (auth.loading) {
    return (
      <div className="aurora-bg min-h-screen">
        <LoadingScreen loading />
      </div>
    )
  }

  if (!auth.user) {
    return (
      <div className="aurora-bg min-h-screen">
        <section className="mx-auto w-full max-w-7xl px-4 py-10">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Profile</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Sign in to view your profile and wins.</h1>
          <div className="mt-8 max-w-md">
            <AuthPanel onLogin={auth.login} onRegister={auth.register} error={auth.error} />
          </div>
        </section>
      </div>
    )
  }

  async function saveProfile (e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      await apiRequest('/users/me', {
        method: 'PATCH',
        body: {
          fullName: profileValues.fullName,
          profile: {
            avatarUrl: profileValues.avatarUrl || null,
            phone: profileValues.phone || null
          }
        }
      })
      await auth.refresh()
      await loadDashboard()
      setProfileInitialized(false)
      setNotice('Profile updated.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="aurora-bg min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">User profile</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">{auth.user.fullName}</h1>
            <p className="mt-2 text-sm text-slate-300">{auth.user.email}</p>
            <p className="mt-1 text-sm text-emerald-200">{auth.user.onyxCredits?.toLocaleString?.() || 0} ONX credits</p>
          </div>
          <button
            onClick={auth.logout}
            className="rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-xs text-slate-300 hover:bg-black/35"
          >
            Logout
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        {notice ? <p className="mt-4 text-sm text-emerald-300">{notice}</p> : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ProfileStat label="Won auctions" value={dashboard?.stats?.wonCount || 0} />
          <ProfileStat label="Active bids" value={dashboard?.stats?.activeBidCount || 0} />
          <ProfileStat label="Selling" value={dashboard?.stats?.sellingCount || 0} />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr,1fr,1fr]">
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-white">Account settings</h2>
            <form onSubmit={saveProfile} className="mt-4 space-y-3">
              <input
                value={profileValues.fullName}
                onChange={(e) => setProfileValues((v) => ({ ...v, fullName: e.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
                placeholder="Full name"
                required
              />
              <input
                value={profileValues.avatarUrl}
                onChange={(e) => setProfileValues((v) => ({ ...v, avatarUrl: e.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
                placeholder="Avatar URL (https://...)"
              />
              <input
                value={profileValues.phone}
                onChange={(e) => setProfileValues((v) => ({ ...v, phone: e.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
                placeholder="Phone"
              />
              <button
                disabled={saving}
                className="w-full rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save profile'}
              </button>
            </form>
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Role</p>
              <p className="mt-1 text-sm text-white">{auth.user.role}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-slate-400">Created</p>
              <p className="mt-1 text-sm text-slate-300">{new Date(dashboard?.user?.createdAt || auth.user.createdAt || Date.now()).toLocaleString()}</p>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-white">Won panel</h2>
            <div className="mt-4 space-y-3">
              {(dashboard?.wonAuctions || []).map((auction) => (
                <article key={auction._id} className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
                  <div className="grid gap-3 sm:grid-cols-[160px,1fr]">
                    <AuctionImage src={auction.imageUrl} alt={auction.title} className="h-32 w-full object-cover sm:h-full" />
                    <div className="p-3">
                      <p className="text-sm font-semibold text-white">{auction.title}</p>
                      <p className="mt-1 text-xs text-slate-300">Won at {formatCurrency(auction.currentBid, auction.currency)}</p>
                      <p className="mt-1 text-xs text-slate-400">Finalized {new Date(auction.finalizedAt || auction.endTime).toLocaleString()}</p>
                      <Link to={`/auctions/${auction._id}`} className="mt-3 inline-flex text-xs text-cyan-200 hover:text-cyan-100">
                        View details →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
              {(dashboard?.wonAuctions || []).length === 0 ? (
                <p className="text-sm text-slate-400">No settled wins yet. Place live bids in the marketplace.</p>
              ) : null}
            </div>
          </motion.section>

          <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white">Bids placed</h3>
              <div className="mt-3 space-y-2">
                {(dashboard?.placedBids || []).slice(0, 10).map((bid) => (
                  <Link key={bid.id} to={`/auctions/${bid.auctionId}`} className="block rounded-lg border border-white/10 bg-black/20 p-2 hover:border-cyan-300/40">
                    <div className="flex items-center gap-2">
                      <AuctionImage src={bid.auctionImageUrl} alt={bid.auctionTitle} className="h-10 w-12 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs text-white">{bid.auctionTitle}</p>
                        <div className="mt-1 flex items-center justify-between text-[11px]">
                          <span className="text-cyan-200">{formatCurrency(bid.bidAmount, bid.currency)}</span>
                          <span className="uppercase text-slate-400">{bid.auctionStatus || 'n/a'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {(dashboard?.placedBids || []).length === 0 ? <p className="text-xs text-slate-400">No bids placed yet.</p> : null}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white">Active bids</h3>
              <div className="mt-3 space-y-2">
                {(dashboard?.activeBidAuctions || []).slice(0, 8).map((auction) => (
                  <div key={auction._id} className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <p className="line-clamp-1 text-xs text-white">{auction.title}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-cyan-200">{formatCurrency(auction.currentBid, auction.currency)}</span>
                      <span className="text-slate-400">{formatTimeLeft(auction.endTime, nowMs)}</span>
                    </div>
                  </div>
                ))}
                {(dashboard?.activeBidAuctions || []).length === 0 ? <p className="text-xs text-slate-400">No active bid positions.</p> : null}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white">Seller lots</h3>
              <div className="mt-3 space-y-2">
                {(dashboard?.sellerAuctions || []).slice(0, 8).map((auction) => (
                  <div key={auction._id} className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <p className="line-clamp-1 text-xs text-white">{auction.title}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-cyan-200">{formatCurrency(auction.currentBid, auction.currency)}</span>
                      <span className="text-slate-400 uppercase">{auction.status}</span>
                    </div>
                  </div>
                ))}
                {(dashboard?.sellerAuctions || []).length === 0 ? <p className="text-xs text-slate-400">No seller listings yet.</p> : null}
              </div>
            </div>
          </motion.aside>
        </div>
      </section>
    </div>
  )
}

function ProfileStat ({ label, value }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}
