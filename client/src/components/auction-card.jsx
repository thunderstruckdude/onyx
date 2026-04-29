import { motion } from 'framer-motion'
import clsx from 'clsx'
import { formatCurrency, formatTimeLeft } from '../lib/format'
import { AuctionImage } from './auction-image'

export function AuctionCard ({ auction, selected, onSelect, nowMs }) {
  const ended = auction.status !== 'active'

  return (
    <motion.button
      onClick={onSelect}
      className={clsx(
        'live-list-card w-full rounded-[1.5rem] p-3 text-left transition-all',
        selected ? 'live-list-card-selected' : ''
      )}
    >
      <div className="flex gap-3">
        <AuctionImage src={auction.imageUrl} alt={auction.title} className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold text-white">{auction.title}</h3>
            <span className={clsx(
              'rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.16em]',
              ended ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'
            )}>
              {ended ? 'Ended' : 'Live'}
            </span>
          </div>
          <p className="line-clamp-2 text-[11px] leading-5 text-slate-400">{auction.description}</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-cyan-200">{formatCurrency(auction.currentBid, auction.currency)}</span>
            <span className="text-slate-500">{formatTimeLeft(auction.endTime, nowMs)}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">{auction.bidCount} bids</div>
        </div>
      </div>
    </motion.button>
  )
}
