import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuctionCard } from './auction-card'
import { BidHistoryPanel } from './bid-history-panel'
import { formatCurrency, formatTimeLeft } from '../lib/format'
import { useSecondTick } from '../hooks/use-second-tick'
import { AuctionImage } from './auction-image'

export function LiveAuctionBoard ({
  auctions,
  selectedAuction,
  selectedAuctionId,
  setSelectedAuctionId,
  onPlaceBid,
  placingBid,
  bidHistory,
  bidsLoading,
  error,
  user,
  onLogout
}) {
  const [bidAmount, setBidAmount] = useState('')
  const nowMs = useSecondTick(Boolean(selectedAuction))
  const minBid = useMemo(() => {
    if (!selectedAuction) return 0
    return selectedAuction.currentBid + selectedAuction.minBidIncrement
  }, [selectedAuction])

  async function submitBid (e) {
    e.preventDefault()
    if (!selectedAuction) return
    await onPlaceBid(selectedAuction._id, Number(bidAmount))
    setBidAmount('')
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4">
      <section className="glass mb-5 overflow-hidden rounded-3xl border border-cyan-300/20">
        <div className="relative p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_40%)]" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Live auction nexus</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Real-time trading floor</h1>
              <p className="mt-2 text-sm text-slate-300">Instant event-driven bidding, version-safe writes, and deterministic closeouts.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">Operator</p>
                <p className="mt-1 text-sm text-white">{user.fullName}</p>
                <p className="mt-1 text-xs text-cyan-200">{user.onyxCredits?.toLocaleString?.() || 0} ONX</p>
              </div>
              <button
                onClick={onLogout}
                className="rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-xs text-slate-300 hover:bg-black/35"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px,1fr]">
        <section className="space-y-3">
          <div className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Live catalog</p>
            <p className="mt-1 text-sm text-slate-300">{auctions.length} active auctions</p>
          </div>
          <div className="max-h-[66vh] space-y-3 overflow-auto pr-1">
          {auctions.map((auction, index) => (
            <motion.div
              key={auction._id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <AuctionCard
                auction={auction}
                selected={String(auction._id) === String(selectedAuctionId)}
                onSelect={() => setSelectedAuctionId(String(auction._id))}
                nowMs={nowMs}
              />
            </motion.div>
          ))}
          </div>
        </section>

        <section className="glass min-h-[70vh] rounded-3xl p-6">
          <AnimatePresence mode="wait">
            {selectedAuction ? (
              <motion.div
                key={selectedAuction._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="grid gap-4 md:grid-cols-[320px,1fr]">
                  <AuctionImage src={selectedAuction.imageUrl} alt={selectedAuction.title} className="h-52 w-full rounded-2xl object-cover md:h-full" />
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{selectedAuction.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm text-slate-300">{selectedAuction.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-cyan-100">
                        {selectedAuction.category || 'Cyber Gear'}
                      </span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-100">
                        Live feed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric title="Current Bid" value={formatCurrency(selectedAuction.currentBid, selectedAuction.currency)} />
                  <Metric title="Minimum Next Bid" value={formatCurrency(minBid, selectedAuction.currency)} />
                  <Metric title="Ends In" value={formatTimeLeft(selectedAuction.endTime, nowMs)} />
                </div>

                <form onSubmit={submitBid} className="glass neon-ring rounded-2xl border border-cyan-300/25 p-4">
                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-200">Execute strategic bid</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="number"
                      min={minBid}
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min ${minBid}`}
                      className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-white outline-none"
                      required
                    />
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      disabled={placingBid}
                      className="rounded-xl bg-emerald-400 px-6 py-2 font-semibold text-slate-950 disabled:opacity-60"
                    >
                      {placingBid ? 'Deploying...' : 'Place Bid'}
                    </motion.button>
                  </div>
                </form>

                {error ? <p className="text-sm text-rose-300">{error}</p> : null}
                <BidHistoryPanel
                  bids={bidHistory}
                  loading={bidsLoading}
                  currency={selectedAuction.currency}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid h-[50vh] place-items-center text-sm text-slate-400"
              >
                No active auctions yet.
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  )
}

function Metric ({ title, value }) {
  return (
    <div className="glass rounded-xl border border-white/10 p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  )
}
