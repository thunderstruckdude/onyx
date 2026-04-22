const { Router } = require('express')
const rateLimit = require('express-rate-limit')
const { asyncHandler } = require('../../../utils/async-handler')
const { validate } = require('../../../middlewares/validate.middleware')
const { requireAuth } = require('../../../middlewares/auth.middleware')
const { placeBidSchema } = require('../validators/place-bid.schema')
const { listBidsSchema } = require('../validators/list-bids.schema')
const {
  placeBidWithSocketController
} = require('../controllers/place-bid-socket.controller')
const { listBidsController } = require('../controllers/list-bids.controller')
const { HTTP_STATUS } = require('../../../constants/http-status')

const bidsRouter = Router()

const bidRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${req.auth?.userId || 'anon'}`,
  message: {
    error: {
      message: 'Too many bid attempts. Slow down.'
    }
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
})

bidsRouter.post(
  '/auctions/:auctionId',
  requireAuth,
  bidRateLimiter,
  validate(placeBidSchema),
  asyncHandler(placeBidWithSocketController)
)
bidsRouter.get(
  '/auctions/:auctionId',
  validate(listBidsSchema),
  asyncHandler(listBidsController)
)

module.exports = { bidsRouter }
