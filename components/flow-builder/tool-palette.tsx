"use client"

import type React from "react"

import { useState } from "react"
import { Square, FileText, GitBranch, Play, StopCircle, Code, Download } from "lucide-react"

type PaletteItem = {
  id: string
  type: string
  label: string
  icon: React.ReactNode
  color: string
}

type ToolPaletteProps = {
  onOverrideClick?: () => void
  onExportClick?: () => void
}

export function ToolPalette({ onOverrideClick, onExportClick }: ToolPaletteProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const paletteItems: PaletteItem[] = [
    {
      id: "step",
      type: "step",
      label: "Step",
      icon: <Square className="h-4 w-4" />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "branch",
      type: "branch",
      label: "Branch",
      icon: <GitBranch className="h-4 w-4" />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      id: "note",
      type: "note",
      label: "Note",
      icon: <FileText className="h-4 w-4" />,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      id: "subprocess",
      type: "subprocess",
      label: "Sub-process",
      icon: <Square className="h-4 w-4" />,
      color: "bg-green-50 text-green-600",
    },
    {
      id: "start",
      type: "start",
      label: "Start",
      icon: <Play className="h-4 w-4" />,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "end",
      type: "end",
      label: "End",
      icon: <StopCircle className="h-4 w-4" />,
      color: "bg-red-50 text-red-600",
    },
    {
      id: "override",
      type: "override",
      label: "Override",
      icon: <Code className="h-4 w-4" />,
      color: "bg-orange-50 text-orange-600",
    },
    {
      id: "export",
      type: "export",
      label: "Export",
      icon: <Download className="h-4 w-4" />,
      color: "bg-indigo-50 text-indigo-600",
    },
  ]

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.setData("text/plain", itemId)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const handleItemClick = (itemId: string) => {
    if (itemId === "override" && onOverrideClick) {
      onOverrideClick()
    } else if (itemId === "export" && onExportClick) {
      onExportClick()
    }
  }

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 space-y-2">
        <div className="text-xs font-medium text-gray-500 mb-3 px-1">Tools</div>
        {paletteItems.map((item) => (
          <div
            key={item.id}
            draggable={item.id !== "override" && item.id !== "export"}
            onDragStart={
              item.id !== "override" && item.id !== "export" ? (e) => handleDragStart(e, item.id) : undefined
            }
            onDragEnd={item.id !== "override" && item.id !== "export" ? handleDragEnd : undefined}
            onClick={() => handleItemClick(item.id)}
            className={`
            flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 hover:bg-gray-100
            ${item.id === "override" || item.id === "export" ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"}
            ${draggedItem === item.id ? "opacity-50" : ""}
            ${item.color}
          `}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
