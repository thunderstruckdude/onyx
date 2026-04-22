import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthPanel } from '../components/auth-panel'
import { LoadingScreen } from '../components/loading-screen'
import { useAuth } from '../hooks/use-auth'
import { apiRequest } from '../api/client'
import { formatCurrency, formatTimeLeft } from '../lib/format'
import { useSecondTick } from '../hooks/use-second-tick'

export function ProfilePage () {
  const nowMs = useSecondTick(true)
  const auth = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard () {
      if (!auth.user) return
      try {
        setError('')
        const payload = await apiRequest('/users/me/dashboard')
        setDashboard(payload.data)
      } catch (err) {
        setError(err.message)
      }
    }

    void loadDashboard()
    const id = setInterval(() => void loadDashboard(), 15000)
    return () => clearInterval(id)
  }, [auth.user])

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

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ProfileStat label="Won auctions" value={dashboard?.stats?.wonCount || 0} />
          <ProfileStat label="Active bids" value={dashboard?.stats?.activeBidCount || 0} />
          <ProfileStat label="Selling" value={dashboard?.stats?.sellingCount || 0} />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-white">Won panel</h2>
            <div className="mt-4 space-y-3">
              {(dashboard?.wonAuctions || []).map((auction) => (
                <article key={auction._id} className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
                  <div className="grid gap-3 sm:grid-cols-[160px,1fr]">
                    <img
                      src={auction.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
                      alt={auction.title}
                      className="h-32 w-full object-cover sm:h-full"
                    />
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
