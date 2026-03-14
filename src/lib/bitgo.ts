import { BitGo } from 'bitgo'

let _bitgo: BitGo | null = null

export function getBitGo(): BitGo {
  if (!_bitgo) {
    _bitgo = new BitGo({
      env: (process.env.BITGO_ENV as 'test' | 'prod') ?? 'test',
      accessToken: process.env.BITGO_ACCESS_TOKEN,
    })
  }
  return _bitgo
}

export const COIN = process.env.BITGO_COIN ?? 'hteth'
export const ENTERPRISE_ID = process.env.BITGO_ENTERPRISE_ID!
export const WALLET_PASSPHRASE = process.env.WALLET_PASSPHRASE!

// Create a fresh BitGo wallet for a new user
export async function createUserWallet(label: string) {
  const bitgo = getBitGo()

  const result = await bitgo.coin(COIN).wallets().generateWallet({
    label,
    passphrase: WALLET_PASSPHRASE,
    enterprise: ENTERPRISE_ID,
    walletVersion: 3,
    multisigType: 'tss',
  })

  const wallet = result.wallet

  // Create a receive address explicitly (TSS wallets need this)
  const addressObj = await wallet.createAddress()

  return {
    walletId: wallet.id(),
    receiveAddress: addressObj.address,
  }
}

// Get USDC balance for a wallet
// For testnet we read hteth balance (no testnet USDC, use ETH for demo)
export async function getWalletBalance(walletId: string): Promise<string> {
  const bitgo = getBitGo()
  const wallet = await bitgo.coin(COIN).wallets().get({ id: walletId })
  return wallet.spendableBalanceString()
}

// Send funds from one wallet to an address
// amount is in base units (wei for ETH, 1 ETH = 1e18)
export async function sendFunds(
  walletId: string,
  toAddress: string,
  amountInBaseUnits: string,
) {
  const bitgo = getBitGo()
  const wallet = await bitgo.coin(COIN).wallets().get({ id: walletId })

  const result = await wallet.send({
    address: toAddress,
    amount: amountInBaseUnits,
    walletPassphrase: WALLET_PASSPHRASE,
    type: 'transfer',
  })

  return result
}

// Create a new receive address for a wallet (used for stealth-like privacy)
export async function createReceiveAddress(walletId: string): Promise<string> {
  const bitgo = getBitGo()
  const wallet = await bitgo.coin(COIN).wallets().get({ id: walletId })
  const address = await wallet.createAddress()
  return address.address
}