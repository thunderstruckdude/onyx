import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiRequest } from '../api/client'
import { formatCurrency, formatTimeLeft } from '../lib/format'
import { useSecondTick } from '../hooks/use-second-tick'
import { AuctionImage } from '../components/auction-image'

export function AuctionDetailPage () {
  const nowMs = useSecondTick(true)
  const { auctionId } = useParams()
  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [bidAmount, setBidAmount] = useState('')
  const [placingBid, setPlacingBid] = useState(false)

  useEffect(() => {
    async function loadMe () {
      try {
        const me = await apiRequest('/users/me')
        setUser(me.data.user)
      } catch {
        setUser(null)
      }
    }
    void loadMe()
  }, [])

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

  const report = useMemo(() => {
    if (!payload) return null
    const { auction, stats, recentBids } = payload
    const auctionStart = new Date(auction.startTime).getTime()
    const auctionEnd = new Date(auction.endTime).getTime()
    const durationMinutes = Math.max(1, Math.round((auctionEnd - auctionStart) / (1000 * 60)))
    const liftAmount = auction.currentBid - auction.basePrice
    const liftPercent = auction.basePrice > 0 ? (liftAmount / auction.basePrice) * 100 : 0
    const firstBid = recentBids.length > 0 ? recentBids[recentBids.length - 1] : null
    const lastBid = recentBids.length > 0 ? recentBids[0] : null

    return {
      isActive: auction.status === 'active',
      durationMinutes,
      liftAmount,
      liftPercent,
      firstBidAt: firstBid?.createdAt || null,
      lastBidAt: lastBid?.createdAt || null,
      winnerId: auction.currentBidderId ? String(auction.currentBidderId) : null,
      priceSpread: Math.max(0, stats.highestBidAmount - stats.lowestBidAmount)
    }
  }, [payload])

  async function submitBid (e) {
    e.preventDefault()
    if (!payload) return
    const minBid = payload.auction.currentBid + payload.auction.minBidIncrement
    const normalized = Number(bidAmount || minBid)
    if (Number.isNaN(normalized) || normalized < minBid) {
      setError(`Bid must be at least ${minBid}`)
      return
    }
    setPlacingBid(true)
    setError('')
    try {
      await apiRequest(`/bids/auctions/${payload.auction._id}`, {
        method: 'POST',
        body: { bidAmount: normalized }
      })
      setBidAmount('')
    } catch (err) {
      setError(err.message)
    } finally {
      setPlacingBid(false)
    }
  }

  return (
    <div className="aurora-bg min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <Link to={report?.isActive ? '/marketplace' : '/finished'} className="text-xs uppercase tracking-[0.18em] text-cyan-200 hover:text-cyan-100">
          ← back to {report?.isActive ? 'marketplace' : 'finished'}
        </Link>

        {loading ? <div className="mt-6 loader-spin" /> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        {payload ? (
          <div className="mt-4 grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
              <AuctionImage
                src={payload.auction.imageUrl}
                alt={payload.auction.title}
                className="mb-5 h-64 w-full rounded-2xl object-cover"
              />
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                {report?.isActive ? 'Live Intel View' : 'Post-Auction Report'}
              </p>
              <h1 className="mt-2 text-4xl font-semibold text-white">{payload.auction.title}</h1>
              <p className="mt-4 text-sm text-slate-300">{payload.auction.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Metric label="Current Bid" value={formatCurrency(payload.auction.currentBid, payload.auction.currency)} />
                <Metric label="Base Price" value={formatCurrency(payload.auction.basePrice, payload.auction.currency)} />
                <Metric label="Min Increment" value={formatCurrency(payload.auction.minBidIncrement, payload.auction.currency)} />
                <Metric label={report?.isActive ? 'Ends In' : 'Ended At'} value={report?.isActive ? formatTimeLeft(payload.auction.endTime, nowMs) : new Date(payload.auction.endTime).toLocaleString()} />
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

              {report?.isActive ? (
                <form onSubmit={submitBid} className="mt-6 rounded-2xl border border-cyan-300/25 bg-black/25 p-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-200">Place bid now</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="number"
                      min={payload.auction.currentBid + payload.auction.minBidIncrement}
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min ${payload.auction.currentBid + payload.auction.minBidIncrement}`}
                      className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-white outline-none"
                    />
                    <button
                      disabled={!user || user.role === 'seller' || placingBid}
                      className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                    >
                      {placingBid ? 'Submitting...' : 'Place Bid'}
                    </button>
                  </div>
                  {!user ? <p className="mt-2 text-xs text-slate-400">Sign in as buyer to place bids.</p> : null}
                </form>
              ) : (
                <div className="mt-6 rounded-2xl border border-emerald-300/25 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Final outcome</p>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <MetricMini label="Status" value={String(payload.auction.status).toUpperCase()} />
                    <MetricMini label="Winning Bidder" value={report?.winnerId ? `…${report.winnerId.slice(-8)}` : 'No winner'} />
                    <MetricMini label="Total Lift" value={`${formatCurrency(report?.liftAmount || 0, payload.auction.currency)} (${(report?.liftPercent || 0).toFixed(1)}%)`} />
                    <MetricMini label="Duration" value={`${report?.durationMinutes || 0} min`} />
                  </div>
                </div>
              )}
            </motion.div>

            <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                  {report?.isActive ? 'Auction Stats' : 'Closing Analytics'}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <MetricMini label="Total Bids" value={payload.stats.totalBids} />
                  <MetricMini label="Unique Bidders" value={payload.stats.uniqueBidders} />
                  <MetricMini label="Avg Bid" value={formatCurrency(payload.stats.averageBidAmount, payload.auction.currency)} />
                  <MetricMini label={report?.isActive ? 'Velocity 10m' : 'Price Spread'} value={report?.isActive ? `${payload.stats.bidVelocityLast10m}/10m` : formatCurrency(report?.priceSpread || 0, payload.auction.currency)} />
                  <MetricMini label="Highest Bid" value={formatCurrency(payload.stats.highestBidAmount, payload.auction.currency)} />
                  <MetricMini label="Lowest Bid" value={formatCurrency(payload.stats.lowestBidAmount, payload.auction.currency)} />
                </div>
              </div>

              <div className="glass rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-teal-200">Timeline</p>
                <div className="mt-3 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 p-2">
                    <span>Start time</span>
                    <span>{new Date(payload.auction.startTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 p-2">
                    <span>End time</span>
                    <span>{new Date(payload.auction.endTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 p-2">
                    <span>First bid</span>
                    <span>{report?.firstBidAt ? new Date(report.firstBidAt).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 p-2">
                    <span>Last bid</span>
                    <span>{report?.lastBidAt ? new Date(report.lastBidAt).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">
                  {report?.isActive ? 'Recent Bid Stream' : 'Bid Ledger'}
                </p>
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
