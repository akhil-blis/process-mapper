"use client"

import type React from "react"
import type { FlowNode } from "@/types/flow"
import { AlertTriangle, ArrowRight, Zap, Play, Clock, Paperclip, Edit3, Database, Settings } from 'lucide-react'

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
  handoff: "bg-brand-50 text-brand border-violet-200",
  automated: "bg-green-100 text-green-600 border-green-200",
  trigger: "bg-blue-50 text-blue-700 border-blue-200",
}

const dataSourceTypeIcons = {
  api: <Database className="h-3 w-3" />,
  event_stream: <Zap className="h-3 w-3" />,
  internal_tool: <Settings className="h-3 w-3" />,
}

const dataSourceTypeColors = {
  api: "bg-indigo-100 text-indigo-600",
  event_stream: "bg-brand-50 text-brand",
  internal_tool: "bg-green-100 text-green-600",
}

export function FlowNodeComponent({ node, isSelected, onSelect, onEdit, style }: FlowNodeProps) {
  return (
    <div
      className={`
        absolute bg-surface rounded-xl-token border cursor-pointer group select-none
        transition-all duration-200 shadow-e1 hover:shadow-e2
        ${isSelected ? "ring-4 ring-brand/20 border-violet-200" : "border-default"}
      `}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: "240px",
        minHeight: "120px",
        ...style,
      }}
      onClick={() => onSelect(node.id)}
    >
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-900 leading-tight pr-2 select-none flex-1">
              {node.title}
            </h3>

            {node.simulatedSources && node.simulatedSources.length > 0 && (
              <div className="flex gap-1 flex-shrink-0">
                {node.simulatedSources.slice(0, 3).map((source, index) => (
                  <div
                    key={index}
                    className={`w-5 h-5 rounded flex items-center justify-center ${dataSourceTypeColors[source.type]} select-none`}
                    title={`${source.label} - ${source.volume.toLocaleString()}/mo, ${(source.errorRate * 100).toFixed(1)}% error rate`}
                  >
                    {dataSourceTypeIcons[source.type]}
                  </div>
                ))}
                {node.simulatedSources.length > 3 && (
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-subtle text-secondary text-xs font-medium">
                    +{node.simulatedSources.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>

          {node.role && (
            <div className="inline-flex items-center gap-1.5 mb-3 badge-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              <p className="text-xs font-medium text-secondary truncate select-none">{node.role}</p>
            </div>
          )}
        </div>

        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(node.id)
            }}
            className="flex-shrink-0 w-8 h-8 bg-brand hover:bg-brand-700 text-white rounded-md shadow-e1 transition-all duration-200 flex items-center justify-center ml-2"
            title="Edit node"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-4 pb-4 space-y-3">
        {node.tools && node.tools.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted uppercase tracking-wide select-none">Tools</div>
            <div className="text-sm text-secondary leading-relaxed select-none">
              {node.tools.slice(0, 2).join(", ")}
              {node.tools.length > 2 && <span className="text-muted"> +{node.tools.length - 2} more</span>}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted">
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

          {node.tags.length > 0 && (
            <div className="flex gap-1.5">
              {node.tags.map((tag) => (
                <div
                  key={tag}
                  className={`px-1.5 h-6 rounded-pill border text-xs inline-flex items-center justify-center ${tagColors[tag]}`}
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
