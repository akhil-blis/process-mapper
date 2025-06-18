export type ElementType = "info" | "action" | "input"

export type PrototypeElement = {
  id: string
  type: ElementType
  label: string
  screenId: string
  position: { x: number; y: number }
}

export type PrototypeScreen = {
  id: string
  title: string
  position: { x: number; y: number }
  elements: PrototypeElement[]
}

export type PrototypeConnection = {
  id: string
  fromElementId: string
  toScreenId: string
}

export type PrototypePlan = {
  screens: PrototypeScreen[]
  connections: PrototypeConnection[]
}

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
