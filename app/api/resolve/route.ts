import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const payId = searchParams.get('id')

    if (!payId) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    let username = payId
    if (payId.endsWith('@pay')) {
      username = payId.replace('@pay', '')
    }

    const user = await prisma.user.findUnique({ where: { username } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      resolved: true,
      username: user.username,
      payId: `${user.username}@pay`,
      walletAddress: user.receiveAddress,
    })

  } catch (err: any) {
    console.error('Resolve error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}