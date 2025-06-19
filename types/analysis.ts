import type { FlowData } from "./flow"
import type { PrototypePlan } from "./prototype"

export type ProcessInsight = {
  id: string
  title: string
  description: string
  type: "delay" | "overlap" | "friction" | "opportunity"
  severity: "low" | "medium" | "high"
}

export type AIOpportunity = {
  id: string
  title: string
  description: string
  stepId: string
  stepTitle: string
  category: "automation" | "summarization" | "generation" | "analysis"
  impact: "low" | "medium" | "high"
}

export type ProcessAnalysisData = {
  processFlow: FlowData
  analysis: {
    summary: {
      metrics: {
        stepCount: number
        roleCount: number
        frictionCount: number
        handoffCount: number
        automatedCount: number
        totalDurationMinutes: number
      }
      roles: string[]
      tools: string[]
      insights: ProcessInsight[]
    }
    aiOpportunities: AIOpportunity[]
  }
  prototypePlan: PrototypePlan
}
