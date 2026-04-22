const { z } = require('zod')

const objectId = /^[a-f\d]{24}$/i

const listBidsSchema = z.object({
  params: z.object({
    auctionId: z.string().regex(objectId, 'Invalid auctionId')
  }),
  body: z.object({}).passthrough(),
  query: z
    .object({
      page: z.coerce.number().int().min(1).max(500).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20)
    })
    .strict()
})

module.exports = { listBidsSchema }
