const crypto = require('crypto')

function requestContextMiddleware (req, res, next) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID()
  req.requestId = requestId
  res.setHeader('x-request-id', requestId)
  return next()
}

module.exports = { requestContextMiddleware }
