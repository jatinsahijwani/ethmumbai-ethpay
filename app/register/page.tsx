'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleRegister() {
    if (!username) return
    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setStatus('error')
        return
      }

      // Save to localStorage for session
      localStorage.setItem('ethpay_username', username)
      setResult(data)
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
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-bold">You're registered!</h2>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 text-left">
            <div>
              <p className="text-gray-500 text-xs mb-1">Your Pay ID</p>
              <p className="text-xl font-bold text-indigo-400">{result.payId}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Wallet Address</p>
              <p className="text-xs font-mono text-gray-300 break-all">{result.walletAddress}</p>
            </div>
            <div className="pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-600">
                🔒 Your wallet is secured by BitGo's enterprise-grade custody infrastructure
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-semibold text-lg transition-colors"
          >
            Send a Payment →
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create your Pay ID</h1>
          <p className="text-gray-400">Choose a username. That's your payment address.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="flex-1 bg-transparent text-white text-lg outline-none placeholder-gray-700"
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />
            <span className="text-gray-600 text-lg">@pay</span>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleRegister}
            disabled={!username || username.length < 3 || status === 'loading'}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 rounded-2xl font-semibold text-lg transition-colors"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Creating wallet...
              </span>
            ) : (
              `Claim ${username ? username + '@pay' : 'your ID'}`
            )}
          </button>

          <p className="text-center text-gray-700 text-xs">
            This creates a BitGo-secured wallet automatically
          </p>
        </div>
      </div>
    </main>
  )
}