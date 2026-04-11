import { useState } from 'react'
import { motion } from 'framer-motion'

const initialLogin = { email: '', password: '' }
const initialRegister = { email: '', password: '', fullName: '', role: 'buyer' }

export function AuthPanel({ onLogin, onRegister, error }) {
  const [mode, setMode] = useState('login')
  const [loginValues, setLoginValues] = useState(initialLogin)
  const [registerValues, setRegisterValues] = useState(initialRegister)
  const [busy, setBusy] = useState(false)

  async function submitLogin(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await onLogin(loginValues)
      setLoginValues(initialLogin)
    } finally {
      setBusy(false)
    }
  }

  async function submitRegister(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await onRegister(registerValues)
      setMode('login')
      setRegisterValues(initialRegister)
    } finally {
      setBusy(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mx-auto w-full max-w-md rounded-3xl p-6"
    >
      <div className="mb-4 flex rounded-full bg-white/5 p-1">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 rounded-full px-3 py-2 text-sm ${isLogin ? 'bg-cyan-400/20 text-cyan-100' : 'text-slate-300'}`}
        >
          Login
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 rounded-full px-3 py-2 text-sm ${!isLogin ? 'bg-cyan-400/20 text-cyan-100' : 'text-slate-300'}`}
        >
          Register
        </button>
      </div>

      {isLogin ? (
        <form onSubmit={submitLogin} className="space-y-3">
          <input
            type="email"
            value={loginValues.email}
            onChange={(e) => setLoginValues((v) => ({ ...v, email: e.target.value }))}
            className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={loginValues.password}
            onChange={(e) => setLoginValues((v) => ({ ...v, password: e.target.value }))}
            className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
            placeholder="Password (min 12)"
            required
          />
          <button
            disabled={busy}
            className="w-full rounded-xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {busy ? 'Authenticating...' : 'Enter Live Floor'}
          </button>
        </form>
      ) : (
        <form onSubmit={submitRegister} className="space-y-3">
          <input
            value={registerValues.fullName}
            onChange={(e) => setRegisterValues((v) => ({ ...v, fullName: e.target.value }))}
            className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            value={registerValues.email}
            onChange={(e) => setRegisterValues((v) => ({ ...v, email: e.target.value }))}
            className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={registerValues.password}
            onChange={(e) => setRegisterValues((v) => ({ ...v, password: e.target.value }))}
            className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
            placeholder="Password (min 12)"
            required
          />
          <select
            value={registerValues.role}
            onChange={(e) => setRegisterValues((v) => ({ ...v, role: e.target.value }))}
            className="w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
          <button
            disabled={busy}
            className="w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {busy ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      )}

      {error ? <p className="mt-3 text-xs text-rose-300">{error}</p> : null}
    </motion.div>
  )
}
