const { HTTP_STATUS } = require('../constants/http-status')

function notFoundMiddleware (req, res) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`
    }
  })
}

module.exports = { notFoundMiddleware }
