const { User } = require('../models/user.model')
const { HTTP_STATUS } = require('../../../constants/http-status')
const { AppError } = require('../../../utils/app-error')

async function getMeController (req, res) {
  const user = await User.findById(req.auth.userId).select(
    '_id email fullName role isEmailVerified isActive profile createdAt updatedAt'
  )
  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found')
  }

  return res.status(HTTP_STATUS.OK).json({
    data: {
      user: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        profile: user.profile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  })
}

module.exports = { getMeController }
