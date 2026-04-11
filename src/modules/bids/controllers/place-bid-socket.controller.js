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

  return res.status(HTTP_STATUS.CREATED).json({
    message: 'Bid placed successfully',
    data: {
      bid: result.bid,
      auction: result.auction
    }
  })
}

module.exports = { placeBidWithSocketController }
