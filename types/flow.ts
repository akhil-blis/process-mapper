export type NodeType = "step" | "branch" | "note" | "subprocess" | "start" | "end"

export type DataSource = {
  label: string
  type: "api" | "event_stream" | "internal_tool"
  volume: number // per month
  errorRate: number // 0-1 (e.g., 0.14 = 14%)
}

export type FlowNode = {
  id: string
  type: NodeType
  title: string
  role?: string
  tools?: string[]
  notes?: string
  position: { row: number; column: number }
  tags: Array<"friction" | "handoff" | "automated" | "trigger">
  duration?: {
    value: number
    unit: "minutes" | "hours" | "days" | "weeks"
  }
  attachments?: Array<{
    name: string
    type: "file" | "link"
    url?: string
  }>
  avgTimeSec?: number // Total average time to complete this step in seconds
  simulatedSources?: DataSource[]
}

export type FlowEdge = {
  id: string
  source: string
  target: string
  label?: string
}

export type FlowData = {
  nodes: FlowNode[]
  edges: FlowEdge[]
  title: string
}
