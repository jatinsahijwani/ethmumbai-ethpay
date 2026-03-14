import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    const [sent, received] = await Promise.all([
      prisma.transaction.findMany({
        where: { senderId: user.id },
        include: { receiver: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.transaction.findMany({
        where: { receiverId: user.id },
        include: { sender: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    const sentFormatted = sent.map(tx => ({
      id: tx.id,
      type: 'sent',
      counterparty: tx.receiver.username + '@pay',
      amount: tx.amountUsdc,
      stealthAddress: tx.stealthAddress,
      txHash: tx.txHash,
      status: tx.status,
      createdAt: tx.createdAt,
      explorerUrl: tx.txHash
        ? `https://hoodi.ethpandaops.io/tx/${tx.txHash}`
        : null,
    }))

    const receivedFormatted = received.map(tx => ({
      id: tx.id,
      type: 'received',
      counterparty: tx.sender.username + '@pay',
      amount: tx.amountUsdc,
      stealthAddress: tx.stealthAddress,
      txHash: tx.txHash,
      status: tx.status,
      createdAt: tx.createdAt,
      explorerUrl: tx.txHash
        ? `https://hoodi.ethpandaops.io/tx/${tx.txHash}`
        : null,
    }))

    const all = [...sentFormatted, ...receivedFormatted].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ transactions: all, total: all.length })

  } catch (err: any) {
    console.error('Transactions error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}