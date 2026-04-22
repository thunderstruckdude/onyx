import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api/client'
import { formatCurrency, formatTimeLeft } from '../lib/format'

export function MarketplacePage () {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load () {
      setLoading(true)
      try {
        const payload = await apiRequest('/auctions?status=active&sortBy=currentBid&sortOrder=desc&limit=24')
        setItems(payload.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="aurora-bg min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Onyx Marketplace</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-white">Cyber-tech lots in active contention</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Explore weaponized wearables, neural hardware, and black-market intelligence devices currently running live.
        </p>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        {loading ? <div className="mt-6 loader-spin" /> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((auction, index) => (
            <motion.article
              key={auction._id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="glass rounded-2xl p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{auction.title}</p>
                <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-indigo-200">
                  Signal: Live
                </span>
              </div>
              <p className="line-clamp-3 text-sm text-slate-300">{auction.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <p className="text-slate-400">Current</p>
                  <p className="font-semibold text-cyan-200">{formatCurrency(auction.currentBid, auction.currency)}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <p className="text-slate-400">Ends In</p>
                  <p className="font-semibold text-white">{formatTimeLeft(auction.endTime)}</p>
                </div>
              </div>
              <Link
                to={`/auctions/${auction._id}`}
                className="mt-4 inline-flex rounded-lg border border-cyan-300/30 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-cyan-200 transition hover:bg-cyan-400/10"
              >
                Open Intel View
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}
