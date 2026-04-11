import { AnimatePresence, motion } from 'framer-motion'

export function LoadingScreen({ loading }) {
  return (
    <AnimatePresence>
      {loading ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
          className="fixed inset-0 z-50 grid place-items-center bg-[#03020a]"
        >
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="glass neon-ring rounded-3xl px-8 py-6"
          >
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <span className="loader-spin" />
              Synchronizing Auction Flux
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
