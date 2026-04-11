const { z } = require('zod')

const auctionIdSchema = z.object({
  params: z.object({
    auctionId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid auctionId')
  }),
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough()
})

module.exports = { auctionIdSchema }
