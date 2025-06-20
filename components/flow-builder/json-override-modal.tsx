"use client"

import { useState } from "react"
import { X, Code, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FlowData } from "@/types/flow"

type JSONOverrideModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (flowData: FlowData) => void
}

export function JSONOverrideModal({ isOpen, onClose, onSubmit }: JSONOverrideModalProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!jsonInput.trim()) {
      setError("Please enter JSON data")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const parsedData = JSON.parse(jsonInput)

      // Basic validation
      if (!parsedData.nodes || !Array.isArray(parsedData.nodes)) {
        throw new Error("JSON must contain a 'nodes' array")
      }

      if (!parsedData.edges || !Array.isArray(parsedData.edges)) {
        throw new Error("JSON must contain an 'edges' array")
      }

      // Validate node structure
      for (const node of parsedData.nodes) {
        if (!node.id || !node.type || !node.title) {
          throw new Error("Each node must have 'id', 'type', and 'title' properties")
        }
        if (!node.position || typeof node.position.row !== "number" || typeof node.position.column !== "number") {
          throw new Error("Each node must have a position with 'row' and 'column' numbers")
        }
      }

      // Validate edge structure
      for (const edge of parsedData.edges) {
        if (!edge.id || !edge.source || !edge.target) {
          throw new Error("Each edge must have 'id', 'source', and 'target' properties")
        }
      }

      const flowData: FlowData = {
        title: parsedData.title || "Imported Process",
        nodes: parsedData.nodes,
        edges: parsedData.edges,
      }

      onSubmit(flowData)
      setJsonInput("")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setJsonInput("")
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Code className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Override Process Flow</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              <label htmlFor="json-input" className="block text-sm font-medium text-gray-900">
                Paste your process flow JSON:
              </label>
              <textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`{
  "title": "My Process",
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "title": "Begin Process",
      "position": { "row": 1, "column": 1 },
      "tags": []
    }
  ],
  "edges": []
}`}
                className="w-full h-80 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm resize-none"
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
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Required Format</h3>
              <p className="text-xs text-gray-600">
                JSON object with 'nodes' and 'edges' arrays. Each node needs 'id', 'type', 'title', and 'position' with
                'row' and 'column' numbers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !jsonInput.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? "Processing..." : "Override Flow"}
          </Button>
        </div>
      </div>
    </div>
  )
}
