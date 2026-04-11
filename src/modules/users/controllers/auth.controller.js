const { User } = require('../models/user.model')
const { AppError } = require('../../../utils/app-error')
const { HTTP_STATUS } = require('../../../constants/http-status')
const { signAccessToken } = require('../../../utils/jwt')
const { env } = require('../../../config/env')
const { ACCESS_COOKIE_NAME } = require('../../../constants/auth')
const { buildAccessCookieOptions } = require('../../../utils/cookies')

async function registerController (req, res) {
  const { email, password, fullName, role } = req.body

  const existing = await User.findOne({ email })
  if (existing) {
    throw new AppError(HTTP_STATUS.CONFLICT, 'Email already registered')
  }

  const user = new User({
    email,
    fullName,
    role
  })
  await user.setPassword(password)
  await user.save()

  return res.status(HTTP_STATUS.CREATED).json({
    message: 'User registered successfully',
    data: {
      user: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    }
  })
}

async function loginController (req, res) {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+passwordHash')
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
        role: user.role
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
