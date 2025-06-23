"use client"

import { useState, useEffect } from "react"
import { Sparkle, GitBranch } from "lucide-react"

type AILoadingProps = {
  onComplete: () => void
  duration?: number
  title: string
}

export function AILoading({ onComplete, duration = 750, title }: AILoadingProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [progress, setProgress] = useState(0)

  const thinkingMessages = [
    "Analyzing your process flow...",
    "Identifying optimization opportunities...",
    "Mapping workflow dependencies...",
    "Generating AI-powered insights...",
    "Structuring recommendations...",
    "Finalizing your analysis...",
  ]

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 100 / (duration / 50)
      })
    }, 50)

    // Message cycling
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % thinkingMessages.length)
    }, 500)

    // Complete loading
    const completeTimer = setTimeout(() => {
      onComplete()
    }, duration)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
      clearTimeout(completeTimer)
    }
  }, [duration, onComplete, thinkingMessages.length])

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        {/* Animated Flowchart Icon */}
        <div className="relative mb-12">
          <div className="w-20 h-20 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <GitBranch className="h-10 w-10 text-violet-600" />
          </div>

          {/* Floating sparkle icons */}
          <div
            className="absolute -top-2 -left-3 w-5 h-5 text-violet-400 animate-bounce"
            style={{ animationDelay: "0s" }}
          >
            <Sparkle className="w-5 h-5" />
          </div>
          <div
            className="absolute -top-1 -right-4 w-4 h-4 text-blue-400 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          >
            <Sparkle className="w-4 h-4" />
          </div>
          <div
            className="absolute -bottom-2 -left-4 w-4 h-4 text-green-400 animate-bounce"
            style={{ animationDelay: "1s" }}
          >
            <Sparkle className="w-4 h-4" />
          </div>
          <div
            className="absolute -bottom-1 -right-3 w-5 h-5 text-yellow-400 animate-bounce"
            style={{ animationDelay: "1.5s" }}
          >
            <Sparkle className="w-5 h-5" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-semibold text-gray-900 mb-10">{title}</h2>

        {/* Thinking Messages */}
        <div className="mb-10 h-6">
          <p className="text-base text-violet-600 font-medium animate-pulse">{thinkingMessages[currentMessage]}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Text */}
        <p className="text-sm text-gray-500 mb-8">{Math.round(progress)}% complete</p>
      </div>
    </div>
  )
}
