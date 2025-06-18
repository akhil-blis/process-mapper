"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import type { FlowNode, FlowEdge } from "@/types/flow"
import { FlowNodeComponent } from "./flow-node"
import { FloatingPanel } from "./floating-panel"

type CanvasProps = {
  nodes: FlowNode[]
  edges: FlowEdge[]
  onNodeUpdate: (nodeId: string, updates: Partial<FlowNode>) => void
}

export function Canvas({ nodes, edges, onNodeUpdate }: CanvasProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null

  // Handle wheel events for zoom and pan
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()

      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = -e.deltaY * 0.01
        const newScale = Math.max(0.1, Math.min(3, transform.scale + delta))

        setTransform((prev) => ({
          ...prev,
          scale: newScale,
        }))
      } else {
        // Pan
        setTransform((prev) => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }))
      }
    },
    [transform.scale],
  )

  // Handle mouse events for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !e.target.closest(".flow-node")) {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      setSelectedNodeId(null)
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastPanPoint.x
        const deltaY = e.clientY - lastPanPoint.y

        setTransform((prev) => ({
          ...prev,
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }))

        setLastPanPoint({ x: e.clientX, y: e.clientY })
      }
    },
    [isPanning, lastPanPoint],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener("wheel", handleWheel, { passive: false })
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      canvas.removeEventListener("wheel", handleWheel)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleWheel, handleMouseMove, handleMouseUp])

  // Generate SVG path for edges
  const generatePath = (edge: FlowEdge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    const targetNode = nodes.find((n) => n.id === edge.target)

    if (!sourceNode || !targetNode) return ""

    const startX = sourceNode.position.x + 220 // Updated node width
    const startY = sourceNode.position.y + 40 // Center of node
    const endX = targetNode.position.x
    const endY = targetNode.position.y + 40

    // Create smooth bezier curve
    const controlOffset = Math.abs(endX - startX) * 0.5
    const controlX1 = startX + controlOffset
    const controlX2 = endX - controlOffset

    return `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`
  }

  // Calculate grid offset for infinite feel
  const gridSize = 20
  const gridOffsetX =
    ((transform.x % (gridSize * transform.scale)) + gridSize * transform.scale) % (gridSize * transform.scale)
  const gridOffsetY =
    ((transform.y % (gridSize * transform.scale)) + gridSize * transform.scale) % (gridSize * transform.scale)

  useEffect(() => {
    // Set initial position to show the entire flow diagram
    const fitToFrame = () => {
      if (nodes.length === 0) return

      // Find the bounds of all nodes
      let minX = Number.POSITIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY

      nodes.forEach((node) => {
        minX = Math.min(minX, node.position.x)
        minY = Math.min(minY, node.position.y)
        maxX = Math.max(maxX, node.position.x + 240) // Node width
        maxY = Math.max(maxY, node.position.y + 120) // Node height
      })

      // Add padding
      minX -= 50
      minY -= 50
      maxX += 50
      maxY += 50

      // Calculate the scale and position to fit all nodes
      const width = maxX - minX
      const height = maxY - minY

      if (canvasRef.current) {
        const containerWidth = canvasRef.current.clientWidth
        const containerHeight = canvasRef.current.clientHeight

        const scaleX = containerWidth / width
        const scaleY = containerHeight / height
        const scale = Math.min(1, Math.min(scaleX, scaleY))

        const centerX = minX + width / 2
        const centerY = minY + height / 2

        const x = containerWidth / 2 - centerX * scale
        const y = containerHeight / 2 - centerY * scale

        setTransform({ x, y, scale })
      }
    }

    fitToFrame()
  }, [nodes])

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50">
      {/* Infinite Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
          backgroundSize: `${gridSize * transform.scale}px ${gridSize * transform.scale}px`,
          backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
          width: "200%",
          height: "200%",
          left: "-50%",
          top: "-50%",
        }}
      />

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Edges */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
          {edges.map((edge) => (
            <path
              key={edge.id}
              d={generatePath(edge)}
              stroke="#6b7280"
              strokeWidth="2"
              fill="none"
              strokeDasharray="none"
              markerEnd="url(#arrowhead)"
              className="hover:stroke-violet-500 transition-colors cursor-pointer"
            />
          ))}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="8"
              refX="11"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,8 L12,4 z" fill="#6b7280" />
            </marker>
          </defs>
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <div key={node.id} className="flow-node">
            <FlowNodeComponent node={node} isSelected={selectedNodeId === node.id} onSelect={setSelectedNodeId} />
          </div>
        ))}
      </div>

      {/* Floating Panel */}
      {selectedNode && (
        <FloatingPanel
          node={selectedNode}
          position={{
            x: (selectedNode.position.x + 200) * transform.scale + transform.x,
            y: selectedNode.position.y * transform.scale + transform.y,
          }}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={onNodeUpdate}
        />
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-20 right-4 bg-white rounded-md shadow-md border p-2 space-y-1">
        <button
          onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }))}
          className="block w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors text-lg font-bold"
        >
          +
        </button>
        <button
          onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(0.1, prev.scale / 1.2) }))}
          className="block w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors text-lg font-bold"
        >
          −
        </button>
        <button
          onClick={() => {
            // Find the bounds of all nodes
            let minX = Number.POSITIVE_INFINITY
            let minY = Number.POSITIVE_INFINITY
            let maxX = Number.NEGATIVE_INFINITY
            let maxY = Number.NEGATIVE_INFINITY

            nodes.forEach((node) => {
              minX = Math.min(minX, node.position.x)
              minY = Math.min(minY, node.position.y)
              maxX = Math.max(maxX, node.position.x + 240) // Node width
              maxY = Math.max(maxY, node.position.y + 120) // Node height
            })

            // Add padding
            minX -= 50
            minY -= 50
            maxX += 50
            maxY += 50

            // Calculate the scale and position to fit all nodes
            const width = maxX - minX
            const height = maxY - minY

            if (canvasRef.current) {
              const containerWidth = canvasRef.current.clientWidth
              const containerHeight = canvasRef.current.clientHeight

              const scaleX = containerWidth / width
              const scaleY = containerHeight / height
              const scale = Math.min(1, Math.min(scaleX, scaleY))

              const centerX = minX + width / 2
              const centerY = minY + height / 2

              const x = containerWidth / 2 - centerX * scale
              const y = containerHeight / 2 - centerY * scale

              setTransform({ x, y, scale })
            }
          }}
          className="block w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors flex items-center justify-center"
          title="Fit to frame"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>
    </div>
  )
}
