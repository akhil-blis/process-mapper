"use client"

import type React from "react"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"

type TopNavigationProps = {
  title?: string
  status?: string
  statusIcon?: React.ReactNode
}

export function TopNavigation({
  title = "Flow Builder",
  status = "Auto-saved",
  statusIcon = <Check className="h-4 w-4" />,
}: TopNavigationProps) {
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => router.push("/")}
              className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity"
            >
              <Logo />
              <span className="ml-2.5 font-semibold text-gray-800 text-lg">Process Mapper</span>
            </button>
          </div>
          <div className="hidden md:block">
            <h2 className="text-lg font-medium text-gray-700">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {statusIcon}
              <span>{status}</span>
            </div>
            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-xs">
              JD
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
