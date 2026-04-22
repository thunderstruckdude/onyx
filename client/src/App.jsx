import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteNav } from './components/layout/site-nav'
import { HomePage } from './pages/home-page'
import { PlatformPage } from './pages/platform-page'
import { LivePage } from './pages/live-page'
import { MarketplacePage } from './pages/marketplace-page'
import { SellerStudioPage } from './pages/seller-studio-page'
import { WalletPage } from './pages/wallet-page'
import { AuctionDetailPage } from './pages/auction-detail-page'

function App() {
  return (
    <>
      <SiteNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/platform" element={<PlatformPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/seller-studio" element={<SellerStudioPage />} />
        <Route path="/auctions/:auctionId" element={<AuctionDetailPage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
