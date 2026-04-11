const mongoose = require('mongoose')

async function connectDatabase (mongoUri) {
  mongoose.set('strictQuery', true)
  await mongoose.connect(mongoUri, {
    autoIndex: false,
    maxPoolSize: 20
  })
}

module.exports = { connectDatabase }
