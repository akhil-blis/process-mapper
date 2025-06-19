"use client"

import { useState } from "react"
import { X, AlertCircle } from "lucide-react"

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
      category: "classification" | "decision" | "summarization" | "analysis" | "communication"
      impact: "high" | "medium" | "low"
      icon: string
    }>
  }
}

type ProcessAnalysisOverrideModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProcessAnalysisData) => void
}

export function ProcessAnalysisOverrideModal({ isOpen, onClose, onSubmit }: ProcessAnalysisOverrideModalProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    try {
      const parsed = JSON.parse(jsonInput)

      // Basic validation
      if (!parsed.processAnalysis) {
        throw new Error("Missing 'processAnalysis' root object")
      }

      if (
        !parsed.processAnalysis.meta ||
        !parsed.processAnalysis.summary ||
        !parsed.processAnalysis.insights ||
        !parsed.processAnalysis.aiOpportunities
      ) {
        throw new Error("Missing required sections: meta, summary, insights, or aiOpportunities")
      }

      onSubmit(parsed)
      onClose()
      setJsonInput("")
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
    }
  }

  const sampleJson = `{
  "processAnalysis": {
    "meta": {
      "processTitle": "Your Process Name",
      "source": "uploadedFlow",
      "analysisDate": "2025-06-19"
    },
    "summary": {
      "metrics": {
        "stepCount": 5,
        "roleCount": 2,
        "frictionCount": 1,
        "handoffCount": 1,
        "automatedCount": 1,
        "estimatedDurationMinutes": 120
      },
      "roles": ["Role 1", "Role 2"],
      "tools": ["Tool 1", "Tool 2"]
    },
    "insights": [
      {
        "id": "insight-1",
        "title": "Sample Insight",
        "description": "Description of the insight",
        "type": "delay",
        "severity": "high",
        "icon": "alert-triangle"
      }
    ],
    "aiOpportunities": [
      {
        "id": "opp-1",
        "title": "Sample Opportunity",
        "description": "Description of the opportunity",
        "targetStepId": "1",
        "targetStepTitle": "Step Name",
        "category": "classification",
        "impact": "high",
        "icon": "layers"
      }
    ]
  }
}`

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Override Process Analysis Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <div>
              <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 mb-2">
                Process Analysis JSON
              </label>
              <textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value)
                  setError("")
                }}
                placeholder={sampleJson}
                className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 font-mono text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Expected Structure:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>
                  • <code>processAnalysis.meta</code> - Process metadata
                </li>
                <li>
                  • <code>processAnalysis.summary</code> - Metrics, roles, and tools
                </li>
                <li>
                  • <code>processAnalysis.insights</code> - AI-generated insights array
                </li>
                <li>
                  • <code>processAnalysis.aiOpportunities</code> - AI opportunities array
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!jsonInput.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  )
}
