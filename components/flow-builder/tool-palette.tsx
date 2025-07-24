"use client"
import { Plus, Download } from "lucide-react"

type ToolPaletteProps = {
  onExportClick?: () => void
  onAddNodeClick?: () => void
}

export function ToolPalette({ onExportClick, onAddNodeClick }: ToolPaletteProps) {
  const paletteItems = [
    {
      id: "add-node",
      label: "Add Node",
      icon: <Plus className="h-4 w-4" />,
      baseClasses: "bg-green-50 text-green-600",
      hoverClasses: "hover:bg-green-100 hover:text-green-700",
      onClick: onAddNodeClick,
    },
    {
      id: "export",
      label: "Export",
      icon: <Download className="h-4 w-4" />,
      baseClasses: "bg-indigo-50 text-indigo-600",
      hoverClasses: "hover:bg-indigo-100 hover:text-indigo-700",
      onClick: onExportClick,
    },
  ]

  return (
    <div className="fixed left-4 bottom-20 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 space-y-2">
        <div className="text-xs font-medium text-gray-500 mb-3 px-1">Tools</div>
        {paletteItems.map((item) => (
          <div
            key={item.id}
            onClick={item.onClick}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer
              ${item.baseClasses} ${item.hoverClasses}
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
