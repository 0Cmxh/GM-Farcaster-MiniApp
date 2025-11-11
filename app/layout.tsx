import type { Metadata } from 'next'
import './globals.css'
import { MiniAppProvider } from './providers'
import { MobileNavigation } from '@/components/MobileNavigation'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gmfarcaster.vercel.app'

const gmEmbed = {
  version: "1",
  imageUrl: `${baseUrl}/api/embed-image`, // 3:2 aspect ratio (1200x800)
  button: {
    title: "GM",
    action: {
      type: "launch_miniapp",
      name: "GM Farcaster",
      url: baseUrl,
      splashImageUrl: `${baseUrl}/logo.png`,
      splashBackgroundColor: "#5c44d8"
    }
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'GM Farcaster',
  description: 'Post a GM every 24 hours to build streaks on Farcaster. Simple daily free interaction that keeps your presence active and tracks consistency.',
  openGraph: {
    title: 'GM Farcaster',
    description: 'Post a GM every 24 hours and keep your streak on Farcaster.',
    type: 'website',
    siteName: 'GM Farcaster',
    images: [
      {
        url: '/api/og-image',
        width: 1200,
        height: 630,
        alt: 'GM Farcaster',
      }
    ],
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gmfarcaster',
    creator: '@gmfarcaster',
    title: 'GM Farcaster',
    description: 'Post a GM every 24 hours and keep your streak on Farcaster.',
    images: [
      {
        url: '/api/og-image',
        alt: 'GM Farcaster',
      }
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="fc:miniapp" content={JSON.stringify(gmEmbed)} />
        <meta name="fc:frame" content={JSON.stringify(gmEmbed)} />
      </head>
      <body className="bg-gradient-to-br from-orange-50 to-yellow-50 min-h-screen pb-20">
        <MiniAppProvider>
          {children}
          <MobileNavigation />
        </MiniAppProvider>
      </body>
    </html>
  )
}