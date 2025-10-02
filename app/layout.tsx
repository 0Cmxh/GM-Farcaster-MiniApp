import type { Metadata } from 'next'
import './globals.css'
import { MiniAppProvider } from './providers'
import { MobileNavigation } from '@/components/MobileNavigation'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gmfarcaster.vercel.app'

const gmEmbed = {
  version: "1",
  imageUrl: `${baseUrl}/logo.png`,
  button: {
    title: "☀️ Start GM",
    action: {
      type: "launch_miniapp",
      name: "GM",
      url: baseUrl,
      splashImageUrl: `${baseUrl}/logo.png`,
      splashBackgroundColor: "#FEF3E2"
    }
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'GM - Daily Streak Tracker',
  description: 'Track your daily GM streak on Base. Send free GM transactions and compete on the leaderboard!',
  openGraph: {
    title: 'GM - Daily Streak Tracker',
    description: 'Track your daily GM streak on Base. Send free GM transactions and compete on the leaderboard!',
    type: 'website',
    siteName: 'GM Tracker',
    images: [
      {
        url: '/logo.png',
        width: 1024,
        height: 1024,
        alt: 'GM Daily Streak Tracker Logo',
      }
    ],
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gmtracker',
    creator: '@gmtracker',
    title: 'GM - Daily Streak Tracker',
    description: 'Track your daily GM streak on Base. Send free GM transactions and compete on the leaderboard!',
    images: [
      {
        url: '/logo.png',
        alt: 'GM Daily Streak Tracker Logo',
      }
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'fc:miniapp': JSON.stringify(gmEmbed),
    'fc:frame': JSON.stringify(gmEmbed),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-orange-50 to-yellow-50 min-h-screen pb-20">
        <MiniAppProvider>
          {children}
          <MobileNavigation />
        </MiniAppProvider>
      </body>
    </html>
  )
}