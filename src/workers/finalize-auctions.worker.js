const cron = require('node-cron')
const mongoose = require('mongoose')
const { Auction, AUCTION_STATUS } = require('../modules/auctions/models/auction.model')
const { Bid } = require('../modules/bids/models/bid.model')
const { User } = require('../modules/users/models/user.model')
const { getIo } = require('../realtime/socket')
const { runTransactionWithRetry } = require('../utils/transaction')

async function finalizeOneAuction (auctionId) {
  return runTransactionWithRetry(async () => {
    const session = await mongoose.startSession()
    let finalizedEvent = null
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
        finalizedEvent = {
          auctionId: String(auction._id),
          status: auction.status,
          currentBid: auction.currentBid,
          winnerBidderId: null
        }
        return finalizedEvent
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
        finalizedEvent = {
          auctionId: String(auction._id),
          status: auction.status,
          currentBid: auction.currentBid,
          winnerBidderId: String(winnerBid.bidderId)
        }
        return finalizedEvent
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
      finalizedEvent = {
        auctionId: String(auction._id),
        status: auction.status,
        currentBid: auction.currentBid,
        winnerBidderId: String(winnerBid.bidderId)
      }
      return finalizedEvent
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  })
}

async function activateScheduledAuctionsSweep () {
  const io = getIo()
  const readyToStart = await Auction.find({
    status: AUCTION_STATUS.DRAFT,
    startTime: { $lte: new Date() }
  })

  const startedEvents = []
  for (const auction of readyToStart) {
    auction.status = AUCTION_STATUS.ACTIVE
    await auction.save()
    const event = {
      auctionId: String(auction._id),
      auction: {
        _id: String(auction._id),
        id: String(auction._id),
        sellerId: String(auction.sellerId),
        title: auction.title,
        description: auction.description,
        imageUrl: auction.imageUrl,
        category: auction.category,
        currency: auction.currency,
        basePrice: auction.basePrice,
        currentBid: auction.currentBid,
        currentBidderId: auction.currentBidderId ? String(auction.currentBidderId) : null,
        minBidIncrement: auction.minBidIncrement,
        bidCount: auction.bidCount,
        status: auction.status,
        startTime: auction.startTime,
        endTime: auction.endTime,
        winnerBidId: auction.winnerBidId,
        finalizedAt: auction.finalizedAt
      }
    }
    startedEvents.push(event)
    if (io) {
      io.emit('auction:started', event)
    }
  }

  return startedEvents
}

async function finalizeExpiredAuctionsSweep () {
  const expiredActive = await Auction.find({
    status: AUCTION_STATUS.ACTIVE,
    endTime: { $lte: new Date() }
  })
    .select('_id')
    .lean()

  const io = getIo()
  for (const auction of expiredActive) {
    const finalizedEvent = await finalizeOneAuction(auction._id)
    if (io && finalizedEvent) {
      io.emit('auction:finalized', finalizedEvent)
    }
  }
}

function startAuctionFinalizerWorker () {
  cron.schedule('*/10 * * * * *', async () => {
    try {
      await activateScheduledAuctionsSweep()
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
