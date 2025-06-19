"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import type { AIOpportunity, ProcessInsight } from "@/types/prototype"
import {
  ArrowLeft,
  Download,
  FileText,
  Clock,
  Users,
  AlertTriangle,
  Zap,
  SquareGanttChartIcon as SquareChartGantt,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { AILoading } from "@/components/ai-loading"

// Sample opportunities data (same as in process-analysis page)
const opportunities: Record<
  string,
  AIOpportunity & {
    detailedDescription: string
    keyInsights: ProcessInsight[]
    proposedSolution: string
    nextSteps: string[]
  }
> = {
  "auto-score-candidates": {
    id: "auto-score-candidates",
    title: "Auto-score candidates",
    description:
      "Use AI to automatically score candidates based on resume content and role criteria, reducing manual screening time by 70%",
    stepId: "4",
    stepTitle: "Screen Candidates",
    category: "analysis",
    impact: "high",
    detailedDescription:
      "The candidate screening process currently takes 4 hours per batch and represents the biggest bottleneck in your hiring workflow. By implementing AI-powered candidate scoring, you can automatically evaluate resumes against job requirements, skills matching, and experience relevance.",
    keyInsights: [
      {
        id: "1",
        title: "Major Time Bottleneck",
        description:
          "Manual screening takes 4 hours per batch and is tagged as a friction point in your current process",
        type: "delay",
        severity: "high",
      },
      {
        id: "2",
        title: "Inconsistent Evaluation",
        description: "Different HR specialists may evaluate candidates differently, leading to missed opportunities",
        type: "friction",
        severity: "medium",
      },
      {
        id: "3",
        title: "High Volume Processing",
        description: "Large number of applications makes manual review time-consuming and error-prone",
        type: "opportunity",
        severity: "high",
      },
    ],
    proposedSolution:
      "Implement an AI scoring system that analyzes resumes for relevant skills, experience, education, and cultural fit indicators. The system would provide confidence scores and highlight key qualifications, allowing HR specialists to focus on the most promising candidates first.",
    nextSteps: [
      "Define scoring criteria and weights for different job roles",
      "Integrate with existing ATS system",
      "Train AI model on historical successful hires",
      "Implement feedback loop for continuous improvement",
    ],
  },
  "summarize-feedback": {
    id: "summarize-feedback",
    title: "Summarize interview feedback",
    description: "Automatically consolidate feedback from multiple interviewers into a structured decision summary",
    stepId: "5",
    stepTitle: "Interview Rounds",
    category: "summarization",
    impact: "medium",
    detailedDescription:
      "Interview feedback collection and synthesis currently involves manual coordination between multiple interviewers, leading to delays and inconsistent decision-making. AI can streamline this by automatically consolidating feedback into structured summaries.",
    keyInsights: [
      {
        id: "1",
        title: "Multiple Handoffs",
        description: "Interview process involves handoffs between different roles, creating coordination overhead",
        type: "friction",
        severity: "medium",
      },
      {
        id: "2",
        title: "Inconsistent Feedback Format",
        description: "Different interviewers provide feedback in varying formats, making comparison difficult",
        type: "friction",
        severity: "medium",
      },
    ],
    proposedSolution:
      "Deploy an AI system that collects structured feedback from all interviewers and generates comprehensive candidate summaries with strengths, concerns, and recommendations. Include sentiment analysis and key theme extraction.",
    nextSteps: [
      "Design standardized feedback collection forms",
      "Implement AI summarization engine",
      "Create decision support dashboard",
      "Train interviewers on new feedback process",
    ],
  },
  "generate-checklist": {
    id: "generate-checklist",
    title: "Generate onboarding checklist",
    description: "Auto-create personalized onboarding tasks based on role, department, and location requirements",
    stepId: "8",
    stepTitle: "Welcome Session",
    category: "generation",
    impact: "medium",
    detailedDescription:
      "Current onboarding process uses generic checklists that don't account for role-specific requirements, leading to missed steps and inefficient onboarding experiences.",
    keyInsights: [
      {
        id: "1",
        title: "Generic Process",
        description: "One-size-fits-all onboarding doesn't account for role, department, or location differences",
        type: "opportunity",
        severity: "medium",
      },
      {
        id: "2",
        title: "Manual Customization",
        description: "HR specialists manually customize onboarding for each new hire, creating extra work",
        type: "friction",
        severity: "low",
      },
    ],
    proposedSolution:
      "Build an AI system that generates personalized onboarding checklists based on role requirements, department policies, location-specific needs, and security clearance levels. Include automated task scheduling and progress tracking.",
    nextSteps: [
      "Map role-specific onboarding requirements",
      "Create rule-based checklist generation engine",
      "Integrate with HRIS and task management systems",
      "Implement progress tracking and notifications",
    ],
  },
  "automate-offers": {
    id: "automate-offers",
    title: "Automate offer letter creation",
    description:
      "Generate customized offer letters with correct compensation, benefits, and legal terms based on role and level",
    stepId: "6",
    stepTitle: "Make Offer",
    category: "generation",
    impact: "high",
    detailedDescription:
      "Offer letter creation currently requires manual input of compensation details, benefits, and legal terms, creating opportunities for errors and delays in the hiring process.",
    keyInsights: [
      {
        id: "1",
        title: "Manual Data Entry",
        description: "HR managers manually input compensation and benefits data, risking errors",
        type: "friction",
        severity: "medium",
      },
      {
        id: "2",
        title: "Handoff Delays",
        description: "Process involves handoffs between hiring manager and HR manager, creating delays",
        type: "delay",
        severity: "medium",
      },
      {
        id: "3",
        title: "Compliance Risk",
        description: "Manual process increases risk of incorrect legal terms or compensation errors",
        type: "friction",
        severity: "high",
      },
    ],
    proposedSolution:
      "Implement automated offer letter generation that pulls compensation data from approved salary bands, includes appropriate benefits packages, and ensures legal compliance based on role level and location.",
    nextSteps: [
      "Define salary bands and benefits matrices",
      "Create offer letter templates with dynamic fields",
      "Integrate with compensation management system",
      "Implement approval workflow and audit trail",
    ],
  },
  "smart-provisioning": {
    id: "smart-provisioning",
    title: "Smart IT provisioning",
    description: "Automatically determine and provision required IT access, tools, and accounts based on role and team",
    stepId: "7",
    stepTitle: "Set Up IT Access",
    category: "automation",
    impact: "high",
    detailedDescription:
      "IT access setup currently takes 2 days and is marked as a friction point. This manual process involves determining required access levels, creating accounts, and configuring tools for each new hire.",
    keyInsights: [
      {
        id: "1",
        title: "Major Time Sink",
        description: "IT setup takes 2 full days and is identified as a friction point in the process",
        type: "delay",
        severity: "high",
      },
      {
        id: "2",
        title: "Security Risk",
        description: "Manual access provisioning can lead to over-privileged accounts or missed security requirements",
        type: "friction",
        severity: "high",
      },
      {
        id: "3",
        title: "Tool Fragmentation",
        description: "Multiple tools (Active Directory, Slack, Google Workspace) require separate manual setup",
        type: "friction",
        severity: "medium",
      },
    ],
    proposedSolution:
      "Deploy intelligent IT provisioning that automatically determines required access levels, creates accounts across all systems, and configures tools based on role templates and team requirements. Include automated security compliance checks.",
    nextSteps: [
      "Map role-based access requirements",
      "Create automated provisioning workflows",
      "Integrate with identity management systems",
      "Implement security compliance validation",
    ],
  },
  "reference-automation": {
    id: "reference-automation",
    title: "Reference check automation",
    description: "Automate reference check requests and follow-ups via email templates",
    stepId: "4",
    stepTitle: "Screen Candidates",
    category: "automation",
    impact: "low",
    detailedDescription:
      "Reference checks are currently handled manually through phone calls and emails, creating administrative overhead and potential delays in the screening process.",
    keyInsights: [
      {
        id: "1",
        title: "Administrative Overhead",
        description: "Manual reference checks require significant time investment from HR specialists",
        type: "friction",
        severity: "low",
      },
      {
        id: "2",
        title: "Inconsistent Process",
        description: "Different approaches to reference checking may lead to varying quality of information",
        type: "friction",
        severity: "low",
      },
    ],
    proposedSolution:
      "Implement automated reference check system with email templates, follow-up reminders, and structured feedback collection. Include integration with ATS for seamless workflow.",
    nextSteps: [
      "Design reference check email templates",
      "Create automated follow-up sequences",
      "Build feedback collection forms",
      "Integrate with existing ATS system",
    ],
  },
}

export default function OpportunityReportPage() {
  const router = useRouter()
  const params = useParams()
  const opportunityId = params.id as string

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem(`opportunity-${opportunityId}-processed`)
    }
    return true
  })

  const opportunity = opportunities[opportunityId]

  useEffect(() => {
    if (!opportunity) {
      router.push("/process-analysis")
    }
  }, [opportunity, router])

  if (!opportunity) {
    return null
  }

  const severityColors = {
    high: "bg-red-50 border-red-200 text-red-700",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
    low: "bg-blue-50 border-blue-200 text-blue-700",
  }

  const typeIcons = {
    delay: <Clock className="h-4 w-4" />,
    overlap: <Users className="h-4 w-4" />,
    friction: <AlertTriangle className="h-4 w-4" />,
    opportunity: <Zap className="h-4 w-4" />,
  }

  const impactColors = {
    high: "text-red-600",
    medium: "text-yellow-600",
    low: "text-blue-600",
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && (
        <AILoading
          title="Generating Opportunity Report"
          subtitle="Analyzing impact and creating detailed recommendations"
          onComplete={() => {
            setIsLoading(false)
            if (typeof window !== "undefined") {
              sessionStorage.setItem(`opportunity-${opportunityId}-processed`, "true")
            }
          }}
          duration={2500}
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
                  <h2 className="text-lg font-medium text-gray-700">Opportunity Report</h2>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    <span>Report Ready</span>
                  </div>
                  <div className="ml-4 w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-xs">
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{opportunity.title}</h1>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">{opportunity.detailedDescription}</p>

                  {/* Info Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
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
                        <span className="text-sm font-medium text-blue-700">Process Step</span>
                      </div>
                      <span className="text-sm text-blue-900 font-semibold">{opportunity.stepTitle}</span>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-green-700">Roles Involved</span>
                      </div>
                      <span className="text-sm text-green-900 font-semibold">HR Specialist, Hiring Manager</span>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-purple-700">Impact Estimate</span>
                      </div>
                      <span className="text-sm text-purple-900 font-semibold">
                        {opportunity.impact === "high"
                          ? "Saves ~3 hours per batch, +70% efficiency"
                          : opportunity.impact === "medium"
                            ? "Saves ~1 hour per batch, +40% consistency"
                            : "Saves ~30 minutes per batch, +20% efficiency"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Key Drivers / Pain Points */}
              <section className="bg-white shadow-sm rounded-lg p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Why This Matters</h2>
                  <p className="text-gray-600">
                    These are the issues in your current process that led to this AI suggestion.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {opportunity.keyInsights.map((insight) => (
                    <div key={insight.id} className={`rounded-lg border p-4 ${severityColors[insight.severity]}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {insight.type === "delay" && <Clock className="h-5 w-5" />}
                          {insight.type === "friction" && <AlertTriangle className="h-5 w-5" />}
                          {insight.type === "opportunity" && <Zap className="h-5 w-5" />}
                          {insight.type === "overlap" && <Users className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-2">{insight.title}</h4>
                          <p className="text-sm opacity-90">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Solution Overview */}
              <section className="bg-white shadow-sm rounded-lg p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">How It Works</h2>
                  <p className="text-gray-600">Detailed breakdown of the AI solution and its implementation.</p>
                </div>

                <div className="space-y-6">
                  <div className="border-l-4 border-violet-500 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Analysis</h3>
                    <p className="text-gray-600 leading-relaxed">
                      AI scans uploaded resumes to extract key information including skills, experience levels,
                      education, certifications, and previous job titles.
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Requirements Matching</h3>
                    <p className="text-gray-600 leading-relaxed">
                      System compares candidate profiles against predefined job criteria, required skills, and
                      experience thresholds.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Confidence Scoring</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Generates numerical scores (0-100) for each candidate with confidence indicators showing how
                      certain the AI is about the match.
                    </p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualification Highlighting</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Automatically identifies and highlights the most relevant qualifications, red flags, and areas
                      requiring human review.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Prioritized Queue</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Ranks candidates by score and presents them in order of best fit, allowing HR specialists to focus
                      on top prospects first.
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Continuous Learning</h3>
                    <p className="text-gray-600 leading-relaxed">
                      System learns from HR specialist feedback and hiring decisions to improve future scoring accuracy.
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. Implementation Path */}
              <section className="bg-white shadow-sm rounded-lg p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">From Concept to MVP</h2>
                  <p className="text-gray-600">
                    Progressive development approach to build and validate this AI solution.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Phase 1: Concept Validation */}
                  <div className="border-l-4 border-blue-500 pl-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Concept Validation</h3>
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        2-3 days
                      </span>
                    </div>
                    <div className="space-y-2 ml-11">
                      <p className="text-gray-700 font-normal">
                        Define scoring criteria and weights for different job roles
                      </p>
                      <p className="text-gray-700 font-normal">
                        Analyze historical hiring data to establish success patterns
                      </p>
                      <p className="text-gray-700 font-normal">Validate concept with key stakeholders</p>
                      <p className="text-gray-700 font-normal">Document requirements and success metrics</p>
                    </div>
                  </div>

                  {/* Phase 2: Prototype Development */}
                  <div className="border-l-4 border-violet-500 pl-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Prototype Development</h3>
                      <span className="text-xs font-medium bg-violet-100 text-violet-800 px-2 py-1 rounded-full">
                        3-5 days
                      </span>
                    </div>
                    <div className="space-y-2 ml-11">
                      <p className="text-gray-700 font-normal">Build basic AI scoring engine with rule-based logic</p>
                      <p className="text-gray-700 font-normal">
                        Create user interface for HR specialists to review scores
                      </p>
                      <p className="text-gray-700 font-normal">Test with sample resumes and gather initial feedback</p>
                      <p className="text-gray-700 font-normal">Refine scoring algorithm based on feedback</p>
                    </div>
                  </div>

                  {/* Phase 3: MVP Integration */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">MVP Integration</h3>
                      <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        1-2 weeks
                      </span>
                    </div>
                    <div className="space-y-2 ml-11">
                      <p className="text-gray-700 font-normal">
                        Integrate with existing ATS system for seamless workflow
                      </p>
                      <p className="text-gray-700 font-normal">
                        Implement machine learning model trained on historical data
                      </p>
                      <p className="text-gray-700 font-normal">Deploy feedback loop for continuous improvement</p>
                      <p className="text-gray-700 font-normal">Launch pilot program with limited job postings</p>
                    </div>
                  </div>
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
        </>
      )}
    </div>
  )
}
