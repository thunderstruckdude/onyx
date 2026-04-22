const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const { Schema } = mongoose

const USER_ROLES = Object.freeze({
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin'
})

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.BUYER,
      required: true
    },
    onyxCredits: {
      type: Number,
      required: true,
      default: 50000,
      min: 0
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    profile: {
      avatarUrl: {
        type: String,
        trim: true,
        maxlength: 1024,
        default: null
      },
      phone: {
        type: String,
        trim: true,
        maxlength: 30,
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

userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ role: 1, isActive: 1 })
userSchema.index({ onyxCredits: -1 })

userSchema.methods.setPassword = async function setPassword (plainPassword) {
  const saltRounds = 12
  this.passwordHash = await bcrypt.hash(plainPassword, saltRounds)
}

userSchema.methods.verifyPassword = async function verifyPassword (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash)
}

module.exports = {
  User: mongoose.model('User', userSchema),
  USER_ROLES
}
