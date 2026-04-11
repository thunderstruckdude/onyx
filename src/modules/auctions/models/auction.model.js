const mongoose = require('mongoose')

const { Schema } = mongoose

const AUCTION_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  ENDED: 'ended',
  SETTLED: 'settled',
  CANCELLED: 'cancelled'
})

const auctionSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
      default: 'USD'
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    currentBid: {
      type: Number,
      required: true,
      min: 0
    },
    currentBidderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    minBidIncrement: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    bidCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(AUCTION_STATUS),
      default: AUCTION_STATUS.DRAFT,
      required: true,
      index: true
    },
    startTime: {
      type: Date,
      required: true,
      index: true
    },
    endTime: {
      type: Date,
      required: true,
      index: true
    },
    winnerBidId: {
      type: Schema.Types.ObjectId,
      ref: 'Bid',
      default: null
    },
    finalizedAt: {
      type: Date,
      default: null
    },
    payment: {
      provider: {
        type: String,
        enum: ['stripe', 'razorpay', null],
        default: null
      },
      status: {
        type: String,
        enum: ['pending', 'requires_action', 'paid', 'failed', null],
        default: null
      },
      paymentIntentId: {
        type: String,
        trim: true,
        maxlength: 255,
        default: null
      }
    }
  },
  {
    timestamps: true,
    versionKey: '__v',
    optimisticConcurrency: true,
    minimize: true
  }
)

auctionSchema.pre('validate', function setCurrentBidFromBasePrice (next) {
  if (this.isNew && (this.currentBid === undefined || this.currentBid === null)) {
    this.currentBid = this.basePrice
  }
  next()
})

auctionSchema.index({ status: 1, endTime: 1 })
auctionSchema.index({ status: 1, startTime: 1 })
auctionSchema.index({ sellerId: 1, status: 1, createdAt: -1 })
auctionSchema.index({ currentBid: -1, endTime: 1 })

module.exports = {
  Auction: mongoose.model('Auction', auctionSchema),
  AUCTION_STATUS
}
