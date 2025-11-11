import { NextResponse } from 'next/server'
import { farcasterManifest } from '@/config/farcaster-manifest'

export async function GET() {
  return NextResponse.json(farcasterManifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
