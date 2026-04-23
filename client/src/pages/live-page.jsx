import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { useAuctions } from '../hooks/use-auctions'
import { LiveAuctionBoard } from '../components/live-auction-board'
import { LoadingScreen } from '../components/loading-screen'

export function LivePage () {
  const auth = useAuth()
  const auctions = useAuctions(Boolean(auth.user))
  const bootLoading = auth.loading || (Boolean(auth.user) && auctions.loading)
  const mergedError = auth.user ? auctions.error : auth.error

  if (auth.loading) {
    return (
      <div className="aurora-bg min-h-screen">
        <LoadingScreen loading />
      </div>
    )
  }

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
        <Navigate to="/auth?next=/live" replace />
      )}
    </div>
  )
}
