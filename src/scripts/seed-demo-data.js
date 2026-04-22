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

  const demoAuctions = [
    {
      title: 'Demo: Patek Philippe Nautilus 5711',
      description: 'Collector-grade stainless steel luxury watch with complete box, papers, and authenticated provenance.',
      basePrice: 18000
    },
    {
      title: 'Demo: Vintage Porsche 911 Carrera',
      description: 'Garage-kept 1989 Carrera with full restoration records and low original mileage.',
      basePrice: 72000
    },
    {
      title: 'Demo: Signed Basquiat Lithograph',
      description: 'Museum-quality framed lithograph signed and verified by certified art valuation experts.',
      basePrice: 9500
    }
  ]

  for (const auctionSeed of demoAuctions) {
    let auction = await Auction.findOne({ title: auctionSeed.title, sellerId: seller._id })
    if (!auction) {
      auction = await Auction.create({
        sellerId: seller._id,
        title: auctionSeed.title,
        description: auctionSeed.description,
        currency: 'USD',
        basePrice: auctionSeed.basePrice,
        currentBid: auctionSeed.basePrice,
        minBidIncrement: 250,
        bidCount: 0,
        status: AUCTION_STATUS.ACTIVE,
        startTime: start,
        endTime: end
      })
    }

    const existingBidCount = await Bid.countDocuments({ auctionId: auction._id })
    if (existingBidCount >= 6) continue

    const bidSequence = [
      { bidderId: buyer1._id, amount: auctionSeed.basePrice + 500 },
      { bidderId: buyer2._id, amount: auctionSeed.basePrice + 900 },
      { bidderId: buyer1._id, amount: auctionSeed.basePrice + 1300 },
      { bidderId: buyer2._id, amount: auctionSeed.basePrice + 1700 },
      { bidderId: buyer1._id, amount: auctionSeed.basePrice + 2300 },
      { bidderId: buyer2._id, amount: auctionSeed.basePrice + 2800 }
    ]

    let lastBid = null
    let bidCounter = 0
    for (const entry of bidSequence) {
      lastBid = await Bid.create({
        auctionId: auction._id,
        bidderId: entry.bidderId,
        bidAmount: entry.amount,
        currency: 'USD',
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
