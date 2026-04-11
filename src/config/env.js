const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

function getRequiredEnv (key) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  mongoUri: getRequiredEnv('MONGODB_URI'),
  jwtAccessSecret: getRequiredEnv('JWT_ACCESS_SECRET'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  jwtIssuer: process.env.JWT_ISSUER || 'secure-auction-backend',
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  corsOrigin: process.env.CORS_ORIGIN || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ''
}

module.exports = { env }
