"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { FlowData } from "@/types/flow"
import type { AIOpportunity } from "@/types/prototype"
import { ProcessSummary } from "@/components/analysis/process-summary"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import { AILoading } from "@/components/ai-loading"

// Sample flow data - in a real app this would come from the previous screen or global state
const sampleFlowData: FlowData = {
  title: "New Employee Onboarding",
  nodes: [
    {
      id: "1",
      type: "step",
      title: "Submit Hiring Request",
      role: "Hiring Manager",
      tools: ["HRIS", "Email"],
      position: { x: 100, y: 100 },
      tags: ["trigger"],
      duration: { value: 15, unit: "minutes" },
      attachments: [{ name: "Job Description Template.docx", type: "file" }],
    },
    {
      id: "2",
      type: "step",
      title: "Create Job Listing",
      role: "HR Specialist",
      tools: ["ATS", "Job Board"],
      position: { x: 400, y: 100 },
      tags: [],
      duration: { value: 2, unit: "hours" },
    },
    {
      id: "3",
      type: "step",
      title: "Post to Platforms",
      role: "HR Specialist",
      tools: ["LinkedIn", "Indeed", "Company Website"],
      position: { x: 700, y: 100 },
      tags: ["automated"],
      duration: { value: 30, unit: "minutes" },
    },
    {
      id: "4",
      type: "step",
      title: "Screen Candidates",
      role: "HR Specialist",
      tools: ["ATS", "Phone"],
      position: { x: 1000, y: 100 },
      tags: ["friction"],
      duration: { value: 4, unit: "hours" },
      attachments: [
        { name: "Screening Checklist.pdf", type: "file" },
        { name: "Interview Questions.docx", type: "file" },
      ],
    },
    {
      id: "5",
      type: "step",
      title: "Interview Rounds",
      role: "Hiring Manager",
      tools: ["Zoom", "Calendar"],
      position: { x: 400, y: 300 },
      tags: ["handoff"],
      duration: { value: 3, unit: "hours" },
    },
    {
      id: "6",
      type: "step",
      title: "Make Offer",
      role: "HR Manager",
      tools: ["DocuSign", "Email"],
      position: { x: 700, y: 300 },
      tags: ["handoff"],
      duration: { value: 1, unit: "hours" },
      attachments: [{ name: "Offer Letter Template.docx", type: "file" }],
    },
    {
      id: "7",
      type: "step",
      title: "Set Up IT Access",
      role: "IT Administrator",
      tools: ["Active Directory", "Slack", "Google Workspace"],
      position: { x: 1000, y: 300 },
      tags: ["friction"],
      duration: { value: 2, unit: "days" },
      attachments: [
        { name: "IT Setup Checklist.pdf", type: "file" },
        { name: "Security Guidelines", type: "link", url: "https://company.com/security" },
      ],
    },
    {
      id: "8",
      type: "step",
      title: "Welcome Session",
      role: "HR Specialist",
      tools: ["Zoom", "Presentation"],
      position: { x: 700, y: 500 },
      tags: [],
      duration: { value: 1, unit: "hours" },
      attachments: [{ name: "Welcome Presentation.pptx", type: "file" }],
    },
  ],
  edges: [
    { id: "e1", source: "1", target: "2" },
    { id: "e2", source: "2", target: "3" },
    { id: "e3", source: "3", target: "4" },
    { id: "e4", source: "4", target: "5" },
    { id: "e5", source: "5", target: "6" },
    { id: "e6", source: "6", target: "7" },
    { id: "e7", source: "7", target: "8" },
  ],
}

// Sample AI opportunities with IDs for routing
const opportunities: AIOpportunity[] = [
  {
    id: "auto-score-candidates",
    title: "Auto-score candidates",
    description:
      "Use AI to automatically score candidates based on resume content and role criteria, reducing manual screening time by 70%",
    stepId: "4",
    stepTitle: "Screen Candidates",
    category: "analysis",
    impact: "high",
  },
  {
    id: "summarize-feedback",
    title: "Summarize interview feedback",
    description: "Automatically consolidate feedback from multiple interviewers into a structured decision summary",
    stepId: "5",
    stepTitle: "Interview Rounds",
    category: "summarization",
    impact: "medium",
  },
  {
    id: "generate-checklist",
    title: "Generate onboarding checklist",
    description: "Auto-create personalized onboarding tasks based on role, department, and location requirements",
    stepId: "8",
    stepTitle: "Welcome Session",
    category: "generation",
    impact: "medium",
  },
  {
    id: "automate-offers",
    title: "Automate offer letter creation",
    description:
      "Generate customized offer letters with correct compensation, benefits, and legal terms based on role and level",
    stepId: "6",
    stepTitle: "Make Offer",
    category: "generation",
    impact: "high",
  },
  {
    id: "smart-provisioning",
    title: "Smart IT provisioning",
    description: "Automatically determine and provision required IT access, tools, and accounts based on role and team",
    stepId: "7",
    stepTitle: "Set Up IT Access",
    category: "automation",
    impact: "high",
  },
  {
    id: "reference-automation",
    title: "Reference check automation",
    description: "Automate reference check requests and follow-ups via email templates",
    stepId: "4",
    stepTitle: "Screen Candidates",
    category: "automation",
    impact: "low",
  },
]

export default function ProcessAnalysisPage() {
  const [isLoading, setIsLoading] = useState(() => {
    // Only show loading if we haven't processed this page in this session
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("process-analysis-processed")
    }
    return true
  })
  const router = useRouter()

  const categoryIcons = {
    automation: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    summarization: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    generation: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
    analysis: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
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

  const impactColors = {
    high: "bg-green-100 border-green-200",
    medium: "bg-yellow-100 border-yellow-200",
    low: "bg-red-100 border-red-200",
  }

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
                  <div className="flex-shrink-0 flex items-center">
                    <Logo />
                    <span className="ml-2.5 font-semibold text-gray-800 text-lg">Process Mapper</span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <h2 className="text-lg font-medium text-gray-700">Process Analysis</h2>
                </div>
                <div className="flex items-center">
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
                  <ProcessSummary flowData={sampleFlowData} />
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
                    {opportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        onClick={() => router.push(`/opportunity/${opportunity.id}`)}
                        className={`group relative ${impactColors[opportunity.impact]} border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor(opportunity.impact)}`}
                          >
                            {categoryIcons[opportunity.category]}
                          </div>
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
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{opportunity.stepTitle}</span>
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
                  {opportunities.length} AI opportunities identified
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}
