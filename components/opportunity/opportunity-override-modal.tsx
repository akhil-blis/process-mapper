"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface OpportunityData {
  title: string
  summary: string
  processStep: string
  rolesInvolved: string[]
  impactEstimate: string
  whyMatters: Array<{
    title: string
    description: string
    type: "bottleneck" | "quality" | "scale"
  }>
  howItWorks: Array<{
    title: string
    description: string
  }>
  mvpPlan: {
    conceptValidation: {
      duration: string
      steps: Array<{
        title: string
        description: string
      }>
    }
    prototypeDevelopment: {
      duration: string
      steps: string[]
    }
    mvpIntegration: {
      duration: string
      steps: string[]
    }
  }
}

interface OpportunityOverrideModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: OpportunityData) => void
}

export function OpportunityOverrideModal({ isOpen, onClose, onSubmit }: OpportunityOverrideModalProps) {
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

      // Validate required fields - these match the actual OpportunityData structure
      const requiredFields = [
        "title",
        "summary",
        "processStep", // Changed from "process_step" to "processStep"
        "rolesInvolved", // Changed from "roles_involved" to "rolesInvolved"
        "impactEstimate", // Changed from "impact_estimate" to "impactEstimate"
        "whyMatters", // Changed from "why_this_matters" to "whyMatters"
        "howItWorks", // Changed from "how_it_works" to "howItWorks"
        "mvpPlan", // Changed from "mvp_plan" to "mvpPlan"
      ]

      for (const field of requiredFields) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      // Validate nested structures
      if (!Array.isArray(parsed.rolesInvolved)) {
        throw new Error("rolesInvolved must be an array")
      }

      if (!Array.isArray(parsed.whyMatters)) {
        throw new Error("whyMatters must be an array")
      }

      if (!Array.isArray(parsed.howItWorks)) {
        throw new Error("howItWorks must be an array")
      }

      if (!parsed.mvpPlan.conceptValidation || !Array.isArray(parsed.mvpPlan.conceptValidation.steps)) {
        throw new Error("mvpPlan.conceptValidation.steps must be an array")
      }

      if (!parsed.mvpPlan.prototypeDevelopment || !Array.isArray(parsed.mvpPlan.prototypeDevelopment.steps)) {
        throw new Error("mvpPlan.prototypeDevelopment.steps must be an array")
      }

      if (!parsed.mvpPlan.mvpIntegration || !Array.isArray(parsed.mvpPlan.mvpIntegration.steps)) {
        throw new Error("mvpPlan.mvpIntegration.steps must be an array")
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
          <DialogTitle>Override Opportunity Data</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="text-sm text-gray-600">
            Paste your opportunity data JSON below. The data should include all required fields like title, summary,
            process_step, roles_involved, etc.
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <Textarea
              value={jsonInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`{
  "id": "auto-score-candidates",
  "title": "Auto-score candidates",
  "summary": "Description of the opportunity...",
  "processStep": "Screen Candidates",
  "rolesInvolved": ["HR Specialist", "Hiring Manager"],
  "impactEstimate": "Saves time and improves efficiency...",
  "whyMatters": [
    {
      "id": "1",
      "type": "bottleneck",
      "title": "Current bottleneck",
      "description": "Manual process takes too long..."
    }
  ],
  "howItWorks": [
    {
      "id": "1", 
      "title": "Step 1",
      "description": "How it works..."
    }
  ],
  "mvpPlan": {
    "conceptValidation": {
      "duration": "2-3 weeks",
      "steps": [
        {
          "id": "1",
          "title": "Validate concept",
          "description": "Test the approach..."
        }
      ]
    },
    "prototypeDevelopment": {
      "duration": "4-6 weeks", 
      "steps": [...]
    },
    "mvpIntegration": {
      "duration": "3-4 weeks",
      "steps": [...]
    }
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
              <div className="text-sm text-green-700">Valid opportunity data format</div>
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
