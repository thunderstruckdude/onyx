const { Router } = require('express')
const { asyncHandler } = require('../../../utils/async-handler')
const {
  handleStripeWebhookController,
  handleRazorpayWebhookController
} = require('../controllers/webhooks.controller')

const paymentsRouter = Router()

paymentsRouter.post('/webhooks/stripe', asyncHandler(handleStripeWebhookController))
paymentsRouter.post('/webhooks/razorpay', asyncHandler(handleRazorpayWebhookController))

module.exports = { paymentsRouter }
