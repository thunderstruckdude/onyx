const { Router } = require('express')
const { asyncHandler } = require('../../../utils/async-handler')
const { validate } = require('../../../middlewares/validate.middleware')
const { requireAuth } = require('../../../middlewares/auth.middleware')
const {
  registerController,
  loginController,
  logoutController
} = require('../controllers/auth.controller')
const { getMeController, getDashboardController, updateMeController } = require('../controllers/profile.controller')
const { registerSchema } = require('../validators/register.schema')
const { loginSchema } = require('../validators/login.schema')
const { updateProfileSchema } = require('../validators/update-profile.schema')

const usersRouter = Router()

usersRouter.post('/auth/register', validate(registerSchema), asyncHandler(registerController))
usersRouter.post('/auth/login', validate(loginSchema), asyncHandler(loginController))
usersRouter.post('/auth/logout', requireAuth, asyncHandler(logoutController))
usersRouter.get('/me', requireAuth, asyncHandler(getMeController))
usersRouter.get('/me/dashboard', requireAuth, asyncHandler(getDashboardController))
usersRouter.patch('/me', requireAuth, validate(updateProfileSchema), asyncHandler(updateMeController))

module.exports = { usersRouter }
