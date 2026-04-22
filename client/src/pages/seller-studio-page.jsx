import { motion } from 'framer-motion'

const modules = [
  {
    title: 'Listing Composer',
    description: 'Craft detailed premium listings with optimized timing, reserve strategy, and audience targeting.'
  },
  {
    title: 'Demand Signals',
    description: 'Track interest velocity, bid acceleration, and conversion quality while auctions are live.'
  },
  {
    title: 'Settlement Oversight',
    description: 'Monitor payment state transitions and winning bidder confirmations from a single secure console.'
  }
]

export function SellerStudioPage () {
  return (
    <div className="aurora-bg min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Seller Studio</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">Control center for high-performing auctions.</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          This area is designed for sellers to optimize listing quality, monitor bid momentum, and close with confidence.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {modules.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}
