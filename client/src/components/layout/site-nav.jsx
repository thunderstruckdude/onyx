import { Link, NavLink } from 'react-router-dom'
import clsx from 'clsx'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/platform', label: 'Platform' },
  { to: '/wallet', label: 'Wallet' },
  { to: '/seller-studio', label: 'Seller Studio' },
  { to: '/live', label: 'Live Auction' }
]

export function SiteNav () {
  return (
    <header className="sticky top-0 z-30 border-b border-indigo-400/20 bg-[#05040c]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-300 shadow-[0_0_18px_rgba(129,140,248,0.95)]" />
          <span className="font-display text-sm font-semibold tracking-wide text-white">ONYX</span>
        </Link>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'rounded-full px-3 py-1.5 text-xs tracking-wide transition',
                  isActive ? 'bg-cyan-400/20 text-cyan-100' : 'text-slate-300 hover:bg-white/10'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
