'use client'

import { useAccount, useConnect } from 'wagmi'

export function ConnectWallet() {
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  if (isConnected) {
    return (
      <div className="text-green-600 font-semibold">
        ✅ Wallet Connected
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => connect({ connector: connectors[0] })}
      className="btn-primary w-full"
    >
      Connect Wallet
    </button>
  )
}