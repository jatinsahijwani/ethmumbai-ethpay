import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getWalletBalance } from '@/lib/bitgo'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const balance = await getWalletBalance(user.walletId)

    return NextResponse.json({
      username,
      balance,
      walletAddress: user.receiveAddress,
    })

  } catch (err: any) {
    console.error('Balance error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}