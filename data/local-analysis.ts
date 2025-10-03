import type { FlowData } from "@/types/flow"

// Minimal type for output structure expected by /process-analysis consumer
type AnalysisOutput = {
  processAnalysis: {
    meta: {
      processTitle: string
      source: string
      analysisDate: string
    }
    summary: {
      metrics: {
        stepCount: number
        roleCount: number
        frictionCount: number
        handoffCount: number
        automatedCount: number
        estimatedDurationMinutes: number
        totalTrafficVolume: number
        avgErrorRate: number
      }
      roles: string[]
      tools: string[]
    }
    insights: Array<{
      id: string
      title: string
      description: string
      type: "delay" | "friction" | "opportunity" | "overlap"
      severity: "high" | "medium" | "low"
      icon: string
    }>
    aiOpportunities: Array<{
      id: string
      title: string
      description: string
      targetStepId: string
      targetStepTitle: string
      category:
        | "automation"
        | "generation"
        | "summarization"
        | "analysis"
        | "communication"
        | "decision"
        | "classification"
      impact: "high" | "medium" | "low"
      icon: string
    }>
  }
}

function toMinutes(value: number, unit: string | undefined) {
  if (!unit) return value
  const u = unit.toLowerCase()
  if (u.startsWith("day")) return value * 24 * 60
  if (u.startsWith("hour")) return value * 60
  return value // assume minutes
}

export function buildLocalProcessAnalysis(flow: FlowData): AnalysisOutput {
  const rolesSet = new Set<string>()
  const toolsSet = new Set<string>()
  let frictionCount = 0
  let automatedCount = 0
  let estimatedDurationMinutes = 0
  let totalVolume = 0
  let weightedErrorSum = 0

  for (const n of flow.nodes) {
    if (n.role) rolesSet.add(n.role)
    if (Array.isArray(n.tools)) {
      for (const t of n.tools) toolsSet.add(t)
    }
    if (Array.isArray(n.tags)) {
      if (n.tags.includes("friction")) frictionCount++
      if (n.tags.includes("automated")) automatedCount++
    }
    if (n.duration && typeof n.duration.value === "number") {
      estimatedDurationMinutes += toMinutes(n.duration.value, n.duration.unit)
    }
    if (Array.isArray(n.simulatedSources)) {
      for (const s of n.simulatedSources) {
        const v = Number(s.volume) || 0
        const e = Number(s.errorRate) || 0
        totalVolume += v
        weightedErrorSum += v * e
      }
    }
  }

  // Handoffs: count edges where role changes between source and target
  const nodeById = new Map(flow.nodes.map((n) => [n.id, n]))
  let handoffCount = 0
  for (const e of flow.edges) {
    const s = nodeById.get(e.source)
    const t = nodeById.get(e.target)
    if (s && t && s.role && t.role && s.role !== t.role) handoffCount++
  }

  const avgErrorRate = totalVolume > 0 ? weightedErrorSum / totalVolume : 0

  // Simple heuristics for insights/opportunities
  const bottlenecks = flow.nodes.filter(
    (n) =>
      Array.isArray(n.tags) &&
      n.tags.includes("friction") &&
      n.duration &&
      toMinutes(n.duration.value, n.duration.unit) >= 60,
  )
  const firstBottleneck = bottlenecks[0]
  const insights =
    firstBottleneck
      ? [
          {
            id: "insight-1",
            title: "Potential bottleneck detected",
            description: `“${firstBottleneck.title}” shows friction and relatively high duration.`,
            type: "friction" as const,
            severity: "medium" as const,
            icon: "alert-triangle",
          },
        ]
      : []

  const autoCandidate = flow.nodes.find((n) => !(n.tags || []).includes("automated"))
  const aiOpportunities =
    autoCandidate
      ? [
          {
            id: "op-1",
            title: "Automate repetitive step",
            description: `Introduce automation for “${autoCandidate.title}” to reduce cycle time.`,
            targetStepId: autoCandidate.id,
            targetStepTitle: autoCandidate.title,
            category: "automation" as const,
            impact: "medium" as const,
            icon: "zap",
          },
        ]
      : []

  const today = new Date().toISOString().slice(0, 10)

  return {
    processAnalysis: {
      meta: {
        processTitle: flow.title || "Untitled Process",
        source: "local",
        analysisDate: today,
      },
      summary: {
        metrics: {
          stepCount: flow.nodes.length,
          roleCount: rolesSet.size,
          frictionCount,
          handoffCount,
          automatedCount,
          estimatedDurationMinutes: Math.round(estimatedDurationMinutes),
          totalTrafficVolume: Math.round(totalVolume),
          avgErrorRate: Number(avgErrorRate.toFixed(4)),
        },
        roles: Array.from(rolesSet),
        tools: Array.from(toolsSet),
      },
      insights,
      aiOpportunities,
    },
  }
}
