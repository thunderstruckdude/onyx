const http = require('http')
const { app } = require('./app')
const { env } = require('./config/env')
const { connectDatabase } = require('./db/connect')
const { initSocket } = require('./realtime/socket')
const { startAuctionFinalizerWorker } = require('./workers/finalize-auctions.worker')

const server = http.createServer(app)
initSocket(server)

async function bootstrap () {
  await connectDatabase(env.mongoUri)
  startAuctionFinalizerWorker()

  server.listen(env.port, () => {
    console.log(`Auction backend listening on port ${env.port}`)
  })
}

bootstrap().catch((error) => {
  console.error('Fatal startup error:', error)
  process.exit(1)
})
