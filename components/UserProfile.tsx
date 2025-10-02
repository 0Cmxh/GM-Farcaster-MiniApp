'use client'

import Image from 'next/image'

interface UserProfileProps {
  user: {
    fid: number
    username?: string
    displayName?: string
    pfpUrl?: string
  }
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="card max-w-sm mx-auto text-center">
      <div className="flex items-center justify-center mb-4">
        {user.pfpUrl ? (
          <Image
            src={user.pfpUrl}
            alt={user.displayName || user.username || 'User'}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {(user.displayName || user.username || 'U')[0].toUpperCase()}
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-1">
        {user.displayName || user.username || `User #${user.fid}`}
      </h2>

      {user.username && (
        <p className="text-gray-500 text-sm mb-2">@{user.username}</p>
      )}

      <p className="text-gray-400 text-xs">FID: {user.fid}</p>
    </div>
  )
}