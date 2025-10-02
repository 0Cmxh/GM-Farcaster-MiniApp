'use client'

import { useState, useEffect } from 'react'

export function TimeEmoji({ className = '' }: { className?: string }) {
  const [emoji, setEmoji] = useState('☀️')
  const [greeting, setGreeting] = useState('Good Morning')

  useEffect(() => {
    const updateEmoji = () => {
      const hour = new Date().getHours()

      if (hour >= 5 && hour < 12) {
        setEmoji('☀️')
        setGreeting('Good Morning')
      } else if (hour >= 12 && hour < 17) {
        setEmoji('🌤️')
        setGreeting('Good Afternoon')
      } else if (hour >= 17 && hour < 21) {
        setEmoji('🌅')
        setGreeting('Good Evening')
      } else {
        setEmoji('🌙')
        setGreeting('Good Night')
      }
    }

    updateEmoji()
    const interval = setInterval(updateEmoji, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`text-center ${className}`}>
      <div className="text-6xl mb-2 animate-pulse">
        {emoji}
      </div>
      <p className="text-sm text-gray-600 font-medium">
        {greeting}!
      </p>
    </div>
  )
}