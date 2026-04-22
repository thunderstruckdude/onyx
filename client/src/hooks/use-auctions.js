import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../api/client'
import { io } from 'socket.io-client'

export function useAuctions (enabled = true) {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [selectedAuctionId, setSelectedAuctionId] = useState(null)
  const [placingBid, setPlacingBid] = useState(false)
  const [bidHistory, setBidHistory] = useState([])
  const [bidsLoading, setBidsLoading] = useState(false)

  const selectedAuction = useMemo(
    () => auctions.find((a) => String(a._id) === String(selectedAuctionId)) || null,
    [auctions, selectedAuctionId]
  )

  const fetchAuctions = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      setError('')
      return
    }
    try {
      setError('')
      setLoading(true)
      const payload = await apiRequest('/auctions?status=active&sortBy=endTime&sortOrder=asc&limit=50')
      setAuctions(payload.data)
      if (!selectedAuctionId && payload.data.length > 0) {
        setSelectedAuctionId(String(payload.data[0]._id))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [enabled, selectedAuctionId])

  useEffect(() => {
    if (!enabled) return
    void fetchAuctions()
  }, [enabled, fetchAuctions])

  useEffect(() => {
    if (!enabled) return
    const socket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      auctions.forEach((a) => socket.emit('auction:join', String(a._id)))
    })

    socket.on('bid:placed', (event) => {
      setAuctions((prev) =>
        prev.map((item) =>
          String(item._id) === String(event.auctionId)
            ? {
                ...item,
                currentBid: event.auction.currentBid,
                currentBidderId: event.auction.currentBidderId,
                bidCount: event.auction.bidCount,
                __v: event.auction.version
              }
            : item
        )
      )

      if (String(selectedAuctionId) === String(event.auctionId)) {
        setBidHistory((prev) => [
          {
            _id: event.bid.id,
            auctionId: event.auctionId,
            bidderId: event.bid.bidderId,
            bidAmount: event.bid.bidAmount,
            createdAt: event.bid.createdAt
          },
          ...prev
        ].slice(0, 50))
      }
    })

    return () => {
      auctions.forEach((a) => socket.emit('auction:leave', String(a._id)))
      socket.close()
    }
  }, [auctions, enabled, selectedAuctionId])

  const fetchBidHistory = useCallback(async (auctionId) => {
    if (!enabled) {
      setBidHistory([])
      setBidsLoading(false)
      return
    }
    if (!auctionId) {
      setBidHistory([])
      return
    }
    setBidsLoading(true)
    try {
      const payload = await apiRequest(`/bids/auctions/${auctionId}?limit=30&page=1`)
      setBidHistory(payload.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setBidsLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    void fetchBidHistory(selectedAuctionId)
  }, [enabled, fetchBidHistory, selectedAuctionId])

  async function placeBid (auctionId, bidAmount) {
    setPlacingBid(true)
    try {
      setError('')
      await apiRequest(`/bids/auctions/${auctionId}`, {
        method: 'POST',
        body: { bidAmount }
      })
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setPlacingBid(false)
    }
  }

  return {
    auctions,
    loading,
    error,
    fetchAuctions,
    selectedAuctionId,
    setSelectedAuctionId,
    selectedAuction,
    placeBid,
    placingBid,
    bidHistory,
    bidsLoading
  }
}
