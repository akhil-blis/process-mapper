"use client"

import type { FlowData } from "@/types/flow"
import type { AIOpportunity } from "@/types/prototype"
import { Zap, FileText, BarChart, Sparkles, ArrowRight } from "lucide-react"

type AIOpportunitiesProps = {
  flowData: FlowData
}

export function AIOpportunities({ flowData }: AIOpportunitiesProps) {
  // Sample AI opportunities - in a real app these would be generated based on the actual flow
  const opportunities: AIOpportunity[] = [
    {
      id: "1",
      title: "Auto-score candidates",
      description:
        "Use AI to automatically score candidates based on resume content and role criteria, reducing manual screening time by 70%",
      stepId: "4",
      stepTitle: "Screen Candidates",
      category: "analysis",
      impact: "high",
    },
    {
      id: "2",
      title: "Summarize interview feedback",
      description: "Automatically consolidate feedback from multiple interviewers into a structured decision summary",
      stepId: "5",
      stepTitle: "Interview Rounds",
      category: "summarization",
      impact: "medium",
    },
    {
      id: "3",
      title: "Generate onboarding checklist",
      description: "Auto-create personalized onboarding tasks based on role, department, and location requirements",
      stepId: "8",
      stepTitle: "Welcome Session",
      category: "generation",
      impact: "medium",
    },
    {
      id: "4",
      title: "Automate offer letter creation",
      description:
        "Generate customized offer letters with correct compensation, benefits, and legal terms based on role and level",
      stepId: "6",
      stepTitle: "Make Offer",
      category: "generation",
      impact: "high",
    },
    {
      id: "5",
      title: "Smart IT provisioning",
      description:
        "Automatically determine and provision required IT access, tools, and accounts based on role and team",
      stepId: "7",
      stepTitle: "Set Up IT Access",
      category: "automation",
      impact: "high",
    },
  ]

  const categoryIcons = {
    automation: <Zap className="h-4 w-4" />,
    summarization: <FileText className="h-4 w-4" />,
    generation: <Sparkles className="h-4 w-4" />,
    analysis: <BarChart className="h-4 w-4" />,
  }

  const categoryColors = {
    automation: "bg-green-100 text-green-600",
    summarization: "bg-blue-100 text-blue-600",
    generation: "bg-purple-100 text-purple-600",
    analysis: "bg-orange-100 text-orange-600",
  }

  const impactColors = {
    high: "border-l-red-500",
    medium: "border-l-yellow-500",
    low: "border-l-blue-500",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI Opportunities</h2>
        <p className="text-gray-600 mb-6">AI-powered suggestions to optimize your process and reduce manual work.</p>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className={`bg-white rounded-lg border border-gray-200 border-l-4 ${impactColors[opportunity.impact]} p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryColors[opportunity.category]}`}
                  >
                    {categoryIcons[opportunity.category]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Step: {opportunity.stepTitle}</span>
                      <span>•</span>
                      <span className="capitalize">{opportunity.category}</span>
                      <span>•</span>
                      <span
                        className={`capitalize font-medium ${
                          opportunity.impact === "high"
                            ? "text-red-600"
                            : opportunity.impact === "medium"
                              ? "text-yellow-600"
                              : "text-blue-600"
                        }`}
                      >
                        {opportunity.impact} impact
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{opportunity.description}</p>
              </div>
              <button className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-colors">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-violet-50 rounded-lg p-6 border border-violet-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-violet-900 mb-2">Ready to prototype?</h3>
            <p className="text-violet-700 text-sm">
              These AI opportunities can be built into your prototype to demonstrate value and gather feedback before
              full implementation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
