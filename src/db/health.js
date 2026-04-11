const mongoose = require('mongoose')
const { AppError } = require('../utils/app-error')
const { HTTP_STATUS } = require('../constants/http-status')

async function assertReplicaSetReady () {
  const admin = mongoose.connection.db.admin()
  const hello = await admin.command({ hello: 1 })
  if (!hello.setName) {
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'MongoDB replica set required for transactions'
    )
  }
}

module.exports = { assertReplicaSetReady }
