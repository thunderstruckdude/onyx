const { z } = require('zod')

const registerSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      email: z.string().email().max(254),
      password: z.string().min(12).max(72),
      fullName: z.string().min(2).max(120),
      role: z.enum(['buyer', 'seller']).default('buyer')
    })
    .strict()
})

module.exports = { registerSchema }
