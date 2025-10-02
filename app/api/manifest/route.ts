import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const manifest = {
    "accountAssociation": {
      "header": "PLACEHOLDER_HEADER",
      "payload": "PLACEHOLDER_PAYLOAD",
      "signature": "PLACEHOLDER_SIGNATURE"
    },
    "miniapp": {
      "version": "1",
      "name": "GM",
      "iconUrl": `${process.env.NEXT_PUBLIC_APP_URL || 'https://gm-miniapp.vercel.app'}/logo.png`,
      "homeUrl": `${process.env.NEXT_PUBLIC_APP_URL || 'https://gm-miniapp.vercel.app'}/`,
      "imageUrl": `${process.env.NEXT_PUBLIC_APP_URL || 'https://gm-miniapp.vercel.app'}/logo.png`,
      "buttonTitle": "☀️ GM",
      "splashImageUrl": `${process.env.NEXT_PUBLIC_APP_URL || 'https://gm-miniapp.vercel.app'}/logo.png`,
      "splashBackgroundColor": "#FEF3E2",
      "subtitle": "Daily GM streak tracker",
      "description": "Track your daily GM streak on Base. Send free GM transactions and compete on the leaderboard!",
      "primaryCategory": "social",
      "tags": ["gm", "streak", "base", "social", "daily"],
      "heroImageUrl": `${process.env.NEXT_PUBLIC_APP_URL || 'https://gm-miniapp.vercel.app'}/logo.png`,
      "tagline": "Start your day with GM ☀️",
      "ogTitle": "GM - Daily Streak Tracker",
      "ogDescription": "Track your daily GM streak on Base. Send free GM transactions and compete on the leaderboard!",
      "ogImageUrl": `${process.env.NEXT_PUBLIC_APP_URL || 'https://gm-miniapp.vercel.app'}/logo.png`,
      "requiredChains": ["eip155:8453"],
      "requiredCapabilities": [
        "actions.ready",
        "actions.composeCast",
        "wallet.getEthereumProvider"
      ]
    }
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}