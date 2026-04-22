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
    ['NeuroLink Mk-IV Cortex Jack', 'Military-grade neural uplink with low-latency wetware translation and hardened intrusion mesh.', 8800, 120, 'Neural Implants', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80'],
    ['Spectral Optics GhostLens', 'Adaptive ocular implant with thermal, UV, and encrypted signal ghosting modes.', 6400, 95, 'Optics', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1400&q=80'],
    ['Arachne NanoWeave Jacket', 'Reactive carbon thread jacket with impact diffusion and active thermal cloaking.', 4200, 80, 'Wearables', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1400&q=80'],
    ['VX-9 Silent Servo Arms', 'Dual hydraulic cyberarms tuned for precision mechanics and stealth torque output.', 13200, 200, 'Augmentations', 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=1400&q=80'],
    ['Kestrel Drone Swarm Core', 'Pocket command node for synchronized recon drone clusters in dense urban zones.', 5100, 90, 'Drones', 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1400&q=80'],
    ['Blackline EMP Grenade Kit', 'Controlled EMP dispersal capsules with directional fail-safe containment shell.', 2700, 50, 'Tactical', 'https://images.unsplash.com/photo-1517420879524-86d64ac2f339?auto=format&fit=crop&w=1400&q=80'],
    ['HoloForge Tactical HUD', 'AR command visor for squad overlays, threat vectors, and skyline route prediction.', 3900, 70, 'Command Systems', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1400&q=80'],
    ['OnyxRail Magnetic Board', 'Urban traversal board with silent mag-lock and gyroscopic stabilization.', 3100, 65, 'Mobility', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80'],
    ['CipherSkin Facial Mesh', 'Programmable dermal mask with biometric spoof resistance and quick morph presets.', 7300, 110, 'Stealth', 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80'],
    ['HydraPulse Med Injector', 'Combat-ready med injector with staged clotting and pain suppression protocols.', 2600, 45, 'Medical', 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1400&q=80'],
    ['EchoTrace Signal Harvester', 'Portable RF intelligence collector with pattern decomposition accelerator.', 4700, 85, 'Signal Intelligence', 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1400&q=80'],
    ['Titanium Spine Reinforcement', 'Modular spinal frame with shock channels and overclock-compatible slots.', 15000, 220, 'Augmentations', 'https://images.unsplash.com/photo-1581091215367-59ab6dcef0f1?auto=format&fit=crop&w=1400&q=80'],
    ['NightGrid Monowire Set', 'Precision monowire bundle for high-fidelity cuts and micro-repair fabrication.', 3600, 60, 'Tools', 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1400&q=80'],
    ['Arc Lantern Plasma Cutter', 'Compact plasma blade engineered for zero-spark breach operations.', 5400, 90, 'Tools', 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1400&q=80'],
    ['NovaDrive Street Bike ECU', 'Illegal race-tuned ECU with predictive torque surge and anti-lock drift assist.', 9800, 140, 'Vehicle Mods', 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1400&q=80'],
    ['Helix Quantum Deck', 'Intrusion deck featuring layered sandbox threads and adaptive crypt breaker cores.', 11800, 170, 'Cyberdecks', 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1400&q=80'],
    ['Vanta Cloak Field Generator', 'Wearable light-bend field projector with burst stealth and heat washout.', 14200, 210, 'Stealth', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80'],
    ['Banshee Sonic Sidearm', 'Sub-lethal sonic pistol with directional cone shaping and resonance dampening.', 5900, 100, 'Tactical', 'https://images.unsplash.com/photo-1557700836-25f2464e8456?auto=format&fit=crop&w=1400&q=80'],
    ['AetherVault Data Shard', 'Cold-storage quantum shard for high-value keys and zero-trust archive syncing.', 3300, 55, 'Data Security', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1400&q=80'],
    ['Grimwire Smart Garrote', 'Smart tension filament with auto-retract and forensic trace neutralizer.', 2900, 50, 'Tactical', 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1400&q=80']
  ].map(([title, description, basePrice, minBidIncrement, category, imageUrl]) => ({
    title: `Onyx Lot: ${title}`,
    description,
    basePrice,
    minBidIncrement,
    category,
    imageUrl
  }))

  for (const auctionSeed of cyberAuctions) {
    let auction = await Auction.findOne({ title: auctionSeed.title, sellerId: seller._id })
    if (!auction) {
      auction = await Auction.create({
        sellerId: seller._id,
        title: auctionSeed.title,
        description: auctionSeed.description,
        imageUrl: auctionSeed.imageUrl,
        category: auctionSeed.category,
        currency: 'ONX',
        basePrice: auctionSeed.basePrice,
        currentBid: auctionSeed.basePrice,
        minBidIncrement: auctionSeed.minBidIncrement,
        bidCount: 0,
        status: AUCTION_STATUS.ACTIVE,
        startTime: start,
        endTime: end
      })
    } else {
      auction.description = auctionSeed.description
      auction.imageUrl = auctionSeed.imageUrl
      auction.category = auctionSeed.category
      auction.currency = 'ONX'
      auction.basePrice = auctionSeed.basePrice
      auction.minBidIncrement = auctionSeed.minBidIncrement
      auction.startTime = start
      auction.endTime = end
      auction.status = AUCTION_STATUS.ACTIVE
      auction.winnerBidId = null
      auction.finalizedAt = null
      auction.payment = {
        provider: null,
        status: null,
        paymentIntentId: null
      }
      await auction.save()
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

  const archiveTitle = 'Onyx Archive: Phantom Relay Crown'
  let archiveAuction = await Auction.findOne({ title: archiveTitle, sellerId: seller._id })
  if (!archiveAuction) {
    archiveAuction = await Auction.create({
      sellerId: seller._id,
      title: archiveTitle,
      description: 'Settled showcase lot used to demonstrate the won-auctions panel and post-auction state history.',
      imageUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1400&q=80',
      category: 'Archive Showcase',
      currency: 'ONX',
      basePrice: 6200,
      currentBid: 7940,
      minBidIncrement: 80,
      bidCount: 3,
      status: AUCTION_STATUS.SETTLED,
      startTime: new Date(now - 1000 * 60 * 180),
      endTime: new Date(now - 1000 * 60 * 120),
      finalizedAt: new Date(now - 1000 * 60 * 115)
    })
  }

  const archiveBidCount = await Bid.countDocuments({ auctionId: archiveAuction._id })
  if (archiveBidCount === 0) {
    const archiveBids = await Bid.insertMany([
      {
        auctionId: archiveAuction._id,
        bidderId: buyer2._id,
        bidAmount: 6840,
        currency: 'ONX',
        auctionVersionAtBid: archiveAuction.__v,
        source: 'api'
      },
      {
        auctionId: archiveAuction._id,
        bidderId: buyer1._id,
        bidAmount: 7320,
        currency: 'ONX',
        auctionVersionAtBid: archiveAuction.__v,
        source: 'api'
      },
      {
        auctionId: archiveAuction._id,
        bidderId: buyer1._id,
        bidAmount: 7940,
        currency: 'ONX',
        auctionVersionAtBid: archiveAuction.__v,
        source: 'api'
      }
    ])
    archiveAuction.bidCount = archiveBids.length
    archiveAuction.currentBid = 7940
    archiveAuction.currentBidderId = buyer1._id
    archiveAuction.winnerBidId = archiveBids[archiveBids.length - 1]._id
    await archiveAuction.save()
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
