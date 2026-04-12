import { motion } from 'framer-motion'
import clsx from 'clsx'
import { formatCurrency, formatTimeLeft } from '../lib/format'

export function AuctionCard({ auction, selected, onSelect }) {
  const ended = auction.status !== 'active'

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={clsx(
        'glass w-full rounded-2xl p-4 text-left transition-all',
        selected ? 'neon-ring border-cyan-300/50' : 'border-white/10'
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-white">{auction.title}</h3>
        <span className={clsx(
          'rounded-full px-2 py-1 text-[10px] uppercase tracking-wider',
          ended ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'
        )}>
          {ended ? 'Ended' : 'Live'}
        </span>
      </div>
      <p className="mb-3 line-clamp-2 text-xs text-slate-300">{auction.description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-cyan-200">{formatCurrency(auction.currentBid, auction.currency)}</span>
        <span className="text-slate-400">{formatTimeLeft(auction.endTime)}</span>
      </div>
      <div className="mt-2 text-[11px] text-slate-400">{auction.bidCount} bids</div>
    </motion.button>
  )
}
