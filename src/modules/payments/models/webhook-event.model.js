const mongoose = require('mongoose')

const { Schema } = mongoose

const webhookEventSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ['stripe', 'razorpay'],
      required: true
    },
    eventId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    processedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: '__v',
    optimisticConcurrency: true
  }
)

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true })

module.exports = {
  WebhookEvent: mongoose.model('WebhookEvent', webhookEventSchema)
}
