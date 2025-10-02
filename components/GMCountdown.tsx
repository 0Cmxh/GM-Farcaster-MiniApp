'use client'

import { useState, useEffect } from 'react'
import { getTimeUntilMidnight, getTimeUntilNextGM } from '@/lib/gm-utils'

interface CountdownProps {
  className?: string
  lastGMTimestamp?: number // Optional: if provided, countdown from last GM + 24h instead of midnight
}

export function GMCountdown({ className = '', lastGMTimestamp }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  })

  useEffect(() => {
    const updateCountdown = () => {
      // Use either timestamp-based countdown or midnight countdown
      const total = lastGMTimestamp
        ? getTimeUntilNextGM(lastGMTimestamp)
        : getTimeUntilMidnight()

      const hours = Math.floor(total / (1000 * 60 * 60))
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((total % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds, total })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [lastGMTimestamp])

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  // Calculate progress percentage for circular progress
  const totalSecondsInPeriod = 24 * 60 * 60 // 24 hours in seconds
  const secondsRemaining = Math.floor(timeLeft.total / 1000)
  const progressPercentage = ((totalSecondsInPeriod - secondsRemaining) / totalSecondsInPeriod) * 100

  return (
    <div className={`text-center ${className}`}>
      <div className="relative w-32 h-32 mx-auto mb-4">
        {/* Background circle */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
            className="text-gradient transition-all duration-1000 ease-out"
            style={{
              background: 'linear-gradient(45deg, #f97316, #eab308)',
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Next GM</div>
            <div className="text-lg font-bold text-orange-600">
              {timeLeft.hours > 0 ? (
                `${formatNumber(timeLeft.hours)}:${formatNumber(timeLeft.minutes)}`
              ) : (
                `${formatNumber(timeLeft.minutes)}:${formatNumber(timeLeft.seconds)}`
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Digital countdown */}
      <div className="flex justify-center space-x-4 mb-4">
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-3 min-w-[60px]">
          <div className="text-2xl font-bold text-orange-600 font-mono">
            {formatNumber(timeLeft.hours)}
          </div>
          <div className="text-xs text-gray-500">Hours</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-3 min-w-[60px]">
          <div className="text-2xl font-bold text-orange-600 font-mono">
            {formatNumber(timeLeft.minutes)}
          </div>
          <div className="text-xs text-gray-500">Minutes</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-3 min-w-[60px]">
          <div className="text-2xl font-bold text-orange-600 font-mono animate-pulse">
            {formatNumber(timeLeft.seconds)}
          </div>
          <div className="text-xs text-gray-500">Seconds</div>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Until next GM opportunity ⏰
      </p>
    </div>
  )
}