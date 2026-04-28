const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const { env } = require('../config/env')
const { ACCESS_COOKIE_NAME } = require('../constants/auth')

let ioInstance = null

function parseCookies (cookieHeader) {
  return String(cookieHeader || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=')
      if (separatorIndex === -1) return cookies
      const key = part.slice(0, separatorIndex).trim()
      const value = part.slice(separatorIndex + 1).trim()
      cookies[key] = decodeURIComponent(value)
      return cookies
    }, {})
}

function initSocket (httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  ioInstance.use((socket, next) => {
    const cookies = parseCookies(socket.handshake.headers.cookie)
    const token = cookies[ACCESS_COOKIE_NAME]

    if (!token) {
      socket.data.auth = null
      return next()
    }

    try {
      const payload = jwt.verify(token, env.jwtAccessSecret, { issuer: env.jwtIssuer })
      socket.data.auth = {
        userId: String(payload.sub),
        role: payload.role
      }
      return next()
    } catch {
      socket.data.auth = null
      return next()
    }
  })

  ioInstance.on('connection', (socket) => {
    if (socket.data.auth?.userId) {
      socket.join(`user:${socket.data.auth.userId}`)
    }

    socket.on('auction:join', (auctionId) => {
      if (typeof auctionId === 'string' && auctionId.length > 0) {
        socket.join(`auction:${auctionId}`)
      }
    })

    socket.on('auction:leave', (auctionId) => {
      if (typeof auctionId === 'string' && auctionId.length > 0) {
        socket.leave(`auction:${auctionId}`)
      }
    })
  })

  return ioInstance
}

function getIo () {
  return ioInstance
}

module.exports = { initSocket, getIo }
