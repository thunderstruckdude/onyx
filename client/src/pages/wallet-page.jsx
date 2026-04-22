import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiRequest } from '../api/client'

export function WalletPage () {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load () {
      setLoading(true)
      try {
        const payload = await apiRequest('/users/me')
        setUser(payload.data.user)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="aurora-bg min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Onyx Wallet</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-white">Credit balance and identity payload</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          ONX credits are used for bidding and final auction settlement. Credits transfer on successful finalization.
        </p>

        {loading ? <div className="mt-6 loader-spin" /> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        {user ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass neon-ring mt-6 max-w-xl rounded-2xl p-6"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Wallet Snapshot</p>
            <p className="mt-2 text-4xl font-display text-white">{user.onyxCredits.toLocaleString()} ONX</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Cell label="User" value={user.fullName} />
              <Cell label="Role" value={user.role} />
              <Cell label="Email" value={user.email} />
              <Cell label="Verified" value={user.isEmailVerified ? 'Yes' : 'No'} />
            </div>
          </motion.div>
        ) : null}
      </section>
    </div>
  )
}

function Cell ({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-1 text-slate-200">{value}</p>
    </div>
  )
}
