'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LeaderboardEntry } from '@/lib/types'

export function LeaderboardList() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock leaderboard data for demo
    // In production, fetch from your backend API
    const mockData: LeaderboardEntry[] = [
      {
        rank: 1,
        userFid: 3621,
        username: 'alice',
        displayName: 'Alice',
        pfpUrl: undefined,
        currentStreak: 42,
        totalGMs: 45,
      },
      {
        rank: 2,
        userFid: 6841,
        username: 'deodad',
        displayName: 'Tony D\'Addeo',
        pfpUrl: undefined,
        currentStreak: 38,
        totalGMs: 40,
      },
      {
        rank: 3,
        userFid: 9152,
        username: 'warpcast',
        displayName: 'Warpcast',
        pfpUrl: undefined,
        currentStreak: 35,
        totalGMs: 35,
      },
      {
        rank: 4,
        userFid: 1234,
        username: 'gmuser1',
        displayName: 'GM Enthusiast',
        pfpUrl: undefined,
        currentStreak: 28,
        totalGMs: 30,
      },
      {
        rank: 5,
        userFid: 5678,
        username: 'earlybird',
        displayName: 'Early Bird',
        pfpUrl: undefined,
        currentStreak: 21,
        totalGMs: 25,
      },
    ]

    // Simulate API call
    setTimeout(() => {
      setLeaderboard(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-4">
        {leaderboard.map((entry) => (
          <div key={entry.userFid} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="text-2xl font-bold min-w-[3rem] text-center">
                  {getRankEmoji(entry.rank)}
                </div>

                {/* Profile Picture */}
                <div className="relative">
                  {entry.pfpUrl ? (
                    <Image
                      src={entry.pfpUrl}
                      alt={entry.displayName || entry.username || 'User'}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                      {(entry.displayName || entry.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {entry.displayName || entry.username || `User #${entry.userFid}`}
                  </h3>
                  {entry.username && (
                    <p className="text-sm text-gray-500">@{entry.username}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-500">
                  {entry.currentStreak}
                </div>
                <div className="text-xs text-gray-500">
                  {entry.totalGMs} total GMs
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {leaderboard.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏁</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No GM streaks yet
          </h3>
          <p className="text-gray-500">
            Be the first to start your GM journey!
          </p>
        </div>
      )}
    </div>
  )
}