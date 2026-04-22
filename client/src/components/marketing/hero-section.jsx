import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-12 lg:grid-cols-[1.08fr,0.92fr]">
      <div className="space-y-5">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200"
        >
          ONYX // AUCTION GRID
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl"
        >
          Trade in the neon underground
          <span className="bg-gradient-to-r from-cyan-200 via-indigo-200 to-fuchsia-200 bg-clip-text text-transparent"> with deterministic realtime execution.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl text-base text-slate-300"
        >
          Onyx is a dark-market auction platform for futuristic gear, powered by transaction-safe bidding and native Onyx credit settlement.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-3"
        >
          <Link to="/marketplace" className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950">
            Enter Marketplace
          </Link>
          <Link to="/platform" className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-slate-200 hover:bg-white/10">
            Explore Platform
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="glass neon-ring rounded-3xl p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Card title="Live Bid Pulse" value="127 bids / 10s" accent="text-emerald-200" />
          <Card title="Current Prime Lot" value="42,800 ONX" accent="text-cyan-200" />
          <Card title="Concurrent Users" value="18,204" accent="text-indigo-200" />
          <Card title="Settlement Integrity" value="99.9%" accent="text-fuchsia-200" />
        </div>
      </motion.div>
    </section>
  )
}

function Card({ title, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className={`mt-2 text-xl font-semibold ${accent}`}>{value}</p>
    </div>
  )
}
