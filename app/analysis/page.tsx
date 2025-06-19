"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { FlowData } from "@/types/flow"
import type { PrototypePlan } from "@/types/prototype"
import { ProcessSummary } from "@/components/analysis/process-summary"
import { Breadboard } from "@/components/analysis/breadboard"
import { ArrowLeft, FileEdit } from "lucide-react"
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

const initialPrototypePlan: PrototypePlan = {
  screens: [
    {
      id: "screen-1",
      title: "Job Request Form",
      position: { x: 50, y: 50 }, // Position will be calculated by Breadboard
      elements: [
        { id: "elem-1", type: "input", label: "Job Title", screenId: "screen-1", position: { x: 10, y: 10 } },
        { id: "elem-2", type: "input", label: "Department", screenId: "screen-1", position: { x: 10, y: 45 } },
        { id: "elem-3", type: "action", label: "Submit Request", screenId: "screen-1", position: { x: 10, y: 80 } },
      ],
    },
    {
      id: "screen-2",
      title: "Candidate Dashboard",
      position: { x: 400, y: 50 },
      elements: [
        { id: "elem-4", type: "info", label: "Application Status", screenId: "screen-2", position: { x: 10, y: 10 } },
        { id: "elem-5", type: "action", label: "View Details", screenId: "screen-2", position: { x: 10, y: 45 } },
        { id: "elem-6", type: "action", label: "Schedule Interview", screenId: "screen-2", position: { x: 10, y: 80 } },
      ],
    },
    {
      id: "screen-3",
      title: "Interview Scheduler",
      position: { x: 750, y: 50 },
      elements: [
        { id: "elem-7", type: "input", label: "Select Date", screenId: "screen-3", position: { x: 10, y: 10 } },
        { id: "elem-8", type: "input", label: "Select Time", screenId: "screen-3", position: { x: 10, y: 45 } },
        { id: "elem-9", type: "action", label: "Confirm Interview", screenId: "screen-3", position: { x: 10, y: 80 } },
        {
          id: "elem-10",
          type: "action",
          label: "Back to Dashboard",
          screenId: "screen-3",
          position: { x: 10, y: 115 },
        },
      ],
    },
  ],
  connections: [
    { id: "conn-1", fromElementId: "elem-3", toScreenId: "screen-2" },
    { id: "conn-2", fromElementId: "elem-6", toScreenId: "screen-3" },
    { id: "conn-3", fromElementId: "elem-10", toScreenId: "screen-2" },
  ],
}

export default function ProcessAnalysisPage() {
  const [prototypePlan, setPrototypePlan] = useState<PrototypePlan>(initialPrototypePlan)
  const [isLoading, setIsLoading] = useState(() => {
    // Only show loading if we haven't processed this page in this session
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("analysis-processed")
    }
    return true
  })
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!sessionStorage.getItem("analysis-processed")) {
        router.replace("/process-analysis")
      }
    }
  }, [router])

  // This function would be passed to the AIAssistant to handle its suggestions
  // For now, it just logs. In a real app, it would parse the suggestion and modify prototypePlan.
  const handleAISuggestionForPrototype = (suggestionText: string) => {
    console.log("AI Suggestion for Prototype Plan:", suggestionText)
    // Example: if suggestionText is "Add a 'Settings' screen"
    // You would add a new screen to prototypePlan.screens
    // setPrototypePlan(prevPlan => ({
    //   ...prevPlan,
    //   screens: [...prevPlan.screens, { id: `screen-${Date.now()}`, title: "Settings", elements: [], position: {x:0,y:0} }]
    // }));
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && (
        <AILoading
          title="Analyzing Your Process"
          subtitle="Identifying bottlenecks, AI opportunities, and generating prototype plan"
          onComplete={() => {
            setIsLoading(false)
            if (typeof window !== "undefined") {
              sessionStorage.setItem("analysis-processed", "true")
            }
          }}
          duration={3500}
        />
      )}
      {!isLoading && (
        <>
          {/* Top Navigation */}
          <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
            {/* z-40 to be below AI assistant modal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0 flex items-center">
                    <Logo />
                    <span className="ml-2.5 font-semibold text-gray-800 text-lg">Process Mapper</span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <h2 className="text-lg font-medium text-gray-700">Process Analysis & Prototype Plan</h2>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Analysis complete</span>
                  </div>
                  {/* User avatar placeholder */}
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
                      AI-powered suggestions to optimize your process and reduce manual work.
                    </p>
                  </div>

                  {/* Compact Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Auto-score candidates - HIGH IMPACT */}
                    <div className="group relative bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-green-800 bg-green-200 px-2 py-1 rounded">
                          High Impact
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Auto-score candidates</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Automatically score candidates based on resume content, reducing screening time by 70%
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Screen Candidates</span>
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Summarize interview feedback - MEDIUM IMPACT */}
                    <div className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-yellow-800 bg-yellow-200 px-2 py-1 rounded">
                          Medium Impact
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Summarize feedback</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Consolidate feedback from multiple interviewers into structured summaries
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Interview Rounds</span>
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-yellow-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Generate onboarding checklist - MEDIUM IMPACT */}
                    <div className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-yellow-800 bg-yellow-200 px-2 py-1 rounded">
                          Medium Impact
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Generate checklist</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Auto-create personalized onboarding tasks based on role and department
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Welcome Session</span>
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-yellow-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Automate offer letter creation - HIGH IMPACT */}
                    <div className="group relative bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-green-800 bg-green-200 px-2 py-1 rounded">
                          High Impact
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Automate offer letters</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Generate customized offers with correct compensation and legal terms
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Make Offer</span>
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Smart IT provisioning - HIGH IMPACT */}
                    <div className="group relative bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-green-800 bg-green-200 px-2 py-1 rounded">
                          High Impact
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Smart IT provisioning</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Auto-provision required IT access and tools based on role and team
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Set Up IT Access</span>
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Reference check automation - LOW IMPACT */}
                    <div className="group relative bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-red-800 bg-red-200 px-2 py-1 rounded">
                          Low Impact
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Reference check automation</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Automate reference check requests and follow-ups via email templates
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Screen Candidates</span>
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Prototype Plan Section (Breadboard + Integrated AI Assistant) */}
              <section aria-labelledby="prototype-plan-title">
                {/* Breadboard will manage its own background and the AI assistant */}
                <Breadboard
                  prototypePlan={prototypePlan}
                  onUpdate={setPrototypePlan}
                  onAISuggestion={handleAISuggestionForPrototype} // Pass the handler
                />
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
                  {prototypePlan.screens.length} screens &bull; {prototypePlan.connections.length} connections
                </div>
                <button
                  onClick={() => router.push("/docs")}
                  className="text-sm font-medium px-4 py-2 rounded-md bg-white text-violet-600 hover:bg-violet-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <FileEdit className="h-4 w-4" />
                  Generate Docs
                </button>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}
