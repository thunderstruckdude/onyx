const msFromShortDuration = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000
}

function parseDurationToMs (value) {
  if (!value || typeof value !== 'string') return 15 * 60 * 1000
  const match = value.match(/^(\d+)([smhd])$/)
  if (!match) return 15 * 60 * 1000
  return Number(match[1]) * msFromShortDuration[match[2]]
}

function buildAccessCookieOptions (env) {
  const isProduction = env.nodeEnv === 'production'
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    domain: env.cookieDomain,
    maxAge: parseDurationToMs(env.jwtAccessTtl),
    path: '/'
  }
}

module.exports = { buildAccessCookieOptions }
