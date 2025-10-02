'use client'

import { useState, useEffect, useRef } from 'react'
import { useReadContract, useAccount } from 'wagmi'
import { GM_CONTRACT_ADDRESS, GM_CONTRACT_ABI } from '@/lib/gm-utils'
import { fetchUsersByAddresses, FarcasterUser } from '@/lib/neynar'
import { sdk } from '@farcaster/miniapp-sdk'
import Image from 'next/image'

interface LeaderboardEntry {
  address: string
  streak: number
  totalGMs: number
  rank: number
  farcasterData?: FarcasterUser
}

export function ContractLeaderboard() {
  const { address: connectedAddress } = useAccount()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null)
  const [currentUserFarcaster, setCurrentUserFarcaster] = useState<FarcasterUser | null>(null)
  const farcasterCacheRef = useRef<Map<string, FarcasterUser | null>>(new Map())
  const lastFetchRef = useRef<number>(0)

  // Read top users from contract
  const { data: topUsersData, isLoading, error: leaderboardError } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'getTopUsers',
    args: [BigInt(5)], // Get top 5 users
    query: {
      enabled: true, // Enable now with correct ABI
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  // Log any errors
  useEffect(() => {
    if (leaderboardError) {
      console.error('Leaderboard contract error:', leaderboardError)
    }
  }, [leaderboardError])

  // Read global stats
  const { data: totalGMs } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'totalGMs',
    query: {
      enabled: true,
      refetchInterval: 10000,
    },
  })

  const { data: totalUsers } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'totalUsers',
    query: {
      enabled: true,
      refetchInterval: 10000,
    },
  })

  const { data: todaysGMs } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'getTodaysGMCount',
    query: {
      enabled: true,
      refetchInterval: 10000,
    },
  })

  // Get current user's Farcaster data from SDK
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const context = await sdk.context
        if (context.user) {
          setCurrentUserFarcaster({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          })
          console.log('=== CURRENT USER DEBUG ===')
          console.log('Current Farcaster user loaded:', {
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          })
          console.log('Connected wallet address:', connectedAddress)
        }
      } catch (error) {
        console.error('Failed to load Farcaster user:', error)
      }
    }
    loadCurrentUser()
  }, [connectedAddress])

  useEffect(() => {
    const loadLeaderboardWithFarcasterData = async () => {
      console.log('=== LEADERBOARD DEBUG ===')
      console.log('Raw topUsersData:', topUsersData)
      console.log('Type of topUsersData:', typeof topUsersData)
      console.log('Is array:', Array.isArray(topUsersData))
      console.log('isLoading:', isLoading)

      if (topUsersData) {
        try {
          const [addresses, streaks, totalGMs] = topUsersData as [string[], bigint[], bigint[]]
          console.log('Parsed addresses:', addresses)
          console.log('Parsed streaks:', streaks)
          console.log('Parsed totalGMs:', totalGMs)
          console.log('Addresses length:', addresses?.length || 0)
          console.log('Streaks length:', streaks?.length || 0)
          console.log('TotalGMs length:', totalGMs?.length || 0)

          if (addresses && addresses.length > 0) {
            // Filter out empty addresses (0x0000...0000)
            const validEntries: LeaderboardEntry[] = []

            for (let i = 0; i < addresses.length; i++) {
              const address = addresses[i]
              // Skip zero addresses
              if (address === '0x0000000000000000000000000000000000000000' || !address || address === '0x') {
                continue
              }

              validEntries.push({
                address,
                streak: Number(streaks[i]),
                totalGMs: Number(totalGMs[i]),
                rank: validEntries.length + 1,
              })
            }

            console.log('Created valid entries:', validEntries)

            if (validEntries.length > 0) {
              // Sort by streak (descending), then by total GMs
              validEntries.sort((a, b) => {
                if (b.streak !== a.streak) return b.streak - a.streak
                return b.totalGMs - a.totalGMs
              })

              // Update ranks after sorting
              validEntries.forEach((entry, index) => {
                entry.rank = index + 1
              })

              console.log('Sorted entries:', validEntries)

              // First, check if current user's wallet is in the leaderboard and add their Farcaster data
              console.log('=== MATCHING CURRENT USER ===')
              console.log('connectedAddress:', connectedAddress)
              console.log('currentUserFarcaster:', currentUserFarcaster)

              if (connectedAddress && currentUserFarcaster) {
                console.log('Searching for matching address in leaderboard...')
                console.log('Leaderboard addresses:', validEntries.map(e => e.address))

                const currentUserEntry = validEntries.find(
                  entry => entry.address.toLowerCase() === connectedAddress.toLowerCase()
                )

                if (currentUserEntry) {
                  currentUserEntry.farcasterData = currentUserFarcaster
                  console.log(`✓✓✓ SUCCESS! Added current user's Farcaster data for ${connectedAddress}`)
                  console.log('Current user entry:', currentUserEntry)
                } else {
                  console.log(`✗✗✗ FAIL! Connected address ${connectedAddress} not found in leaderboard`)
                }
              } else {
                console.log('Missing data:', {
                  hasConnectedAddress: !!connectedAddress,
                  hasCurrentUserFarcaster: !!currentUserFarcaster
                })
              }

              // Try to fetch Farcaster data for other addresses
              // Rate limit: only fetch once every 30 seconds
              const now = Date.now()
              const shouldFetch = now - lastFetchRef.current > 30000

              if (shouldFetch) {
                console.log('Fetching Farcaster data for addresses...')
                lastFetchRef.current = now

                try {
                  // Collect addresses that need fetching
                  const addressesToFetch: string[] = []

                  for (const entry of validEntries) {
                    // Skip if already has Farcaster data (current user)
                    if (entry.farcasterData) {
                      console.log(`⊙ Skipping ${entry.address} - already has Farcaster data`)
                      continue
                    }

                    // Check cache first
                    const cached = farcasterCacheRef.current.get(entry.address.toLowerCase())
                    if (cached !== undefined) {
                      console.log(`⊙ Using cached data for ${entry.address}`)
                      entry.farcasterData = cached || undefined
                    } else {
                      addressesToFetch.push(entry.address)
                    }
                  }

                  // Fetch all addresses in one batch request to avoid rate limit
                  if (addressesToFetch.length > 0) {
                    console.log(`Fetching ${addressesToFetch.length} addresses in batch from API...`)
                    console.log('Addresses to fetch:', addressesToFetch)

                    const batchResults = await fetchUsersByAddresses(addressesToFetch)
                    console.log('Batch results:', batchResults)

                    // Process results and update entries
                    for (const address of addressesToFetch) {
                      const farcasterData = batchResults[address.toLowerCase()]

                      // Cache the result
                      farcasterCacheRef.current.set(address.toLowerCase(), farcasterData)

                      // Update the entry
                      const entry = validEntries.find(e => e.address.toLowerCase() === address.toLowerCase())
                      if (entry && farcasterData) {
                        entry.farcasterData = farcasterData
                        console.log(`✓ Found Farcaster data for ${address}:`, {
                          username: farcasterData.username,
                          displayName: farcasterData.displayName,
                          pfpUrl: farcasterData.pfpUrl,
                          fid: farcasterData.fid
                        })
                      } else {
                        console.log(`✗ No Farcaster data for ${address}`)
                      }
                    }
                  }

                  console.log('Finished fetching Farcaster data')
                } catch (error) {
                  console.error('Error fetching Farcaster data:', error)
                }
              } else {
                console.log('Using cached Farcaster data (rate limit protection)')
                // Use cached data
                for (const entry of validEntries) {
                  if (!entry.farcasterData) {
                    const cached = farcasterCacheRef.current.get(entry.address.toLowerCase())
                    if (cached) {
                      entry.farcasterData = cached
                    }
                  }
                }
              }

              // Check if current user is in top 5
              const currentUserInTop5 = connectedAddress && validEntries.slice(0, 5).some(
                entry => entry.address.toLowerCase() === connectedAddress.toLowerCase()
              )

              // If current user is not in top 5, find their entry for display
              if (connectedAddress && !currentUserInTop5) {
                const userEntry = validEntries.find(
                  entry => entry.address.toLowerCase() === connectedAddress.toLowerCase()
                )
                setCurrentUserEntry(userEntry || null)
              } else {
                setCurrentUserEntry(null)
              }

              setLeaderboard(validEntries)
            } else {
              console.log('No valid addresses in leaderboard data')
              setLeaderboard([])
              setCurrentUserEntry(null)
            }
          } else {
            console.log('No addresses in leaderboard data')
            setLeaderboard([])
          }
        } catch (error) {
          console.error('Error parsing leaderboard data:', error)
        }
      } else {
        console.log('No topUsersData available')
      }
    }

    loadLeaderboardWithFarcasterData()
  }, [topUsersData, connectedAddress, currentUserFarcaster])

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
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
      {/* Global Stats */}
      {(totalUsers || totalGMs || todaysGMs) && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">📊 Global Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {totalUsers ? Number(totalUsers) : 0}
              </div>
              <div className="text-xs text-gray-600">Total Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {totalGMs ? Number(totalGMs) : 0}
              </div>
              <div className="text-xs text-gray-600">Total GMs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">
                {todaysGMs ? Number(todaysGMs) : 0}
              </div>
              <div className="text-xs text-gray-600">Today's GMs</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-4">
        {leaderboard.slice(0, 5).map((entry) => (
          <div key={entry.address} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="text-2xl font-bold min-w-[3rem] text-center">
                  {getRankEmoji(entry.rank)}
                </div>
                {/* Profile Picture */}
                <div className="relative">
                  {entry.farcasterData?.pfpUrl ? (
                    <>
                      <Image
                        src={entry.farcasterData.pfpUrl}
                        alt={entry.farcasterData.displayName || entry.farcasterData.username || 'User'}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                        unoptimized
                      />
                      {/* Verified badge */}
                      <div className="absolute -bottom-1 -right-1">
                        <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path className="fill-purple-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M 17 9 C 16.984699 8.44998 16.8169 7.914431 16.5147 7.45381 C 16.297401 7.122351 16.016399 6.83868 15.6895 6.61875 C 15.4741 6.47382 15.3639 6.206079 15.4143 5.9514 C 15.4908 5.56531 15.4893 5.16623 15.4095 4.777781 C 15.298 4.23797 15.0375 3.74074 14.6586 3.34142 C 14.2584 2.96254 13.762 2.70285 13.2222 2.59046 C 12.8341 2.51075 12.4353 2.5092 12.0495 2.5855 C 11.7944 2.63594 11.5263 2.52522 11.3816 2.30924 C 11.1622 1.982038 10.87893 1.700779 10.54704 1.48361 C 10.08642 1.182205 9.55087 1.013622 9 1 C 8.44998 1.014473 7.91613 1.181355 7.45636 1.48361 C 7.12562 1.701042 6.84379 1.981922 6.62575 2.30818 C 6.4811 2.52463 6.21278 2.6359 5.95742 2.58524 C 5.57065 2.50851 5.17062 2.50951 4.78118 2.59046 C 4.24053 2.70115 3.74244 2.96169 3.34227 3.34142 C 2.96339 3.74159 2.70456 4.23968 2.59472 4.77863 C 2.51504 5.16661 2.51478 5.56517 2.59204 5.9505 C 2.64317 6.20557 2.53289 6.47402 2.31683 6.618879 C 1.98923 6.83852 1.707141 7.12164 1.488719 7.45296 C 1.185611 7.91273 1.016177 8.44913 1 9 C 1.017028 9.55087 1.185611 10.08642 1.488719 10.54704 C 1.70699 10.87813 1.988839 11.1615 2.31614 11.381 C 2.53242 11.5261 2.64304 11.7948 2.59191 12.0501 C 2.51478 12.4353 2.51509 12.8336 2.59472 13.2214 C 2.70541 13.7612 2.96339 14.2584 3.34142 14.6586 C 3.74159 15.0358 4.23882 15.2946 4.77778 15.4061 C 5.16676 15.4872 5.56638 15.4885 5.95297 15.4125 C 6.2069 15.3626 6.4733 15.473 6.61752 15.6879 C 6.8374 16.015499 7.12119 16.2973 7.45381 16.515499 C 7.91358 16.8169 8.44998 16.984699 9 17 C 9.55087 16.986401 10.08642 16.8186 10.54704 16.5172 C 10.87568 16.3022 11.1566 16.023899 11.3751 15.7008 C 11.5233 15.4816 11.7988 15.3721 12.0576 15.4274 C 12.4412 15.5093 12.8397 15.5111 13.2273 15.4308 C 13.7688 15.3184 14.2661 15.0502 14.6577 14.6586 C 15.0494 14.2669 15.3184 13.7697 15.4308 13.2273 C 15.5112 12.8397 15.5093 12.4411 15.427 12.0575 C 15.3716 11.7987 15.4806 11.5231 15.6997 11.3745 C 16.022301 11.1558 16.2999 10.87482 16.515499 10.54619 C 16.8169 10.08642 16.984699 9.55002 17 9 Z M 12.1286 6.46597"></path>
                          <path fill="#ffffff" fillRule="evenodd" stroke="none" d="M 5.48206 8.829732 C 5.546341 8.757008 6.096026 8.328334 6.590207 8.831891 C 6.990357 9.239633 7.80531 10.013605 7.80531 10.013605 C 7.80531 10.013605 10.326332 7.31631 11.011629 6.559397 C 11.320887 6.21782 11.875775 6.239667 12.135474 6.515033 C 12.411443 6.807649 12.489538 7.230008 12.164574 7.601331 C 10.947777 8.991708 9.508716 10.452277 8.3795 11.706156 C 8.11062 12.004721 7.595459 12.008714 7.302509 11.735093 C 7.061394 11.509888 6.005327 10.437536 5.502547 9.931531 C 5.003333 9.429114 5.404643 8.887831 5.48206 8.829732 Z"></path>
                        </svg>
                      </div>
                    </>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {entry.address.slice(2, 4).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {entry.farcasterData?.displayName ||
                     entry.farcasterData?.username ||
                     formatAddress(entry.address)}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {entry.farcasterData?.username && (
                      <p>@{entry.farcasterData.username}</p>
                    )}
                    <a
                      href={`https://basescan.org/address/${entry.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-500"
                    >
                      {formatAddress(entry.address)} ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-500">
                  {entry.streak}
                </div>
                <div className="text-xs text-gray-500">
                  {entry.totalGMs} total GMs
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Current User Entry (if not in top 5) */}
        {currentUserEntry && (
          <>
            <div className="flex items-center justify-center py-2">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">Your Rank</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div className="card hover:shadow-lg transition-shadow border-2 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="text-2xl font-bold min-w-[3rem] text-center text-blue-600">
                    #{currentUserEntry.rank}
                  </div>
                  {/* Profile Picture */}
                  <div className="relative">
                    {currentUserEntry.farcasterData?.pfpUrl ? (
                      <>
                        <Image
                          src={currentUserEntry.farcasterData.pfpUrl}
                          alt={currentUserEntry.farcasterData.displayName || currentUserEntry.farcasterData.username || 'User'}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                          unoptimized
                        />
                        {/* Verified badge */}
                        <div className="absolute -bottom-1 -right-1">
                          <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path className="fill-purple-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M 17 9 C 16.984699 8.44998 16.8169 7.914431 16.5147 7.45381 C 16.297401 7.122351 16.016399 6.83868 15.6895 6.61875 C 15.4741 6.47382 15.3639 6.206079 15.4143 5.9514 C 15.4908 5.56531 15.4893 5.16623 15.4095 4.777781 C 15.298 4.23797 15.0375 3.74074 14.6586 3.34142 C 14.2584 2.96254 13.762 2.70285 13.2222 2.59046 C 12.8341 2.51075 12.4353 2.5092 12.0495 2.5855 C 11.7944 2.63594 11.5263 2.52522 11.3816 2.30924 C 11.1622 1.982038 10.87893 1.700779 10.54704 1.48361 C 10.08642 1.182205 9.55087 1.013622 9 1 C 8.44998 1.014473 7.91613 1.181355 7.45636 1.48361 C 7.12562 1.701042 6.84379 1.981922 6.62575 2.30818 C 6.4811 2.52463 6.21278 2.6359 5.95742 2.58524 C 5.57065 2.50851 5.17062 2.50951 4.78118 2.59046 C 4.24053 2.70115 3.74244 2.96169 3.34227 3.34142 C 2.96339 3.74159 2.70456 4.23968 2.59472 4.77863 C 2.51504 5.16661 2.51478 5.56517 2.59204 5.9505 C 2.64317 6.20557 2.53289 6.47402 2.31683 6.618879 C 1.98923 6.83852 1.707141 7.12164 1.488719 7.45296 C 1.185611 7.91273 1.016177 8.44913 1 9 C 1.017028 9.55087 1.185611 10.08642 1.488719 10.54704 C 1.70699 10.87813 1.988839 11.1615 2.31614 11.381 C 2.53242 11.5261 2.64304 11.7948 2.59191 12.0501 C 2.51478 12.4353 2.51509 12.8336 2.59472 13.2214 C 2.70541 13.7612 2.96339 14.2584 3.34142 14.6586 C 3.74159 15.0358 4.23882 15.2946 4.77778 15.4061 C 5.16676 15.4872 5.56638 15.4885 5.95297 15.4125 C 6.2069 15.3626 6.4733 15.473 6.61752 15.6879 C 6.8374 16.015499 7.12119 16.2973 7.45381 16.515499 C 7.91358 16.8169 8.44998 16.984699 9 17 C 9.55087 16.986401 10.08642 16.8186 10.54704 16.5172 C 10.87568 16.3022 11.1566 16.023899 11.3751 15.7008 C 11.5233 15.4816 11.7988 15.3721 12.0576 15.4274 C 12.4412 15.5093 12.8397 15.5111 13.2273 15.4308 C 13.7688 15.3184 14.2661 15.0502 14.6577 14.6586 C 15.0494 14.2669 15.3184 13.7697 15.4308 13.2273 C 15.5112 12.8397 15.5093 12.4411 15.427 12.0575 C 15.3716 11.7987 15.4806 11.5231 15.6997 11.3745 C 16.022301 11.1558 16.2999 10.87482 16.515499 10.54619 C 16.8169 10.08642 16.984699 9.55002 17 9 Z M 12.1286 6.46597"></path>
                            <path fill="#ffffff" fillRule="evenodd" stroke="none" d="M 5.48206 8.829732 C 5.546341 8.757008 6.096026 8.328334 6.590207 8.831891 C 6.990357 9.239633 7.80531 10.013605 7.80531 10.013605 C 7.80531 10.013605 10.326332 7.31631 11.011629 6.559397 C 11.320887 6.21782 11.875775 6.239667 12.135474 6.515033 C 12.411443 6.807649 12.489538 7.230008 12.164574 7.601331 C 10.947777 8.991708 9.508716 10.452277 8.3795 11.706156 C 8.11062 12.004721 7.595459 12.008714 7.302509 11.735093 C 7.061394 11.509888 6.005327 10.437536 5.502547 9.931531 C 5.003333 9.429114 5.404643 8.887831 5.48206 8.829732 Z"></path>
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {currentUserEntry.address.slice(2, 4).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {currentUserEntry.farcasterData?.displayName ||
                       currentUserEntry.farcasterData?.username ||
                       formatAddress(currentUserEntry.address)}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {currentUserEntry.farcasterData?.username && (
                        <p>@{currentUserEntry.farcasterData.username}</p>
                      )}
                      <a
                        href={`https://basescan.org/address/${currentUserEntry.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500"
                      >
                        {formatAddress(currentUserEntry.address)} ↗
                      </a>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-500">
                    {currentUserEntry.streak}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentUserEntry.totalGMs} total GMs
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Empty State */}
      {leaderboard.length === 0 && !isLoading && (
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

      {/* Contract Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          Contract:
          <a
            href={`https://basescan.org/address/${GM_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline ml-1"
          >
            {formatAddress(GM_CONTRACT_ADDRESS)}
          </a>
        </p>
      </div>
    </div>
  )
}