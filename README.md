# GM Farcaster Mini App ☀️

A Farcaster Mini App that brings daily "Good Morning" rituals on-chain. Built on Base blockchain with gasless transactions, streak tracking, and competitive leaderboards.

[![Built on Base](https://img.shields.io/badge/Built%20on-Base-0052FF?style=flat&logo=ethereum)](https://base.org)
[![Farcaster](https://img.shields.io/badge/Farcaster-Mini%20App-855DCD?style=flat)](https://warpcast.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Overview

GM Farcaster Mini App transforms the simple act of saying "Good Morning" into an engaging on-chain experience. Users can send their daily GM, maintain streaks, compete on leaderboards, and connect with the Farcaster community—all with **free, gasless transactions** on Base.

**Live Demo**: [Try it on Farcaster](https://gmfarcaster.vercel.app)

## ✨ Key Features

### 🎯 Core Functionality
- **Daily On-Chain GM**: Send your good morning message to the blockchain every day
- **Gasless Transactions**: All transactions are completely free—no gas fees required
- **Streak System**: Track consecutive days of GM submissions
- **Global Leaderboard**: Compete with the community for the longest streak
- **Real-time Updates**: Live data from smart contracts and Farcaster network

### 🎨 User Experience
- **⏰ Smart Countdown Timer**: Visual countdown to your next available GM
- **🌅 Dynamic Time Emojis**: Interface adapts based on time of day (morning, afternoon, evening)
- **📱 Mobile-First Design**: Native app experience optimized for mobile devices
- **💫 Smooth Animations**: Polished interactions and transitions
- **🎯 Instant Feedback**: Clear visual states for all actions

### 🔗 Farcaster Integration
- **Profile Display**: Show Farcaster usernames, display names, and profile pictures
- **Verified Badges**: Visual indicators for Farcaster-verified accounts
- **Social Features**: Share your streak with the community
- **Seamless Auth**: Automatic wallet connection through Farcaster

### ⛓️ Blockchain Features
- **Base Network**: Built on Coinbase's Layer 2 for fast, cheap transactions
- **Smart Contract**: Transparent, on-chain streak tracking and leaderboard
- **Sponsored Transactions**: Gasless UX powered by account abstraction
- **Real-time Data**: All stats pulled directly from blockchain

## 🛠️ Technology Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Farcaster Mini App SDK](https://docs.farcaster.xyz/developers/frames/)** - Farcaster integration

### Blockchain & APIs
- **[Base](https://base.org)** - Ethereum Layer 2 network
- **[Wagmi](https://wagmi.sh/)** - React hooks for Ethereum
- **[Viem](https://viem.sh/)** - TypeScript Ethereum library
- **[Neynar](https://neynar.com)** - Farcaster data and profiles

### Infrastructure
- **[Vercel](https://vercel.com)** - Deployment and hosting
- **Smart Contract** - Custom GM streak tracker on Base

## 🏗️ Project Structure

```
gm-farcaster-miniapp/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   └── manifest/        # Farcaster manifest endpoint
│   ├── leaderboard/         # Leaderboard page
│   ├── profile/             # User profile page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── providers.tsx        # Context providers
├── components/              # React components
│   ├── ConnectWallet.tsx   # Wallet connection
│   ├── ContractGMButton.tsx # GM submission button
│   ├── ContractLeaderboard.tsx # Leaderboard display
│   ├── GMCountdown.tsx     # Countdown timer
│   ├── MobileNavigation.tsx # Bottom navigation
│   └── ...                 # Other components
├── lib/                     # Utilities and configs
│   ├── gm-utils.ts         # Smart contract config
│   ├── neynar.ts           # Farcaster data fetching
│   └── wagmi.ts            # Web3 configuration
├── public/
│   └── .well-known/
│       └── farcaster.json  # Farcaster manifest
└── README.md
```

## 🎮 How It Works

### For Users

1. **Open the Mini App** - Launch from any Farcaster client
2. **Connect Wallet** - Automatically connects your Farcaster wallet
3. **Send Daily GM** - Click the GM button once per day (free!)
4. **Build Your Streak** - Send GM daily to increase your streak
5. **Climb the Leaderboard** - Compete for the top spot
6. **Share Your Progress** - Post your streak on Farcaster

### Technical Flow

1. **User Authentication**: Farcaster SDK handles auth and wallet connection
2. **Smart Contract Interaction**: GM button triggers gasless transaction to Base
3. **On-Chain Recording**: Smart contract records timestamp, updates streak
4. **Data Retrieval**: Frontend reads contract for stats and leaderboard
5. **Farcaster Enrichment**: Neynar API adds usernames, profiles, avatars
6. **Real-time Updates**: UI refreshes every 10 seconds for live data

## 📊 Smart Contract

The GM smart contract on Base handles:
- ✅ Daily GM submissions with timestamp validation
- ✅ Automatic streak calculation
- ✅ Streak breaks when a day is missed
- ✅ Global leaderboard rankings
- ✅ Total GM count and user statistics
- ✅ Gasless transactions via account abstraction

**Contract Address**: `0x67FafE153aeB3c2caae7a138C1409aB53f680C75` (Base)

## 🎯 Why Base?

- **Fast & Cheap**: Transactions confirm in seconds for negligible cost
- **Ethereum Security**: Inherits security from Ethereum mainnet
- **Great DevEx**: Full EVM compatibility with modern tooling
- **Growing Ecosystem**: Thriving community and increasing adoption
- **Coinbase Integration**: Seamless fiat on-ramps and user experience

## 🤝 Contributing

This is an open-source project showcasing Base building. While not designed for external deployment, contributions are welcome:

- Report bugs via Issues
- Suggest features or improvements
- Submit PRs for fixes or enhancements

## 📄 License

MIT License - feel free to learn from and reference this code!

## 🏆 Built for Base Builders

This project demonstrates:
- ✅ Gasless transaction patterns
- ✅ Smart contract integration with modern frontend
- ✅ Farcaster Mini App best practices
- ✅ Mobile-first web3 UX
- ✅ Real-time blockchain data handling
- ✅ Social + on-chain composability

**No revenue model. No token. Just vibes and good mornings. ☀️**

## 🔗 Links

- **Live App**: [gmfarcaster.vercel.app](https://gmfarcaster.vercel.app)
- **Base**: [base.org](https://base.org)
- **Farcaster**: [farcaster](https://farcaster.xyz/miniapps/zOCvTtAbTpBY/gm-farcaster)
- **Contract Explorer**: [View on BaseScan](https://basescan.org/address/0x67FafE153aeB3c2caae7a138C1409aB53f680C75)

---

**Built with ❤️ on Base for the Farcaster community**

*Good morning, anon. Time to build.* ☀️
