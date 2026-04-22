import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const blocks = [
  {
    title: 'Security Envelope',
    points: ['HttpOnly JWT cookie auth', 'NoSQL sanitization + strict validation', 'Webhook signature verification + idempotency']
  },
  {
    title: 'Bidding Engine',
    points: ['Replica-set transaction writes', 'OCC race detection via __v', 'Socket broadcast only after commit']
  },
  {
    title: 'Onyx Settlement Automation',
    points: ['Cron-based expiry sweeps', 'Winner selection by max bid + first timestamp', 'Atomic Onyx credit transfer at close']
  }
]

export function PlatformPage() {
  return (
    <div className="aurora-bg min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Platform Deep Dive</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-white">Built for adversarial real-world traffic, not tutorials.</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Every layer is engineered for integrity under contention: transactions, conflict-safe writes, deterministic finalization, and signed settlement events.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {blocks.map((block, idx) => (
            <motion.article
              key={block.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="text-lg font-semibold text-white">{block.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {block.points.map((point) => (
                  <li key={point} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">{point}</li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        <div className="mt-8">
          <Link to="/live" className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950">
            Open Live Auction Experience
          </Link>
        </div>
      </section>
    </div>
  )
}
