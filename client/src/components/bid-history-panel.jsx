import { AnimatePresence, motion } from 'framer-motion'
import { formatCurrency } from '../lib/format'

export function BidHistoryPanel ({ bids, loading, currency }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-indigo-200">Bid History</p>
        {loading ? <span className="loader-spin" /> : null}
      </div>

      <div className="max-h-60 space-y-2 overflow-auto pr-1">
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
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(bid.bidAmount, currency)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(bid.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Bidder: {String(bid.bidderId).slice(-6)}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
