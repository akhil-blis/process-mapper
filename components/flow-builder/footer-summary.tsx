"use client"

import type { FlowData } from "@/types/flow"
import { ArrowLeft, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

type FooterSummaryProps = {
  flowData: FlowData
}

export function FooterSummary({ flowData }: FooterSummaryProps) {
  const router = useRouter()
  const stepCount = flowData.nodes.length
  const roleCount = new Set(flowData.nodes.map((n) => n.role).filter(Boolean)).size
  const frictionCount = flowData.nodes.filter((n) => n.tags?.includes("friction")).length

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-violet-600 border-t border-violet-700 py-4 shadow-lg z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-violet-100 hover:text-white hover:bg-violet-700 transition-colors flex items-center gap-2 px-3 py-2 rounded-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
        <div className="flex items-center gap-4">
          <div className="text-xs text-violet-200 font-mono hidden sm:block">
            {stepCount} steps • {roleCount} roles • {frictionCount} friction points
          </div>
          <button
            onClick={() => router.push("/analysis")}
            className="text-sm font-medium px-4 py-2 rounded-md bg-white text-violet-600 hover:bg-violet-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            Analyse Process Flow
          </button>
        </div>
      </div>
    </footer>
  )
}
