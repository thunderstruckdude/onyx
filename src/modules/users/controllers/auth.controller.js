const { User } = require('../models/user.model')
const { AppError } = require('../../../utils/app-error')
const { HTTP_STATUS } = require('../../../constants/http-status')
const { signAccessToken } = require('../../../utils/jwt')
const { env } = require('../../../config/env')
const { ACCESS_COOKIE_NAME } = require('../../../constants/auth')
const { buildAccessCookieOptions } = require('../../../utils/cookies')

function normalizeEmail (email) {
  return String(email || '').trim().toLowerCase()
}

async function registerController (req, res) {
  const { email, password, fullName, role } = req.body
  const normalizedEmail = normalizeEmail(email)

  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    throw new AppError(HTTP_STATUS.CONFLICT, 'Email already registered')
  }

  const user = new User({
    email: normalizedEmail,
    fullName,
    role,
    onyxCredits: 50000
  })
  await user.setPassword(password)
  await user.save()

  const token = signAccessToken({
    userId: user._id,
    role: user.role,
    env
  })
  res.cookie(ACCESS_COOKIE_NAME, token, buildAccessCookieOptions(env))

  return res.status(HTTP_STATUS.CREATED).json({
    message: 'User registered and authenticated successfully',
    data: {
      user: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        onyxCredits: user.onyxCredits
      }
    }
  })
}

async function loginController (req, res) {
  const { email, password } = req.body
  const normalizedEmail = normalizeEmail(email)

  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash')
  if (!user) {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials')
  }

  const passwordOk = await user.verifyPassword(password)
  if (!passwordOk) {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials')
  }

  if (!user.isActive) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'User account is disabled')
  }

  const token = signAccessToken({
    userId: user._id,
    role: user.role,
    env
  })

  user.lastLoginAt = new Date()
  await user.save()

  res.cookie(ACCESS_COOKIE_NAME, token, buildAccessCookieOptions(env))
  return res.status(HTTP_STATUS.OK).json({
    message: 'Login successful',
    data: {
      user: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        onyxCredits: user.onyxCredits
      }
    }
  })
}

function logoutController (_req, res) {
  res.clearCookie(ACCESS_COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: env.nodeEnv === 'production',
    domain: env.cookieDomain
  })

  return res.status(HTTP_STATUS.OK).json({
    message: 'Logout successful'
  })
}

module.exports = {
  registerController,
  loginController,
  logoutController
}
