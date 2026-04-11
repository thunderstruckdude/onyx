const { Router } = require('express')
const { asyncHandler } = require('../../../utils/async-handler')
const { validate } = require('../../../middlewares/validate.middleware')
const { requireAuth, requireRoles } = require('../../../middlewares/auth.middleware')
const {
  createAuctionController,
  listAuctionsController,
  getAuctionByIdController
} = require('../controllers/auctions.controller')
const { createAuctionSchema } = require('../validators/create-auction.schema')
const { listAuctionsSchema } = require('../validators/list-auctions.schema')
const { auctionIdSchema } = require('../validators/auction-id.schema')

const auctionsRouter = Router()

auctionsRouter.get('/', validate(listAuctionsSchema), asyncHandler(listAuctionsController))
auctionsRouter.get('/:auctionId', validate(auctionIdSchema), asyncHandler(getAuctionByIdController))
auctionsRouter.post(
  '/',
  requireAuth,
  requireRoles('seller', 'admin'),
  validate(createAuctionSchema),
  asyncHandler(createAuctionController)
)

module.exports = { auctionsRouter }
