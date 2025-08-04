"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Layers, FileText, Brain, MessageSquare, BarChart3, FilePlus, Settings } from "lucide-react"

type OpportunityFormData = {
  id: string
  title: string
  description: string
  targetStepId: string
  targetStepTitle: string
  category: "classification" | "decision" | "summarization" | "analysis" | "communication" | "generation" | "automation"
  impact: "high" | "medium" | "low"
  icon: string
  dataSource?: {
    hasDataSource: boolean
    traffic?: string
    volume?: string
  }
}

type AddOpportunityModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (opportunity: OpportunityFormData) => void
  editingOpportunity?: OpportunityFormData | null
  availableSteps: Array<{ id: string; title: string }>
}

const categoryOptions = [
  { value: "classification", label: "Classification", icon: Layers },
  { value: "decision", label: "Decision", icon: Brain },
  { value: "summarization", label: "Summarization", icon: FileText },
  { value: "analysis", label: "Analysis", icon: BarChart3 },
  { value: "communication", label: "Communication", icon: MessageSquare },
  { value: "generation", label: "Generation", icon: FilePlus },
  { value: "automation", label: "Automation", icon: Settings },
]

const impactColors = {
  high: "bg-green-100 border-green-200",
  medium: "bg-yellow-100 border-yellow-200",
  low: "bg-red-100 border-red-200",
}

const getIconColor = (impact: string) => {
  switch (impact) {
    case "high":
      return "bg-green-500"
    case "medium":
      return "bg-yellow-500"
    case "low":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export function AddOpportunityModal({
  isOpen,
  onClose,
  onSubmit,
  editingOpportunity,
  availableSteps,
}: AddOpportunityModalProps) {
  const [formData, setFormData] = useState<OpportunityFormData>({
    id: "",
    title: "",
    description: "",
    targetStepId: "",
    targetStepTitle: "",
    category: "analysis",
    impact: "medium",
    icon: "bar-chart-3",
    dataSource: {
      hasDataSource: false,
      traffic: "",
      volume: "",
    },
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens/closes or when editing opportunity changes
  useEffect(() => {
    if (isOpen) {
      if (editingOpportunity) {
        setFormData({
          ...editingOpportunity,
          dataSource: editingOpportunity.dataSource || {
            hasDataSource: false,
            traffic: "",
            volume: "",
          },
        })
      } else {
        setFormData({
          id: "",
          title: "",
          description: "",
          targetStepId: "",
          targetStepTitle: "",
          category: "analysis",
          impact: "medium",
          icon: "bar-chart-3",
          dataSource: {
            hasDataSource: false,
            traffic: "",
            volume: "",
          },
        })
      }
      setErrors({})
    }
  }, [isOpen, editingOpportunity])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.targetStepId) {
      newErrors.targetStepId = "Target step is required"
    }

    if (formData.dataSource?.hasDataSource) {
      if (!formData.dataSource.traffic?.trim()) {
        newErrors.traffic = "Traffic is required when data source is enabled"
      }
      if (!formData.dataSource.volume?.trim()) {
        newErrors.volume = "Volume is required when data source is enabled"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Get the icon from the selected category
    const selectedCategory = categoryOptions.find((cat) => cat.value === formData.category)
    const categoryIcon =
      selectedCategory?.value === "classification"
        ? "layers"
        : selectedCategory?.value === "decision"
          ? "brain"
          : selectedCategory?.value === "summarization"
            ? "file-text"
            : selectedCategory?.value === "analysis"
              ? "bar-chart-3"
              : selectedCategory?.value === "communication"
                ? "message-square"
                : selectedCategory?.value === "generation"
                  ? "file-plus"
                  : selectedCategory?.value === "automation"
                    ? "settings"
                    : "bar-chart-3"

    // Generate ID if creating new opportunity
    const opportunityData = {
      ...formData,
      icon: categoryIcon,
      id: formData.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    onSubmit(opportunityData)
    onClose()
  }

  const handleStepChange = (stepId: string) => {
    const step = availableSteps.find((s) => s.id === stepId)
    setFormData((prev) => ({
      ...prev,
      targetStepId: stepId,
      targetStepTitle: step?.title || "",
    }))
  }

  const handleCategoryChange = (category: any) => {
    // Update the icon based on the selected category
    const categoryIcon =
      category === "classification"
        ? "layers"
        : category === "decision"
          ? "brain"
          : category === "summarization"
            ? "file-text"
            : category === "analysis"
              ? "bar-chart-3"
              : category === "communication"
                ? "message-square"
                : category === "generation"
                  ? "file-plus"
                  : category === "automation"
                    ? "settings"
                    : "bar-chart-3"

    setFormData((prev) => ({
      ...prev,
      category: category,
      icon: categoryIcon,
    }))
  }

  const selectedCategory = categoryOptions.find((option) => option.value === formData.category)
  const IconComponent = selectedCategory?.icon || BarChart3

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingOpportunity ? "Edit AI Opportunity" : "Add AI Opportunity"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Auto-score candidates"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="targetStep">Target Step *</Label>
                <Select value={formData.targetStepId} onValueChange={handleStepChange}>
                  <SelectTrigger className={errors.targetStepId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a process step" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSteps.map((step) => (
                      <SelectItem key={step.id} value={step.id}>
                        {step.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.targetStepId && <p className="text-sm text-red-600 mt-1">{errors.targetStepId}</p>}
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="impact">Impact Level</Label>
                <Select
                  value={formData.impact}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, impact: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Impact</SelectItem>
                    <SelectItem value="medium">Medium Impact</SelectItem>
                    <SelectItem value="low">Low Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe how this AI opportunity will improve the process..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>

              {/* Data Source Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasDataSource">Has Data Source</Label>
                  <Switch
                    id="hasDataSource"
                    checked={formData.dataSource?.hasDataSource || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        dataSource: {
                          ...prev.dataSource,
                          hasDataSource: checked,
                          traffic: checked ? prev.dataSource?.traffic || "" : "",
                          volume: checked ? prev.dataSource?.volume || "" : "",
                        },
                      }))
                    }
                  />
                </div>

                {formData.dataSource?.hasDataSource && (
                  <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                    <div>
                      <Label htmlFor="traffic">Traffic</Label>
                      <Input
                        id="traffic"
                        value={formData.dataSource?.traffic || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dataSource: {
                              ...prev.dataSource,
                              hasDataSource: true,
                              traffic: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g., 2.3k/day, 450/week"
                        className={errors.traffic ? "border-red-500" : ""}
                      />
                      {errors.traffic && <p className="text-sm text-red-600 mt-1">{errors.traffic}</p>}
                    </div>

                    <div>
                      <Label htmlFor="volume">Volume</Label>
                      <Select
                        value={formData.dataSource?.volume || ""}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            dataSource: {
                              ...prev.dataSource,
                              hasDataSource: true,
                              volume: value,
                            },
                          }))
                        }
                      >
                        <SelectTrigger className={errors.volume ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select volume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.volume && <p className="text-sm text-red-600 mt-1">{errors.volume}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
            <div className={`${impactColors[formData.impact]} border rounded-lg p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor(formData.impact)}`}>
                  <div className="text-white">
                    <IconComponent className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{formData.title || "Opportunity Title"}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {formData.description || "Opportunity description will appear here..."}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    formData.impact === "high"
                      ? "text-green-800 bg-green-200"
                      : formData.impact === "medium"
                        ? "text-yellow-800 bg-yellow-200"
                        : "text-red-800 bg-red-200"
                  }`}
                >
                  {formData.impact.charAt(0).toUpperCase() + formData.impact.slice(1)} Impact
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{formData.targetStepTitle || "Target Step"}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingOpportunity ? "Update Opportunity" : "Add Opportunity"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
