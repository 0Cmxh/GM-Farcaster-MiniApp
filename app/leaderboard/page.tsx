'use client'

import { ContractLeaderboard } from '@/components/ContractLeaderboard'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            🏆 GM Leaderboard
          </h1>
          <p className="text-gray-600">
            Top GM streaks in the community
          </p>
        </div>

        <ContractLeaderboard />
      </main>
    </div>
  )
}