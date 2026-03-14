import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendFunds } from '@/lib/bitgo'
import { generateStealthAddress } from '@/lib/stealth'

export async function POST(req: NextRequest) {
  try {
    const { senderUsername, recipientPayId, amount } = await req.json()

    if (!senderUsername || !recipientPayId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const sender = await prisma.user.findUnique({ where: { username: senderUsername } })
    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 })
    }

    const recipientUsername = recipientPayId.replace('@pay', '')
    const recipient = await prisma.user.findUnique({ where: { username: recipientUsername } })
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Generate real EIP-5564 stealth address using ECDH
    const stealth = generateStealthAddress(
      recipient.spendPubKey,
      recipient.viewPubKey,
    )

    const amountInWei = BigInt(Math.round(parseFloat(amount) * 1e18)).toString()

    console.log(`Sending ${amount} ETH from ${senderUsername} to ${recipientPayId}`)
    console.log(`Real stealth address (EIP-5564): ${stealth.address}`)
    console.log(`Ephemeral pubkey: ${stealth.ephemeralPubKey}`)

    const txResult = await sendFunds(sender.walletId, stealth.address, amountInWei)

    const tx = await prisma.transaction.create({
      data: {
        txHash: txResult.txid ?? null,
        senderId: sender.id,
        receiverId: recipient.id,
        stealthAddress: stealth.address,
        ephemeralPubKey: stealth.ephemeralPubKey,
        amountUsdc: amount,
        amountBase: amountInWei,
        status: 'confirmed',
      },
    })

    return NextResponse.json({
      success: true,
      txHash: txResult.txid,
      stealthAddress: stealth.address,
      ephemeralPubKey: stealth.ephemeralPubKey,
      transactionId: tx.id,
      explorerUrl: `https://hoodi.ethpandaops.io/tx/${txResult.txid}`,
      message: `${amount} ETH sent to ${recipientPayId}`,
    })

  } catch (err: any) {
    console.error('Send error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}