"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface ProcessAnalysisData {
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
        | "automation"
        | "summarization"
        | "generation"
        | "analysis"
        | "classification"
        | "decision"
        | "communication"
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

interface ProcessAnalysisOverrideModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProcessAnalysisData) => void
}

export function ProcessAnalysisOverrideModal({ isOpen, onClose, onSubmit }: ProcessAnalysisOverrideModalProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  const validateJSON = (input: string) => {
    if (!input.trim()) {
      setError(null)
      setIsValid(false)
      return
    }

    try {
      const parsed = JSON.parse(input)

      // Validate top-level structure
      if (!parsed.processAnalysis) {
        throw new Error("Missing required field: processAnalysis")
      }

      const { processAnalysis } = parsed

      // Validate meta section
      if (!processAnalysis.meta) {
        throw new Error("Missing required field: processAnalysis.meta")
      }
      if (!processAnalysis.meta.processTitle) {
        throw new Error("Missing required field: processAnalysis.meta.processTitle")
      }
      if (!processAnalysis.meta.source) {
        throw new Error("Missing required field: processAnalysis.meta.source")
      }
      if (!processAnalysis.meta.analysisDate) {
        throw new Error("Missing required field: processAnalysis.meta.analysisDate")
      }

      // Validate summary section
      if (!processAnalysis.summary) {
        throw new Error("Missing required field: processAnalysis.summary")
      }
      if (!processAnalysis.summary.metrics) {
        throw new Error("Missing required field: processAnalysis.summary.metrics")
      }
      if (!Array.isArray(processAnalysis.summary.roles)) {
        throw new Error("processAnalysis.summary.roles must be an array")
      }
      if (!Array.isArray(processAnalysis.summary.tools)) {
        throw new Error("processAnalysis.summary.tools must be an array")
      }

      // Validate insights array
      if (!Array.isArray(processAnalysis.insights)) {
        throw new Error("processAnalysis.insights must be an array")
      }

      // Validate aiOpportunities array
      if (!Array.isArray(processAnalysis.aiOpportunities)) {
        throw new Error("processAnalysis.aiOpportunities must be an array")
      }

      // Validate insights structure
      for (const insight of processAnalysis.insights) {
        if (!insight.id || !insight.title || !insight.description || !insight.type || !insight.severity) {
          throw new Error("Each insight must have id, title, description, type, and severity")
        }
      }

      // Validate aiOpportunities structure
      for (const opportunity of processAnalysis.aiOpportunities) {
        if (
          !opportunity.id ||
          !opportunity.title ||
          !opportunity.description ||
          !opportunity.targetStepId ||
          !opportunity.targetStepTitle ||
          !opportunity.category ||
          !opportunity.impact
        ) {
          throw new Error(
            "Each AI opportunity must have id, title, description, targetStepId, targetStepTitle, category, and impact",
          )
        }
      }

      setError(null)
      setIsValid(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
      setIsValid(false)
    }
  }

  const handleInputChange = (value: string) => {
    setJsonInput(value)
    validateJSON(value)
  }

  const handleSubmit = () => {
    if (!isValid || !jsonInput.trim()) return

    try {
      const parsed = JSON.parse(jsonInput)
      onSubmit(parsed)
      onClose()
      setJsonInput("")
      setError(null)
      setIsValid(false)
    } catch (err) {
      setError("Failed to parse JSON")
    }
  }

  const handleClose = () => {
    onClose()
    setJsonInput("")
    setError(null)
    setIsValid(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[76vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Override Process Analysis Data</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="text-sm text-gray-600">
            Paste your process analysis JSON below. The data should include process details, metrics, insights, and AI
            opportunities.
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <Textarea
              value={jsonInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`{
  "processAnalysis": {
    "meta": {
      "processTitle": "New Employee Onboarding",
      "source": "uploadedFlow",
      "analysisDate": "2025-06-19"
    },
    "summary": {
      "metrics": {
        "stepCount": 8,
        "roleCount": 4,
        "frictionCount": 2,
        "handoffCount": 2,
        "automatedCount": 1,
        "estimatedDurationMinutes": 5040
      },
      "roles": ["Hiring Manager", "HR Specialist"],
      "tools": ["HRIS", "Email", "ATS"]
    },
    "insights": [
      {
        "id": "1",
        "title": "Bottleneck Detected",
        "description": "Step 4 takes 4 hours and has friction tags",
        "type": "delay",
        "severity": "high",
        "icon": "alert-triangle"
      }
    ],
    "aiOpportunities": [
      {
        "id": "auto-score-candidates",
        "title": "Auto-score candidates",
        "description": "Use AI to automatically score candidates",
        "targetStepId": "4",
        "targetStepTitle": "Screen Candidates",
        "category": "analysis",
        "impact": "high",
        "icon": "layers",
        "dataSource": {
          "hasDataSource": true,
          "traffic": "2.3k/day",
          "volume": "High"
        }
      }
    ]
  }
}`}
              className="flex-1 min-h-[300px] font-mono text-sm resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {isValid && !error && jsonInput.trim() && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div className="text-sm text-green-700">Valid process analysis data format</div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || !jsonInput.trim()}>
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
