"use client"

import type React from "react"

import type { FlowNode } from "@/types/flow"
import { AlertTriangle, ArrowRight, Zap, Play, Clock, Paperclip, Edit3 } from "lucide-react"

type FlowNodeProps = {
  node: FlowNode
  isSelected: boolean
  onSelect: (nodeId: string) => void
  onEdit?: (nodeId: string) => void
  style?: React.CSSProperties
}

const tagIcons = {
  friction: <AlertTriangle className="h-3 w-3" />,
  handoff: <ArrowRight className="h-3 w-3" />,
  automated: <Zap className="h-3 w-3" />,
  trigger: <Play className="h-3 w-3" />,
}

const tagColors = {
  friction: "bg-red-100 text-red-600 border-red-200",
  handoff: "bg-violet-100 text-violet-600 border-violet-200",
  automated: "bg-green-100 text-green-600 border-green-200",
  trigger: "bg-blue-100 text-blue-600 border-blue-200",
}

export function FlowNodeComponent({ node, isSelected, onSelect, onEdit, style }: FlowNodeProps) {
  return (
    <div
      className={`
        absolute bg-white rounded-xl border-2 cursor-pointer group select-none
        transition-all duration-200 hover:shadow-lg
        ${isSelected ? "border-violet-500 shadow-lg ring-4 ring-violet-100" : "border-gray-200 shadow-sm hover:border-gray-300"}
      `}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: "240px",
        minHeight: "120px",
        ...style,
      }}
    >
      {/* Node Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 leading-tight mb-2 pr-2 select-none">{node.title}</h3>
          {node.role && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2 h-2 bg-violet-400 rounded-full flex-shrink-0"></div>
              <p className="text-sm text-gray-600 font-medium truncate select-none">{node.role}</p>
            </div>
          )}
        </div>

        {/* Edit button - only visible when selected */}
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(node.id)
            }}
            className="flex-shrink-0 w-8 h-8 bg-violet-600 hover:bg-violet-700 text-white rounded-md shadow-md transition-all duration-200 flex items-center justify-center ml-2"
            title="Edit node"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Node Content */}
      <div className="px-4 pb-4 space-y-3">
        {/* Tools */}
        {node.tools && node.tools.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide select-none">Tools</div>
            <div className="text-sm text-gray-700 leading-relaxed select-none">
              {node.tools.slice(0, 2).join(", ")}
              {node.tools.length > 2 && <span className="text-gray-500"> +{node.tools.length - 2} more</span>}
            </div>
          </div>
        )}

        {/* Time and Attachments Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {node.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium select-none">
                  {node.duration.value} {node.duration.unit}
                </span>
              </div>
            )}
            {node.attachments && node.attachments.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" />
                <span className="font-medium select-none">{node.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Tags as rounded squares */}
          {node.tags.length > 0 && (
            <div className="flex gap-1.5">
              {node.tags.map((tag) => (
                <div
                  key={tag}
                  className={`w-6 h-6 rounded-md flex items-center justify-center ${tagColors[tag]} select-none`}
                  title={tag.charAt(0).toUpperCase() + tag.slice(1)}
                >
                  {tagIcons[tag]}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
