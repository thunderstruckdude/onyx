const jwt = require('jsonwebtoken')

function signAccessToken ({ userId, role, env }) {
  return jwt.sign(
    {
      role
    },
    env.jwtAccessSecret,
    {
      subject: String(userId),
      issuer: env.jwtIssuer,
      expiresIn: env.jwtAccessTtl
    }
  )
}

module.exports = { signAccessToken }
