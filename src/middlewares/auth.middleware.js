const jwt = require('jsonwebtoken')
const { User } = require('../modules/users/models/user.model')
const { HTTP_STATUS } = require('../constants/http-status')
const { AppError } = require('../utils/app-error')
const { env } = require('../config/env')

async function requireAuth (req, _res, next) {
  const token = req.cookies?.accessToken

  if (!token) {
    return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required'))
  }

  let payload
  try {
    payload = jwt.verify(token, env.jwtAccessSecret, { issuer: env.jwtIssuer })
  } catch {
    return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid access token'))
  }

  const user = await User.findById(payload.sub).select('_id role isActive')
  if (!user || !user.isActive) {
    return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'User is not authorized'))
  }

  req.auth = {
    userId: String(user._id),
    role: user.role
  }

  return next()
}

function requireRoles (...roles) {
  return function requireRolesMiddleware (req, _res, next) {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return next(new AppError(HTTP_STATUS.FORBIDDEN, 'Insufficient permissions'))
    }
    return next()
  }
}

module.exports = { requireAuth, requireRoles }
