'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Logo */}
        <div className="space-y-2">
          <div className="text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            EthPay
          </div>
          <p className="text-gray-400 text-lg">
            Private crypto payments on Base
          </p>
          <p className="text-gray-600 text-sm">
            Send USDC as easily as a UPI payment — privately.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {['🔒 Stealth Addresses', '⚡ Instant', '🛡️ BitGo Custody', '🔗 Base Chain'].map(f => (
            <span key={f} className="px-3 py-1 bg-gray-900 border border-gray-800 rounded-full text-xs text-gray-400">
              {f}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <div className="space-y-3">
  <button
    onClick={() => router.push('/register')}
    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-semibold text-lg transition-colors"
  >
    Get Started
  </button>
  <button
    onClick={() => router.push('/send')}
    className="w-full py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-2xl font-semibold text-lg transition-colors"
  >
    Send Payment
  </button>
  <button
    onClick={() => router.push('/dashboard')}
    className="w-full py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-2xl font-semibold text-lg transition-colors"
  >
    My Dashboard
  </button>
</div>
        </div>

        <p className="text-gray-700 text-xs">
          Powered by BitGo · Built for ETHMumbai 2026
        </p>
      </div>
    </main>
  )
}