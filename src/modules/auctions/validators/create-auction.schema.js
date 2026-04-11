const { z } = require('zod')

const createAuctionSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      title: z.string().min(3).max(200),
      description: z.string().min(10).max(5000),
      currency: z.string().length(3).transform((v) => v.toUpperCase()),
      basePrice: z.number().nonnegative(),
      minBidIncrement: z.number().positive(),
      startTime: z.string().datetime(),
      endTime: z.string().datetime()
    })
    .strict()
})

module.exports = { createAuctionSchema }
