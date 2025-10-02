'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import { ProfileStats } from '@/components/ProfileStats'
import { GMHistory } from '@/components/GMHistory'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        const context = await sdk.context
        setUser(context.user)
      } catch (error) {
        console.error('Failed to load user context:', error)
      }
    }

    initializeProfile()
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            👤 Your Profile
          </h1>
          <p className="text-gray-600">
            Track your GM journey
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <ProfileStats user={user} />
          <GMHistory user={user} />
        </div>
      </main>
    </div>
  )
}