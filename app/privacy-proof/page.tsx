// 'use client'
// import { useState } from 'react'
// import { useRouter } from 'next/navigation'

// export default function PrivacyProofPage() {
//   const router = useRouter()
//   const [step, setStep] = useState(0)

//   const txHash = '0xbbc076fd0f34212354acb4f46f4bb29e46ecbab605c4d4cc40a22478893e48f0'
//   const stealthAddress = '0xa3f0a0544d1a74b8ce9610fc83854987b00c2e39'
//   const senderWallet = '0xb8504a2dea442dbb187fbdb5dbd5957d9c77f1b6'
//   const recipientPayId = 'alice@pay'
//   const recipientWallet = '0xd0d8410d73ab513a964a6a135cd01d94aa1317ac'

//   const steps = [w
//     {
//       title: 'What happened on-chain',
//       description: 'This is exactly what any blockchain observer sees when they look at the transaction.',
//       content: (
//         <div className="space-y-3">
//           <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-xs space-y-2">
//             <div className="flex justify-between">
//               <span className="text-gray-500">TX Hash</span>
//               <span className="text-gray-300">{txHash.slice(0, 18)}...</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-500">From</span>
//               <span className="text-yellow-400">{senderWallet.slice(0, 18)}...</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-500">To</span>
//               <span className="text-yellow-400">{stealthAddress.slice(0, 18)}...</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-500">Value</span>
//               <span className="text-gray-300">0.01 ETH</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-500">Status</span>
//               <span className="text-green-400">✓ Confirmed</span>
//             </div>
//           </div>
//           <div className="bg-yellow-950/30 border border-yellow-900/30 rounded-xl p-3">
//             <p className="text-yellow-500 text-xs">
//               ⚠️ An observer sees: money went from wallet A to some random address. They have no idea who owns that address or what it means.
//             </p>
//           </div>
//         </div>
//       )
//     },
//     {
//       title: 'The destination is a stealth address',
//       description: 'Every EthPay payment generates a fresh one-time address. It has never appeared on-chain before.',
//       content: (
//         <div className="space-y-3">
//           <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-4">
//             <div>
//               <p className="text-gray-500 text-xs mb-2">One-time stealth address (used for this payment only)</p>
//               <p className="font-mono text-sm text-purple-400 break-all">{stealthAddress}</p>
//             </div>
//             <div className="border-t border-gray-800 pt-3">
//               <p className="text-gray-500 text-xs mb-2">Alice's actual wallet address</p>
//               <p className="font-mono text-sm text-gray-600 break-all">{recipientWallet}</p>
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <div className="bg-red-950/30 border border-red-900/30 rounded-xl p-3 text-center">
//               <p className="text-red-400 text-xs font-medium">Without EthPay</p>
//               <p className="text-gray-500 text-xs mt-1">Payment goes directly to Alice's known address — linkable forever</p>
//             </div>
//             <div className="bg-green-950/30 border border-green-900/30 rounded-xl p-3 text-center">
//               <p className="text-green-400 text-xs font-medium">With EthPay</p>
//               <p className="text-gray-500 text-xs mt-1">Payment goes to a fresh address — no link to Alice's identity</p>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     {
//       title: 'How Alice claims the funds',
//       description: 'Alice uses her private view key to scan the blockchain and find payments meant for her.',
//       content: (
//         <div className="space-y-3">
//           <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3 font-mono text-xs">
//             <p className="text-gray-500">// Alice's view key scans every stealth payment event</p>
//             <p className="text-gray-400">sharedSecret = hash(viewKey + ephemeralPubKey)</p>
//             <p className="text-gray-400">expectedAddr = hash(spendKey + sharedSecret)</p>
//             <p className="text-gray-400">if expectedAddr == stealthAddress:</p>
//             <p className="text-green-400 pl-4">→ "This payment is mine!"</p>
//           </div>
//           <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-xl p-3">
//             <p className="text-indigo-400 text-xs">
//               🔑 Only Alice (with her view key) can identify that this stealth address belongs to her. Even if someone knows Alice's pay ID, they cannot find her transactions on-chain.
//             </p>
//           </div>
//         </div>
//       )
//     },
//     {
//       title: 'Complete privacy guarantee',
//       description: 'Here is the full picture — what different parties can and cannot see.',
//       content: (
//         <div className="space-y-3">
//           {[
//             {
//               party: '👀 Blockchain Observer',
//               color: 'red',
//               sees: 'A transaction between two addresses',
//               cantSee: 'Who sent, who received, any identity',
//             },
//             {
//               party: '💸 Sender (Charlie)',
//               color: 'yellow',
//               sees: 'Payment sent to alice@pay confirmed',
//               cantSee: "Alice's other transactions or balance",
//             },
//             {
//               party: '📬 Receiver (Alice)',
//               color: 'green',
//               sees: 'Received 0.01 ETH via view key scan',
//               cantSee: "Charlie's wallet balance or history",
//             },
//             {
//               party: '🏦 BitGo',
//               color: 'blue',
//               sees: 'Transaction from Charlie wallet to address',
//               cantSee: 'That the stealth address belongs to Alice',
//             },
//           ].map(({ party, color, sees, cantSee }) => (
//             <div key={party} className={`bg-gray-950 border border-gray-800 rounded-xl p-3`}>
//               <p className="font-medium text-sm mb-2">{party}</p>
//               <div className="grid grid-cols-2 gap-2 text-xs">
//                 <div>
//                   <p className="text-green-500 mb-1">Can see ✓</p>
//                   <p className="text-gray-400">{sees}</p>
//                 </div>
//                 <div>
//                   <p className="text-red-500 mb-1">Cannot see ✗</p>
//                   <p className="text-gray-400">{cantSee}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )
//     }
//   ]

//   return (
//     <main className="min-h-screen bg-black text-white">
//       <div className="border-b border-gray-900 px-6 py-4 flex items-center justify-between">
//         <button onClick={() => router.back()} className="text-gray-500 hover:text-white text-sm">
//           ← Back
//         </button>
//         <div className="text-sm font-medium text-gray-400">Privacy Proof</div>
//         <div className="w-16" />
//       </div>

//       <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

//         {/* Header */}
//         <div className="text-center space-y-2">
//           <div className="text-4xl">🔒</div>
//           <h1 className="text-2xl font-bold">How EthPay Protects Privacy</h1>
//           <p className="text-gray-400 text-sm">
//             A step-by-step breakdown of the real transaction above
//           </p>
//         </div>

//         {/* Step indicator */}
//         <div className="flex gap-2">
//           {steps.map((_, i) => (
//             <div
//               key={i}
//               onClick={() => setStep(i)}
//               className={`flex-1 h-1 rounded-full cursor-pointer transition-colors ${
//                 i <= step ? 'bg-indigo-500' : 'bg-gray-800'
//               }`}
//             />
//           ))}
//         </div>

//         {/* Step content */}
//         <div className="space-y-4">
//           <div>
//             <div className="flex items-center gap-2 mb-1">
//               <span className="text-indigo-400 text-sm font-medium">Step {step + 1} of {steps.length}</span>
//             </div>
//             <h2 className="text-xl font-bold">{steps[step].title}</h2>
//             <p className="text-gray-400 text-sm mt-1">{steps[step].description}</p>
//           </div>

//           {steps[step].content}
//         </div>

//         {/* Navigation */}
//         <div className="flex gap-3">
//           {step > 0 && (
//             <button
//               onClick={() => setStep(s => s - 1)}
//               className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl font-medium transition-colors"
//             >
//               ← Previous
//             </button>
//           )}
//           {step < steps.length - 1 ? (
//             <button
//               onClick={() => setStep(s => s + 1)}
//               className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition-colors"
//             >
//               Next →
//             </button>
//           ) : (
//             <button
//               onClick={() => router.push('/dashboard')}
//               className="flex-1 py-3 bg-green-700 hover:bg-green-600 rounded-xl font-medium transition-colors"
//             >
//               ✓ Got it — Back to Dashboard
//             </button>
//           )}
//         </div>

//         {/* Bottom note */}
//         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
//           <p className="text-gray-500 text-xs">
//             This privacy model is based on{' '}
//             <span className="text-indigo-400">EIP-5564 Stealth Addresses</span>
//             {' '}— the same standard used by Ethereum core developers for on-chain privacy.
//             Wallet custody is handled by{' '}
//             <span className="text-indigo-400">BitGo TSS</span>.
//           </p>
//         </div>
//       </div>
//     </main>
//   )
// }