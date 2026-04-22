import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AuthPanel } from '../components/auth-panel'
import { LoadingScreen } from '../components/loading-screen'
import { apiRequest } from '../api/client'
import { useAuth } from '../hooks/use-auth'
import { formatCurrency, formatTimeLeft } from '../lib/format'
import { useSecondTick } from '../hooks/use-second-tick'

export function SellerStudioPage () {
  const nowMs = useSecondTick(true)
  const auth = useAuth()
  const [values, setValues] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'Cyber Gear',
    basePrice: '3000',
    minBidIncrement: '100',
    durationMinutes: '45'
  })
  const [myAuctions, setMyAuctions] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const loadMyAuctions = useCallback(async () => {
    if (!auth.user) return
    try {
      const payload = await apiRequest(`/auctions?sellerId=${auth.user.id}&sortBy=createdAt&sortOrder=desc&limit=24`)
      setMyAuctions(payload.data)
    } catch (err) {
      setError(err.message)
    }
  }, [auth.user])

  useEffect(() => {
    if (!auth.user) return
    void loadMyAuctions()
  }, [auth.user, loadMyAuctions])

  async function submitAuction (e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const start = new Date()
      const end = new Date(start.getTime() + Number(values.durationMinutes) * 60 * 1000)
      await apiRequest('/auctions', {
        method: 'POST',
        body: {
          title: values.title,
          description: values.description,
          imageUrl: values.imageUrl || undefined,
          category: values.category,
          currency: 'ONX',
          basePrice: Number(values.basePrice),
          minBidIncrement: Number(values.minBidIncrement),
          startTime: start.toISOString(),
          endTime: end.toISOString()
        }
      })
      setValues((prev) => ({
        ...prev,
        title: '',
        description: '',
        imageUrl: ''
      }))
      await loadMyAuctions()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

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
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Seller Studio</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Sign in as a seller to publish a live auction.</h1>
          <div className="mt-8 max-w-md">
            <AuthPanel onLogin={auth.login} onRegister={auth.register} error={auth.error} />
          </div>
        </section>
      </div>
    )
  }

  if (auth.user.role !== 'seller' && auth.user.role !== 'admin') {
    return (
      <div className="aurora-bg min-h-screen">
        <section className="mx-auto w-full max-w-7xl px-4 py-10">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-200">Seller access required</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">This account is a buyer profile.</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Register a seller account from this screen, then return to publish auctions.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="aurora-bg min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            Signed in as <span className="font-semibold text-white">{auth.user.email}</span> ({auth.user.role})
          </div>
          <div className="flex items-center gap-2">
            <Link to="/live" className="rounded-xl border border-cyan-300/30 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-400/10">
              Open live floor
            </Link>
            <button
              onClick={auth.logout}
              className="rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-xs text-slate-300 hover:bg-black/35"
            >
              Logout
            </button>
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Seller Studio</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Create, launch, and monitor live auctions.</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Listings published here appear in the marketplace immediately. Every placed bid updates live everywhere.
        </p>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={submitAuction}
            className="glass space-y-3 rounded-2xl p-5"
          >
            <h2 className="text-lg font-semibold text-white">New listing</h2>
            <input
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
              placeholder="Lot title"
              required
            />
            <textarea
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              className="h-28 w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
              placeholder="Describe the item"
              required
            />
            <input
              value={values.imageUrl}
              onChange={(e) => setValues((v) => ({ ...v, imageUrl: e.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
              placeholder="Image URL (https://...)"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={values.category}
                onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
                placeholder="Category"
                required
              />
              <input
                type="number"
                min={1}
                value={values.durationMinutes}
                onChange={(e) => setValues((v) => ({ ...v, durationMinutes: e.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
                placeholder="Duration (minutes)"
                required
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={values.basePrice}
                onChange={(e) => setValues((v) => ({ ...v, basePrice: e.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
                placeholder="Base price (ONX)"
                required
              />
              <input
                type="number"
                min={1}
                step="0.01"
                value={values.minBidIncrement}
                onChange={(e) => setValues((v) => ({ ...v, minBidIncrement: e.target.value }))}
                className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
                placeholder="Min increment"
                required
              />
            </div>
            <button
              disabled={busy}
              className="w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {busy ? 'Publishing...' : 'Publish Live Auction'}
            </button>
          </motion.form>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5"
          >
            <h2 className="text-lg font-semibold text-white">Your recent auctions</h2>
            <div className="mt-4 max-h-[32rem] space-y-3 overflow-auto pr-1">
              {myAuctions.map((auction) => (
                <article key={auction._id} className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{auction.title}</p>
                    <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-cyan-100">
                      {auction.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{auction.category || 'Cyber Gear'}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-cyan-200">{formatCurrency(auction.currentBid, auction.currency)}</span>
                    <span className="text-slate-400">{formatTimeLeft(auction.endTime, nowMs)}</span>
                  </div>
                </article>
              ))}
              {myAuctions.length === 0 ? <p className="text-sm text-slate-400">No auctions created yet.</p> : null}
            </div>
          </motion.section>
        </div>
      </section>
    </div>
  )
}
