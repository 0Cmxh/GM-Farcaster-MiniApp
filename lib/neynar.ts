// Neynar integration for Farcaster user data
// Note: This runs on the client side using public endpoints

export interface FarcasterUser {
  fid: number
  username?: string
  displayName?: string
  pfpUrl?: string
  bio?: string
  followerCount?: number
  followingCount?: number
  verifications?: string[]
}

// Simple client-side fetch for user data by FID
export async function fetchUserByFid(fid: number): Promise<FarcasterUser | null> {
  try {
    // Using Neynar's API with authentication
    const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY
    if (!apiKey) {
      console.error('NEYNAR_API_KEY not found in environment variables')
      return null
    }

    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        'Accept': 'application/json',
        'api_key': apiKey,
      }
    })

    if (!response.ok) {
      console.warn(`Failed to fetch user data for FID ${fid}:`, response.status, response.statusText)
      return null
    }

    const data = await response.json()

    if (data.users && data.users.length > 0) {
      const user = data.users[0]
      return {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        bio: user.profile?.bio?.text,
        followerCount: user.follower_count,
        followingCount: user.following_count,
        verifications: user.verifications || []
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching user from Neynar:', error)
    return null
  }
}

// Fetch user data by Ethereum address
export async function fetchUserByAddress(address: string): Promise<FarcasterUser | null> {
  try {
    // Using Neynar's API with authentication
    const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY
    if (!apiKey) {
      console.error('NEYNAR_API_KEY not found in environment variables')
      return null
    }

    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`, {
      headers: {
        'Accept': 'application/json',
        'api_key': apiKey,
      }
    })

    if (!response.ok) {
      console.warn(`Failed to fetch user data for address ${address}:`, response.status, response.statusText)
      return null
    }

    const data = await response.json()

    if (data && data[address] && data[address].length > 0) {
      const user = data[address][0]
      return {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        bio: user.profile?.bio?.text,
        followerCount: user.follower_count,
        followingCount: user.following_count,
        verifications: user.verifications || []
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching user by address from Neynar:', error)
    return null
  }
}

// Batch fetch multiple users by addresses for leaderboard
export async function fetchUsersByAddresses(addresses: string[]): Promise<Record<string, FarcasterUser | null>> {
  if (addresses.length === 0) return {}

  try {
    const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY
    if (!apiKey) {
      console.error('NEYNAR_API_KEY not found in environment variables')
      return {}
    }

    const addressesString = addresses.join(',')
    console.log(`Fetching batch data for ${addresses.length} addresses:`, addressesString)

    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${addressesString}`, {
      headers: {
        'Accept': 'application/json',
        'api_key': apiKey,
      }
    })

    if (!response.ok) {
      console.warn('Failed to fetch users by addresses batch:', response.status, response.statusText)
      return {}
    }

    const data = await response.json()
    console.log('Batch response from Neynar:', data)

    const result: Record<string, FarcasterUser | null> = {}

    // The API returns an object with addresses as keys (lowercase)
    for (const address of addresses) {
      // Try both original case and lowercase
      const addressLower = address.toLowerCase()
      const addressData = data[addressLower] || data[address]

      console.log(`Processing address ${address}:`, addressData)

      if (addressData && Array.isArray(addressData) && addressData.length > 0) {
        const user = addressData[0]
        console.log(`User data for ${address}:`, user)

        result[addressLower] = {
          fid: user.fid,
          username: user.username,
          displayName: user.display_name,
          pfpUrl: user.pfp_url,
          bio: user.profile?.bio?.text,
          followerCount: user.follower_count,
          followingCount: user.following_count,
          verifications: user.verifications || []
        }
        console.log(`✓ Processed Farcaster user for ${address}:`, result[addressLower])
      } else {
        console.log(`✗ No valid data for ${address}`)
        result[addressLower] = null
      }
    }

    console.log('Final batch results:', result)
    return result
  } catch (error) {
    console.error('Error fetching users by addresses from Neynar:', error)
    return {}
  }
}

// Batch fetch multiple users for leaderboard
export async function fetchUsersBatch(fids: number[]): Promise<FarcasterUser[]> {
  if (fids.length === 0) return []

  try {
    const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY
    if (!apiKey) {
      console.error('NEYNAR_API_KEY not found in environment variables')
      return []
    }

    const fidsString = fids.join(',')
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fidsString}`, {
      headers: {
        'Accept': 'application/json',
        'api_key': apiKey,
      }
    })

    if (!response.ok) {
      console.warn('Failed to fetch users batch:', response.status, response.statusText)
      return []
    }

    const data = await response.json()

    if (data.users) {
      return data.users.map((user: any) => ({
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        bio: user.profile?.bio?.text,
        followerCount: user.follower_count,
        followingCount: user.following_count,
        verifications: user.verifications || []
      }))
    }

    return []
  } catch (error) {
    console.error('Error fetching users batch from Neynar:', error)
    return []
  }
}

// Enhanced user profile with both contract and Farcaster data
export interface EnhancedUserProfile extends FarcasterUser {
  contractData?: {
    currentStreak: number
    longestStreak: number
    totalGMs: number
    lastGMTimestamp: number
    canGMToday: boolean
    isRegistered: boolean
  }
  walletAddress?: string
}