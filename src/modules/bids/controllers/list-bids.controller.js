const { Bid } = require('../models/bid.model')
const { HTTP_STATUS } = require('../../../constants/http-status')

async function listBidsController (req, res) {
  const { auctionId } = req.params
  const { page, limit } = req.query

  const [items, total] = await Promise.all([
    Bid.find({ auctionId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Bid.countDocuments({ auctionId })
  ])

  return res.status(HTTP_STATUS.OK).json({
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}

module.exports = { listBidsController }
