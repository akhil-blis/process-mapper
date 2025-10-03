"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Code, Clock, Users, AlertTriangle, Play, Zap, Shuffle, Grid, Layers, FileText, ClipboardList, FilePlus, Terminal, Mail, Download, Database, AlertCircle, Edit3, Brain, MessageSquare, BarChart3, Settings, Trash2 } from 'lucide-react'
import { Logo } from "@/components/logo"
import { ProcessAnalysisOverrideModal } from "@/components/analysis/process-analysis-override-modal"
import { AddOpportunityModal } from "@/components/analysis/add-opportunity-modal"

// Updated types for the new JSON structure
type ProcessAnalysisMetrics = {
  stepCount: number
  roleCount: number
  frictionCount: number
  handoffCount: number
  automatedCount: number
  estimatedDurationMinutes: number
  // Optional extended metrics supported by the new default JSON
  totalTrafficVolume?: number
  avgErrorRate?: number
}

type ProcessAnalysisData = {
  processAnalysis: {
    meta: {
      processTitle: string
      source: string
      analysisDate: string
    }
    summary: {
      metrics: ProcessAnalysisMetrics
      roles: string[]
      tools: string[]
    }
    insights: Array<{
      id: string
      title: string
      description: string
      type: "delay" | "friction" | "overlap" | "opportunity"
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
        | "classification"
        | "decision"
        | "summarization"
        | "analysis"
        | "communication"
        | "generation"
        | "automation"
      impact: "high" | "medium" | "low"
      icon: string
      dataSource?: {
        hasDataSource: boolean
        traffic?: string
        volume?: string
      }
    }>
  }
}

const DEFAULT_PROCESS_ANALYSIS: ProcessAnalysisData = {
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
}

export default function ProcessAnalysisPage() {
  // Remove loading state entirely - just render immediately
  const router = useRouter()
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)
  const [isAddOpportunityModalOpen, setIsAddOpportunityModalOpen] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState<any>(null)
  const [analysisData, setAnalysisData] = useState<ProcessAnalysisData>(() => {
    if (typeof window !== "undefined") {
      const storedData = sessionStorage.getItem("processAnalysisData")
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          // Clear the stored data after using it (optional; keep if desired)
          sessionStorage.removeItem("processAnalysisData")
          return parsedData
        } catch (error) {
          console.error("Error parsing stored analysis data:", error)
        }
      }
    }
    // Fallback to the new default JSON provided by the user
    return DEFAULT_PROCESS_ANALYSIS
  })

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    if (minutes < 480) return `${Math.round((minutes / 60) * 10) / 10}h`
    if (minutes < 2400) return `${Math.round((minutes / 480) * 10) / 10}d`
    return `${Math.round((minutes / 2400) * 10) / 10}w`
  }

  const severityColors = {
    high: "bg-red-50 border-red-200 text-red-700",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
    low: "bg-blue-50 border-blue-200 text-blue-700",
  }

  const impactColors = {
    high: "bg-green-100 border-green-200",
    medium: "bg-yellow-100 border-yellow-200",
    low: "bg-red-100 border-red-200",
  }

  const getIconColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleProcessAnalysisOverride = (newData: ProcessAnalysisData) => {
    setAnalysisData(newData)
    console.log("Process analysis data updated:", newData)
  }

  const handleAddOpportunity = (newOpportunity: any) => {
    setAnalysisData((prevData) => ({
      ...prevData,
      processAnalysis: {
        ...prevData.processAnalysis,
        aiOpportunities: [...prevData.processAnalysis.aiOpportunities, newOpportunity],
      },
    }))
    console.log("New AI opportunity added:", newOpportunity)
  }

  const handleEditOpportunity = (updatedOpportunity: any) => {
    setAnalysisData((prevData) => ({
      ...prevData,
      processAnalysis: {
        ...prevData.processAnalysis,
        aiOpportunities: prevData.processAnalysis.aiOpportunities.map((opp) =>
          opp.id === updatedOpportunity.id ? updatedOpportunity : opp,
        ),
      },
    }))
    console.log("AI opportunity updated:", updatedOpportunity)
  }

  const handleDeleteOpportunity = (opportunityId: string) => {
    if (confirm("Are you sure you want to delete this AI opportunity?")) {
      setAnalysisData((prevData) => ({
        ...prevData,
        processAnalysis: {
          ...prevData.processAnalysis,
          aiOpportunities: prevData.processAnalysis.aiOpportunities.filter((opp) => opp.id !== opportunityId),
        },
      }))
      console.log("AI opportunity deleted:", opportunityId)
    }
  }

  const openEditModal = (opportunity: any) => {
    setEditingOpportunity(opportunity)
    setIsAddOpportunityModalOpen(true)
  }

  const closeOpportunityModal = () => {
    setIsAddOpportunityModalOpen(false)
    setEditingOpportunity(null)
  }

  const getIconComponent = (category: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      classification: Layers,
      decision: Brain,
      summarization: FileText,
      analysis: BarChart3,
      communication: MessageSquare,
      generation: FilePlus,
      automation: Settings,
      // Fallback for legacy icon names
      "alert-triangle": AlertTriangle,
      shuffle: Shuffle,
      zap: Zap,
      grid: Grid,
      layers: Layers,
      "file-text": FileText,
      "clipboard-list": ClipboardList,
      "file-plus": FilePlus,
      terminal: Terminal,
      mail: Mail,
    }

    const IconComponent = iconMap[category] || AlertTriangle
    return <IconComponent className="h-4 w-4" />
  }

  const handleExportOpportunity = (opportunity: any) => {
    // Compile context information for the specific opportunity
    const exportData = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportType: "ai-opportunity-context",
        opportunityId: opportunity.id,
        processTitle: meta.processTitle,
      },
      processContext: {
        meta: {
          processTitle: meta.processTitle,
          source: meta.source,
          analysisDate: meta.analysisDate,
        },
        summary: {
          metrics: summary.metrics,
          roles: summary.roles,
          tools: summary.tools,
        },
        relevantInsights: insights.filter(
          (insight) =>
            // Include insights that might be relevant to this opportunity
            insight.type === "delay" || insight.type === "friction" || insight.severity === "high",
        ),
      },
      aiOpportunity: {
        id: opportunity.id,
        title: opportunity.title,
        description: opportunity.description,
        targetStepId: opportunity.targetStepId,
        targetStepTitle: opportunity.targetStepTitle,
        category: opportunity.category,
        impact: opportunity.impact,
        icon: opportunity.icon,
      },
      implementationContext: {
        estimatedTimeReduction: opportunity.impact === "high" ? "70%" : opportunity.impact === "medium" ? "40%" : "20%",
        affectedRoles: summary.roles.filter(
          (role) =>
            // Filter roles that might be affected by this opportunity
            role.toLowerCase().includes("hr") ||
            role.toLowerCase().includes("manager") ||
            role.toLowerCase().includes("specialist"),
        ),
        relevantTools: summary.tools.filter((tool) =>
          // Filter tools that might be relevant to this opportunity
          opportunity.category === "automation"
            ? true
            : opportunity.category === "analysis"
              ? ["ATS", "HRIS", "LinkedIn", "Indeed"].includes(tool)
              : opportunity.category === "generation"
                ? ["Email", "DocuSign", "Google Workspace"].includes(tool)
                : true,
        ),
      },
    }

    // Create and download the JSON file
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `${opportunity.id}-context-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up the URL
    URL.revokeObjectURL(url)

    console.log(`Exported context for opportunity: ${opportunity.title}`)
  }

  const { processAnalysis } = analysisData
  const { meta, summary, insights, aiOpportunities } = processAnalysis

  // Check if any opportunities have data sources
  const hasDataSources = aiOpportunities.some((opportunity) => opportunity.dataSource?.hasDataSource)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity"
              >
                <Logo />
                <span className="ml-2.5 font-semibold text-gray-800 text-lg">Process Mapper</span>
              </button>
            </div>
            <div className="hidden md:block">
              <h2 className="text-lg font-medium text-gray-700">Process Analysis</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsOverrideModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
              >
                <Code className="h-4 w-4" />
                Override Data
              </button>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Analysis complete</span>
              </div>
              <div className="ml-4 w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-xs">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Process Summary Section */}
          <section aria-labelledby="process-summary-title">
            <div className="bg-white shadow-sm rounded-lg p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Process Summary</h2>
                  <p className="text-gray-600 mb-6">
                    Overview of your {meta.processTitle} process structure and key metrics.
                  </p>
                </div>

                {/* Metrics Grid */}
                <div
                  className={`grid ${hasDataSources ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"} gap-4 mb-8`}
                >
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Play className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{summary.metrics.stepCount}</div>
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
                        <div className="text-2xl font-bold text-gray-900">{summary.metrics.roleCount}</div>
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
                        <div className="text-2xl font-bold text-gray-900">{summary.metrics.frictionCount}</div>
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
                        <div className="text-2xl font-bold text-gray-900">
                          {formatDuration(summary.metrics.estimatedDurationMinutes)}
                        </div>
                        <div className="text-sm text-gray-500">Est. Duration</div>
                      </div>
                    </div>
                  </div>

                  {hasDataSources && (
                    <>
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Database className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">1.2k</div>
                            <div className="text-sm text-gray-500">Data Source Traffic</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">2.1%</div>
                            <div className="text-sm text-gray-500">Error Rate</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Process Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Roles Involved</h3>
                    <div className="space-y-2">
                      {summary.roles.map((role) => (
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
                      {summary.tools.slice(0, 8).map((tool) => (
                        <span key={tool} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                          {tool}
                        </span>
                      ))}
                      {summary.tools.length > 8 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-sm">
                          +{summary.tools.length - 8} more
                        </span>
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
                          <div className="flex-shrink-0 mt-0.5">{getIconComponent(insight.icon)}</div>
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
            </div>
          </section>

          {/* AI Opportunities Section */}
          <section aria-labelledby="ai-opportunities-title">
            <div className="bg-white shadow-sm rounded-lg p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI Opportunities</h2>
                <p className="text-gray-600">
                  AI-powered suggestions to optimize your process and reduce manual work. Click any card to view
                  detailed analysis.
                </p>
              </div>

              {/* Compact Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {aiOpportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className={`group relative ${impactColors[opportunity.impact]} border rounded-lg p-4 hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor(opportunity.impact)}`}
                      >
                        <div className="text-white">{getIconComponent(opportunity.category)}</div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(opportunity)
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-md transition-colors"
                          title="Edit opportunity"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExportOpportunity(opportunity)
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-md transition-colors"
                          title="Export opportunity context"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteOpportunity(opportunity.id)
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white/50 rounded-md transition-colors"
                          title="Delete opportunity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div onClick={() => router.push("/opportunity/auto-score-candidates")} className="cursor-pointer">
                      <h3 className="font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            opportunity.impact === "high"
                              ? "text-green-800 bg-green-200"
                              : opportunity.impact === "medium"
                                ? "text-yellow-800 bg-yellow-200"
                                : "text-red-800 bg-red-200"
                          }`}
                        >
                          {opportunity.impact.charAt(0).toUpperCase() + opportunity.impact.slice(1)} Impact
                        </span>
                        {opportunity.dataSource?.hasDataSource && (
                          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
                            <Database className="h-3 w-3" />
                            <span>{opportunity.dataSource.traffic}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{opportunity.targetStepTitle}</span>
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Opportunity Button - Bottom Right */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsAddOpportunityModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <FilePlus className="h-4 w-4" />
                  Add Opportunity
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 bg-violet-600 border-t border-violet-700 py-4 shadow-lg z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/builder")}
            className="text-sm text-violet-100 hover:text-white hover:bg-violet-700 transition-colors flex items-center gap-2 px-3 py-2 rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Flow Builder
          </button>
          <div className="flex items-center gap-4">
            <div className="text-xs text-violet-200 font-mono hidden sm:block">
              {aiOpportunities.length} AI opportunities identified
            </div>
          </div>
        </div>
      </footer>
      <ProcessAnalysisOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onSubmit={handleProcessAnalysisOverride}
      />
      <AddOpportunityModal
        isOpen={isAddOpportunityModalOpen}
        onClose={closeOpportunityModal}
        onSubmit={editingOpportunity ? handleEditOpportunity : handleAddOpportunity}
        editingOpportunity={editingOpportunity}
        availableSteps={[
          { id: "1", title: "Post Job Opening" },
          { id: "2", title: "Source Candidates" },
          { id: "3", title: "Application Review" },
          { id: "4", title: "Screen Candidates" },
          { id: "5", title: "Interview Rounds" },
          { id: "6", title: "Make Offer" },
          { id: "7", title: "Set Up IT Access" },
          { id: "8", title: "Welcome Session" },
        ]}
      />
    </div>
  )
}
