const { User } = require('../models/user.model')
const { Auction } = require('../../auctions/models/auction.model')
const { Bid } = require('../../bids/models/bid.model')
const { HTTP_STATUS } = require('../../../constants/http-status')
const { AppError } = require('../../../utils/app-error')

async function getMeController (req, res) {
  const user = await User.findById(req.auth.userId).select(
    '_id email fullName role onyxCredits isEmailVerified isActive profile createdAt updatedAt'
  )
  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
  }

  return res.status(HTTP_STATUS.OK).json({
    data: {
      user: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        onyxCredits: user.onyxCredits,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        profile: user.profile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  })
}

async function getDashboardController (req, res) {
  const userId = req.auth.userId
  const user = await User.findById(userId).select(
    '_id email fullName role onyxCredits isEmailVerified isActive profile createdAt updatedAt'
  )
  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
  }

  const [wonAuctions, sellerAuctions, distinctAuctionIds] = await Promise.all([
    Auction.find({
      currentBidderId: userId,
      winnerBidId: { $ne: null },
      status: { $in: ['ended', 'settled'] }
    })
      .sort({ finalizedAt: -1, endTime: -1 })
      .limit(24)
      .lean(),
    Auction.find({ sellerId: userId })
      .sort({ createdAt: -1 })
      .limit(24)
      .lean(),
    Bid.distinct('auctionId', { bidderId: userId })
  ])

  const activeBidAuctions = distinctAuctionIds.length > 0
    ? await Auction.find({
      _id: { $in: distinctAuctionIds },
      status: 'active'
    })
      .sort({ endTime: 1 })
      .limit(24)
      .lean()
    : []

  return res.status(HTTP_STATUS.OK).json({
    data: {
      user: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        onyxCredits: user.onyxCredits,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        profile: user.profile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      stats: {
        wonCount: wonAuctions.length,
        sellingCount: sellerAuctions.length,
        activeBidCount: activeBidAuctions.length
      },
      wonAuctions,
      sellerAuctions,
      activeBidAuctions
    }
  })
}

module.exports = { getMeController, getDashboardController }
