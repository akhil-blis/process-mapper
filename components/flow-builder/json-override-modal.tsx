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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[60vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Code className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold">Override Process Flow</h2>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <div className="mb-4">
            <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="text-xs text-gray-500 mb-4">
            <strong>Required format:</strong> JSON object with 'nodes' and 'edges' arrays. Each node needs 'id', 'type',
            'title', and 'position' with 'row' and 'column' numbers.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
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
