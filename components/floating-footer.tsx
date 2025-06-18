"use client"

import { GitBranch } from "lucide-react"
import { useRouter } from "next/navigation"

export function FloatingFooter() {
  const router = useRouter()

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 shadow-sm z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div></div>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-4">Prefer to build visually?</span>
          <button
            onClick={() => router.push("/builder")}
            className="text-sm font-medium px-4 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center gap-2"
          >
            <GitBranch className="h-4 w-4" />
            Open Flow Builder
          </button>
        </div>
      </div>
    </footer>
  )
}
