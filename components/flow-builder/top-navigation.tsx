"use client"

import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/shared/user-menu"

type TopNavigationProps = {
  title: string
  status?: string
  onOverrideClick?: () => void
}

export function TopNavigation({ title, status, onOverrideClick }: TopNavigationProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {status ? <span className="text-xs text-gray-500">• {status}</span> : null}
          </div>
          <div className="flex items-center gap-3">
            {onOverrideClick ? (
              <Button variant="outline" size="sm" onClick={onOverrideClick} aria-label="Override JSON">
                Override JSON
              </Button>
            ) : null}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
