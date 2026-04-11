const { HTTP_STATUS } = require('../constants/http-status')
const { AppError } = require('../utils/app-error')

function validate (schema) {
  return function validateMiddleware (req, _res, next) {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    })

    if (!parsed.success) {
      return next(
        new AppError(
          HTTP_STATUS.BAD_REQUEST,
          'Request validation failed',
          parsed.error.issues
        )
      )
    }

    req.body = parsed.data.body
    req.params = parsed.data.params
    req.query = parsed.data.query
    return next()
  }
}

module.exports = { validate }
