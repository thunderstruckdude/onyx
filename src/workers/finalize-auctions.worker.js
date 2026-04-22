const cron = require('node-cron')
const mongoose = require('mongoose')
const { Auction, AUCTION_STATUS } = require('../modules/auctions/models/auction.model')
const { Bid } = require('../modules/bids/models/bid.model')
const { User } = require('../modules/users/models/user.model')
const { runTransactionWithRetry } = require('../utils/transaction')

async function finalizeOneAuction (auctionId) {
  await runTransactionWithRetry(async () => {
    const session = await mongoose.startSession()
    try {
      await session.startTransaction()

      const auction = await Auction.findOne({
        _id: auctionId,
        status: AUCTION_STATUS.ACTIVE,
        endTime: { $lte: new Date() }
      }).session(session)

      if (!auction) {
        await session.abortTransaction()
        return
      }

      const winnerBid = await Bid.findOne({ auctionId: auction._id })
        .sort({ bidAmount: -1, createdAt: 1 })
        .session(session)

      if (!winnerBid) {
        auction.status = AUCTION_STATUS.ENDED
        auction.finalizedAt = new Date()
        auction.payment = {
          provider: 'onyx_credits',
          paymentIntentId: null,
          status: 'pending'
        }
        await auction.save({ session })
        await session.commitTransaction()
        return
      }

      const [seller, winner] = await Promise.all([
        User.findById(auction.sellerId).session(session),
        User.findById(winnerBid.bidderId).session(session)
      ])

      if (!seller || !winner || !winner.isActive || winner.onyxCredits < winnerBid.bidAmount) {
        auction.status = AUCTION_STATUS.ENDED
        auction.winnerBidId = winnerBid._id
        auction.finalizedAt = new Date()
        auction.payment = {
          provider: 'onyx_credits',
          paymentIntentId: null,
          status: 'failed'
        }
        await auction.save({ session })
        await session.commitTransaction()
        return
      }

      winner.onyxCredits -= winnerBid.bidAmount
      seller.onyxCredits += winnerBid.bidAmount
      await Promise.all([winner.save({ session }), seller.save({ session })])

      auction.status = AUCTION_STATUS.SETTLED
      auction.winnerBidId = winnerBid._id
      auction.finalizedAt = new Date()
      auction.payment = {
        provider: 'onyx_credits',
        paymentIntentId: null,
        status: 'paid'
      }
      await auction.save({ session })
      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  })
}

async function finalizeExpiredAuctionsSweep () {
  const expiredActive = await Auction.find({
    status: AUCTION_STATUS.ACTIVE,
    endTime: { $lte: new Date() }
  })
    .select('_id')
    .lean()

  for (const auction of expiredActive) {
    await finalizeOneAuction(auction._id)
  }
}

function startAuctionFinalizerWorker () {
  cron.schedule('*/1 * * * *', async () => {
    try {
      await finalizeExpiredAuctionsSweep()
    } catch (error) {
      console.error('Auction finalizer sweep failed:', error.message)
    }
  })
}

module.exports = {
  startAuctionFinalizerWorker,
  finalizeExpiredAuctionsSweep
}
