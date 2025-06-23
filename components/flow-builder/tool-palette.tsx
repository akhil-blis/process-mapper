"use client"
import { Plus, Code, Download } from "lucide-react"

type ToolPaletteProps = {
  onOverrideClick?: () => void
  onExportClick?: () => void
  onAddNodeClick?: () => void
}

export function ToolPalette({ onOverrideClick, onExportClick, onAddNodeClick }: ToolPaletteProps) {
  const paletteItems = [
    {
      id: "add-node",
      label: "Add Node",
      icon: <Plus className="h-4 w-4" />,
      color: "bg-green-50 text-green-600",
      onClick: onAddNodeClick,
    },
    {
      id: "export",
      label: "Export",
      icon: <Download className="h-4 w-4" />,
      color: "bg-indigo-50 text-indigo-600",
      onClick: onExportClick,
    },
    {
      id: "override",
      label: "Override",
      icon: <Code className="h-4 w-4" />,
      color: "bg-orange-50 text-orange-600",
      onClick: onOverrideClick,
    },
  ]

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 space-y-2">
        <div className="text-xs font-medium text-gray-500 mb-3 px-1">Tools</div>
        {paletteItems.map((item) => (
          <div
            key={item.id}
            onClick={item.onClick}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 hover:bg-gray-100 cursor-pointer
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
