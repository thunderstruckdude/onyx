const { z } = require('zod')

const loginSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      email: z.string().email().max(254),
      password: z.string().min(12).max(72)
    })
    .strict()
})

module.exports = { loginSchema }
