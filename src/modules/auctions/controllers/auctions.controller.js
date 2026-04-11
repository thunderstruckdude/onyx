const { Auction, AUCTION_STATUS } = require('../models/auction.model')
const { HTTP_STATUS } = require('../../../constants/http-status')
const { AppError } = require('../../../utils/app-error')

async function createAuctionController (req, res) {
  const {
    title,
    description,
    currency,
    basePrice,
    minBidIncrement,
    startTime,
    endTime
  } = req.body

  const start = new Date(startTime)
  const end = new Date(endTime)
  if (end <= start) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'endTime must be after startTime')
  }

  const status = start <= new Date() ? AUCTION_STATUS.ACTIVE : AUCTION_STATUS.DRAFT

  const auction = await Auction.create({
    sellerId: req.auth.userId,
    title,
    description,
    currency,
    basePrice,
    minBidIncrement,
    startTime: start,
    endTime: end,
    status
  })

  return res.status(HTTP_STATUS.CREATED).json({
    data: { auction }
  })
}

async function cancelAuctionController (req, res) {
  const { auctionId } = req.params
  const auction = await Auction.findById(auctionId)
  if (!auction) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'Auction not found')
  }
  if (String(auction.sellerId) !== req.auth.userId && req.auth.role !== 'admin') {
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'Not allowed to cancel this auction')
  }
  if (![AUCTION_STATUS.DRAFT, AUCTION_STATUS.ACTIVE].includes(auction.status)) {
    throw new AppError(HTTP_STATUS.CONFLICT, 'Auction cannot be cancelled in current state')
  }
  auction.status = AUCTION_STATUS.CANCELLED
  await auction.save()
  return res.status(HTTP_STATUS.OK).json({ data: { auction } })
}

async function listAuctionsController (req, res) {
  const {
    page,
    limit,
    status,
    sellerId,
    minCurrentBid,
    maxCurrentBid,
    sortBy,
    sortOrder
  } = req.query

  const filter = {}
  if (status) filter.status = status
  if (sellerId) filter.sellerId = sellerId
  if (minCurrentBid !== undefined || maxCurrentBid !== undefined) {
    filter.currentBid = {}
    if (minCurrentBid !== undefined) filter.currentBid.$gte = minCurrentBid
    if (maxCurrentBid !== undefined) filter.currentBid.$lte = maxCurrentBid
  }

  const sortDirection = sortOrder === 'asc' ? 1 : -1
  const sort = { [sortBy]: sortDirection }

  const [items, total] = await Promise.all([
    Auction.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Auction.countDocuments(filter)
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

async function getAuctionByIdController (req, res) {
  const { auctionId } = req.params
  const auction = await Auction.findById(auctionId).lean()
  if (!auction) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'Auction not found')
  }
  return res.status(HTTP_STATUS.OK).json({ data: { auction } })
}

module.exports = {
  createAuctionController,
  cancelAuctionController,
  listAuctionsController,
  getAuctionByIdController
}
