import { createConfig, http } from 'wagmi'
import { base, celo } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

export const config = createConfig({
  chains: [base, celo],
  transports: {
    [base.id]: http(),
    [celo.id]: http(),
  },
  connectors: [
    farcasterMiniApp()
  ]
})