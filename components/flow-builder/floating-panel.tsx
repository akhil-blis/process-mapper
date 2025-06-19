"use client"

import { useState, useEffect } from "react"
import type { FlowNode } from "@/types/flow"
import { X, ArrowRight, Trash2, Paperclip, AlertTriangle, Play, Zap, ChevronDown } from "lucide-react"

type FloatingPanelProps = {
  node: FlowNode
  position: { x: number; y: number }
  onClose: () => void
  onUpdate: (nodeId: string, updates: Partial<FlowNode>) => void
}

export function FloatingPanel({ node, position, onClose, onUpdate }: FloatingPanelProps) {
  const [showToolsDropdown, setShowToolsDropdown] = useState(false)

  const toggleTag = (tag: "friction" | "handoff" | "automated" | "trigger") => {
    const currentTags = node.tags || []
    const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag]

    onUpdate(node.id, { tags: newTags })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showToolsDropdown && !event.target.closest(".tools-dropdown")) {
        setShowToolsDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showToolsDropdown])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".floating-panel") && !target.closest(".flow-node")) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  return (
    <div
      className="floating-panel fixed bg-white rounded-lg border shadow-xl p-3 w-[400px] z-50"
      style={{
        left: position.x + 10,
        top: position.y - 10,
      }}
    >
      {/* Header with Title and Main Actions */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 text-sm">Edit Step</h3>
        <div className="flex items-center gap-1">
          <button
            title="Delete"
            className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors text-gray-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-colors text-gray-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Flag Buttons Row */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <button
          title="Friction Point"
          onClick={() => toggleTag("friction")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-150 text-xs font-medium ${
            node.tags?.includes("friction")
              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              : "text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Friction</span>
        </button>
        <button
          title="Handoff"
          onClick={() => toggleTag("handoff")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-150 text-xs font-medium ${
            node.tags?.includes("handoff")
              ? "bg-violet-50 text-violet-600 border border-violet-200 hover:bg-violet-100"
              : "text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span>Handoff</span>
        </button>
        <button
          title="Automated"
          onClick={() => toggleTag("automated")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-150 text-xs font-medium ${
            node.tags?.includes("automated")
              ? "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
              : "text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Auto</span>
        </button>
        <button
          title="Trigger"
          onClick={() => toggleTag("trigger")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-150 text-xs font-medium ${
            node.tags?.includes("trigger")
              ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
              : "text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <Play className="h-3.5 w-3.5" />
          <span>Trigger</span>
        </button>
      </div>

      <div className="space-y-3">
        {/* All input fields */}
        <div>
          <input
            type="text"
            value={node.title}
            onChange={(e) => onUpdate(node.id, { title: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent"
            placeholder="Step name"
          />
        </div>

        <div>
          <input
            type="text"
            value={node.role || ""}
            onChange={(e) => onUpdate(node.id, { role: e.target.value })}
            placeholder="Who performs this step?"
            className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* Tools */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tools</label>
          <div className="relative tools-dropdown">
            <div
              onClick={() => setShowToolsDropdown(!showToolsDropdown)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent bg-white min-h-[32px] flex flex-wrap gap-1 items-center cursor-pointer"
            >
              {node.tools && node.tools.length > 0 ? (
                node.tools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    {tool}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const newTools = node.tools?.filter((t) => t !== tool) || []
                        onUpdate(node.id, { tools: newTools })
                      }}
                      className="hover:text-gray-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">Select tools...</span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-gray-400 ml-auto transition-transform ${showToolsDropdown ? "rotate-180" : ""}`}
              />
            </div>
            {showToolsDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                {[
                  "Slack",
                  "Email",
                  "Google Docs",
                  "Zoom",
                  "Calendar",
                  "HRIS",
                  "ATS",
                  "LinkedIn",
                  "Indeed",
                  "DocuSign",
                  "Active Directory",
                  "Google Workspace",
                ].map((tool) => (
                  <label
                    key={tool}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={node.tools?.includes(tool) || false}
                      onChange={(e) => {
                        const currentTools = node.tools || []
                        const newTools = e.target.checked
                          ? [...currentTools, tool]
                          : currentTools.filter((t) => t !== tool)
                        onUpdate(node.id, { tools: newTools })
                      }}
                      className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span>{tool}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timing */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={node.duration?.value || ""}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value) || 0
                onUpdate(node.id, {
                  duration: {
                    value,
                    unit: node.duration?.unit || "minutes",
                  },
                })
              }}
              placeholder="0"
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent"
              min="0"
            />
            <select
              value={node.duration?.unit || "minutes"}
              onChange={(e) => {
                onUpdate(node.id, {
                  duration: {
                    value: node.duration?.value || 0,
                    unit: e.target.value as "minutes" | "hours" | "days" | "weeks",
                  },
                })
              }}
              className="px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent bg-white"
            >
              <option value="minutes">min</option>
              <option value="hours">hrs</option>
              <option value="days">days</option>
              <option value="weeks">weeks</option>
            </select>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Attachments</label>

          {/* Show existing attachments */}
          {node.attachments && node.attachments.length > 0 && (
            <div className="space-y-1 mb-2">
              {node.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 rounded-md px-2 py-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Paperclip className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate text-gray-700">{attachment.name}</span>
                    <span className="text-gray-400 flex-shrink-0">({attachment.type})</span>
                  </div>
                  <button
                    onClick={() => {
                      const newAttachments = node.attachments?.filter((_, i) => i !== index) || []
                      onUpdate(node.id, { attachments: newAttachments })
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm text-left text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent transition-colors flex items-center gap-2">
            <Paperclip className="h-3.5 w-3.5" />
            <span>Attach files...</span>
          </button>
        </div>
      </div>
    </div>
  )
}
