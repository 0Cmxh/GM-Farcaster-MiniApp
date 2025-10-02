'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSendTransaction } from 'wagmi'
import { sdk } from '@farcaster/miniapp-sdk'
import { createGMTransaction, hasGMToday, getTodayDateString, getTimeUntilMidnight } from '@/lib/gm-utils'

export function GMButton() {
  const { address, isConnected } = useAccount()
  const { sendTransaction, isPending, isSuccess, data: txHash } = useSendTransaction()
  const [gmToday, setGmToday] = useState(false)
  const [streak, setStreak] = useState(0)
  const [timeUntilReset, setTimeUntilReset] = useState('')

  // Check if user already GM'd today (using localStorage for demo)
  useEffect(() => {
    const checkGMStatus = () => {
      const gmHistory = JSON.parse(localStorage.getItem(`gm_history_${address}`) || '[]')
      const lastGM = gmHistory[gmHistory.length - 1]
      setGmToday(hasGMToday(lastGM))
      setStreak(gmHistory.length) // Simple streak calculation for demo
    }

    if (address) {
      checkGMStatus()
    }
  }, [address])

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const timeLeft = getTimeUntilMidnight()
      const hours = Math.floor(timeLeft / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      setTimeUntilReset(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const handleGM = async () => {
    if (!isConnected || gmToday) return

    try {
      const transaction = createGMTransaction()
      sendTransaction(transaction)
    } catch (error) {
      console.error('Failed to send GM transaction:', error)
    }
  }

  const handleShare = async () => {
    try {
      await sdk.actions.composeCast({
        text: `GM! ☀️ Just completed day ${streak + 1} of my GM streak on Base! 🔥\n\nJoin me in spreading good vibes daily 💪`,
        embeds: [window.location.origin],
      })
    } catch (error) {
      console.error('Failed to share:', error)
    }
  }

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && txHash) {
      // Save GM to localStorage (in production, save to backend)
      const gmHistory = JSON.parse(localStorage.getItem(`gm_history_${address}`) || '[]')
      gmHistory.push(getTodayDateString())
      localStorage.setItem(`gm_history_${address}`, JSON.stringify(gmHistory))

      setGmToday(true)
      setStreak(prev => prev + 1)
    }
  }, [isSuccess, txHash, address])

  if (gmToday) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔥</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            GM Sent Today!
          </h2>
          <p className="text-gray-600 mb-4">
            Current streak: <span className="font-bold text-orange-500">{streak} days</span>
          </p>
          <p className="text-sm text-gray-500">
            Next GM in: {timeUntilReset}
          </p>
        </div>

        <button
          onClick={handleShare}
          className="btn-secondary w-full"
        >
          📢 Share Your Streak
        </button>

        {txHash && (
          <p className="text-xs text-gray-500 text-center">
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on BaseScan ↗
            </a>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">☀️</div>
        <h2 className="text-2xl font-bold mb-2">Ready for GM?</h2>
        <p className="text-gray-600 mb-4">
          Send your daily GM on Base
        </p>
        {streak > 0 && (
          <p className="text-sm text-gray-500">
            Your streak: <span className="font-bold text-orange-500">{streak} days</span>
          </p>
        )}
      </div>

      <button
        onClick={handleGM}
        disabled={!isConnected || isPending}
        className={`btn-primary w-full ${
          (!isConnected || isPending) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isPending ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Sending GM...
          </div>
        ) : (
          'Send GM (Free) 🚀'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Free transaction on Base ⚡
      </p>
    </div>
  )
}