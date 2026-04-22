import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiRequest } from '../api/client'
import { formatCurrency, formatTimeLeft } from '../lib/format'
import { useSecondTick } from '../hooks/use-second-tick'

export function AuctionDetailPage () {
  const nowMs = useSecondTick(true)
  const { auctionId } = useParams()
  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let timerId
    async function load () {
      try {
        const response = await apiRequest(`/auctions/${auctionId}/analytics`)
        setPayload(response.data)
        setError('')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    void load()
    timerId = setInterval(() => void load(), 7000)
    return () => clearInterval(timerId)
  }, [auctionId])

  const ratio = useMemo(() => {
    if (!payload) return 0
    const base = payload.auction.basePrice || 1
    const current = payload.auction.currentBid || base
    return Math.min(100, Math.round((current / base) * 100))
  }, [payload])

  return (
    <div className="aurora-bg min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <Link to="/marketplace" className="text-xs uppercase tracking-[0.18em] text-cyan-200 hover:text-cyan-100">
          ← back to marketplace
        </Link>

        {loading ? <div className="mt-6 loader-spin" /> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        {payload ? (
          <div className="mt-4 grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
              {payload.auction.imageUrl ? (
                <img
                  src={payload.auction.imageUrl}
                  alt={payload.auction.title}
                  className="mb-5 h-64 w-full rounded-2xl object-cover"
                />
              ) : null}
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{payload.auction.status}</p>
              <h1 className="mt-2 text-4xl font-semibold text-white">{payload.auction.title}</h1>
              <p className="mt-4 text-sm text-slate-300">{payload.auction.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Metric label="Current Bid" value={formatCurrency(payload.auction.currentBid, payload.auction.currency)} />
                <Metric label="Base Price" value={formatCurrency(payload.auction.basePrice, payload.auction.currency)} />
                <Metric label="Min Increment" value={formatCurrency(payload.auction.minBidIncrement, payload.auction.currency)} />
                <Metric label="Ends In" value={formatTimeLeft(payload.auction.endTime, nowMs)} />
              </div>

              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Bid intensity over base</p>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ratio}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400"
                  />
                </div>
              </div>
            </motion.div>

            <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Auction Stats</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <MetricMini label="Total Bids" value={payload.stats.totalBids} />
                  <MetricMini label="Unique Bidders" value={payload.stats.uniqueBidders} />
                  <MetricMini label="Avg Bid" value={formatCurrency(payload.stats.averageBidAmount, payload.auction.currency)} />
                  <MetricMini label="Velocity 10m" value={`${payload.stats.bidVelocityLast10m}/10m`} />
                </div>
              </div>

              <div className="glass rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Recent Bid Stream</p>
                <div className="mt-3 max-h-80 space-y-2 overflow-auto pr-1">
                  {payload.recentBids.map((bid) => (
                    <div key={bid._id} className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">
                          {formatCurrency(bid.bidAmount, bid.currency)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(bid.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        bidder • {String(bid.bidderId).slice(-8)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>
        ) : null}
      </section>
    </div>
  )
}

function Metric ({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg text-white">{value}</p>
    </div>
  )
}

function MetricMini ({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-slate-200">{value}</p>
    </div>
  )
}
