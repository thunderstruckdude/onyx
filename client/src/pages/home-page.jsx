import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const trustMarks = ['Seller tools', 'Live floor', 'Finished reports', 'Admin console', 'Profile', 'Settlement']

const snapshotLabels = [
  'Live floor',
  'Secure bids',
  'Timed close',
  'Seller tools',
  'Reports',
  'Admin'
]

const snapshotStats = [
  { label: 'Active lots', value: '48' },
  { label: 'Highest bid', value: '18.4k' },
  { label: 'Closeout', value: 'Cron sweep' }
]

const pillars = [
  {
    title: 'Fast to list',
    copy: 'Drop a lot, set a timer, and go live in one clean flow.'
  },
  {
    title: 'Easy to bid',
    copy: 'Buyers get a focused marketplace with live pricing and instant feedback.'
  },
  {
    title: 'Clear to trust',
    copy: 'Transactions, reporting, and settlement stay visible after the hammer falls.'
  }
]

const steps = [
  { step: '1.', title: 'List', copy: 'Publish a lot with price, image, and duration.' },
  { step: '2.', title: 'Compete', copy: 'Watch bids move live across the floor.' },
  { step: '3.', title: 'Settle', copy: 'See the outcome in reports, profile, and admin views.' }
]

const reviews = [
  { name: 'S. Kade', role: 'Marketplace Ops', quote: 'Clean, fast, and easy to explain to stakeholders.' },
  { name: 'M. Voss', role: 'Seller Lead', quote: 'The listing flow stays out of the way and gets the job done.' },
  { name: 'J. Riven', role: 'Security', quote: 'The transaction story is the real selling point.' },
  { name: 'I. Sol', role: 'Growth', quote: 'Feels like a product teams would actually ship.' }
]

export function HomePage () {
  return (
    <div className="onyx-landing min-h-screen pb-16">
      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="space-y-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="inline-flex rounded-full border border-emerald-300/30 bg-black/45 px-3 py-1 text-xs uppercase tracking-[0.22em] text-emerald-200"
          >
            Onyx auction platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="mx-auto max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            ONYX
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg"
          >
            One place for buyers, sellers, and operators to list, bid, settle, and review outcomes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <Link to="/auth" className="rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950">
              Get started
            </Link>
            <Link to="/marketplace" className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-slate-200 hover:bg-white/10">
              Browse marketplace
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="flex flex-wrap justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500"
          >
            {trustMarks.map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-black/40 px-3 py-1">
                {item}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="onyx-panel overflow-hidden rounded-3xl p-5 text-left sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Launch snapshot</p>
                <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">Auction flow, simplified.</h2>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-200">
                Live
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-3xl border border-white/10 bg-black/50 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Top lot</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">NeuroLink Mk-IV</h3>
                    <p className="mt-1 text-sm text-slate-400">Neural implant</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200">Current bid</p>
                    <p className="mt-1 text-lg font-semibold text-white">$18.4k</p>
                  </div>
                </div>

                <div className="mt-5 flex items-end gap-2">
                  {[58, 82, 44, 92, 66, 74].map((height, index) => (
                    <span
                      key={height}
                      className={`w-full rounded-t-full ${index % 2 === 0 ? 'bg-emerald-300/70' : 'bg-cyan-300/70'}`}
                      style={{ height: `${height}px` }}
                    />
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                    10s closeout
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                    OCC guarded
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                    Socket live
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                {snapshotStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/45 p-3 shadow-[0_0_40px_rgba(16,185,129,0.08)] sm:p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {snapshotLabels.map((label, index) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 transition-colors duration-200 hover:border-emerald-300/30 hover:bg-black/45 ${
                  index === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-emerald-300 via-teal-300 to-cyan-300 shadow-[0_0_16px_rgba(45,212,191,0.75)]" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Onyx signal</p>
                  <p className="truncate text-sm font-medium text-slate-100">{label}</p>
                </div>
                <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="onyx-panel rounded-2xl p-5"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">Why teams use Onyx</p>
              <h2 className="mt-2 text-lg font-semibold text-white">{pillar.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{pillar.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Simple flow</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">List, bid, settle.</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass rounded-2xl p-5"
            >
              <p className="font-code text-xs uppercase tracking-[0.18em] text-cyan-200">{item.step}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="onyx-panel rounded-3xl p-6">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Operator feedback</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Short quotes, real signal.</h2>
          </div>
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
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Ready to go</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Start with a seller account or jump straight into bidding.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth" className="rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950">
                Create account
              </Link>
              <Link to="/live" className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-slate-200 hover:bg-white/10">
                Open live floor
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
