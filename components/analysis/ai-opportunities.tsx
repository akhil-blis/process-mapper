"use client"

import type { FlowData } from "@/types/flow"
import type { AIOpportunity } from "@/types/prototype"
import { Zap, FileText, BarChart, Sparkles, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

type AIOpportunitiesProps = {
  flowData: FlowData
}

export function AIOpportunities({ flowData }: AIOpportunitiesProps) {
  const router = useRouter()
  // Sample AI opportunities - in a real app these would be generated based on the actual flow
  const opportunities: AIOpportunity[] = [
    {
      id: "1",
      title: "Auto-score candidates",
      description: `With ${
        flowData.nodes
          .find((n) => n.id === "step-3a")
          ?.simulatedSources?.reduce((sum, s) => sum + s.volume, 0)
          ?.toLocaleString() || "18,200"
      } applications/month and ${((flowData.nodes.find((n) => n.id === "step-3a")?.simulatedSources?.reduce((max, s) => Math.max(max, s.errorRate), 0) || 0.12) * 100).toFixed(1)}% error rate, AI scoring could reduce manual screening time by 70% and improve consistency`,
      stepId: "step-3a",
      stepTitle: "Inbound Applications Review",
      category: "analysis",
      impact: "high",
    },
    {
      id: "2",
      title: "Smart interview scheduling",
      description: `Calendar API shows ${flowData.nodes.find((n) => n.id === "step-5")?.simulatedSources?.[0]?.volume?.toLocaleString() || "4,500"} scheduling requests/month with ${((flowData.nodes.find((n) => n.id === "step-5")?.simulatedSources?.[0]?.errorRate || 0.15) * 100).toFixed(1)}% failure rate - AI can optimize scheduling and reduce conflicts`,
      stepId: "step-5",
      stepTitle: "Schedule Interview Loop",
      category: "automation",
      impact: "high",
    },
    {
      id: "3",
      title: "Referral quality scoring",
      description: `Employee referral system processes ${flowData.nodes.find((n) => n.id === "step-3b")?.simulatedSources?.[0]?.volume?.toLocaleString() || "1,200"} referrals/month - AI can score referral quality and prioritize high-potential candidates`,
      stepId: "step-3b",
      stepTitle: "Referrals Review",
      category: "analysis",
      impact: "medium",
    },
    {
      id: "4",
      title: "Multi-source application deduplication",
      description: `With ${flowData.nodes.filter((n) => n.simulatedSources && n.simulatedSources.length > 0).length} different data sources feeding applications, AI can detect and merge duplicate candidates across platforms`,
      stepId: "step-2",
      stepTitle: "Distribute Job Posting",
      category: "automation",
      impact: "medium",
    },
    {
      id: "5",
      title: "Predictive headcount planning",
      description: `Workday API shows ${flowData.nodes.find((n) => n.id === "start-1")?.simulatedSources?.[0]?.volume?.toLocaleString() || "2,400"} headcount requests/year - AI can predict hiring needs and pre-populate job descriptions`,
      stepId: "start-1",
      stepTitle: "Headcount Approved",
      category: "generation",
      impact: "low",
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
            onClick={() => router.push("/opportunity/auto-score-candidates")}
            className={`bg-white rounded-lg border border-gray-200 border-l-4 ${impactColors[opportunity.impact]} p-6 hover:shadow-md transition-shadow cursor-pointer`}
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
              <div className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
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
