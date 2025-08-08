"use client"

import type { FlowData } from "@/types/flow"
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { buildLocalProcessAnalysis } from "@/data/local-analysis"

type FooterSummaryProps = {
  flowData: FlowData
}

export function FooterSummary({ flowData }: FooterSummaryProps) {
  const router = useRouter()
  const stepCount = flowData.nodes.length
  const roleCount = new Set(flowData.nodes.map((n) => n.role).filter(Boolean)).size
  const frictionCount = flowData.nodes.filter((n) => n.tags?.includes("friction")).length
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [apiDataEnabled, setApiDataEnabled] = useState(false)

  useEffect(() => {
    // Initialize from localStorage
    try {
      setApiDataEnabled(localStorage.getItem("process-mapper:api-data-enabled") === "true")
    } catch {
      // ignore
    }

    // Stay in sync with global toggle changes
    const onToggle = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && typeof detail.enabled === "boolean") {
        setApiDataEnabled(detail.enabled)
      }
    }
    window.addEventListener("pm:api-data-changed", onToggle as EventListener)
    return () => window.removeEventListener("pm:api-data-changed", onToggle as EventListener)
  }, [])

  const handleAnalyzeProcess = async () => {
    setIsAnalyzing(true)

    try {
      const enabled =
        typeof window !== "undefined" &&
        localStorage.getItem("process-mapper:api-data-enabled") === "true"

      if (enabled) {
        // API mode: call server to analyze
        const response = await fetch("/api/analyze-process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ flow: flowData }),
        })

        if (!response.ok) {
          throw new Error("Analysis failed")
        }

        const analysisData = await response.json()
        sessionStorage.setItem("processAnalysisData", JSON.stringify(analysisData))
      } else {
        // Local mode: build deterministic analysis from current flow
        const localAnalysis = buildLocalProcessAnalysis(flowData)
        sessionStorage.setItem("processAnalysisData", JSON.stringify(localAnalysis))
      }

      router.push("/process-analysis")
    } catch (error) {
      console.error("Error analyzing process:", error)
      // Navigate to show whatever default the page can render
      router.push("/process-analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

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
            onClick={handleAnalyzeProcess}
            disabled={isAnalyzing}
            className="text-sm font-medium px-4 py-2 rounded-md bg-white text-violet-600 hover:bg-violet-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "Analyzing..." : apiDataEnabled ? "Analyse Process Flow" : "Analyse (Local) Process Flow"}
          </button>
        </div>
      </div>
    </footer>
  )
}
