"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Code,
  Clock,
  Users,
  AlertTriangle,
  Play,
  Zap,
  Shuffle,
  Grid,
  Layers,
  FileText,
  ClipboardList,
  FilePlus,
  Terminal,
  Mail,
  Download,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { AILoading } from "@/components/ai-loading"
import { ProcessAnalysisOverrideModal } from "@/components/analysis/process-analysis-override-modal"

// Updated types for the new JSON structure
type ProcessAnalysisData = {
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
      }
      roles: string[]
      tools: string[]
    }
    insights: Array<{
      id: string
      title: string
      description: string
      type: "delay" | "friction" | "overlap"
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
    }>
  }
}

// Sample data using the new structure
const sampleData: ProcessAnalysisData = {
  processAnalysis: {
    meta: {
      processTitle: "New Employee Onboarding",
      source: "uploadedFlow",
      analysisDate: "2025-06-19",
    },
    summary: {
      metrics: {
        stepCount: 8,
        roleCount: 4,
        frictionCount: 2,
        handoffCount: 2,
        automatedCount: 1,
        estimatedDurationMinutes: 5040,
      },
      roles: ["Hiring Manager", "HR Specialist", "HR Manager", "IT Administrator"],
      tools: [
        "HRIS",
        "Email",
        "ATS",
        "Job Board",
        "LinkedIn",
        "Indeed",
        "Company Website",
        "Phone",
        "Zoom",
        "Calendar",
        "DocuSign",
        "Active Directory",
        "Slack",
        "Google Workspace",
      ],
    },
    insights: [
      {
        id: "1",
        title: "Bottleneck Detected",
        description: "Step 4 (Screen Candidates) takes 4 hours and has friction tags – this is your main bottleneck.",
        type: "delay",
        severity: "high",
        icon: "alert-triangle",
      },
      {
        id: "2",
        title: "Multiple Handoffs",
        description: "2 handoff points between roles may cause delays and miscommunication.",
        type: "friction",
        severity: "medium",
        icon: "shuffle",
      },
      {
        id: "3",
        title: "Automation Opportunity",
        description: "Only 1 of 8 steps are automated – significant efficiency gains possible.",
        type: "opportunity",
        severity: "medium",
        icon: "zap",
      },
      {
        id: "4",
        title: "Tool Fragmentation",
        description: "15 different tools used across the process – consider consolidation.",
        type: "overlap",
        severity: "low",
        icon: "grid",
      },
    ],
    aiOpportunities: [
      {
        id: "auto-score-candidates",
        title: "Auto-score candidates",
        description:
          "Use AI to automatically score candidates based on resume content and role criteria, reducing manual screening time by 70%.",
        targetStepId: "4",
        targetStepTitle: "Screen Candidates",
        category: "analysis",
        impact: "high",
        icon: "layers",
      },
      {
        id: "summarize-feedback",
        title: "Summarize interview feedback",
        description:
          "Automatically consolidate feedback from multiple interviewers into a structured decision summary.",
        targetStepId: "5",
        targetStepTitle: "Interview Rounds",
        category: "summarization",
        impact: "medium",
        icon: "file-text",
      },
      {
        id: "generate-checklist",
        title: "Generate onboarding checklist",
        description: "Auto-create personalized onboarding tasks based on role, department, and location requirements.",
        targetStepId: "8",
        targetStepTitle: "Welcome Session",
        category: "generation",
        impact: "medium",
        icon: "clipboard-list",
      },
      {
        id: "automate-offers",
        title: "Automate offer letter creation",
        description:
          "Generate customized offer letters with correct compensation, benefits, and legal terms based on role and level.",
        targetStepId: "6",
        targetStepTitle: "Make Offer",
        category: "generation",
        impact: "high",
        icon: "file-plus",
      },
      {
        id: "smart-provisioning",
        title: "Smart IT provisioning",
        description:
          "Automatically determine and provision required IT access, tools, and accounts based on role and team.",
        targetStepId: "7",
        targetStepTitle: "Set Up IT Access",
        category: "automation",
        impact: "high",
        icon: "terminal",
      },
      {
        id: "reference-automation",
        title: "Reference check automation",
        description: "Automate reference check requests and follow-ups via email templates.",
        targetStepId: "4",
        targetStepTitle: "Screen Candidates",
        category: "automation",
        impact: "low",
        icon: "mail",
      },
    ],
  },
}

export default function ProcessAnalysisPage() {
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("process-analysis-processed")
    }
    return true
  })
  const router = useRouter()
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)
  const [analysisData, setAnalysisData] = useState<ProcessAnalysisData>(sampleData)

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

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
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

    const IconComponent = iconMap[iconName] || AlertTriangle
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

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && (
        <AILoading
          title="Analyzing Your Process"
          subtitle="Identifying bottlenecks and AI opportunities"
          onComplete={() => {
            setIsLoading(false)
            if (typeof window !== "undefined") {
              sessionStorage.setItem("process-analysis-processed", "true")
            }
          }}
          duration={3500}
        />
      )}
      {!isLoading && (
        <>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiOpportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        onClick={() => router.push(`/opportunity/${opportunity.id}`)}
                        className={`group relative ${impactColors[opportunity.impact]} border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor(opportunity.impact)}`}
                          >
                            <div className="text-white">{getIconComponent(opportunity.icon)}</div>
                          </div>
                          <div className="flex items-center gap-2">
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleExportOpportunity(opportunity)
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              title="Export opportunity context"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
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
                    ))}
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
        </>
      )}
    </div>
  )
}
