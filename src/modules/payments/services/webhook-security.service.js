const crypto = require('crypto')
const Stripe = require('stripe')
const { env } = require('../../../config/env')
const { AppError } = require('../../../utils/app-error')
const { HTTP_STATUS } = require('../../../constants/http-status')
const { WebhookEvent } = require('../models/webhook-event.model')

function parseStripeEvent (rawBody, signature) {
  if (!env.stripeSecretKey || !env.stripeWebhookSecret) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Stripe webhook is not configured')
  }
  const stripe = new Stripe(env.stripeSecretKey)
  return stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret)
}

function parseRazorpayEvent (rawBody, signature) {
  if (!env.razorpayWebhookSecret) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Razorpay webhook is not configured')
  }
  const expected = crypto
    .createHmac('sha256', env.razorpayWebhookSecret)
    .update(rawBody)
    .digest('hex')

  const sig = Buffer.from(signature || '', 'utf8')
  const exp = Buffer.from(expected, 'utf8')
  if (sig.length !== exp.length || !crypto.timingSafeEqual(sig, exp)) {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid Razorpay webhook signature')
  }
}

async function ensureWebhookNotProcessed ({ provider, eventId }) {
  const existing = await WebhookEvent.findOne({ provider, eventId }).lean()
  if (existing) {
    return false
  }
  await WebhookEvent.create({ provider, eventId })
  return true
}

module.exports = {
  parseStripeEvent,
  parseRazorpayEvent,
  ensureWebhookNotProcessed
}
