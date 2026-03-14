'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SendPage() {
  const router = useRouter()
  const [senderUsername, setSenderUsername] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [resolvedUser, setResolvedUser] = useState<any>(null)
  const [resolveError, setResolveError] = useState('')
  const [status, setStatus] = useState<'idle' | 'resolving' | 'sending' | 'done' | 'error'>('idle')
  const [txResult, setTxResult] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('ethpay_username')
    if (saved) setSenderUsername(saved)
  }, [])

  async function handleResolve() {
    if (!recipient) return
    setStatus('resolving')
    setResolveError('')
    setResolvedUser(null)

    try {
      const res = await fetch(`/api/resolve?id=${encodeURIComponent(recipient)}`)
      const data = await res.json()
      if (res.ok) {
        setResolvedUser(data)
        setStatus('idle')
      } else {
        setResolveError('User not found')
        setStatus('idle')
      }
    } catch {
      setResolveError('Could not resolve')
      setStatus('idle')
    }
  }

  async function handleSend() {
    if (!senderUsername || !resolvedUser || !amount) return
    setStatus('sending')
    setError('')

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderUsername,
          recipientPayId: resolvedUser.payId,
          amount,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setStatus('error')
        return
      }

      setTxResult(data)
      setStatus('done')

    } catch (e: any) {
      setError(e.message)
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="text-2xl font-bold">Payment Sent!</h2>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-white">{amount} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">To</span>
              <span className="font-bold text-indigo-400">{resolvedUser?.payId}</span>
            </div>
            <div className="border-t border-gray-800 pt-4 space-y-2">
              <div>
                <p className="text-gray-500 text-xs mb-1">Stealth Address Used</p>
                <p className="text-xs font-mono text-gray-400 break-all">{txResult?.stealthAddress}</p>
              </div>
              {txResult?.txHash && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Transaction Hash</p>
                  <p className="text-xs font-mono text-gray-400 break-all">{txResult.txHash}</p>
                </div>
              )}
            </div>
            <div className="bg-green-950 border border-green-900 rounded-xl p-3">
              <p className="text-green-400 text-xs">
                🔒 Payment routed through a one-time stealth address. On-chain observers cannot link this to the recipient's identity.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setStatus('idle')
              setRecipient('')
              setAmount('')
              setResolvedUser(null)
              setTxResult(null)
            }}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-semibold text-lg transition-colors"
          >
            Send Another
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">

        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold">Send Payment</h1>
          <p className="text-gray-400">Private · Instant · Secured by BitGo</p>
        </div>

        <div className="space-y-4">

          {/* Sender */}
          <div>
            <label className="text-gray-500 text-xs mb-1 block">From</label>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
              <input
                type="text"
                placeholder="your username"
                value={senderUsername}
                onChange={e => setSenderUsername(e.target.value)}
                className="flex-1 bg-transparent text-white outline-none placeholder-gray-700"
              />
              <span className="text-gray-600 text-sm">@pay</span>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="text-gray-500 text-xs mb-1 block">To</label>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
              <input
                type="text"
                placeholder="alice@pay"
                value={recipient}
                onChange={e => {
                  setRecipient(e.target.value)
                  setResolvedUser(null)
                  setResolveError('')
                }}
                onBlur={handleResolve}
                className="flex-1 bg-transparent text-white outline-none placeholder-gray-700"
              />
              {status === 'resolving' && <span className="text-gray-500 text-sm animate-pulse">...</span>}
              {resolvedUser && <span className="text-green-400 text-sm">✓</span>}
            </div>
            {resolveError && <p className="text-red-400 text-xs mt-1 ml-1">{resolveError}</p>}
            {resolvedUser && (
              <p className="text-green-400 text-xs mt-1 ml-1">Found: {resolvedUser.payId}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Amount (ETH)</label>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-gray-600">Ξ</span>
              <input
                type="number"
                placeholder="0.001"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-white text-xl outline-none placeholder-gray-700"
              />
            </div>
          </div>

          {/* Privacy info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Network</span>
              <span className="text-white">Base (Testnet)</span>
            </div>
            <div className="flex justify-between">
              <span>Privacy</span>
              <span className="text-green-400">🔒 Stealth Address</span>
            </div>
            <div className="flex justify-between">
              <span>Custody</span>
              <span className="text-white">BitGo TSS Wallet</span>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            onClick={handleSend}
            disabled={!resolvedUser || !amount || !senderUsername || status === 'sending'}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 rounded-2xl font-semibold text-lg transition-colors"
          >
            {status === 'sending' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Processing...
              </span>
            ) : (
              `Send ${amount ? 'Ξ' + amount : ''} →`
            )}
          </button>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full text-center text-gray-700 text-sm hover:text-gray-500"
        >
          ← Back
        </button>
      </div>
    </main>
  )
}