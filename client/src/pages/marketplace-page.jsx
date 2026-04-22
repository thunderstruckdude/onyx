import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { apiRequest } from '../api/client'
import { formatCurrency, formatTimeLeft } from '../lib/format'
import { useSecondTick } from '../hooks/use-second-tick'

export function MarketplacePage () {
  const nowMs = useSecondTick(true)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const itemsRef = useRef([])
  const socketRef = useRef(null)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    async function load () {
      try {
        setError('')
        setLoading(true)
        const payload = await apiRequest('/auctions?status=active&sortBy=currentBid&sortOrder=desc&limit=24')
        setItems(payload.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    void load()
    const id = setInterval(() => void load(), 20000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const socket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })
    socketRef.current = socket

    socket.on('connect', () => {
      itemsRef.current.forEach((auction) => socket.emit('auction:join', String(auction._id)))
    })

    socket.on('bid:placed', (event) => {
      setItems((prev) =>
        prev
          .map((item) =>
            String(item._id) === String(event.auctionId)
              ? {
                  ...item,
                  currentBid: event.auction.currentBid,
                  currentBidderId: event.auction.currentBidderId,
                  bidCount: event.auction.bidCount
                }
              : item
          )
          .sort((a, b) => b.currentBid - a.currentBid)
      )
    })

    socket.on('auction:finalized', (event) => {
      setItems((prev) => prev.filter((item) => String(item._id) !== String(event.auctionId)))
    })

    return () => {
      socketRef.current = null
      socket.close()
    }
  }, [])

  useEffect(() => {
    if (!socketRef.current) return
    items.forEach((auction) => socketRef.current.emit('auction:join', String(auction._id)))
  }, [items])

  return (
    <div className="aurora-bg min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Onyx Marketplace</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Live cyber-tech lots in active contention</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Real lots, real bids, live ranking updates. Open an item to inspect telemetry and bid stream depth in detail.
        </p>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        {loading ? <div className="mt-6 loader-spin" /> : null}
        {!loading && items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
            <p className="text-sm text-slate-200">No active auctions right now.</p>
            <p className="mt-2 text-xs text-slate-400">Create one from Seller Studio to repopulate the live floor instantly.</p>
            <Link
              to="/seller-studio"
              className="mt-4 inline-flex rounded-lg border border-cyan-300/30 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-cyan-200 transition hover:bg-cyan-400/10"
            >
              Open Seller Studio
            </Link>
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((auction, index) => (
            <motion.article
              key={auction._id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="glass overflow-hidden rounded-2xl"
            >
              <div className="relative h-44 w-full">
                <img
                  src={auction.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80'}
                  alt={auction.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-cyan-100">
                    {auction.category || 'Cyber Gear'}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-100">
                    Live
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-semibold text-white">{auction.title}</p>
                  <span className="text-[11px] text-slate-400">{auction.bidCount} bids</span>
                </div>
                <p className="line-clamp-2 text-sm text-slate-300">{auction.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <p className="text-slate-400">Current</p>
                    <p className="font-semibold text-cyan-200">{formatCurrency(auction.currentBid, auction.currency)}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <p className="text-slate-400">Ends In</p>
                    <p className="font-semibold text-white">{formatTimeLeft(auction.endTime, nowMs)}</p>
                  </div>
                </div>
                <Link
                  to={`/auctions/${auction._id}`}
                  className="mt-4 inline-flex rounded-lg border border-cyan-300/30 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-cyan-200 transition hover:bg-cyan-400/10"
                >
                  Open Intel View
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}
