'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { sdk } from '@farcaster/miniapp-sdk'
import { GM_CONTRACT_ADDRESS, GM_CONTRACT_ABI, getTimeUntilNextGM, formatTimeUntilNextGM, canGMBasedOnTimestamp } from '@/lib/gm-utils'
import { GMCountdown } from './GMCountdown'

export function ContractGMButton() {
  const { address, isConnected } = useAccount()
  const [streak, setStreak] = useState(0)
  const [canGM, setCanGM] = useState(false)
  const [gmMessage, setGmMessage] = useState('')
  const [timeUntilNextGM, setTimeUntilNextGM] = useState('')
  const [lastGMTimestamp, setLastGMTimestamp] = useState(0)

  // Contract write function
  const {
    writeContract,
    isPending: isWritePending,
    data: txHash,
    error: writeError
  } = useWriteContract()

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Read user data from contract
  const { data: userData, refetch: refetchUserData, error: userDataError } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'getUserData',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      retry: 1, // Only retry once
    },
  })

  // Log errors
  useEffect(() => {
    if (userDataError) {
      console.error('Error reading user data from contract:', userDataError)
    }
  }, [userDataError])

  // Read if user can GM today
  const { data: canGMData, refetch: refetchCanGM } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'canUserGM',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Update state when contract data changes
  useEffect(() => {
    console.log('ContractGMButton - userData received:', userData)
    if (userData) {
      const [currentStreak, , , lastGMTimestampBigInt, canGMToday] = userData as [bigint, bigint, bigint, bigint, boolean, boolean]
      const timestampNumber = Number(lastGMTimestampBigInt)

      console.log('ContractGMButton - parsed data:', {
        currentStreak: Number(currentStreak),
        lastGMTimestamp: timestampNumber,
        canGMToday
      })

      setStreak(Number(currentStreak))
      setLastGMTimestamp(timestampNumber)

      // Use contract's canGMToday, but also validate with our timestamp logic
      const canGMFromTimestamp = canGMBasedOnTimestamp(timestampNumber)
      setCanGM(canGMToday && canGMFromTimestamp)

      console.log('CanGM status:', {
        contractSays: canGMToday,
        timestampSays: canGMFromTimestamp,
        final: canGMToday && canGMFromTimestamp
      })
    }
  }, [userData])

  useEffect(() => {
    if (canGMData) {
      const [canGMBool, reason] = canGMData as [boolean, string]
      setCanGM(canGMBool)
      setGmMessage(reason)
    }
  }, [canGMData])

  // Refetch data after successful transaction
  useEffect(() => {
    if (isConfirmed) {
      refetchUserData()
      refetchCanGM()
    }
  }, [isConfirmed, refetchUserData, refetchCanGM])

  // Update countdown timer for next GM based on last GM timestamp
  useEffect(() => {
    const updateTimer = () => {
      if (lastGMTimestamp === 0) {
        setTimeUntilNextGM("Ready to GM!")
        return
      }

      const formattedTime = formatTimeUntilNextGM(lastGMTimestamp)
      setTimeUntilNextGM(formattedTime)

      // Update canGM status based on timestamp
      const canGMNow = canGMBasedOnTimestamp(lastGMTimestamp)
      if (canGMNow && !canGM && userData) {
        // Re-evaluate canGM when 24h has passed
        const [, , , , canGMToday] = userData as [bigint, bigint, bigint, bigint, boolean, boolean]
        setCanGM(canGMToday && canGMNow)
      }
    }

    // Update immediately
    updateTimer()

    // Update every second to show countdown
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [lastGMTimestamp, canGM, userData])

  const handleGM = async () => {
    if (!isConnected || !canGM) return

    try {
      writeContract({
        address: GM_CONTRACT_ADDRESS,
        abi: GM_CONTRACT_ABI,
        functionName: 'sendGM',
        chainId: 8453, // Base chain ID
      })
    } catch (error) {
      console.error('Failed to send GM transaction:', error)
    }
  }

  const handleShare = async () => {
    try {
      await sdk.actions.composeCast({
        text: `GM! ☀️ Just completed day ${streak} of my GM streak on Base! 🔥\n\nJoin me in spreading good vibes daily 💪\n\nContract: ${GM_CONTRACT_ADDRESS}`,
        embeds: [window.location.origin],
      })
    } catch (error) {
      console.error('Failed to share:', error)
    }
  }

  // Loading state
  if (!address) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold text-gray-600">
            Connect wallet to start
          </h2>
        </div>
      </div>
    )
  }

  // Already GM'd today
  if (!canGM && !isWritePending && !isConfirming) {
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
          <p className="text-xs text-gray-400 mb-2">
            {gmMessage}
          </p>
          <GMCountdown lastGMTimestamp={lastGMTimestamp} className="mb-4" />
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

  // Ready to GM
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">☀️</div>
        <h2 className="text-2xl font-bold mb-2">Ready for GM?</h2>
        <p className="text-gray-600 mb-4">
          Send your daily GM on Base
        </p>
        {streak > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Your streak: <span className="font-bold text-orange-500">{streak} days</span>
          </p>
        )}
        <p className="text-sm text-green-600 mb-4">
          {gmMessage}
        </p>
      </div>

      <button
        onClick={handleGM}
        disabled={!isConnected || !canGM || isWritePending || isConfirming}
        className={`btn-primary w-full ${
          (!isConnected || !canGM || isWritePending || isConfirming) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isWritePending ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Sending GM...
          </div>
        ) : isConfirming ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Confirming...
          </div>
        ) : (
          'Send GM On-Chain 🚀'
        )}
      </button>

      {writeError && (
        <p className="text-xs text-red-500 text-center">
          Error: {writeError.message}
        </p>
      )}

      <p className="text-xs text-gray-500 text-center">
        Free transaction on Base ⚡ (only gas fees)
      </p>
    </div>
  )
}