const mongoose = require('mongoose')

const { Schema } = mongoose

const bidSchema = new Schema(
  {
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
      index: true
    },
    bidderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    bidAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3
    },
    auctionVersionAtBid: {
      type: Number,
      required: true,
      min: 0
    },
    source: {
      type: String,
      enum: ['api', 'socket'],
      required: true,
      default: 'api'
    }
  },
  {
    timestamps: true,
    versionKey: '__v',
    optimisticConcurrency: true,
    minimize: true
  }
)

bidSchema.index({ auctionId: 1, bidAmount: -1 })
bidSchema.index({ auctionId: 1, createdAt: -1 })
bidSchema.index({ bidderId: 1, createdAt: -1 })
bidSchema.index({ auctionId: 1, bidderId: 1, createdAt: -1 })

module.exports = {
  Bid: mongoose.model('Bid', bidSchema)
}
