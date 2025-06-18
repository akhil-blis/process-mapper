"use client"

import type { FlowData } from "@/types/flow"
import type { ProcessInsight } from "@/types/prototype"
import { Clock, Users, AlertTriangle, ArrowRight, Zap, Play } from "lucide-react"

type ProcessSummaryProps = {
  flowData: FlowData
}

export function ProcessSummary({ flowData }: ProcessSummaryProps) {
  const stepCount = flowData.nodes.length
  const roleCount = new Set(flowData.nodes.map((n) => n.role).filter(Boolean)).size
  const frictionCount = flowData.nodes.filter((n) => n.tags?.includes("friction")).length
  const handoffCount = flowData.nodes.filter((n) => n.tags?.includes("handoff")).length
  const automatedCount = flowData.nodes.filter((n) => n.tags?.includes("automated")).length

  // Calculate total estimated time
  const totalMinutes = flowData.nodes.reduce((total, node) => {
    if (!node.duration) return total
    const { value, unit } = node.duration
    switch (unit) {
      case "minutes":
        return total + value
      case "hours":
        return total + value * 60
      case "days":
        return total + value * 60 * 8 // 8 hour work day
      case "weeks":
        return total + value * 60 * 8 * 5 // 5 day work week
      default:
        return total
    }
  }, 0)

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    if (minutes < 480) return `${Math.round((minutes / 60) * 10) / 10}h`
    if (minutes < 2400) return `${Math.round((minutes / 480) * 10) / 10}d`
    return `${Math.round((minutes / 2400) * 10) / 10}w`
  }

  // Get all unique tools
  const allTools = new Set(flowData.nodes.flatMap((n) => n.tools || []))

  // Sample insights - in a real app these would be AI-generated
  const insights: ProcessInsight[] = [
    {
      id: "1",
      title: "Bottleneck Detected",
      description: "Step 4 (Screen Candidates) takes 4 hours and has friction tags - this is your main bottleneck",
      type: "delay",
      severity: "high",
    },
    {
      id: "2",
      title: "Multiple Handoffs",
      description: `${handoffCount} handoff points between roles may cause delays and miscommunication`,
      type: "friction",
      severity: "medium",
    },
    {
      id: "3",
      title: "Automation Opportunity",
      description: `Only ${automatedCount} of ${stepCount} steps are automated - significant efficiency gains possible`,
      type: "opportunity",
      severity: "medium",
    },
    {
      id: "4",
      title: "Tool Fragmentation",
      description: `${allTools.size} different tools used across the process - consider consolidation`,
      type: "overlap",
      severity: "low",
    },
  ]

  const severityColors = {
    high: "bg-red-50 border-red-200 text-red-700",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
    low: "bg-blue-50 border-blue-200 text-blue-700",
  }

  const typeIcons = {
    delay: <Clock className="h-4 w-4" />,
    overlap: <ArrowRight className="h-4 w-4" />,
    friction: <AlertTriangle className="h-4 w-4" />,
    opportunity: <Zap className="h-4 w-4" />,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Process Summary</h2>
        <p className="text-gray-600 mb-6">Overview of your {flowData.title} process structure and key metrics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stepCount}</div>
              <div className="text-sm text-gray-500">Steps</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{roleCount}</div>
              <div className="text-sm text-gray-500">Roles</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{frictionCount}</div>
              <div className="text-sm text-gray-500">Friction Points</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatDuration(totalMinutes)}</div>
              <div className="text-sm text-gray-500">Est. Duration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Roles Involved</h3>
          <div className="space-y-2">
            {Array.from(new Set(flowData.nodes.map((n) => n.role).filter(Boolean))).map((role) => (
              <div key={role} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span className="text-sm text-gray-700">{role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tools & Systems</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(allTools)
              .slice(0, 8)
              .map((tool) => (
                <span key={tool} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                  {tool}
                </span>
              ))}
            {allTools.size > 8 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-sm">+{allTools.size - 8} more</span>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">AI-Generated Insights</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <div key={insight.id} className={`rounded-lg border p-4 ${severityColors[insight.severity]}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{typeIcons[insight.type]}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm opacity-90">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
