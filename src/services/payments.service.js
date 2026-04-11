const Stripe = require('stripe')
const Razorpay = require('razorpay')
const { env } = require('../config/env')

let stripeClient = null
if (env.stripeSecretKey) {
  stripeClient = new Stripe(env.stripeSecretKey)
}

let razorpayClient = null
if (env.razorpayKeyId && env.razorpayKeySecret) {
  razorpayClient = new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret
  })
}

function toMinorUnit (amount) {
  return Math.round(amount * 100)
}

function normalizePaymentStatus (providerStatus) {
  if (!providerStatus) return 'pending'
  if (providerStatus === 'succeeded' || providerStatus === 'paid') return 'paid'
  if (providerStatus === 'requires_action') return 'requires_action'
  if (providerStatus === 'canceled' || providerStatus === 'failed') return 'failed'
  return 'pending'
}

async function createPaymentIntentForAuctionWin ({ auction, winnerBid }) {
  const amountMinor = toMinorUnit(winnerBid.bidAmount)

  if (stripeClient) {
    const intent = await stripeClient.paymentIntents.create({
      amount: amountMinor,
      currency: auction.currency.toLowerCase(),
      metadata: {
        auctionId: String(auction._id),
        bidId: String(winnerBid._id),
        winnerId: String(winnerBid.bidderId)
      }
    })
    return {
      provider: 'stripe',
      paymentIntentId: intent.id,
      status: normalizePaymentStatus(intent.status)
    }
  }

  if (razorpayClient) {
    const order = await razorpayClient.orders.create({
      amount: amountMinor,
      currency: auction.currency,
      receipt: `auction_${auction._id}`,
      notes: {
        auctionId: String(auction._id),
        bidId: String(winnerBid._id),
        winnerId: String(winnerBid.bidderId)
      }
    })

    return {
      provider: 'razorpay',
      paymentIntentId: order.id,
      status: 'requires_action'
    }
  }

  return {
    provider: null,
    paymentIntentId: null,
    status: 'pending'
  }
}

module.exports = { createPaymentIntentForAuctionWin }
