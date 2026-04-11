function isRetryableTransactionError (error) {
  if (!error) return false
  if (typeof error.hasErrorLabel === 'function') {
    return (
      error.hasErrorLabel('TransientTransactionError') ||
      error.hasErrorLabel('UnknownTransactionCommitResult')
    )
  }
  return false
}

async function runTransactionWithRetry (operation, maxRetries = 3) {
  let attempt = 0
  while (attempt < maxRetries) {
    try {
      return await operation()
    } catch (error) {
      attempt += 1
      if (!isRetryableTransactionError(error) || attempt >= maxRetries) {
        throw error
      }
    }
  }
  return null
}

module.exports = {
  runTransactionWithRetry
}
