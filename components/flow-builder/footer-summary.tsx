"use client"

import type { FlowData } from "@/types/flow"
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const DEFAULT_PROCESS_ANALYSIS = {
  processAnalysis: {
    meta: {
      processTitle: "Hiring Process - Mid-Level Role",
      source: "Hiring Process Mid Level Role Aug 8 2025.json",
      analysisDate: "2025-08-08",
    },
    summary: {
      metrics: {
        stepCount: 15,
        roleCount: 12,
        frictionCount: 3,
        handoffCount: 4,
        automatedCount: 1,
        estimatedDurationMinutes: 10320,
        totalTrafficVolume: 34300,
        avgErrorRate: 0.093,
      },
      roles: ["Department Lead", "Hiring Manager", "Recruiter", "Team Leads", "Hiring Committee", "Candidate"],
      tools: [
        "Workday",
        "Google Docs",
        "LinkedIn",
        "Company Site",
        "ATS",
        "Email",
        "Zoom",
        "Calendly",
        "Google Calendar",
        "Notion",
        "Slack",
        "DocuSign",
      ],
    },
    insights: [
      {
        id: "insight-1",
        title: "High-volume review bottleneck",
        description:
          "Inbound Applications Review has both a long duration (2 days) and a friction tag, combined with a high volume of 18,200 applications and above-average error rates (12% and 8%). This step poses a major processing delay risk.",
        type: "friction",
        severity: "high",
        icon: "alert-triangle",
      },
      {
        id: "insight-2",
        title: "Multiple role handoffs",
        description:
          "The process involves at least 4 role handoffs, increasing coordination overhead and the potential for communication gaps.",
        type: "friction",
        severity: "medium",
        icon: "shuffle",
      },
      {
        id: "insight-3",
        title: "High error rate in scheduling automation",
        description:
          "The Schedule Interview Loop step is automated but experiences a 15% error rate, indicating integration or usability issues with calendar tools.",
        type: "delay",
        severity: "medium",
        icon: "alert-triangle",
      },
      {
        id: "insight-4",
        title: "Loop in rejection path",
        description:
          "Rejected candidates are routed back to Inbound Applications Review, creating a potential rework loop that can waste resources if not managed with clear criteria.",
        type: "overlap",
        severity: "low",
        icon: "grid",
      },
    ],
    aiOpportunities: [
      {
        id: "ai-opp-1",
        title: "Auto-score candidates",
        description:
          "Deploy AI to pre-screen and rank applications in the Inbound Applications Review step, reducing manual workload and mitigating delays caused by high volume and error-prone manual review.",
        targetStepId: "step-3a",
        targetStepTitle: "Inbound Applications Review",
        category: "classification",
        impact: "high",
        icon: "layers",
      },
      {
        id: "ai-opp-2",
        title: "Intelligent interview scheduling",
        description:
          "Use AI-powered scheduling assistants that adapt to panel availability, time zones, and candidate preferences to lower the 15% error rate in the Schedule Interview Loop step.",
        targetStepId: "step-5",
        targetStepTitle: "Schedule Interview Loop",
        category: "automation",
        impact: "medium",
        icon: "zap",
      },
      {
        id: "ai-opp-3",
        title: "Interview feedback summarization",
        description:
          "Implement AI tools to consolidate and summarize panel feedback in Interview Panel Evaluation, accelerating decision-making and reducing reliance on manual collation.",
        targetStepId: "step-6",
        targetStepTitle: "Interview Panel Evaluation",
        category: "summarization",
        impact: "medium",
        icon: "file-text",
      },
      {
        id: "ai-opp-4",
        title: "Candidate rejection communication automation",
        description:
          "Introduce AI-generated personalized rejection messages in Candidate Rejected step to streamline communications and maintain a positive candidate experience.",
        targetStepId: "step-8a",
        targetStepTitle: "Candidate Rejected",
        category: "communication",
        impact: "low",
        icon: "mail",
      },
    ],
  },
} as const

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
        // Local mode: use provided default JSON without any API call
        sessionStorage.setItem("processAnalysisData", JSON.stringify(DEFAULT_PROCESS_ANALYSIS))
      }

      router.push("/process-analysis")
    } catch (error) {
      console.error("Error analyzing process:", error)
      // Navigate to show the page (it has its own fallback)
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
            <>
              <Sparkles className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Analyzing..." : "Analyse Process Flow"}
            </>
          </button>
        </div>
      </div>
    </footer>
  )
}
