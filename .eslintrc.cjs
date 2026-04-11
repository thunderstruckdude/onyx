module.exports = {
  root: true,
  ignorePatterns: ['client/**'],
  env: {
    node: true,
    es2022: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script'
  },
  rules: {
    'no-console': 'off'
  }
}
