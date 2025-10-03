'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { sdk } from '@farcaster/miniapp-sdk'
import { GM_CELO_CONTRACT_ADDRESS, GM_CELO_CONTRACT_ABI } from '@/lib/gm-utils-celo'
import { celo } from 'wagmi/chains'

export function ContractGMButtonCelo() {
  const { address, isConnected, chainId } = useAccount()
  const [totalGMs, setTotalGMs] = useState(0)
  const [streak, setStreak] = useState(0)
  const [gmMessage, setGmMessage] = useState('')
  const { switchChainAsync } = useSwitchChain()

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
    address: GM_CELO_CONTRACT_ADDRESS,
    abi: GM_CELO_CONTRACT_ABI,
    functionName: 'getUserData',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      retry: 1,
    },
  })

  // Read if user can GM (always true for Celo)
  const { data: canGMData, refetch: refetchCanGM } = useReadContract({
    address: GM_CELO_CONTRACT_ADDRESS,
    abi: GM_CELO_CONTRACT_ABI,
    functionName: 'canUserGM',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Log errors
  useEffect(() => {
    if (userDataError) {
      console.error('Error reading user data from Celo contract:', userDataError)
    }
  }, [userDataError])

  // Update state when contract data changes
  useEffect(() => {
    if (userData) {
      const [currentStreak, , userTotalGMs] = userData as [bigint, bigint, bigint, bigint, boolean, boolean]
      setStreak(Number(currentStreak))
      setTotalGMs(Number(userTotalGMs))
    }
  }, [userData])

  useEffect(() => {
    if (canGMData) {
      const [, reason] = canGMData as [boolean, string]
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

  const handleGM = async () => {
    if (!isConnected) return

    try {
      // Switch to Celo network if not already on it
      if (chainId !== celo.id) {
        await switchChainAsync({ chainId: celo.id })
      }

      writeContract({
        address: GM_CELO_CONTRACT_ADDRESS,
        abi: GM_CELO_CONTRACT_ABI,
        functionName: 'sendGM',
      })
    } catch (error) {
      console.error('Failed to send GM transaction on Celo:', error)
    }
  }

  const handleShare = async () => {
    try {
      await sdk.actions.composeCast({
        text: `GM Celo! ☀️ Just completed day ${streak} of my GM streak on Celo! 🔥\n\nJoin me in spreading good vibes on Celo 💚\n\nContract: ${GM_CELO_CONTRACT_ADDRESS}`,
        embeds: [window.location.origin + '/celo'],
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

  // Successfully sent GM - show success message
  if (isConfirmed && !isWritePending && !isConfirming) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            GM Sent on Celo!
          </h2>
          <p className="text-gray-600 mb-4">
            Current streak: <span className="font-bold text-orange-500">{streak} days</span>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Total GMs: <span className="font-bold">{totalGMs}</span>
          </p>
          <p className="text-sm text-green-600 mb-4">
            {gmMessage}
          </p>
        </div>

        <button
          onClick={handleGM}
          className="btn-primary w-full"
        >
          Send Another GM 🚀
        </button>

        <button
          onClick={handleShare}
          className="btn-secondary w-full"
        >
          📢 Share on Farcaster
        </button>

        {txHash && (
          <p className="text-xs text-gray-500 text-center">
            <a
              href={`https://celoscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on CeloScan ↗
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
          Send unlimited GMs on Celo - No waiting!
        </p>
        {streak > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Your streak: <span className="font-bold text-orange-500">{streak} days</span>
          </p>
        )}
        <p className="text-sm text-green-600 mb-4">
          {gmMessage || 'Ready to GM on Celo!'}
        </p>
      </div>

      <button
        onClick={handleGM}
        disabled={!isConnected || isWritePending || isConfirming}
        className={`btn-primary w-full ${
          (!isConnected || isWritePending || isConfirming) ? 'opacity-50 cursor-not-allowed' : ''
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
          'Send GM On Celo 💚'
        )}
      </button>

      {writeError && (
        <p className="text-xs text-red-500 text-center">
          Error: {writeError.message}
        </p>
      )}

      <p className="text-xs text-gray-500 text-center">
        Free transaction on Celo ⚡ (only gas fees)
      </p>
    </div>
  )
}
