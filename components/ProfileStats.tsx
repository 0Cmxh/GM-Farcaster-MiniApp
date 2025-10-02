'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import Image from 'next/image'
import { GM_CONTRACT_ADDRESS, GM_CONTRACT_ABI } from '@/lib/gm-utils'

interface ProfileStatsProps {
  user: {
    fid: number
    username?: string
    displayName?: string
    pfpUrl?: string
  }
}

export function ProfileStats({ user }: ProfileStatsProps) {
  const { address } = useAccount()
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalGMs: 0,
    rank: 0,
  })

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
    if (contractData) {
      console.log('Contract data received:', contractData)
      const [currentStreak, longestStreak, totalGMs, lastGMTimestamp, canGMToday, isRegistered] =
        contractData as [bigint, bigint, bigint, bigint, boolean, boolean]

      setStats(prevStats => ({
        ...prevStats,
        currentStreak: Number(currentStreak),
        longestStreak: Number(longestStreak),
        totalGMs: Number(totalGMs),
      }))

      console.log('Updated stats:', {
        currentStreak: Number(currentStreak),
        longestStreak: Number(longestStreak),
        totalGMs: Number(totalGMs),
      })
    }
  }, [contractData])

  // Calculate global rank
  useEffect(() => {
    if (leaderboardData && address) {
      const [addresses, streaks, totalGMs] = leaderboardData as [string[], bigint[], bigint[]]

      // Find user's position in the leaderboard
      const userIndex = addresses.findIndex(addr => addr.toLowerCase() === address.toLowerCase())

      if (userIndex !== -1) {
        setStats(prevStats => ({
          ...prevStats,
          rank: userIndex + 1 // Rank is 1-based
        }))
        console.log(`User rank: ${userIndex + 1}`)
      } else {
        // User not in top 100, they're probably ranked lower or have no GMs
        setStats(prevStats => ({
          ...prevStats,
          rank: 0 // Set to 0 to show '-'
        }))
        console.log('User not in top 100 or has no GMs')
      }
    }
  }, [leaderboardData, address])

  return (
    <div className="card">
      {/* User Header */}
      <div className="flex items-center space-x-4 mb-6">
        {user.pfpUrl ? (
          <Image
            src={user.pfpUrl}
            alt={user.displayName || user.username || 'User'}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {(user.displayName || user.username || 'U')[0].toUpperCase()}
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold">
            {user.displayName || user.username || `User #${user.fid}`}
          </h2>
          {user.username && (
            <p className="text-gray-500">@{user.username}</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-500 mb-1">
            {stats.currentStreak}
          </div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-500 mb-1">
            {stats.longestStreak}
          </div>
          <div className="text-sm text-gray-600">Longest Streak</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-500 mb-1">
            {stats.totalGMs}
          </div>
          <div className="text-sm text-gray-600">Total GMs</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-500 mb-1">
            {stats.rank > 0 ? `#${stats.rank}` : '-'}
          </div>
          <div className="text-sm text-gray-600">Global Rank</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Achievements</h3>
        <div className="flex flex-wrap gap-2">
          {stats.totalGMs >= 1 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
              🌅 First GM
            </span>
          )}
          {stats.currentStreak >= 7 && (
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
              🔥 Week Warrior
            </span>
          )}
          {stats.currentStreak >= 30 && (
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
              💎 Month Master
            </span>
          )}
          {stats.totalGMs === 0 && (
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
              Start your GM journey!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}