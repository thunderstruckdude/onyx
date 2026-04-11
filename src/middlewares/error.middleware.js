const { HTTP_STATUS } = require('../constants/http-status')

function errorMiddleware (err, req, res, _next) {
  const statusCode = Number(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
  const payload = {
    error: {
      message: err.message || 'Internal Server Error',
      requestId: req.requestId
    }
  }

  if (err.details) {
    payload.error.details = err.details
  }

  res.status(statusCode).json(payload)
}

module.exports = { errorMiddleware }
