import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const stats = [
  { label: 'Bid throughput', value: '2.6K / min' },
  { label: 'Finalization cadence', value: '10s sweep' },
  { label: 'Integrity', value: '99.997%' }
]

const features = [
  {
    title: 'Realtime bidding',
    description: 'Instant bid propagation across marketplace, live floor, and profile dashboards.'
  },
  {
    title: 'Deterministic closeout',
    description: 'Auction winners are locked through transactional updates and OCC protection.'
  },
  {
    title: 'Operator-grade reporting',
    description: 'Finished auctions open into detailed post-auction analytics and timelines.'
  }
]

const logos = ['NovaGrid', 'Aether Labs', 'SignalForge', 'Helix Capital']

const reviews = [
  { name: 'S. Kade', role: 'Marketplace Ops', quote: 'Realtime bid propagation feels instantaneous, even under heavy traffic.' },
  { name: 'M. Voss', role: 'Seller Lead', quote: 'Listing creation is clean and fast. The reporting view is exactly what we need.' },
  { name: 'J. Riven', role: 'Security Engineer', quote: 'OCC + transactional writes are implemented properly — no race issues.' },
  { name: 'I. Sol', role: 'Growth Ops', quote: 'Live auction experience feels premium and stable. Great operator UX.' },
  { name: 'R. Nyx', role: 'Product', quote: 'Unified auth flow makes onboarding smooth for both buyers and sellers.' }
]

export function HomePage () {
  return (
    <div className="onyx-landing min-h-screen pb-16">
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-5"
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-emerald-200"
          >
            Onyx Auction Platform
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl font-semibold leading-tight text-white sm:text-5xl"
          >
            Professional realtime auctions with precision-grade reliability.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl text-base text-slate-300"
          >
            Built for real operations: transaction-safe bidding, live updates, and clear post-auction reporting.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap gap-3"
          >
            <Link to="/auth" className="rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950">
              Start now
            </Link>
            <Link to="/marketplace" className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-slate-200 hover:bg-white/10">
              View marketplace
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500"
          >
            {logos.map((logo) => (
              <span key={logo} className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                {logo}
              </span>
            ))}
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="onyx-panel rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Live signal</p>
            <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-200">Onyx</span>
          </div>
          <div className="mt-5 space-y-3">
            {stats.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
              >
                <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</span>
                <span className="text-sm font-semibold text-emerald-200">{item.value}</span>
              </motion.div>
            ))}
          </div>
          <div className="onyx-divider mt-5" />
          <p className="mt-4 text-sm text-slate-300">
            Unified auth for buyers and sellers. Fast onboarding, reliable bidding, and verified outcomes.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="onyx-panel rounded-2xl p-5"
            >
              <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Operator feedback</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Teams running live auctions on Onyx</h2>
          </div>
        </div>
        <div className="onyx-panel rounded-3xl p-6">
          <div className="marquee">
            <div className="marquee-track">
              {[...reviews, ...reviews].map((review, idx) => (
                <div key={`${review.name}-top-${idx}`} className="marquee-item">
                  <p className="text-sm text-slate-200">“{review.quote}”</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-emerald-200">{review.name}</p>
                  <p className="text-xs text-slate-400">{review.role}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="marquee mt-4">
            <div className="marquee-track reverse">
              {[...reviews, ...reviews].reverse().map((review, idx) => (
                <div key={`${review.name}-bottom-${idx}`} className="marquee-item">
                  <p className="text-sm text-slate-200">“{review.quote}”</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-emerald-200">{review.name}</p>
                  <p className="text-xs text-slate-400">{review.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="onyx-panel rounded-3xl p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Launch flow</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Create a seller lot, bid as buyer, review the outcome.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/seller-studio" className="rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950">
                Open Seller Studio
              </Link>
              <Link to="/finished" className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-slate-200 hover:bg-white/10">
                Finished reports
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
