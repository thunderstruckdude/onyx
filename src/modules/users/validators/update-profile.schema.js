const { z } = require('zod')

const updateProfileSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    fullName: z.string().min(2).max(120).optional(),
    profile: z.object({
      avatarUrl: z.string().url().max(1024).nullable().optional(),
      phone: z.string().min(4).max(30).nullable().optional()
    }).optional()
  }).strict()
})

module.exports = { updateProfileSchema }
