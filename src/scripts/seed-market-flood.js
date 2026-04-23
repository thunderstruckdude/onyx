/* eslint-disable no-console */
const mongoose = require('mongoose')
const { env } = require('../config/env')
const { User } = require('../modules/users/models/user.model')
const { Auction, AUCTION_STATUS } = require('../modules/auctions/models/auction.model')
const { Bid } = require('../modules/bids/models/bid.model')

const DEMO_PASSWORD = 'DemoPass#2026!!'

const cyberpunkImages = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1515861461225-1488dfdaf0c7?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1526374965328-0d36a5f7f2a5?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1400&q=80'
]

const fantasyImages = [
  'https://images.unsplash.com/photo-1518548132453-9a5a4f0e0f75?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1510768532818-0e65c9bf5d34?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1508264165352-258db2ebd59d?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80'
]

function pick (items, index) {
  return items[index % items.length]
}

function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function priceForTier (tier) {
  const tiers = {
    common: [1200, 4200],
    uncommon: [3200, 7600],
    rare: [6500, 12800],
    epic: [12000, 22000],
    legendary: [20000, 42000]
  }
  const [min, max] = tiers[tier] || tiers.rare
  return randomInt(min, max)
}

function incrementForPrice (price) {
  if (price < 2500) return randomInt(25, 75)
  if (price < 7000) return randomInt(60, 140)
  if (price < 15000) return randomInt(120, 260)
  if (price < 30000) return randomInt(220, 420)
  return randomInt(320, 650)
}

async function fetchJson (url) {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

function buildFallbackMongoUri (uri) {
  try {
    const parsed = new URL(uri)
    if (parsed.hostname !== 'mongo') return null
    parsed.hostname = '127.0.0.1'
    return parsed.toString()
  } catch {
    return null
  }
}

async function connectWithFallback (uri) {
  const candidates = [uri, buildFallbackMongoUri(uri)].filter(Boolean)
  let lastError = null

  mongoose.set('strictQuery', true)

  for (const candidate of candidates) {
    try {
      await mongoose.connect(candidate, {
        autoIndex: false,
        maxPoolSize: 20
      })
      return candidate
    } catch (error) {
      lastError = error
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect()
      }
    }
  }

  throw lastError
}

async function loadFantasyCorpus () {
  const sources = await Promise.all([
    fetchJson('https://www.dnd5eapi.co/api/magic-items'),
    fetchJson('https://www.dnd5eapi.co/api/equipment')
  ])

  const magicList = sources[0]?.results || []
  const equipmentList = sources[1]?.results || []

  const fetchDetails = async (source, list, limit) => {
    const entries = list.slice(0, limit)
    const details = await Promise.all(entries.map(async (entry) => {
      const detail = await fetchJson(`https://www.dnd5eapi.co${entry.url}`)
      return {
        name: entry.name,
        source,
        rarity: detail?.rarity || detail?.equipment_category?.name || null,
        desc: Array.isArray(detail?.desc) ? detail.desc.join(' ') : null
      }
    }))
    return details.filter(Boolean)
  }

  const [magicItems, equipmentItems] = await Promise.all([
    fetchDetails('magic', magicList, 14),
    fetchDetails('equipment', equipmentList, 14)
  ])

  return [...magicItems, ...equipmentItems]
}

function buildCyberpunkSeeds (count) {
  const prefixes = [
    'Neuro', 'Ghost', 'Vanta', 'Helix', 'Cipher', 'Specter', 'Echo', 'Nova', 'Chrome', 'Ion',
    'Pulse', 'Quantum', 'Blackline', 'Kestrel', 'Signal', 'Axiom', 'Obsidian', 'Arc', 'Viper', 'Orchid'
  ]
  const middles = [
    'Link', 'Deck', 'Rig', 'Crown', 'Shell', 'Node', 'Halo', 'Mantle', 'Shard', 'Bloom',
    'Ghostline', 'Pulsecore', 'Mesh', 'Spine', 'Lattice', 'Trace', 'Cipher', 'Drive', 'Grid', 'Vault'
  ]
  const suffixes = [
    'Mk-I', 'Mk-II', 'Mk-III', 'Omega', 'Nightfall', 'Zero', 'Prime', 'Black', 'X', 'Vector', 'Rift', 'Pulse'
  ]
  const categories = [
    'Cyberdecks', 'Neural Implants', 'Augmentations', 'Tactical Systems', 'Mobility', 'Signal Ops',
    'Vehicle Mods', 'Counter-Intel', 'Stealth Gear'
  ]
  const descriptions = [
    'Recalibrated for street-level covert ops and high-frequency intrusion.',
    'Built to survive hostile urban environments and hostile firmware.',
    'Optimized for velocity, concealment, and live signal dominance.',
    'Recovered from an abandoned corporate vault and tuned for active use.',
    'Configured for rapid deployment, hardened analytics, and silent handling.'
  ]

  return Array.from({ length: count }, (_, index) => {
    const price = priceForTier(index % 5 === 0 ? 'legendary' : index % 4 === 0 ? 'epic' : index % 3 === 0 ? 'rare' : 'uncommon')
    return {
      title: `Onyx Node: ${pick(prefixes, index)} ${pick(middles, index)} ${pick(suffixes, index)}`,
      description: pick(descriptions, index),
      basePrice: price,
      minBidIncrement: incrementForPrice(price),
      category: pick(categories, index),
      imageUrl: pick(cyberpunkImages, index),
      seedSource: 'generated-cyberpunk'
    }
  })
}

function buildFantasySeeds (corpus) {
  const fallbackNames = [
    'Dragonbone Crown', 'Moonlit Grimoire', 'Knightfall Halberd', 'Elven Starforge', 'Runebound Amulet',
    'Hollowwood Wand', 'Abyssal Lantern', 'Sageglass Ring', 'Stormforged Blade', 'Oracle Compass',
    'Phoenix Cloak', 'Ironroot Greaves', 'Glassveil Dagger', 'Astral Scepter'
  ]

  return (corpus.length > 0 ? corpus : fallbackNames.map((name) => ({ name, source: 'fallback', rarity: 'rare', desc: null }))).map((entry, index) => {
    const normalizedName = String(entry.name || fallbackNames[index % fallbackNames.length])
    const rarity = String(entry.rarity || 'rare').toLowerCase()
    let tier = 'rare'
    if (rarity.includes('legendary')) {
      tier = 'legendary'
    } else if (rarity.includes('rare')) {
      tier = 'rare'
    } else if (rarity.includes('uncommon')) {
      tier = 'uncommon'
    } else if (rarity.includes('common')) {
      tier = 'common'
    } else if (index % 2 === 0) {
      tier = 'epic'
    }
    const price = priceForTier(tier)

    return {
      title: `Onyx Relic: ${normalizedName}`,
      description:
        entry.desc ||
        `A ${rarity} relic pulled from a sanctioned fantasy archive and prepped for competitive auction.`,
      basePrice: price,
      minBidIncrement: incrementForPrice(price),
      category: entry.source === 'equipment' ? 'Arcane Armory' : 'Mythic Relics',
      imageUrl: pick(fantasyImages, index),
      seedSource: entry.source || 'fantasy-api'
    }
  })
}

async function upsertUser ({ email, fullName, role, password, credits }) {
  const normalizedEmail = email.trim().toLowerCase()
  let user = await User.findOne({ email: normalizedEmail }).select('+passwordHash')
  if (!user) {
    user = new User({ email: normalizedEmail, fullName, role })
  }
  user.fullName = fullName
  user.role = role
  user.onyxCredits = credits
  await user.setPassword(password)
  await user.save()
  return user
}

async function seedAuction (auctionSeed, seller, buyerPool, startedMinutesAgo, endsMinutesFromNow, status = AUCTION_STATUS.ACTIVE) {
  const startTime = new Date(Date.now() - startedMinutesAgo * 60 * 1000)
  const endTime = new Date(Date.now() + endsMinutesFromNow * 60 * 1000)
  const auction = await Auction.create({
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
    status,
    startTime,
    endTime
  })

  const bidCount = status === AUCTION_STATUS.ACTIVE ? randomInt(8, 18) : randomInt(3, 8)
  const bids = []
  let currentBid = auctionSeed.basePrice
  let lastBidder = buyerPool[0]

  for (let i = 0; i < bidCount; i += 1) {
    const bidder = buyerPool[i % buyerPool.length]
    currentBid += auctionSeed.minBidIncrement + (i * randomInt(4, 18))
    bids.push({
      auctionId: auction._id,
      bidderId: bidder._id,
      bidAmount: currentBid,
      currency: 'ONX',
      auctionVersionAtBid: auction.__v,
      source: 'api'
    })
    lastBidder = bidder
  }

  const createdBids = await Bid.insertMany(bids)
  auction.currentBid = currentBid
  auction.currentBidderId = lastBidder._id
  auction.bidCount = createdBids.length

  if (status === AUCTION_STATUS.SETTLED) {
    auction.status = AUCTION_STATUS.SETTLED
    auction.winnerBidId = createdBids[createdBids.length - 1]._id
    auction.finalizedAt = new Date()
    auction.payment = {
      provider: 'onyx_credits',
      status: 'paid',
      paymentIntentId: null
    }
  }

  await auction.save()
  return auction
}

async function seed () {
  const connectedTo = await connectWithFallback(env.mongoUri)
  console.log(`Connected to MongoDB at ${connectedTo}`)

  const seller = await upsertUser({
    email: 'seller@aetherbid.dev',
    fullName: 'Demo Seller',
    role: 'seller',
    password: DEMO_PASSWORD,
    credits: 250000
  })

  const buyers = await Promise.all([
    upsertUser({
      email: 'buyer1@aetherbid.dev',
      fullName: 'Demo Buyer One',
      role: 'buyer',
      password: DEMO_PASSWORD,
      credits: 225000
    }),
    upsertUser({
      email: 'buyer2@aetherbid.dev',
      fullName: 'Demo Buyer Two',
      role: 'buyer',
      password: DEMO_PASSWORD,
      credits: 225000
    }),
    upsertUser({
      email: 'buyer3@aetherbid.dev',
      fullName: 'Demo Buyer Three',
      role: 'buyer',
      password: DEMO_PASSWORD,
      credits: 225000
    }),
    upsertUser({
      email: 'buyer4@aetherbid.dev',
      fullName: 'Demo Buyer Four',
      role: 'buyer',
      password: DEMO_PASSWORD,
      credits: 225000
    })
  ])

  await Promise.all([
    Auction.deleteMany({}),
    Bid.deleteMany({})
  ])

  const fantasyCorpus = await loadFantasyCorpus()
  const fantasySeeds = buildFantasySeeds(fantasyCorpus).slice(0, 18)
  const cyberSeeds = buildCyberpunkSeeds(30)
  const activeSeeds = [...cyberSeeds, ...fantasySeeds]

  const seededAuctions = []
  for (let i = 0; i < activeSeeds.length; i += 1) {
    const auction = await seedAuction(
      activeSeeds[i],
      seller,
      buyers,
      randomInt(10, 120),
      randomInt(40, 180),
      AUCTION_STATUS.ACTIVE
    )
    seededAuctions.push(auction)
  }

  const archiveSeeds = [
    {
      title: 'Onyx Archive: Dragon Crown of the Warden',
      description: 'A finished showcase relic used for the won-panel and report pages.',
      basePrice: 12400,
      minBidIncrement: 220,
      category: 'Mythic Relics',
      imageUrl: fantasyImages[0]
    },
    {
      title: 'Onyx Archive: Chrome Revenant Spear',
      description: 'Settled cyber-fantasy hybrid with a clean closing ledger.',
      basePrice: 15900,
      minBidIncrement: 260,
      category: 'Hybrid Relics',
      imageUrl: cyberpunkImages[1]
    },
    {
      title: 'Onyx Archive: Astral Circuit Tome',
      description: 'Closed auction for a recovered spellbook-backed data shard.',
      basePrice: 9800,
      minBidIncrement: 180,
      category: 'Arcane Systems',
      imageUrl: fantasyImages[3]
    }
  ]

  for (const archiveSeed of archiveSeeds) {
    await seedAuction(
      archiveSeed,
      seller,
      buyers,
      randomInt(160, 360),
      randomInt(-180, -20),
      AUCTION_STATUS.SETTLED
    )
  }

  console.log('Market flood seed complete')
  console.log(`Seeded ${seededAuctions.length} live auctions and ${archiveSeeds.length} finished showcase items.`)
  console.log('Login credentials:')
  console.log('seller@aetherbid.dev / DemoPass#2026!!')
  console.log('buyer1@aetherbid.dev / DemoPass#2026!!')
  console.log('buyer2@aetherbid.dev / DemoPass#2026!!')
  console.log('buyer3@aetherbid.dev / DemoPass#2026!!')
  console.log('buyer4@aetherbid.dev / DemoPass#2026!!')
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
