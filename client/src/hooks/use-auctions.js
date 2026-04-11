import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../api/client'
import { io } from 'socket.io-client'

export function useAuctions() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAuctionId, setSelectedAuctionId] = useState(null)
  const [placingBid, setPlacingBid] = useState(false)

  const selectedAuction = useMemo(
    () => auctions.find((a) => String(a._id) === String(selectedAuctionId)) || null,
    [auctions, selectedAuctionId]
  )

  const fetchAuctions = useCallback(async () => {
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
  }, [selectedAuctionId])

  useEffect(() => {
    void fetchAuctions()
  }, [fetchAuctions])

  useEffect(() => {
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
    })

    return () => {
      auctions.forEach((a) => socket.emit('auction:leave', String(a._id)))
      socket.close()
    }
  }, [auctions])

  async function placeBid(auctionId, bidAmount) {
    setPlacingBid(true)
    try {
      await apiRequest(`/bids/auctions/${auctionId}`, {
        method: 'POST',
        body: { bidAmount }
      })
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
    placingBid
  }
}
