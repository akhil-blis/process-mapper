"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Download,
  FileText,
  Clock,
  Users,
  AlertTriangle,
  Zap,
  SquareGanttChartIcon as SquareChartGantt,
  CodeIcon,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { OpportunityOverrideModal } from "@/components/opportunity/opportunity-override-modal"

type OpportunityData = {
  title: string
  summary: string
  process_step: {
    label: string
  }
  roles_involved: string[]
  impact_estimate: {
    description: string
  }
  why_this_matters: Array<{
    title: string
    description: string
    type: string
  }>
  how_it_works: {
    steps: Array<{
      label: string
      description: string
    }>
  }
  mvp_plan: {
    phases: Array<{
      title: string
      duration: string
      steps: string[]
    }>
  }
}

// Default opportunity data - ALWAYS shows "Auto-score candidates" regardless of ID
const defaultOpportunityData: OpportunityData = {
  title: "Auto-score candidates",
  summary:
    "The candidate screening process currently takes 4 hours per batch and represents the biggest bottleneck in your hiring workflow. With an average of 150-200 applications per job posting and 12-15 active positions monthly, you're processing ~2,400 resumes per month manually. By implementing AI-powered candidate scoring, you can automatically evaluate resumes against job requirements, skills matching, and experience relevance.",
  process_step: {
    label: "Screen Candidates",
  },
  roles_involved: ["HR Specialist", "Hiring Manager"],
  impact_estimate: {
    description: "Saves ~3 hours per batch, processes 2,400+ resumes/month, +70% efficiency",
  },
  why_this_matters: [
    {
      title: "Major Time Bottleneck",
      description: "Manual screening takes 4 hours per batch and is tagged as a friction point in your current process",
      type: "bottleneck",
    },
    {
      title: "Inconsistent Evaluation",
      description: "Different HR specialists may evaluate candidates differently, leading to missed opportunities",
      type: "quality",
    },
    {
      title: "High Volume Processing",
      description:
        "Processing 2,400+ resumes monthly across 12-15 active positions makes manual review extremely time-consuming and increases the likelihood of overlooking qualified candidates",
      type: "scale",
    },
  ],
  how_it_works: {
    steps: [
      {
        label: "Resume Analysis",
        description:
          "AI scans uploaded resumes to extract key information including skills, experience levels, education, certifications, and previous job titles. Capable of processing 200+ resumes in minutes rather than hours.",
      },
      {
        label: "Job Requirements Matching",
        description:
          "System compares candidate profiles against predefined job criteria, required skills, and experience thresholds.",
      },
      {
        label: "Confidence Scoring",
        description:
          "Generates numerical scores (0–100) for each candidate with confidence indicators showing how certain the AI is about the match.",
      },
      {
        label: "Qualification Highlighting",
        description:
          "Automatically identifies and highlights the most relevant qualifications, red flags, and areas requiring human review.",
      },
      {
        label: "Prioritized Queue",
        description:
          "Ranks candidates by score and presents them in order of best fit, allowing HR specialists to focus on top prospects first. Reduces review time from 4 hours to 45 minutes per batch of 150-200 applications.",
      },
      {
        label: "Continuous Learning",
        description:
          "System learns from HR specialist feedback and hiring decisions to improve future scoring accuracy.",
      },
    ],
  },
  mvp_plan: {
    phases: [
      {
        title: "Concept Validation",
        duration: "2–3 days",
        steps: [
          "Define scoring criteria and weights for different job roles",
          "Analyze historical hiring data to establish success patterns",
          "Validate concept with key stakeholders",
          "Document requirements and success metrics",
        ],
      },
      {
        title: "Prototype Development",
        duration: "3–5 days",
        steps: [
          "Build basic AI scoring engine with rule-based logic",
          "Create user interface for HR specialists to review scores",
          "Test with sample resumes and gather initial feedback",
          "Refine scoring algorithm based on feedback",
        ],
      },
      {
        title: "MVP Integration",
        duration: "1–2 weeks",
        steps: [
          "Integrate with existing ATS system for seamless workflow",
          "Implement machine learning model trained on historical data",
          "Deploy feedback loop for continuous improvement",
          "Launch pilot program with limited job postings",
        ],
      },
    ],
  },
}

export default function OpportunityReportPage() {
  const router = useRouter()
  const params = useParams()
  const opportunityId = params.id as string

  const [opportunityData, setOpportunityData] = useState<OpportunityData>(defaultOpportunityData)
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)

  useEffect(() => {
    // Check if there's custom data for this opportunity
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(`opportunity-${opportunityId}-data`)
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          setOpportunityData(parsedData)
        } catch (error) {
          console.error("Error parsing saved opportunity data:", error)
          setOpportunityData(defaultOpportunityData)
        }
      }
    }
  }, [opportunityId])

  const handleOverrideSubmit = (data: OpportunityData) => {
    setOpportunityData(data)
    // Save to localStorage with the current opportunity ID
    if (typeof window !== "undefined") {
      localStorage.setItem(`opportunity-${opportunityId}-data`, JSON.stringify(data))
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bottleneck":
        return <Clock className="h-5 w-5" />
      case "quality":
        return <AlertTriangle className="h-5 w-5" />
      case "scale":
        return <Zap className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bottleneck":
        return "bg-red-50 border-red-200 text-red-700"
      case "quality":
        return "bg-yellow-50 border-yellow-200 text-yellow-700"
      case "scale":
        return "bg-blue-50 border-blue-200 text-blue-700"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  const getPhaseColor = (index: number) => {
    const colors = ["border-blue-500", "border-violet-500", "border-green-500"]
    return colors[index] || "border-gray-500"
  }

  const getPhaseBackgroundColor = (index: number) => {
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
      { bg: "bg-violet-100", text: "text-violet-700", badge: "bg-violet-100 text-violet-800" },
      { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-100 text-green-800" },
    ]
    return colors[index] || { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-100 text-gray-800" }
  }

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
              <h2 className="text-lg font-medium text-gray-700">Opportunity Report</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsOverrideModalOpen(true)}
                className="flex items-center gap-2 px-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors py-1.5"
              >
                <CodeIcon className="h-4 w-4" />
                Override Data
              </button>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                <span>Report Ready</span>
              </div>
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-xs">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
          {/* 1. Opportunity Summary Header */}
          <section className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{opportunityData.title}</h1>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">{opportunityData.summary}</p>

              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-blue-900 mb-2">Process Step</h4>
                      <p className="text-sm text-blue-700 opacity-90">{opportunityData.process_step.label}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-green-900 mb-2">Roles Involved</h4>
                      <p className="text-sm text-green-700 opacity-90">{opportunityData.roles_involved.join(", ")}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-purple-900 mb-2">Impact Estimate</h4>
                      <p className="text-sm text-purple-700 opacity-90">
                        {opportunityData.impact_estimate.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Why This Matters */}
          <section className="bg-white shadow-sm rounded-lg p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Why This Matters</h2>
              <p className="text-gray-600">
                These are the issues in your current process that led to this AI suggestion.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {opportunityData.why_this_matters.map((insight, index) => (
                <div key={index} className={`rounded-lg border p-4 ${getTypeColor(insight.type)}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getTypeIcon(insight.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-2">{insight.title}</h4>
                      <p className="text-sm opacity-90">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. How It Works */}
          <section className="bg-white shadow-sm rounded-lg p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">How It Works</h2>
              <p className="text-gray-600">Detailed breakdown of the AI solution and its implementation.</p>
            </div>

            <div className="space-y-6">
              {opportunityData.how_it_works.steps.map((step, index) => {
                const colors = [
                  "border-violet-500",
                  "border-blue-500",
                  "border-green-500",
                  "border-yellow-500",
                  "border-purple-500",
                  "border-orange-500",
                ]
                return (
                  <div key={index} className={`border-l-4 ${colors[index] || "border-gray-500"} pl-6`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.label}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* 4. MVP Plan */}
          <section className="bg-white shadow-sm rounded-lg p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">From Concept to MVP</h2>
              <p className="text-gray-600">Progressive development approach to build and validate this AI solution.</p>
            </div>

            <div className="space-y-6">
              {opportunityData.mvp_plan.phases.map((phase, index) => {
                const phaseColors = getPhaseBackgroundColor(index)
                return (
                  <div key={index} className={`border-l-4 ${getPhaseColor(index)} pl-6`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-8 h-8 ${phaseColors.bg} ${phaseColors.text} rounded-full flex items-center justify-center text-sm font-bold`}
                      >
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{phase.title}</h3>
                      <span className={`text-xs font-medium ${phaseColors.badge} px-2 py-1 rounded-full`}>
                        {phase.duration}
                      </span>
                    </div>
                    <div className="space-y-2 ml-11">
                      {phase.steps.map((step, stepIndex) => (
                        <p key={stepIndex} className="text-gray-700 font-normal">
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-violet-600 py-4 shadow-lg z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/process-analysis")}
            className="text-sm text-white hover:text-violet-200 transition-colors flex items-center gap-2 px-3 py-2 rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Process Analysis
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // In a real app, this would generate and download a PDF
                console.log("Downloading PDF report for:", opportunityId)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-violet-700 text-white rounded-md hover:bg-violet-800 transition-colors text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Export Report as PDF
            </button>
            <button
              onClick={() => router.push(`/prototype-plan/${opportunityId}`)}
              className="flex items-center gap-2 px-6 py-2 bg-white text-violet-700 rounded-md hover:bg-violet-50 transition-colors text-sm font-medium shadow-sm"
            >
              <SquareChartGantt className="h-4 w-4" />
              Start Prototype Planning
            </button>
          </div>
        </div>
      </footer>

      {/* Override Modal */}
      <OpportunityOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onSubmit={handleOverrideSubmit}
        currentData={opportunityData}
      />
    </div>
  )
}
