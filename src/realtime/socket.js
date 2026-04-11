const { Server } = require('socket.io')

let ioInstance = null

function initSocket (httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  ioInstance.on('connection', (socket) => {
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
