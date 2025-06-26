"use client"

import type React from "react"

import { useState } from "react"
import { X, Database, Zap, Settings, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DataSource } from "@/types/flow"

type DataSourceModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dataSource: DataSource) => void
  existingSources?: DataSource[]
}

const sourceTypeOptions = [
  { value: "api", label: "API", icon: <Database className="h-4 w-4" /> },
  { value: "event_stream", label: "Event Stream", icon: <Zap className="h-4 w-4" /> },
  { value: "internal_tool", label: "Internal Tool", icon: <Settings className="h-4 w-4" /> },
] as const

const getDefaultDataForType = (type: DataSource["type"]): Omit<DataSource, "type"> => {
  switch (type) {
    case "api":
      return {
        label: "Internal API – Job Queue",
        volume: 12000,
        errorRate: 0.14,
      }
    case "event_stream":
      return {
        label: "User Activity Stream",
        volume: 45000,
        errorRate: 0.08,
      }
    case "internal_tool":
      return {
        label: "HR Management System",
        volume: 8500,
        errorRate: 0.05,
      }
  }
}

export function DataSourceModal({ isOpen, onClose, onSubmit, existingSources = [] }: DataSourceModalProps) {
  const [selectedType, setSelectedType] = useState<DataSource["type"]>("api")
  const [formData, setFormData] = useState<Omit<DataSource, "type">>(() => getDefaultDataForType("api"))
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleTypeChange = (type: DataSource["type"]) => {
    setSelectedType(type)
    setFormData(getDefaultDataForType(type))
    setIsDropdownOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dataSource: DataSource = {
      type: selectedType,
      ...formData,
    }
    onSubmit(dataSource)
    onClose()
  }

  const handleClose = () => {
    setSelectedType("api")
    setFormData(getDefaultDataForType("api"))
    setIsDropdownOpen(false)
    onClose()
  }

  if (!isOpen) return null

  const selectedOption = sourceTypeOptions.find((opt) => opt.value === selectedType)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Plus className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Connect Data Source</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Source Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {selectedOption?.icon}
                    <span className="text-gray-900">{selectedOption?.label}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {sourceTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleTypeChange(option.value)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors text-left"
                      >
                        {option.icon}
                        <span className="text-gray-900">{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  id="label"
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Internal API – Job Queue"
                  required
                />
              </div>

              <div>
                <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">
                  Volume (per month)
                </label>
                <input
                  id="volume"
                  type="number"
                  value={formData.volume}
                  onChange={(e) => setFormData((prev) => ({ ...prev, volume: Number.parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="errorRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Error Rate (%)
                </label>
                <input
                  id="errorRate"
                  type="number"
                  value={(formData.errorRate * 100).toFixed(1)}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, errorRate: (Number.parseFloat(e.target.value) || 0) / 100 }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="14.0"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
            </div>

            {/* Existing Sources Preview */}
            {existingSources.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Sources</h4>
                <div className="space-y-2">
                  {existingSources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-md p-2"
                    >
                      {sourceTypeOptions.find((opt) => opt.value === source.type)?.icon}
                      <span className="flex-1 truncate">{source.label}</span>
                      <span className="text-gray-500">{source.volume.toLocaleString()}/mo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Connect Source
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
