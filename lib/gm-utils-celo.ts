import { parseEther, encodeFunctionData } from 'viem'

// GM Celo Contract deployed on Celo Mainnet
export const GM_CELO_CONTRACT_ADDRESS = '0x0A419eC7Ea59cDa9DE934AD70fAc9f3Ca2960f91'

// Contract ABI for GMCelo - Full version with streak tracking, NO TIME RESTRICTIONS
export const GM_CELO_CONTRACT_ABI = [
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
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "canUserGM",
    "outputs": [
      {"internalType": "bool", "name": "canGM", "type": "bool"},
      {"internalType": "string", "name": "reason", "type": "string"}
    ],
    "stateMutability": "pure",
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

// Create GM transaction - calls sendGM() on the Celo contract
export const createGMCeloTransaction = () => {
  const data = encodeFunctionData({
    abi: GM_CELO_CONTRACT_ABI,
    functionName: 'sendGM',
    args: []
  })

  return {
    to: GM_CELO_CONTRACT_ADDRESS as `0x${string}`,
    value: parseEther('0'), // Free transaction (only gas)
    data,
  }
}
