const { getIo } = require('../../../realtime/socket')
const { placeBid } = require('../services/place-bid.service')
const { AppError } = require('../../../utils/app-error')
const { HTTP_STATUS } = require('../../../constants/http-status')

async function placeBidWithSocketController (req, res) {
  const { auctionId } = req.params
  const { bidAmount } = req.body
  const bidderId = req.auth.userId

  const result = await placeBid({
    auctionId,
    bidderId,
    bidAmount,
    source: 'api'
  })

  const io = getIo()
  if (!io) {
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Realtime service unavailable')
  }

  io.to(`auction:${auctionId}`).emit('bid:placed', {
    auctionId: String(result.auction._id),
    bid: {
      id: String(result.bid._id),
      bidderId: String(result.bid.bidderId),
      bidAmount: result.bid.bidAmount,
      createdAt: result.bid.createdAt
    },
    auction: {
      currentBid: result.auction.currentBid,
      currentBidderId: String(result.auction.currentBidderId),
      bidCount: result.auction.bidCount,
      version: result.auction.__v
    }
  })

  if (result.previousHighBidderId && result.previousHighBidderId !== bidderId) {
    io.to(`user:${result.previousHighBidderId}`).emit('bid:outbid', {
      auctionId: String(result.auction._id),
      auction: {
        id: String(result.auction._id),
        title: result.auction.title,
        imageUrl: result.auction.imageUrl,
        currency: result.auction.currency,
        currentBid: result.auction.currentBid,
        endTime: result.auction.endTime
      },
      outbidByUserId: bidderId,
      previousHighBidAmount: result.previousHighBidAmount,
      newBidAmount: result.bid.bidAmount,
      bid: {
        id: String(result.bid._id),
        bidderId: String(result.bid.bidderId),
        bidAmount: result.bid.bidAmount,
        createdAt: result.bid.createdAt
      }
    })
  }

  return res.status(HTTP_STATUS.CREATED).json({
    message: 'Bid placed successfully',
    data: {
      bid: result.bid,
      auction: result.auction
    }
  })
}

module.exports = { placeBidWithSocketController }
