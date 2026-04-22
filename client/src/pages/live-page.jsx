import { useAuth } from '../hooks/use-auth'
import { useAuctions } from '../hooks/use-auctions'
import { AuthPanel } from '../components/auth-panel'
import { LiveAuctionBoard } from '../components/live-auction-board'
import { LoadingScreen } from '../components/loading-screen'

export function LivePage () {
  const auth = useAuth()
  const auctions = useAuctions(Boolean(auth.user))
  const bootLoading = auth.loading || auctions.loading
  const mergedError = auth.user ? auctions.error : auth.error

  return (
    <div className="aurora-bg min-h-screen">
      <LoadingScreen loading={bootLoading} />
      {auth.user ? (
        <LiveAuctionBoard
          auctions={auctions.auctions}
          selectedAuction={auctions.selectedAuction}
          selectedAuctionId={auctions.selectedAuctionId}
          setSelectedAuctionId={auctions.setSelectedAuctionId}
          onPlaceBid={auctions.placeBid}
          placingBid={auctions.placingBid}
          bidHistory={auctions.bidHistory}
          bidsLoading={auctions.bidsLoading}
          error={mergedError}
          user={auth.user}
          onLogout={auth.logout}
        />
      ) : (
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12">
          <AuthPanel onLogin={auth.login} onRegister={auth.register} error={mergedError} />
        </div>
      )}
    </div>
  )
}
