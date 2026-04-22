/* eslint-disable no-console */
const { env } = require('../config/env')
const { connectDatabase } = require('../db/connect')
const { User } = require('../modules/users/models/user.model')
const { Auction, AUCTION_STATUS } = require('../modules/auctions/models/auction.model')
const { Bid } = require('../modules/bids/models/bid.model')

async function upsertUser ({ email, fullName, role, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  let user = await User.findOne({ email: normalizedEmail }).select('+passwordHash')
  if (!user) {
    user = new User({
      email: normalizedEmail,
      fullName,
      role
    })
  }
  user.fullName = fullName
  user.role = role
  user.onyxCredits = role === 'seller' ? 220000 : 175000
  await user.setPassword(password)
  await user.save()
  return user
}

async function seed () {
  await connectDatabase(env.mongoUri)

  const demoPassword = 'DemoPass#2026!!'

  const seller = await upsertUser({
    email: 'seller@aetherbid.dev',
    fullName: 'Demo Seller',
    role: 'seller',
    password: demoPassword
  })

  const buyer1 = await upsertUser({
    email: 'buyer1@aetherbid.dev',
    fullName: 'Demo Buyer One',
    role: 'buyer',
    password: demoPassword
  })

  const buyer2 = await upsertUser({
    email: 'buyer2@aetherbid.dev',
    fullName: 'Demo Buyer Two',
    role: 'buyer',
    password: demoPassword
  })

  const now = Date.now()
  const end = new Date(now + 1000 * 60 * 90)
  const start = new Date(now - 1000 * 60 * 30)

  const cyberAuctions = [
    ['NeuroLink Mk-IV Cortex Jack', 'Military-grade neural uplink with low-latency wetware translation and hardened intrusion mesh.', 8800, 120],
    ['Spectral Optics GhostLens', 'Adaptive ocular implant with thermal, UV, and encrypted signal ghosting modes.', 6400, 95],
    ['Arachne NanoWeave Jacket', 'Reactive carbon thread jacket with impact diffusion and active thermal cloaking.', 4200, 80],
    ['VX-9 Silent Servo Arms', 'Dual hydraulic cyberarms tuned for precision mechanics and stealth torque output.', 13200, 200],
    ['Kestrel Drone Swarm Core', 'Pocket command node for synchronized recon drone clusters in dense urban zones.', 5100, 90],
    ['Blackline EMP Grenade Kit', 'Controlled EMP dispersal capsules with directional fail-safe containment shell.', 2700, 50],
    ['HoloForge Tactical HUD', 'AR command visor for squad overlays, threat vectors, and skyline route prediction.', 3900, 70],
    ['OnyxRail Magnetic Board', 'Urban traversal board with silent mag-lock and gyroscopic stabilization.', 3100, 65],
    ['CipherSkin Facial Mesh', 'Programmable dermal mask with biometric spoof resistance and quick morph presets.', 7300, 110],
    ['HydraPulse Med Injector', 'Combat-ready med injector with staged clotting and pain suppression protocols.', 2600, 45],
    ['EchoTrace Signal Harvester', 'Portable RF intelligence collector with pattern decomposition accelerator.', 4700, 85],
    ['Titanium Spine Reinforcement', 'Modular spinal frame with shock channels and overclock-compatible slots.', 15000, 220],
    ['NightGrid Monowire Set', 'Precision monowire bundle for high-fidelity cuts and micro-repair fabrication.', 3600, 60],
    ['Arc Lantern Plasma Cutter', 'Compact plasma blade engineered for zero-spark breach operations.', 5400, 90],
    ['NovaDrive Street Bike ECU', 'Illegal race-tuned ECU with predictive torque surge and anti-lock drift assist.', 9800, 140],
    ['Helix Quantum Deck', 'Intrusion deck featuring layered sandbox threads and adaptive crypt breaker cores.', 11800, 170],
    ['Vanta Cloak Field Generator', 'Wearable light-bend field projector with burst stealth and heat washout.', 14200, 210],
    ['Banshee Sonic Sidearm', 'Sub-lethal sonic pistol with directional cone shaping and resonance dampening.', 5900, 100],
    ['AetherVault Data Shard', 'Cold-storage quantum shard for high-value keys and zero-trust archive syncing.', 3300, 55],
    ['Grimwire Smart Garrote', 'Smart tension filament with auto-retract and forensic trace neutralizer.', 2900, 50]
  ].map(([title, description, basePrice, minBidIncrement]) => ({
    title: `Onyx Lot: ${title}`,
    description,
    basePrice,
    minBidIncrement
  }))

  for (const auctionSeed of cyberAuctions) {
    let auction = await Auction.findOne({ title: auctionSeed.title, sellerId: seller._id })
    if (!auction) {
      auction = await Auction.create({
        sellerId: seller._id,
        title: auctionSeed.title,
        description: auctionSeed.description,
        currency: 'ONX',
        basePrice: auctionSeed.basePrice,
        currentBid: auctionSeed.basePrice,
        minBidIncrement: auctionSeed.minBidIncrement,
        bidCount: 0,
        status: AUCTION_STATUS.ACTIVE,
        startTime: start,
        endTime: end
      })
    }

    const existingBidCount = await Bid.countDocuments({ auctionId: auction._id })
    if (existingBidCount >= 14) continue

    const bidSequence = []
    let cursor = auctionSeed.basePrice
    for (let i = 0; i < 14; i += 1) {
      cursor += auctionSeed.minBidIncrement + (i * 10)
      bidSequence.push({
        bidderId: i % 2 === 0 ? buyer1._id : buyer2._id,
        amount: cursor
      })
    }

    let lastBid = null
    let bidCounter = 0
    for (const entry of bidSequence) {
      lastBid = await Bid.create({
        auctionId: auction._id,
        bidderId: entry.bidderId,
        bidAmount: entry.amount,
        currency: 'ONX',
        auctionVersionAtBid: auction.__v,
        source: 'api'
      })
      bidCounter += 1
      auction.currentBid = entry.amount
      auction.currentBidderId = entry.bidderId
    }

    if (lastBid) {
      auction.bidCount = bidCounter
      await auction.save()
    }
  }

  console.log('Demo seed complete')
  console.log('Onyx credits initialized for demo users')
  console.log('Login credentials:')
  console.log('seller@aetherbid.dev / DemoPass#2026!!')
  console.log('buyer1@aetherbid.dev / DemoPass#2026!!')
  console.log('buyer2@aetherbid.dev / DemoPass#2026!!')
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
