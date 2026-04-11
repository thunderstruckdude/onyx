const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp')
const morgan = require('morgan')
const { v1Router } = require('./api/v1')
const { notFoundMiddleware } = require('./middlewares/not-found.middleware')
const { errorMiddleware } = require('./middlewares/error.middleware')
const { env } = require('./config/env')
const { requestContextMiddleware } = require('./utils/request-context')

const app = express()

app.set('trust proxy', 1)

app.use(helmet())
app.use(
  cors({
    origin: env.corsOrigin || true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  })
)
app.use(compression())
app.use(cookieParser())
app.use('/api/v1/payments/webhooks', express.raw({ type: '*/*', limit: '256kb' }))
app.use(express.json({ limit: '32kb' }))
app.use(express.urlencoded({ extended: false }))
app.use(requestContextMiddleware)
app.use(mongoSanitize())
app.use(hpp())
app.use(morgan('combined'))

app.get('/healthz', (_req, res) => {
  res.status(200).json({ ok: true })
})

app.use('/api/v1', v1Router)
app.use(notFoundMiddleware)
app.use(errorMiddleware)

module.exports = { app }
