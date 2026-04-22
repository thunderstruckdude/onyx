import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuctionCard } from './auction-card'
import { BidHistoryPanel } from './bid-history-panel'
import { formatCurrency, formatTimeLeft } from '../lib/format'

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
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 pb-10 pt-4 lg:grid-cols-[360px,1fr]">
      <section className="space-y-3">
        <div className="glass rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Live Catalog</p>
          <p className="mt-1 text-sm text-slate-300">{auctions.length} active auctions</p>
        </div>
        <div className="max-h-[68vh] space-y-3 overflow-auto pr-1">
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
              />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="glass min-h-[70vh] rounded-3xl p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Authenticated as</p>
            <h1 className="font-display text-lg font-semibold text-white">{user.fullName}</h1>
            <p className="mt-1 text-xs text-cyan-200">{user.onyxCredits?.toLocaleString?.() || 0} ONX credits</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-xs text-slate-300 hover:bg-black/35"
          >
            Logout
          </button>
        </header>

        <AnimatePresence mode="wait">
          {selectedAuction ? (
            <motion.div
              key={selectedAuction._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-display text-2xl font-semibold text-white">{selectedAuction.title}</h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-300">{selectedAuction.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric title="Current Bid" value={formatCurrency(selectedAuction.currentBid, selectedAuction.currency)} />
                <Metric title="Minimum Next Bid" value={formatCurrency(minBid, selectedAuction.currency)} />
                <Metric title="Ends In" value={formatTimeLeft(selectedAuction.endTime)} />
              </div>

              <form onSubmit={submitBid} className="glass neon-ring rounded-2xl p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-200">Place Strategic Bid</p>
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
                    className="rounded-xl bg-cyan-400 px-6 py-2 font-semibold text-slate-950 disabled:opacity-60"
                  >
                    {placingBid ? 'Deploying bid...' : 'Execute Bid'}
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
  )
}

function Metric({ title, value }) {
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  )
}
