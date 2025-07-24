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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Override Process Analysis Data</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              <label htmlFor="json-input" className="block text-sm font-medium text-gray-900">
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
                className="w-full h-80 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-mono text-sm resize-none"
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-800">Validation Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Expected Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">processAnalysis.meta</code>
                    <span>Process metadata</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">processAnalysis.summary</code>
                    <span>Metrics, roles, and tools</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">processAnalysis.insights</code>
                    <span>AI-generated insights array</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">processAnalysis.aiOpportunities</code>
                    <span>AI opportunities array</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!jsonInput.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  )
}
