const cron = require('node-cron')
const mongoose = require('mongoose')
const { Auction, AUCTION_STATUS } = require('../modules/auctions/models/auction.model')
const { Bid } = require('../modules/bids/models/bid.model')
const { createPaymentIntentForAuctionWin } = require('../services/payments.service')
const { runTransactionWithRetry } = require('../utils/transaction')

async function finalizeOneAuction (auctionId) {
  let winnerBidId = null
  let endedAuctionId = null
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
        await auction.save({ session })
        await session.commitTransaction()
        return
      }

      auction.status = AUCTION_STATUS.ENDED
      auction.winnerBidId = winnerBid._id
      auction.finalizedAt = new Date()
      auction.payment = {
        provider: null,
        paymentIntentId: null,
        status: 'pending'
      }
      await auction.save({ session })
      await session.commitTransaction()
      winnerBidId = winnerBid._id
      endedAuctionId = auction._id
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  })

  if (!winnerBidId || !endedAuctionId) {
    return
  }

  const [auction, winnerBid] = await Promise.all([
    Auction.findById(endedAuctionId),
    Bid.findById(winnerBidId)
  ])
  if (!auction || !winnerBid) {
    return
  }

  const paymentIntent = await createPaymentIntentForAuctionWin({
    auction,
    winnerBid
  })

  await Auction.findOneAndUpdate(
    {
      _id: endedAuctionId,
      status: AUCTION_STATUS.ENDED
    },
    {
      $set: {
        payment: {
          provider: paymentIntent.provider,
          paymentIntentId: paymentIntent.paymentIntentId,
          status: paymentIntent.status
        }
      }
    }
  )
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
