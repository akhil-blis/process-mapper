"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Code } from 'lucide-react'
import { Logo } from "@/components/logo"

type TopNavigationProps = {
  title?: string
  status?: string
  statusIcon?: React.ReactNode
  onOverrideClick?: () => void
}

export function TopNavigation({
  title = "Flow Builder",
  status,
  statusIcon,
  onOverrideClick,
}: TopNavigationProps) {
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-default z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Restored shared layout structure */}
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + App name (clickable to Home) */}
          <div className="flex items-center">
            <button
              onClick={() => router.push("/")}
              className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity"
              aria-label="Go to home"
            >
              <Logo />
              <span className="ml-2.5 font-semibold text-secondary text-lg">Process Mapper</span>
            </button>
          </div>

          {/* Center: Title */}
          <div className="hidden md:block">
            <h2 className="text-lg font-medium text-secondary">{title}</h2>
          </div>

          {/* Right: Controls (Override, status, avatar) */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOverrideClick}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted hover:text-foreground hover:bg-subtle rounded-md transition-colors border border-default"
              aria-label="Override Data"
            >
              <Code className="h-4 w-4" />
              Override Data
            </button>
            <div className="flex items-center gap-2 text-sm text-success-600">
              <div className="w-2 h-2 bg-success-600 rounded-full animate-pulse" aria-hidden="true"></div>
              <span>Flow ready</span>
            </div>
            <div
              className="w-8 h-8 bg-brand-50 rounded-full flex items-center justify-center text-brand font-semibold text-xs"
              role="button"
              aria-label="User menu"
              aria-haspopup="menu"
              tabIndex={0}
            >
              JD
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
