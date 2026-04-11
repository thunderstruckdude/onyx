import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from './hooks/use-auth'
import { useAuctions } from './hooks/use-auctions'
import { AuthPanel } from './components/auth-panel'
import { LiveAuctionBoard } from './components/live-auction-board'
import { LoadingScreen } from './components/loading-screen'

function App() {
  const auth = useAuth()
  const auctions = useAuctions()
  const bootLoading = auth.loading || auctions.loading
  const mergedError = auth.error || auctions.error

  const heroText = useMemo(
    () => ({
      title: 'AetherBid Exchange',
      subtitle: 'High-frequency live auctions with cinematic motion and transaction-safe execution.'
    }),
    []
  )

  return (
    <div className="aurora-bg min-h-screen">
      <LoadingScreen loading={bootLoading} />
      <main className="relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pb-2 pt-8"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Realtime Auction Network</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">{heroText.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">{heroText.subtitle}</p>
          </div>
          <span className="glass rounded-full px-3 py-2 text-xs text-emerald-200">TLS + JWT Cookie + OCC + ACID</span>
        </motion.header>

        {auth.user ? (
          <LiveAuctionBoard
            auctions={auctions.auctions}
            selectedAuction={auctions.selectedAuction}
            selectedAuctionId={auctions.selectedAuctionId}
            setSelectedAuctionId={auctions.setSelectedAuctionId}
            onPlaceBid={auctions.placeBid}
            placingBid={auctions.placingBid}
            user={auth.user}
            onLogout={auth.logout}
          />
        ) : (
          <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12">
            <AuthPanel onLogin={auth.login} onRegister={auth.register} error={mergedError} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
