import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuctionCard } from './auction-card'
import { BidHistoryPanel } from './bid-history-panel'
import { formatCurrency, formatTimeLeft } from '../lib/format'
import { useSecondTick } from '../hooks/use-second-tick'

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

  const activeCount = auctions.length
  const topBid = auctions.reduce((max, auction) => Math.max(max, auction.currentBid || 0), 0)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4">
      <section className="live-shell mb-6 overflow-hidden rounded-[2rem] p-5 sm:p-6">
        <div className="live-shell-sheen pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Live floor</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Real-time auctions with a cleaner visual rhythm.</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              The floor, the selected lot, and the bid feed are separated into distinct surfaces so the interaction reads like a dashboard instead of a list.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="live-chip">
              <span className="live-dot" />
              <span>{activeCount} active lots</span>
            </div>
            <div className="live-chip">
              <span className="live-dot live-dot-blue" />
              <span>Top bid {formatCurrency(topBid, selectedAuction?.currency || 'ONX')}</span>
            </div>
            <div className="live-chip live-chip-solid">
              <span className="text-slate-300">Operator</span>
              <span className="font-semibold text-white">{user.fullName}</span>
              <button onClick={onLogout} className="ml-2 text-[11px] uppercase tracking-[0.18em] text-cyan-200 hover:text-cyan-100">
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px,minmax(0,1fr),320px]">
        <aside className="live-rail rounded-[1.75rem] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Catalog</p>
              <p className="mt-1 text-sm text-slate-400">Choose a lot to inspect.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">
              {auctions.length}
            </span>
          </div>
          <div className="max-h-[calc(100vh-14rem)] space-y-3 overflow-auto pr-1">
            {auctions.map((auction, index) => (
              <motion.div
                key={auction._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
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
        </aside>

        <main className="live-stage rounded-[2rem] p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {selectedAuction ? (
              <motion.div
                key={selectedAuction._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mx-auto grid max-w-5xl gap-5"
              >
                <section className="live-floor overflow-hidden rounded-[1.75rem]">
                  <div className="live-floor-stage relative h-[28rem]">
                    <img
                      src={selectedAuction.imageUrl}
                      alt={selectedAuction.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06070c] via-[#06070c]/40 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.11),transparent_18%),radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08),transparent_24%),radial-gradient(circle_at_50%_76%,rgba(56,189,248,0.1),transparent_22%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#05070c] to-transparent" />

                    <div className="absolute left-1/2 top-5 flex -translate-x-1/2 flex-wrap justify-center gap-2">
                      <span className="live-pill">{selectedAuction.category || 'Cyber Gear'}</span>
                      <span className="live-pill live-pill-accent">Live feed</span>
                    </div>

                    <div className="absolute inset-x-0 bottom-5 flex justify-center px-4">
                      <div className="live-floor-caption max-w-3xl rounded-[1.5rem] p-5 text-center">
                        <p className="text-[11px] uppercase tracking-[0.26em] text-slate-400">Selected auction</p>
                        <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{selectedAuction.title}</h2>
                        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-300">{selectedAuction.description}</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          <span className="live-chip live-chip-solid">
                            <span className="text-slate-300">Ends</span>
                            <span className="font-semibold text-white">{formatTimeLeft(selectedAuction.endTime, nowMs)}</span>
                          </span>
                          <span className="live-chip live-chip-solid">
                            <span className="text-slate-300">Bids</span>
                            <span className="font-semibold text-white">{selectedAuction.bidCount}</span>
                          </span>
                          <span className="live-chip live-chip-solid">
                            <span className="text-slate-300">Floor</span>
                            <span className="font-semibold text-white">{formatCurrency(minBid, selectedAuction.currency)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 border-t border-white/10 bg-black/35 p-4 sm:grid-cols-3">
                    <Metric title="Minimum next bid" value={formatCurrency(minBid, selectedAuction.currency)} />
                    <Metric title="Bid count" value={`${selectedAuction.bidCount} bids`} />
                    <Metric title="Time left" value={formatTimeLeft(selectedAuction.endTime, nowMs)} />
                  </div>

                  <div className="grid gap-4 p-4 sm:grid-cols-[1.1fr,0.9fr]">
                    <form onSubmit={submitBid} className="live-bid-form rounded-[1.5rem] p-4">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Bid composer</p>
                          <p className="mt-1 text-sm text-slate-400">Place a clean version-safe bid.</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                          Min {formatCurrency(minBid, selectedAuction.currency)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          type="number"
                          min={minBid}
                          step="0.01"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={`Bid at least ${minBid}`}
                          className="w-full rounded-full border border-white/10 bg-black/30 px-4 py-3 text-white outline-none backdrop-blur-xl"
                          required
                        />
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          disabled={placingBid}
                          className="rounded-full bg-emerald-400 px-6 py-3 font-semibold text-slate-950 shadow-[0_16px_32px_rgba(16,185,129,0.25)] disabled:opacity-60"
                        >
                          {placingBid ? 'Submitting...' : 'Place Bid'}
                        </motion.button>
                      </div>
                      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
                    </form>

                    <div className="live-panel rounded-[1.5rem] p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Auction pulse</p>
                      <div className="mt-4 grid gap-3">
                        <Metric title="Current bid" value={formatCurrency(selectedAuction.currentBid, selectedAuction.currency)} />
                        <Metric title="Minimum next bid" value={formatCurrency(minBid, selectedAuction.currency)} />
                        <Metric title="Status" value="Live floor" />
                      </div>
                    </div>
                  </div>
                </section>

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
                className="live-empty grid min-h-[60vh] place-items-center rounded-[2rem]"
              >
                <div className="max-w-md text-center">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">No active lots</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">The floor is quiet.</h2>
                  <p className="mt-2 text-sm text-slate-400">When auctions go live, they’ll appear here with a much cleaner stage and bidding flow.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
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
