'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { GM_CONTRACT_ADDRESS, GM_CONTRACT_ABI } from '@/lib/gm-utils'

interface GMHistoryProps {
  user: {
    fid: number
    username?: string
    displayName?: string
  }
}

interface GMRecord {
  date: string
  txHash?: string
  streak: number
}

export function GMHistory({ user }: GMHistoryProps) {
  const { address } = useAccount()
  const [history, setHistory] = useState<GMRecord[]>([])

  // Get user data from contract
  const { data: userData, refetch: refetchUserData } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'getUserData',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  })

  useEffect(() => {
    if (userData && address) {
      const [currentStreak, , , lastGMTimestamp] = userData as [bigint, bigint, bigint, bigint, boolean, boolean]

      // Generate history based on current streak and last GM timestamp
      const historyRecords: GMRecord[] = []
      const lastGMDate = new Date(Number(lastGMTimestamp) * 1000)

      for (let i = 0; i < Number(currentStreak); i++) {
        const gmDate = new Date(lastGMDate)
        gmDate.setDate(gmDate.getDate() - i)

        historyRecords.push({
          date: gmDate.toISOString().split('T')[0],
          streak: Number(currentStreak) - i,
          txHash: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock tx hash
        })
      }

      setHistory(historyRecords.reverse()) // Show most recent first
    }
  }, [userData, address])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStreakDay = (record: GMRecord) => {
    return record.streak
  }

  if (history.length === 0) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No GM History Yet
        </h3>
        <p className="text-gray-500">
          Start your daily GM journey today!
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">GM History</h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((record, index) => (
          <div
            key={record.date}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {getStreakDay(record)}
              </div>

              <div>
                <div className="font-medium text-gray-900">
                  {formatDate(record.date)}
                </div>
                <div className="text-sm text-gray-500">
                  Day {getStreakDay(record)} of streak
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-green-500 text-sm">✅</span>
              {record.txHash && (
                <a
                  href={`https://basescan.org/tx/${record.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 text-xs"
                >
                  View TX ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Total GM days: {history.length}
        </div>
      )}
    </div>
  )
}