import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiRequest } from '../api/client'
import { formatCurrency } from '../lib/format'
import { AuctionImage } from '../components/auction-image'

export function FinishedAuctionsPage () {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load () {
      try {
        setError('')
        setLoading(true)
        const [settled, ended] = await Promise.all([
          apiRequest('/auctions?status=settled&sortBy=endTime&sortOrder=desc&limit=50'),
          apiRequest('/auctions?status=ended&sortBy=endTime&sortOrder=desc&limit=50')
        ])
        setItems([...settled.data, ...ended.data])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const ordered = useMemo(
    () => [...items].sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()),
    [items]
  )

  return (
    <div className="aurora-bg min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Archive</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Finished auctions</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Completed lots ordered by most recently finished, including settled wins and ended rounds.
        </p>

        {loading ? <div className="mt-6 loader-spin" /> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ordered.map((auction, index) => (
            <motion.article
              key={auction._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.015 }}
              className="glass overflow-hidden rounded-2xl"
            >
              <AuctionImage src={auction.imageUrl} alt={auction.title} className="h-44 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-semibold text-white">{auction.title}</p>
                  <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-[10px] uppercase text-cyan-100">
                    {auction.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">Ended {new Date(auction.endTime).toLocaleString()}</p>
                <p className="mt-2 text-sm text-cyan-200">{formatCurrency(auction.currentBid, auction.currency)}</p>
                <Link
                  to={`/auctions/${auction._id}`}
                  className="mt-3 inline-flex rounded-lg border border-cyan-300/30 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-cyan-200 hover:bg-cyan-400/10"
                >
                  View report
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}
