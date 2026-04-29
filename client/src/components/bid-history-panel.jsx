import { AnimatePresence, motion } from 'framer-motion'
import { formatCurrency } from '../lib/format'

export function BidHistoryPanel ({ bids, loading, currency }) {
  return (
    <div className="live-feed rounded-[1.75rem] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Bid history</p>
          <p className="mt-1 text-sm text-slate-400">A clean feed of the latest price pressure.</p>
        </div>
        {loading ? <span className="loader-spin" /> : null}
      </div>

      <div className="max-h-[26rem] space-y-2 overflow-auto pr-1">
        <AnimatePresence initial={false}>
          {bids.length === 0 ? (
            <p className="text-sm text-slate-400">No bids yet for this auction.</p>
          ) : (
            bids.map((bid) => (
              <motion.div
                key={bid._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-[1.25rem] border border-white/10 bg-black/25 px-3 py-3 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(bid.bidAmount, currency)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(bid.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">Bidder</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                    {String(bid.bidderId).slice(-6)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
