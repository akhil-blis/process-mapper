"use client"

import { useEffect } from "react"

type AILoadingProps = {
  onComplete: () => void
  duration?: number
  title: string
}

export function AILoading({ onComplete }: AILoadingProps) {
  useEffect(() => {
    // Immediately call onComplete to skip loading screen
    onComplete()
  }, [onComplete])

  return null
}
