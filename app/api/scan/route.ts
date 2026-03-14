import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { scanStealthAddress } from '@/lib/stealth'

// This endpoint proves the privacy model works:
// Alice uses her view key to scan all stealth payments and find hers
// This is what a real stealth address scanner does
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

    // Get ALL transactions on the platform (simulates scanning the full blockchain)
    const allTransactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const myPayments = []
    const otherPayments = []

    for (const tx of allTransactions) {
      if (!tx.ephemeralPubKey) continue

      // Use recipient's view key to check if this stealth address belongs to them
      const isMyPayment = scanStealthAddress(
        tx.stealthAddress,
        tx.ephemeralPubKey,
        user.viewPrivKey,    // private — only this user has it
        user.spendPubKey,    // public
      )

      if (isMyPayment) {
        myPayments.push({
          stealthAddress: tx.stealthAddress,
          amount: tx.amountUsdc,
          txHash: tx.txHash,
          createdAt: tx.createdAt,
          explorerUrl: tx.txHash
            ? `https://hoodi.ethpandaops.io/tx/${tx.txHash}`
            : null,
        })
      } else {
        otherPayments.push({
          stealthAddress: tx.stealthAddress,
          amount: '???',   // observer cannot see amount linked to identity
          txHash: tx.txHash,
        })
      }
    }

    return NextResponse.json({
      username,
      totalScanned: allTransactions.length,
      myPayments,
      otherPayments: otherPayments.length,
      proof: `Scanned ${allTransactions.length} stealth transactions. Found ${myPayments.length} belonging to ${username}@pay using view key scanning. ${otherPayments.length} transactions are unreadable without the view key.`,
    })

  } catch (err: any) {
    console.error('Scan error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}