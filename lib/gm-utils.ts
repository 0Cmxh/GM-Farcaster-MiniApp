import { parseEther, encodeFunctionData } from 'viem'

export const GM_CONTRACT_ADDRESS = '0x67FafE153aeB3c2caae7a138C1409aB53f680C75' // GM Contract deployed on Base

// Contract ABI - Real ABI from contract
export const GM_CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "streak", "type": "uint256"}
    ],
    "name": "GMSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "NewUser",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "previousStreak", "type": "uint256"}
    ],
    "name": "StreakBroken",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "SECONDS_PER_DAY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "allUsers",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "canUserGM",
    "outputs": [
      {"internalType": "bool", "name": "canGM", "type": "bool"},
      {"internalType": "string", "name": "reason", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "dailyGMCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractInfo",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "version", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"}
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentDay",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "day", "type": "uint256"}],
    "name": "getDailyGMCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGMMessage",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGlobalStats",
    "outputs": [
      {"internalType": "uint256", "name": "_totalUsers", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalGMs", "type": "uint256"},
      {"internalType": "uint256", "name": "_todaysGMs", "type": "uint256"},
      {"internalType": "uint256", "name": "_currentDay", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTodaysGMCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "limit", "type": "uint256"}],
    "name": "getTopUsers",
    "outputs": [
      {"internalType": "address[]", "name": "addresses", "type": "address[]"},
      {"internalType": "uint256[]", "name": "streaks", "type": "uint256[]"},
      {"internalType": "uint256[]", "name": "totalGMCounts", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalUsers",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "getUserByIndex",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserData",
    "outputs": [
      {"internalType": "uint256", "name": "currentStreak", "type": "uint256"},
      {"internalType": "uint256", "name": "longestStreak", "type": "uint256"},
      {"internalType": "uint256", "name": "userTotalGMs", "type": "uint256"},
      {"internalType": "uint256", "name": "lastGMTimestamp", "type": "uint256"},
      {"internalType": "bool", "name": "canGMToday", "type": "bool"},
      {"internalType": "bool", "name": "isRegistered", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserRank",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "hasGMdToday",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "isRegisteredUser",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sendGM",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalGMs",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalUsers",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "users",
    "outputs": [
      {"internalType": "uint256", "name": "currentStreak", "type": "uint256"},
      {"internalType": "uint256", "name": "longestStreak", "type": "uint256"},
      {"internalType": "uint256", "name": "totalGMs", "type": "uint256"},
      {"internalType": "uint256", "name": "lastGMTimestamp", "type": "uint256"},
      {"internalType": "uint256", "name": "lastGMDay", "type": "uint256"},
      {"internalType": "bool", "name": "isRegistered", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0]
}

export const getYesterdayDateString = (): string => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

export const getTimeUntilMidnight = (): number => {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0) // Next midnight
  return midnight.getTime() - now.getTime()
}

// New function: Calculate time until next GM based on last GM timestamp (24 hours later)
export const getTimeUntilNextGM = (lastGMTimestamp: number): number => {
  if (lastGMTimestamp === 0) return 0 // Can GM immediately if never GM'd

  const now = Date.now()
  const lastGMTime = lastGMTimestamp * 1000 // Convert from seconds to milliseconds
  const nextGMTime = lastGMTime + (24 * 60 * 60 * 1000) // Add 24 hours

  const timeRemaining = nextGMTime - now
  return Math.max(0, timeRemaining) // Return 0 if time has passed
}

// Check if user can GM based on last GM timestamp
export const canGMBasedOnTimestamp = (lastGMTimestamp: number): boolean => {
  return getTimeUntilNextGM(lastGMTimestamp) === 0
}

export const formatTimeUntilMidnight = (): string => {
  const timeLeft = getTimeUntilMidnight()
  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

// Format time until next GM based on last GM timestamp
export const formatTimeUntilNextGM = (lastGMTimestamp: number): string => {
  const timeLeft = getTimeUntilNextGM(lastGMTimestamp)

  if (timeLeft === 0) return "Ready to GM!"

  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

export const hasGMToday = (lastGMDate?: string): boolean => {
  if (!lastGMDate) return false
  return lastGMDate === getTodayDateString()
}

export const calculateStreak = (gmHistory: string[]): number => {
  if (gmHistory.length === 0) return 0

  // Sort dates in descending order
  const sortedDates = gmHistory.sort((a, b) => b.localeCompare(a))

  let streak = 0
  let currentDate = new Date()

  for (const dateStr of sortedDates) {
    const gmDate = new Date(dateStr)
    const diffInDays = Math.floor((currentDate.getTime() - gmDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === streak) {
      streak++
      currentDate = gmDate
    } else {
      break
    }
  }

  return streak
}

// Create GM transaction - calls sendGM() on the contract
export const createGMTransaction = () => {
  const data = encodeFunctionData({
    abi: GM_CONTRACT_ABI,
    functionName: 'sendGM',
    args: []
  })

  return {
    to: GM_CONTRACT_ADDRESS as `0x${string}`,
    value: parseEther('0'), // Free transaction (only gas)
    data,
  }
}