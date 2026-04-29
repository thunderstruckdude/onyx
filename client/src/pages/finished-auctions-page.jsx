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
              className="archive-card rounded-[1.75rem]"
            >
              <div className="auction-card-media relative h-52 w-full">
                <AuctionImage src={auction.imageUrl} alt={auction.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070c] via-[#05070c]/30 to-transparent" />
                <div className="absolute left-3 top-3">
                  <span className="auction-pill rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                    {auction.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-xl">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Ended</p>
                    <p className="mt-1 text-sm font-semibold text-white">{new Date(auction.endTime).toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200">Final bid</p>
                    <p className="mt-1 text-sm font-semibold text-white">{formatCurrency(auction.currentBid, auction.currency)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <p className="line-clamp-1 text-base font-semibold text-white">{auction.title}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                  Closed auction archive entry with report-ready settlement detail.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="auction-stat rounded-2xl p-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Status</p>
                    <p className="mt-1 font-semibold text-cyan-200">{auction.status}</p>
                  </div>
                  <div className="auction-stat rounded-2xl p-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Currency</p>
                    <p className="mt-1 font-semibold text-white">{auction.currency}</p>
                  </div>
                </div>
                <Link
                  to={`/auctions/${auction._id}`}
                  className="auction-link mt-4 inline-flex rounded-full border border-cyan-300/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-400/10"
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
