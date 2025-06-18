export type NodeType = "step" | "branch" | "note" | "subprocess" | "start" | "end"

export type FlowNode = {
  id: string
  type: NodeType
  title: string
  role?: string
  tools?: string[]
  notes?: string
  position: { x: number; y: number }
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
