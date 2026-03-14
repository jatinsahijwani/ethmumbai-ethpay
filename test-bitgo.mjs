// check-balance.mjs
import { BitGo } from 'bitgo'

const bitgo = new BitGo({
  env: 'test',
  accessToken: 'v2xaf9c873fe1511afdc046ed160b886ecc4dcdbb37af79cf481ba29c2e74fa92f2',
})

const WALLET_ID = '69b48c3f13e898b33a6e71bd17204f51'

// Poll every 15 seconds until balance appears
async function checkBalance() {
  const wallet = await bitgo.coin('hteth').wallets().get({ id: WALLET_ID })
  const balance = wallet.balanceString()
  const confirmed = wallet.confirmedBalanceString()
  const spendable = wallet.spendableBalanceString()
  
  console.log(new Date().toISOString())
  console.log('  Balance          :', balance)
  console.log('  Confirmed Balance:', confirmed)
  console.log('  Spendable Balance:', spendable)
  console.log('')
  
  if (BigInt(spendable) > 0n) {
    console.log('✅ Funds detected! Ready to send.')
    process.exit(0)
  }
}

// Check immediately then every 15 seconds
await checkBalance()
const interval = setInterval(checkBalance, 15000)

// Stop after 5 minutes
setTimeout(() => {
  console.log('Timed out. BitGo may take longer to index.')
  clearInterval(interval)
  process.exit(1)
}, 300000)