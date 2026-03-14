import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createUserWallet } from '@/lib/bitgo'
import { generateStealthKeypair } from '@/lib/stealth'

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json()

    // Validate username
    if (!username || !/^[a-z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters, lowercase letters, numbers, underscores only' },
        { status: 400 }
      )
    }

    // Check if taken
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    // 1. Create BitGo wallet
    console.log(`Creating BitGo wallet for ${username}...`)
    const wallet = await createUserWallet(`ethpay-${username}`)

    // 2. Generate stealth keypair for privacy
    const stealthKeys = generateStealthKeypair()

    // 3. Save user to DB
    const user = await prisma.user.create({
      data: {
        username,
        walletId: wallet.walletId,
        receiveAddress: wallet.receiveAddress,
        spendPubKey: stealthKeys.spendPubKey,
        viewPubKey: stealthKeys.viewPubKey,
        viewPrivKey: stealthKeys.viewPrivKey,
      },
    })

    return NextResponse.json({
      success: true,
      payId: `${username}@pay`,
      walletAddress: wallet.receiveAddress,
      userId: user.id,
    })

  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}