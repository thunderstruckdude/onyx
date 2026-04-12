#!/usr/bin/env bash
set -euo pipefail

mongosh --host mongo:27017 <<'EOF'
const config = {
  _id: 'rs0',
  members: [{ _id: 0, host: 'mongo:27017' }]
}

try {
  rs.status()
  print('Replica set already initialized')
} catch (err) {
  rs.initiate(config)
  print('Replica set initiated')
}
EOF
