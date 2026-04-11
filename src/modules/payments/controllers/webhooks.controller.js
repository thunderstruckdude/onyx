const {
  parseStripeEvent,
  parseRazorpayEvent,
  ensureWebhookNotProcessed
} = require('../services/webhook-security.service')
const { Auction, AUCTION_STATUS } = require('../../auctions/models/auction.model')
const { HTTP_STATUS } = require('../../../constants/http-status')
const { AppError } = require('../../../utils/app-error')

async function handleStripeWebhookController (req, res) {
  const sig = req.headers['stripe-signature']
  const rawBody = req.body.toString('utf8')
  const event = parseStripeEvent(rawBody, sig)

  const accepted = await ensureWebhookNotProcessed({
    provider: 'stripe',
    eventId: event.id
  })
  if (!accepted) {
    return res.status(HTTP_STATUS.OK).json({ received: true, duplicate: true })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntentId = event.data.object.id
    const auction = await Auction.findOne({ 'payment.paymentIntentId': paymentIntentId })
    if (!auction) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Auction payment not found')
    if (auction.status !== AUCTION_STATUS.ENDED) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'Invalid auction state transition')
    }
    auction.status = AUCTION_STATUS.SETTLED
    auction.payment.status = 'paid'
    await auction.save()
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntentId = event.data.object.id
    const auction = await Auction.findOne({ 'payment.paymentIntentId': paymentIntentId })
    if (!auction) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Auction payment not found')
    if (auction.status === AUCTION_STATUS.SETTLED) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'Cannot downgrade settled payment')
    }
    auction.payment.status = 'failed'
    await auction.save()
  }

  return res.status(HTTP_STATUS.OK).json({ received: true })
}

async function handleRazorpayWebhookController (req, res) {
  const sig = req.headers['x-razorpay-signature']
  const rawBody = req.body.toString('utf8')
  parseRazorpayEvent(rawBody, sig)
  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid Razorpay webhook payload')
  }

  const eventId = payload?.event + ':' + String(payload?.payload?.payment?.entity?.id || '')
  const accepted = await ensureWebhookNotProcessed({
    provider: 'razorpay',
    eventId
  })
  if (!accepted) {
    return res.status(HTTP_STATUS.OK).json({ received: true, duplicate: true })
  }

  const paymentId = payload?.payload?.payment?.entity?.id
  const eventType = payload?.event
  const auction = await Auction.findOne({ 'payment.paymentIntentId': paymentId })
  if (!auction) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'Auction payment not found')
  }

  if (eventType === 'payment.captured') {
    if (auction.status !== AUCTION_STATUS.ENDED) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'Invalid auction state transition')
    }
    auction.status = AUCTION_STATUS.SETTLED
    auction.payment.status = 'paid'
    await auction.save()
  } else if (eventType === 'payment.failed') {
    if (auction.status === AUCTION_STATUS.SETTLED) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'Cannot downgrade settled payment')
    }
    auction.payment.status = 'failed'
    await auction.save()
  }

  return res.status(HTTP_STATUS.OK).json({ received: true })
}

module.exports = {
  handleStripeWebhookController,
  handleRazorpayWebhookController
}
