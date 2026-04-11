function securityLog (event, data = {}) {
  const payload = {
    level: 'security',
    event,
    timestamp: new Date().toISOString(),
    ...data
  }
  console.info(JSON.stringify(payload))
}

module.exports = { securityLog }
