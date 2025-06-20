"use client"

import { useState } from "react"
import { X, AlertCircle } from "lucide-react"

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

type OpportunityOverrideModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: OpportunityData) => void
  currentData: OpportunityData
}

export function OpportunityOverrideModal({ isOpen, onClose, onSubmit, currentData }: OpportunityOverrideModalProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    try {
      const parsed = JSON.parse(jsonInput)

      // Basic validation
      if (!parsed.title || !parsed.summary || !parsed.process_step || !parsed.roles_involved) {
        throw new Error("Missing required fields: title, summary, process_step, or roles_involved")
      }

      if (!parsed.why_this_matters || !parsed.how_it_works || !parsed.mvp_plan) {
        throw new Error("Missing required sections: why_this_matters, how_it_works, or mvp_plan")
      }

      onSubmit(parsed)
      onClose()
      setJsonInput("")
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
    }
  }

  const sampleJson = JSON.stringify(currentData, null, 2)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Override Opportunity Data</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              <label htmlFor="json-input" className="block text-sm font-medium text-gray-900">
                Opportunity Data JSON
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
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">title</code>
                    <span>Opportunity title</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">summary</code>
                    <span>Detailed description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">process_step</code>
                    <span>Process step info</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">roles_involved</code>
                    <span>Array of roles</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">impact_estimate</code>
                    <span>Impact description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">why_this_matters</code>
                    <span>Array of insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">how_it_works</code>
                    <span>Solution steps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">mvp_plan</code>
                    <span>Implementation phases</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
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
