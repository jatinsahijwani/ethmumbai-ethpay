'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Transaction = {
    id: string
    type: 'sent' | 'received'
    counterparty: string
    amount: string
    stealthAddress: string
    txHash: string | null
    status: string
    createdAt: string
    explorerUrl: string | null
}

export default function DashboardPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [balance, setBalance] = useState<string | null>(null)
    const [walletAddress, setWalletAddress] = useState('')
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('all')

    useEffect(() => {
        const saved = localStorage.getItem('ethpay_username')
        if (!saved) {
            router.push('/register')
            return
        }
        setUsername(saved)
        loadData(saved)
    }, [])

    async function loadData(user: string) {
        setLoading(true)
        try {
            const [balRes, txRes] = await Promise.all([
                fetch(`/api/balance?username=${user}`),
                fetch(`/api/transactions?username=${user}`),
            ])
            const balData = await balRes.json()
            const txData = await txRes.json()

            setBalance(balData.balance ?? '0')
            setWalletAddress(balData.walletAddress ?? '')
            setTransactions(txData.transactions ?? [])
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    const filtered = transactions.filter(tx =>
        activeTab === 'all' ? true : tx.type === activeTab
    )

    const totalSent = transactions
        .filter(t => t.type === 'sent')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)

    const totalReceived = transactions
        .filter(t => t.type === 'received')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-gray-900 px-6 py-4 flex items-center justify-between">
                <div className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    EthPay
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">{username}@pay</span>
                    <button
                        onClick={() => router.push('/send')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition-colors"
                    >
                        Send →
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-800/50 rounded-2xl p-6">
                    <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
                    {loading ? (
                        <div className="h-10 bg-gray-800 rounded animate-pulse w-40" />
                    ) : (
                        <p className="text-4xl font-bold">
                            {parseFloat(balance ?? '0') / 1e18 < 0.000001
                                ? '0'
                                : (parseFloat(balance ?? '0') / 1e18).toFixed(6)
                            } <span className="text-xl text-gray-400">ETH</span>
                        </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-indigo-800/50">
                        <p className="text-gray-500 text-xs mb-1">Wallet Address</p>
                        <p className="text-xs font-mono text-gray-400 break-all">{walletAddress}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs">Secured by BitGo TSS</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                        <p className="text-gray-500 text-xs mb-1">Total Sent</p>
                        <p className="text-xl font-bold text-red-400">↑ {totalSent.toFixed(4)} ETH</p>
                        <p className="text-gray-600 text-xs mt-1">{transactions.filter(t => t.type === 'sent').length} transactions</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                        <p className="text-gray-500 text-xs mb-1">Total Received</p>
                        <p className="text-xl font-bold text-green-400">↓ {totalReceived.toFixed(4)} ETH</p>
                        <p className="text-gray-600 text-xs mt-1">{transactions.filter(t => t.type === 'received').length} transactions</p>
                    </div>
                </div>

                {/* Privacy Badge */}
<div
  onClick={() => router.push('/privacy-proof')}
  className="bg-green-950/50 border border-green-900/50 rounded-2xl p-4 flex items-start gap-3 cursor-pointer hover:bg-green-950/70 transition-colors"
>
  <span className="text-2xl">🔒</span>
  <div className="flex-1">
    <p className="text-green-400 font-medium text-sm">Privacy Protected</p>
    <p className="text-green-700 text-xs mt-1">
      Every payment uses a unique stealth address. Tap to see how it works →
    </p>
  </div>
  <span className="text-green-700 text-lg">›</span>
</div>

                {/* Transactions */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-lg">Transactions</h2>
                        <div className="flex gap-1 bg-gray-900 rounded-xl p-1">
                            {(['all', 'sent', 'received'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${activeTab === tab
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-900 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-gray-600">
                            <p className="text-4xl mb-3">💸</p>
                            <p>No transactions yet</p>
                            <button
                                onClick={() => router.push('/send')}
                                className="mt-4 px-4 py-2 bg-indigo-600 rounded-xl text-sm"
                            >
                                Send your first payment
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(tx => (
                                <div
                                    key={tx.id}
                                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3"
                                >
                                    {/* Top row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${tx.type === 'sent'
                                                    ? 'bg-red-950 text-red-400'
                                                    : 'bg-green-950 text-green-400'
                                                }`}>
                                                {tx.type === 'sent' ? '↑' : '↓'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {tx.type === 'sent' ? 'Sent to' : 'Received from'}{' '}
                                                    <span className="text-indigo-400">{tx.counterparty}</span>
                                                </p>
                                                <p className="text-gray-600 text-xs">
                                                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${tx.type === 'sent' ? 'text-red-400' : 'text-green-400'}`}>
                                                {tx.type === 'sent' ? '-' : '+'}{parseFloat(tx.amount).toFixed(4)} ETH
                                            </p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'confirmed'
                                                    ? 'bg-green-950 text-green-400'
                                                    : 'bg-yellow-950 text-yellow-400'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Privacy row */}
                                    <div className="bg-black/40 rounded-xl p-3 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-500 text-xs">🔒</span>
                                            <span className="text-gray-500 text-xs">Stealth address used:</span>
                                        </div>
                                        <p className="text-xs font-mono text-gray-600 break-all">{tx.stealthAddress}</p>
                                    </div>

                                    {/* Explorer link */}
                                    {tx.explorerUrl && (
                                        <a
                                        href = { tx.explorerUrl }
                      target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs text-indigo-500 hover:text-indigo-400"
                    >
                                    <span className="font-mono">{tx.txHash?.slice(0, 20)}...</span>
                                    <span>↗ View on explorer</span>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
          )}
            </div>
        </div>
    </main >
  )
}