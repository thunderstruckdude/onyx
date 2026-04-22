export const platformStats = [
  { label: 'Onyx Lots Traded', value: '148K+' },
  { label: 'Bid Throughput', value: '2.6K/min' },
  { label: 'Avg Commit Latency', value: '48ms' },
  { label: 'Credit Integrity', value: '99.997%' }
]

export const capabilities = [
  {
    title: 'Realtime Contest Engine',
    description:
      'Socket-native bid streams, anti-race transactional writes, and deterministic ordering under heavy contention.'
  },
  {
    title: 'Onyx Credit Settlement',
    description:
      'At auction finalization, winner credits transfer atomically to seller accounts with no external payment dependencies.'
  },
  {
    title: 'Seller Combat HUD',
    description:
      'Listing diagnostics, demand intensity visuals, and closing pressure indicators tuned for cyber-market performance.'
  },
  {
    title: 'Buyer Tactical View',
    description:
      'Low-friction bidding, instant lot detail analytics, and timing overlays engineered for split-second decisions.'
  }
]

export const timeline = [
  { step: '01', title: 'Mint Lot', description: 'Sellers publish cyber-tech lots with constrained windows and reserve control.' },
  { step: '02', title: 'Compete', description: 'Buyers place bids under ACID transaction guarantees and OCC conflict protection.' },
  { step: '03', title: 'Lock Winner', description: 'Top valid bid is selected deterministically at auction close.' },
  { step: '04', title: 'Transfer Credits', description: 'Onyx credits move from winner to seller in a single settlement transaction.' }
]
