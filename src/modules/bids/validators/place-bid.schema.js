const { z } = require('zod')

const objectId = /^[a-f\d]{24}$/i

const placeBidSchema = z.object({
  params: z.object({
    auctionId: z.string().regex(objectId, 'Invalid auctionId')
  }),
  body: z
    .object({
      bidAmount: z.number().positive().finite()
    })
    .strict(),
  query: z.object({}).passthrough()
})

module.exports = { placeBidSchema }
