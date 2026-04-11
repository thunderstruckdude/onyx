const { z } = require('zod')

const listAuctionsSchema = z.object({
  params: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
  query: z
    .object({
      page: z.coerce.number().int().min(1).max(1000).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      status: z.enum(['draft', 'active', 'ended', 'settled', 'cancelled']).optional(),
      sellerId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
      minCurrentBid: z.coerce.number().nonnegative().optional(),
      maxCurrentBid: z.coerce.number().nonnegative().optional(),
      sortBy: z.enum(['createdAt', 'endTime', 'currentBid']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc')
    })
    .strict()
})

module.exports = { listAuctionsSchema }
