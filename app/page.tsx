'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import { ConnectWallet } from '@/components/ConnectWallet'
import { ContractGMButton } from '@/components/ContractGMButton'
import { EnhancedUserProfile } from '@/components/EnhancedUserProfile'
import { TimeEmoji } from '@/components/TimeEmoji'
import { useAccount } from 'wagmi'

export default function HomePage() {
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { isConnected } = useAccount()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get user context from Farcaster
        const context = await sdk.context
        setUser(context.user)

        // Hide splash screen
        await sdk.actions.ready()
        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsReady(true)
      }
    }

    initializeApp()
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading GM...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <TimeEmoji className="mb-4" />
          <h1 className="text-4xl font-bold text-gradient mb-2">
            GM Farcaster
          </h1>
          <p className="text-gray-600 text-lg">
            Track your daily GM streak on Base
          </p>
        </div>

        <div className="mb-6">
          <EnhancedUserProfile />
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {!isConnected ? (
            <div className="card text-center">
              <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                Connect your wallet to send GM transactions on Base
              </p>
              <ConnectWallet />
            </div>
          ) : (
            <div className="card text-center">
              <ContractGMButton />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}