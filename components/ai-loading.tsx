"use client"

import { useEffect } from "react"

type AILoadingProps = {
  onComplete: () => void
  duration?: number
  title: string
  subtitle?: string
}

export function AILoading({ onComplete }: AILoadingProps) {
  useEffect(() => {
    // Immediately call onComplete to skip loading screen entirely
    onComplete()
  }, [onComplete])

  // Return null to render nothing and avoid any visual delay
  return null
}
