const mongoose = require('mongoose')
const { Auction, AUCTION_STATUS } = require('../../auctions/models/auction.model')
const { Bid } = require('../models/bid.model')
const { User } = require('../../users/models/user.model')
const { HTTP_STATUS } = require('../../../constants/http-status')
const { AppError } = require('../../../utils/app-error')
const { securityLog } = require('../../../utils/security-log')
const { runTransactionWithRetry } = require('../../../utils/transaction')

async function placeBid ({ auctionId, bidderId, bidAmount, source = 'api' }) {
  return runTransactionWithRetry(async () => {
    const session = await mongoose.startSession()
    let committedBid = null
    let updatedAuction = null
    let previousHighBidderId = null
    let previousHighBidAmount = null
    try {
      await session.startTransaction()

      const auction = await Auction.findById(auctionId).session(session)
      if (!auction) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'Auction not found')
      }

      if (auction.status !== AUCTION_STATUS.ACTIVE) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Auction is not active')
      }

      const now = new Date()
      if (auction.endTime <= now) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Auction has already ended')
      }

      if (String(auction.sellerId) === String(bidderId)) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'Seller cannot bid on own auction')
      }

      const minAllowedBid = auction.currentBid + auction.minBidIncrement
      if (bidAmount < minAllowedBid) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          `Bid must be >= ${minAllowedBid}`
        )
      }

      const bidder = await User.findById(bidderId).select('_id isActive onyxCredits').session(session)
      if (!bidder || !bidder.isActive) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Bidder is not authorized')
      }
      if (bidder.onyxCredits < bidAmount) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Insufficient Onyx credits for this bid')
      }

      previousHighBidderId = auction.currentBidderId ? String(auction.currentBidderId) : null
      previousHighBidAmount = auction.currentBid
      const expectedVersion = auction.__v
      const auctionUpdate = await Auction.findOneAndUpdate(
        {
          _id: auction._id,
          __v: expectedVersion
        },
        {
          $set: {
            currentBid: bidAmount,
            currentBidderId: bidderId
          },
          $inc: {
            bidCount: 1,
            __v: 1
          }
        },
        {
          new: true,
          session
        }
      )

      if (!auctionUpdate) {
        securityLog('bid_race_conflict', {
          auctionId: String(auction._id),
          bidderId: String(bidderId),
          bidAmount
        })
        throw new AppError(
          HTTP_STATUS.CONFLICT,
          'Bid race detected. Please retry with latest auction state.'
        )
      }

      const [newBid] = await Bid.create(
        [
          {
            auctionId: auction._id,
            bidderId,
            bidAmount,
            currency: auction.currency,
            auctionVersionAtBid: expectedVersion,
            source
          }
        ],
        { session }
      )

      await session.commitTransaction()
      committedBid = newBid
      updatedAuction = auctionUpdate
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }

    return {
      bid: committedBid,
      auction: updatedAuction,
      previousHighBidderId,
      previousHighBidAmount
    }
  })
}

module.exports = { placeBid }
