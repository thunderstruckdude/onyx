const { Router } = require('express')
const rateLimit = require('express-rate-limit')
const { asyncHandler } = require('../../../utils/async-handler')
const { validate } = require('../../../middlewares/validate.middleware')
const { requireAuth } = require('../../../middlewares/auth.middleware')
const { placeBidSchema } = require('../validators/place-bid.schema')
const {
  placeBidWithSocketController
} = require('../controllers/place-bid-socket.controller')
const { HTTP_STATUS } = require('../../../constants/http-status')

const bidsRouter = Router()

const bidRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many bid attempts. Slow down.'
    }
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
})

bidsRouter.post(
  '/auctions/:auctionId',
  bidRateLimiter,
  requireAuth,
  validate(placeBidSchema),
  asyncHandler(placeBidWithSocketController)
)

module.exports = { bidsRouter }
