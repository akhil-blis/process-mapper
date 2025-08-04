"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Download, Zap, Clock, Users, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Opportunity = {
  id: string
  title: string
  description: string
  impact: "High" | "Medium" | "Low"
  effort: "Low" | "Medium" | "High"
  category: "automation" | "optimization" | "intelligence"
  estimatedSavings: string
  timeToImplement: string
  rolesAffected: string[]
}

const opportunities: Opportunity[] = [
  {
    id: "auto-score-candidates",
    title: "Auto-score candidates",
    description:
      "AI-powered resume screening and candidate ranking based on job requirements and historical hiring data.",
    impact: "High",
    effort: "Medium",
    category: "automation",
    estimatedSavings: "~3 hours per batch",
    timeToImplement: "2-3 weeks",
    rolesAffected: ["HR Specialist", "Hiring Manager"],
  },
  {
    id: "smart-interview-scheduling",
    title: "Smart interview scheduling",
    description:
      "Automated coordination of interview panels with conflict detection and optimal time slot suggestions.",
    impact: "Medium",
    effort: "Low",
    category: "optimization",
    estimatedSavings: "~2 hours per week",
    timeToImplement: "1-2 weeks",
    rolesAffected: ["Recruiting Coordinator"],
  },
  {
    id: "predictive-offer-acceptance",
    title: "Predictive offer acceptance",
    description: "ML model to predict candidate acceptance likelihood and suggest optimal offer packages.",
    impact: "High",
    effort: "High",
    category: "intelligence",
    estimatedSavings: "~15% faster closes",
    timeToImplement: "4-6 weeks",
    rolesAffected: ["HR Business Partner", "Hiring Manager"],
  },
]

export function AIOpportunities() {
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "automation":
        return <Zap className="h-4 w-4" />
      case "optimization":
        return <TrendingUp className="h-4 w-4" />
      case "intelligence":
        return <Users className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleExportOpportunities = async () => {
    setIsExporting(true)
    try {
      // Create export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        processName: "Hiring Process - Mid-Level Role",
        opportunities: opportunities.map((opp) => ({
          ...opp,
          detailsUrl: `${window.location.origin}/opportunity/${opp.id}`,
        })),
      }

      // Create and download JSON file
      const jsonData = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      const link = document.createElement("a")
      link.href = url
      link.download = `ai_opportunities_${timestamp}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("AI opportunities exported successfully")
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">AI Opportunities</h2>
          <p className="text-gray-600 mt-1">Suggested automation and optimization opportunities for your process</p>
        </div>
        <Button
          onClick={handleExportOpportunities}
          disabled={isExporting}
          variant="outline"
          className="flex items-center gap-2 bg-transparent"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export All"}
        </Button>
      </div>

      <div className="grid gap-6">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 rounded-lg">{getCategoryIcon(opportunity.category)}</div>
                  <div>
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{opportunity.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push(`/opportunity/${opportunity.id}`)}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-violet-600 hover:text-violet-700"
                >
                  View Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Impact</p>
                  <Badge variant="outline" className={getImpactColor(opportunity.impact)}>
                    {opportunity.impact}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Effort</p>
                  <Badge variant="outline" className={getEffortColor(opportunity.effort)}>
                    {opportunity.effort}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Estimated Savings</p>
                  <p className="text-sm font-medium text-gray-900">{opportunity.estimatedSavings}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Time to Implement</p>
                  <p className="text-sm font-medium text-gray-900">{opportunity.timeToImplement}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Roles Affected</p>
                <div className="flex flex-wrap gap-2">
                  {opportunity.rolesAffected.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
