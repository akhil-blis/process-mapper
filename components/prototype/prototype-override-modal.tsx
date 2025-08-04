"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { PrototypePlan } from "@/types/prototype"

interface PrototypeOverrideModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PrototypePlan) => void
}

export function PrototypeOverrideModal({ isOpen, onClose, onSubmit }: PrototypeOverrideModalProps) {
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

      // Validate required fields
      if (!parsed.screens || !Array.isArray(parsed.screens)) {
        throw new Error("Missing or invalid 'screens' array")
      }

      if (!parsed.connections || !Array.isArray(parsed.connections)) {
        throw new Error("Missing or invalid 'connections' array")
      }

      // Validate screen structure
      for (const screen of parsed.screens) {
        if (!screen.id || !screen.title || !screen.position || !screen.elements) {
          throw new Error("Each screen must have id, title, position, and elements")
        }

        if (!Array.isArray(screen.elements)) {
          throw new Error("Screen elements must be an array")
        }

        if (typeof screen.position.x !== "number" || typeof screen.position.y !== "number") {
          throw new Error("Screen position must have numeric x and y coordinates")
        }

        // Validate element structure
        for (const element of screen.elements) {
          if (!element.id || !element.type || !element.label || !element.screenId || !element.position) {
            throw new Error("Each element must have id, type, label, screenId, and position")
          }

          if (!["info", "action", "input"].includes(element.type)) {
            throw new Error("Element type must be 'info', 'action', or 'input'")
          }

          if (typeof element.position.x !== "number" || typeof element.position.y !== "number") {
            throw new Error("Element position must have numeric x and y coordinates")
          }
        }
      }

      // Validate connection structure
      for (const connection of parsed.connections) {
        if (!connection.id || !connection.fromElementId || !connection.toScreenId) {
          throw new Error("Each connection must have id, fromElementId, and toScreenId")
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
          <DialogTitle>Override Prototype Plan Data</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="text-sm text-gray-600">
            Paste your prototype plan JSON below. The data should include screens and connections arrays with proper
            structure.
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <Textarea
              value={jsonInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`{
  "screens": [
    {
      "id": "screen-1",
      "title": "Resume Upload",
      "position": { "x": 50, "y": 50 },
      "elements": [
        {
          "id": "elem-1",
          "type": "input",
          "label": "Upload Resume",
          "screenId": "screen-1",
          "position": { "x": 10, "y": 10 }
        }
      ]
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "fromElementId": "elem-1",
      "toScreenId": "screen-2"
    }
  ]
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
              <div className="text-sm text-green-700">Valid prototype plan data format</div>
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
