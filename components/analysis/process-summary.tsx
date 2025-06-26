"use client"

import type { FlowData } from "@/types/flow"
import type { ProcessInsight } from "@/types/prototype"
import { Clock, Users, AlertTriangle, ArrowRight, Zap, Play, TrendingUp, AlertCircle } from "lucide-react"

type ProcessSummaryProps = {
  flowData: FlowData
}

export function ProcessSummary({ flowData }: ProcessSummaryProps) {
  const stepCount = flowData.nodes.length
  const roleCount = new Set(flowData.nodes.map((n) => n.role).filter(Boolean)).size
  const frictionCount = flowData.nodes.filter((n) => n.tags?.includes("friction")).length
  const handoffCount = flowData.nodes.filter((n) => n.tags?.includes("handoff")).length
  const automatedCount = flowData.nodes.filter((n) => n.tags?.includes("automated")).length

  // Calculate total volume from all connected data sources
  const totalVolume = flowData.nodes.reduce((total, node) => {
    return total + (node.simulatedSources?.reduce((nodeTotal, source) => nodeTotal + source.volume, 0) || 0)
  }, 0)

  // Calculate weighted average error rate or use highest error rate
  const allSources = flowData.nodes.flatMap((node) => node.simulatedSources || [])
  const weightedErrorRate =
    allSources.length > 0
      ? allSources.reduce((sum, source) => sum + source.errorRate * source.volume, 0) / totalVolume
      : 0
  const maxErrorRate = allSources.reduce((max, source) => Math.max(max, source.errorRate), 0)

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

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
    return volume.toString()
  }

  // Get all unique tools
  const allTools = new Set(flowData.nodes.flatMap((n) => n.tools || []))

  // Enhanced insights with data source information
  const insights: ProcessInsight[] = [
    {
      id: "1",
      title: "High-Volume Bottleneck",
      description: `Step "Inbound Applications Review" processes ${
        flowData.nodes
          .find((n) => n.id === "step-3a")
          ?.simulatedSources?.reduce((sum, s) => sum + s.volume, 0)
          ?.toLocaleString() || "N/A"
      }/month with ${((flowData.nodes.find((n) => n.id === "step-3a")?.simulatedSources?.reduce((max, s) => Math.max(max, s.errorRate), 0) || 0) * 100).toFixed(1)}% error rate - this is your main bottleneck`,
      type: "delay",
      severity: "high",
    },
    {
      id: "2",
      title: "Data Quality Issues",
      description: `${(maxErrorRate * 100).toFixed(1)}% peak error rate across data sources may cause delays and rework`,
      type: "friction",
      severity: maxErrorRate > 0.1 ? "high" : "medium",
    },
    {
      id: "3",
      title: "Volume Processing Gap",
      description: `${formatVolume(totalVolume)}/month total volume with only ${automatedCount} of ${stepCount} steps automated`,
      type: "opportunity",
      severity: "medium",
    },
    {
      id: "4",
      title: "Integration Complexity",
      description: `${allSources.length} data sources across ${allTools.size} different tools - consolidation opportunity`,
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

      {/* Metrics Grid - Updated to 6 metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatVolume(totalVolume)}</div>
              <div className="text-sm text-gray-500">Total Volume/mo</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{(maxErrorRate * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-500">Peak Error Rate</div>
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
          <h3 className="font-semibold text-gray-900 mb-4">Data Sources</h3>
          <div className="space-y-2">
            {allSources.slice(0, 6).map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-700 truncate">{source.label}</span>
                </div>
                <span className="text-xs text-gray-500">{formatVolume(source.volume)}/mo</span>
              </div>
            ))}
            {allSources.length > 6 && (
              <div className="text-xs text-gray-500 pl-4">+{allSources.length - 6} more sources</div>
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
