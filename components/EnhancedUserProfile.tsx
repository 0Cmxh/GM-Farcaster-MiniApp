'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import Image from 'next/image'
import { fetchUserByFid, fetchUserByAddress } from '@/lib/neynar'
import type { EnhancedUserProfile as EnhancedUserProfileType } from '@/lib/neynar'
import { GM_CONTRACT_ADDRESS, GM_CONTRACT_ABI } from '@/lib/gm-utils'
import { sdk } from '@farcaster/miniapp-sdk'

interface LeaderboardEntry {
  address: string
  streak: number
  totalGMs: number
  rank: number
}

export function EnhancedUserProfile() {
  const { address } = useAccount()
  const [userProfile, setUserProfile] = useState<EnhancedUserProfileType | null>(null)
  const [loading, setLoading] = useState(true)
  const [globalRank, setGlobalRank] = useState<number | null>(null)

  // Get user data from contract
  const { data: contractData, refetch: refetchContractData } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'getUserData',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  })

  // Get leaderboard data to calculate global rank
  const { data: leaderboardData } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'getTopUsers',
    args: [BigInt(100)], // Get top 100 to find user's rank
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true)
      let profile: EnhancedUserProfileType | null = null

      try {
        // First, try to get Farcaster user from SDK context
        const context = await sdk.context
        
        if (context.user) {
          // Use SDK context data directly (disable Neynar for now)
          profile = {
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          }
        } else if (address) {
          // Fallback for when no SDK context
          profile = {
            fid: 0,
            username: 'Unknown',
            displayName: 'Unknown User',
            pfpUrl: undefined,
          }
        }

        // Add contract data if available
        if (profile && contractData) {
          console.log('Contract data received:', contractData)
          const [currentStreak, longestStreak, totalGMs, lastGMTimestamp, canGMToday, isRegistered] =
            contractData as [bigint, bigint, bigint, bigint, boolean, boolean]

          console.log('Parsed contract data:', {
            currentStreak: Number(currentStreak),
            longestStreak: Number(longestStreak),
            totalGMs: Number(totalGMs),
            lastGMTimestamp: Number(lastGMTimestamp),
            canGMToday,
            isRegistered
          })

          profile.contractData = {
            currentStreak: Number(currentStreak),
            longestStreak: Number(longestStreak),
            totalGMs: Number(totalGMs),
            lastGMTimestamp: Number(lastGMTimestamp),
            canGMToday,
            isRegistered
          }
        } else {
          console.log('No contract data available:', { profile: !!profile, contractData: !!contractData })
        }

        if (profile && address) {
          profile.walletAddress = address
        }

        setUserProfile(profile)
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [address, contractData])

  // Calculate global rank
  useEffect(() => {
    if (leaderboardData && address) {
      const [addresses, streaks, totalGMs] = leaderboardData as [string[], bigint[], bigint[]]
      
      // Find user's position in the leaderboard
      const userIndex = addresses.findIndex(addr => addr.toLowerCase() === address.toLowerCase())
      
      if (userIndex !== -1) {
        setGlobalRank(userIndex + 1) // Rank is 1-based
        console.log(`User rank: ${userIndex + 1}`)
      } else {
        // User not in top 100, they're probably ranked lower
        setGlobalRank(101) // Indicate they're outside top 100
        console.log('User not in top 100')
      }
    }
  }, [leaderboardData, address])

  // Refetch when contract data changes
  useEffect(() => {
    if (address) {
      refetchContractData()
    }
  }, [address, refetchContractData])

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="card text-center">
        <div className="text-4xl mb-2">👤</div>
        <p className="text-gray-600">
          Connect your wallet to view profile
        </p>
      </div>
    )
  }

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="card">
      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div className="relative">
          {userProfile.pfpUrl ? (
            <Image
              src={userProfile.pfpUrl}
              alt={userProfile.displayName || userProfile.username || 'User'}
              width={64}
              height={64}
              className="rounded-full"
              onError={(e) => {
                console.error('Image failed to load:', userProfile.pfpUrl)
                console.error('Error event:', e)
                // Hide the image and show fallback
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          
          {/* Fallback avatar - always present but hidden when image loads */}
          <div className={`w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xl ${userProfile.pfpUrl ? 'hidden' : ''}`}>
            {(userProfile.displayName || userProfile.username || 'U')[0].toUpperCase()}
          </div>

          {/* Verification badge if verified */}
          {userProfile.verifications && userProfile.verifications.length > 0 && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900 truncate">
              {userProfile.displayName || userProfile.username || `User #${userProfile.fid}`}
            </h3>
            <button
              onClick={() => {
                refetchContractData()
                console.log('Refreshing user data...')
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {userProfile.username && (
            <p className="text-gray-500 text-sm">@{userProfile.username}</p>
          )}

          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>FID: {userProfile.fid}</span>
            {userProfile.followerCount !== undefined && (
              <span>{userProfile.followerCount} followers</span>
            )}
            {globalRank && (
              <span className="font-semibold text-orange-500">
                #{globalRank > 100 ? '100+' : globalRank} Global Rank
              </span>
            )}
          </div>

          {userProfile.walletAddress && (
            <p className="text-xs text-gray-400 mt-1">
              {formatAddress(userProfile.walletAddress)}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {userProfile.bio && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {userProfile.bio}
          </p>
        </div>
      )}

      {/* Contract Stats */}
      {userProfile.contractData && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-orange-500">
                {userProfile.contractData.currentStreak}
              </div>
              <div className="text-xs text-gray-500">Current Streak</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-500">
                {userProfile.contractData.longestStreak}
              </div>
              <div className="text-xs text-gray-500">Best Streak</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-500">
                {userProfile.contractData.totalGMs}
              </div>
              <div className="text-xs text-gray-500">Total GMs</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}