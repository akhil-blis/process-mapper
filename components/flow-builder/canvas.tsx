"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react"
import type { FlowNode, FlowEdge } from "@/types/flow"
import { FlowNodeComponent } from "./flow-node"
import { FloatingPanel } from "./floating-panel"
import { nanoid } from "nanoid"

type CanvasProps = {
  nodes: FlowNode[]
  edges: FlowEdge[]
  onNodeUpdate: (nodeId: string, updates: Partial<FlowNode>) => void
  onNodeAdd?: (node: FlowNode) => void
  onNodeDelete?: (nodeId: string) => void
  onEdgeAdd?: (edge: FlowEdge) => void
  onEdgeDelete?: (edgeId: string) => void
  onEdgeUpdate?: (edgeId: string, updates: Partial<FlowEdge>) => void
}

export type CanvasRef = {
  exportAsImage: () => Promise<string>
  enterPlacementMode: () => void
}

// Layout constants - doubled the spacing between nodes
const NODE_WIDTH = 240
const NODE_HEIGHT = 120
const GRID_COL_GAP = 160 // Doubled from 80
const GRID_ROW_GAP = 200 // Doubled from 100
const CANVAS_PADDING_X = 60
const CANVAS_PADDING_Y = 60
const GRID_X_SPACING = NODE_WIDTH + GRID_COL_GAP
const GRID_Y_SPACING = NODE_HEIGHT + GRID_ROW_GAP

// Connection dot constants
const CONNECTION_DOT_SIZE = 16
const CONNECTION_DOT_Y_OFFSET = 20

export const Canvas = forwardRef<CanvasRef, CanvasProps>(
  ({ nodes, edges, onNodeUpdate, onNodeAdd, onNodeDelete, onEdgeAdd, onEdgeDelete, onEdgeUpdate }, ref) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [connectingFromNode, setConnectingFromNode] = useState<string | null>(null)
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
    const [isPanning, setIsPanning] = useState(false)
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 800 })
    const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null)
    const canvasRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
    const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null)
    const [editingLabel, setEditingLabel] = useState("")
    const editInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const [highlightedCell, setHighlightedCell] = useState<{ row: number; column: number } | null>(null)
    const [showFloatingPanel, setShowFloatingPanel] = useState(false)
    const [hasInitiallyFitted, setHasInitiallyFitted] = useState(false)

    // New state for placement mode
    const [isPlacingNewNode, setIsPlacingNewNode] = useState(false)

    const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null

    // Handle node edit button click
    const handleNodeEdit = (nodeId: string) => {
      setShowFloatingPanel(true)
    }

    // Handle node deletion
    const handleNodeDelete = (nodeId: string) => {
      if (onNodeDelete) {
        onNodeDelete(nodeId)
      }
      // Close floating panel and clear selection
      setSelectedNodeId(null)
      setShowFloatingPanel(false)
    }

    // Enter placement mode
    const enterPlacementMode = () => {
      setIsPlacingNewNode(true)
      setSelectedNodeId(null)
      setShowFloatingPanel(false)
      setConnectingFromNode(null)
      setSelectedConnectionId(null)
      setEditingConnectionId(null)
    }

    // Exit placement mode
    const exitPlacementMode = () => {
      setIsPlacingNewNode(false)
      setHighlightedCell(null)
    }

    // Expose functions to parent
    useImperativeHandle(ref, () => ({
      enterPlacementMode,
      exportAsImage: async () => {
        // Import html2canvas dynamically
        const html2canvas = (await import("html2canvas")).default

        if (!contentRef.current) throw new Error("Canvas not ready")

        // Calculate the bounds of all nodes
        const maxCol = Math.max(...nodes.map((node) => node.position.column))
        const maxRow = Math.max(...nodes.map((node) => node.position.row))
        const minCol = Math.min(...nodes.map((node) => node.position.column))
        const minRow = Math.min(...nodes.map((node) => node.position.row))

        // Calculate content bounds with generous padding for text
        const exportPadding = 200
        const baseContentWidth = (maxCol - minCol + 1) * NODE_WIDTH + (maxCol - minCol) * GRID_COL_GAP
        const baseContentHeight = (maxRow - minRow + 1) * NODE_HEIGHT + (maxRow - minRow) * GRID_ROW_GAP

        // Add padding to both dimensions
        const contentWidth = baseContentWidth + exportPadding * 2
        const contentHeight = baseContentHeight + exportPadding * 2

        console.log(`Initial export dimensions: ${contentWidth}x${contentHeight}`)

        // Calculate the content positioning
        const contentLeft = CANVAS_PADDING_X + minCol * GRID_X_SPACING - exportPadding
        const contentTop = CANVAS_PADDING_Y + minRow * GRID_Y_SPACING - exportPadding

        // Temporarily hide UI elements that shouldn't be in export
        const elementsToHide = [".connection-dot", ".zoom-controls", ".floating-panel"]

        const hiddenElements: HTMLElement[] = []
        elementsToHide.forEach((selector) => {
          const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>
          elements.forEach((el) => {
            hiddenElements.push(el)
            el.style.display = "none"
          })
        })

        try {
          // Create a temporary container for export
          const exportContainer = document.createElement("div")
          exportContainer.style.position = "absolute"
          exportContainer.style.left = "-9999px"
          exportContainer.style.top = "0"
          exportContainer.style.width = `${contentWidth}px`
          exportContainer.style.height = `${contentHeight}px`
          exportContainer.style.background = "#f9fafb" // bg-gray-50
          exportContainer.style.overflow = "hidden"
          document.body.appendChild(exportContainer)

          // Clone the content
          const clonedContent = contentRef.current.cloneNode(true) as HTMLElement
          clonedContent.style.transform = `translate(${-contentLeft}px, ${-contentTop}px)`
          clonedContent.style.transformOrigin = "0 0"
          clonedContent.style.position = "absolute"
          clonedContent.style.top = "0"
          clonedContent.style.left = "0"

          // Remove interactive elements from clone
          const interactiveElements = clonedContent.querySelectorAll(".connection-dot, .floating-panel")
          interactiveElements.forEach((el) => el.remove())

          exportContainer.appendChild(clonedContent)

          // Add grid background to export container
          const gridSize = 20
          exportContainer.style.backgroundImage = `radial-gradient(circle, #d1d5db 1px, transparent 1px)`
          exportContainer.style.backgroundSize = `${gridSize}px ${gridSize}px`

          // Capture the export container at high quality
          const originalCanvas = await html2canvas(exportContainer, {
            width: contentWidth,
            height: contentHeight,
            backgroundColor: "#f9fafb",
            scale: 2, // High quality capture
            useCORS: true,
            allowTaint: true,
            logging: false,
            removeContainer: false,
            foreignObjectRendering: false,
          })

          // Clean up the temporary container
          document.body.removeChild(exportContainer)

          console.log(`Original canvas dimensions: ${originalCanvas.width}x${originalCanvas.height}`)

          // Check if we need to compress the image to fit within 8000px constraint
          const maxDimension = 8000
          let finalCanvas = originalCanvas

          if (originalCanvas.width > maxDimension || originalCanvas.height > maxDimension) {
            console.log("Compressing image to fit within 8000px constraint...")

            // Calculate the scale factor to fit within constraints
            const scaleX = maxDimension / originalCanvas.width
            const scaleY = maxDimension / originalCanvas.height
            const scale = Math.min(scaleX, scaleY)

            // Create a new canvas with the compressed dimensions
            const compressedWidth = Math.floor(originalCanvas.width * scale)
            const compressedHeight = Math.floor(originalCanvas.height * scale)

            console.log(`Compressed dimensions: ${compressedWidth}x${compressedHeight}, scale: ${scale}`)

            const compressedCanvas = document.createElement("canvas")
            compressedCanvas.width = compressedWidth
            compressedCanvas.height = compressedHeight

            const ctx = compressedCanvas.getContext("2d")
            if (!ctx) throw new Error("Could not get canvas context")

            // Draw the original canvas scaled down to the compressed canvas
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"
            ctx.drawImage(originalCanvas, 0, 0, compressedWidth, compressedHeight)

            finalCanvas = compressedCanvas
          }

          console.log(`Final canvas dimensions: ${finalCanvas.width}x${finalCanvas.height}`)

          // Convert to JPEG
          return finalCanvas.toDataURL("image/jpeg", 0.9)
        } finally {
          // Restore hidden elements
          hiddenElements.forEach((el) => {
            el.style.display = ""
          })
        }
      },
    }))

    // Helper function to find nearest empty grid cell
    const findNearestEmptyCell = (targetRow: number, targetCol: number, nodes: FlowNode[]) => {
      const occupied = new Set(nodes.map((n) => `${n.position.row},${n.position.column}`))

      // Check if target position is already empty
      if (!occupied.has(`${targetRow},${targetCol}`)) {
        return { row: targetRow, column: targetCol }
      }

      // Search in expanding rings around the target
      const offsets = [
        [0, 0],
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
        [1, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
      ]
      for (let radius = 1; radius < 10; radius++) {
        for (const [dr, dc] of offsets) {
          const r = targetRow + dr * radius
          const c = targetCol + dc * radius
          if (r >= 0 && c >= 0 && !occupied.has(`${r},${c}`)) {
            return { row: r, column: c }
          }
        }
      }

      return { row: targetRow, column: targetCol }
    }

    // Helper function to convert canvas coordinates to grid position
    const canvasToGridPosition = (canvasX: number, canvasY: number) => {
      const adjustedX = canvasX - CANVAS_PADDING_X
      const adjustedY = canvasY - CANVAS_PADDING_Y

      const column = Math.round(adjustedX / GRID_X_SPACING)
      const row = Math.round(adjustedY / GRID_Y_SPACING)

      return { row: Math.max(0, row), column: Math.max(0, column) }
    }

    // Calculate actual position from row/column coordinates
    const getGridPosition = (node: FlowNode) => {
      return {
        x: CANVAS_PADDING_X + node.position.column * GRID_X_SPACING,
        y: CANVAS_PADDING_Y + node.position.row * GRID_Y_SPACING,
      }
    }

    // Get nodes with their calculated grid positions
    const getNodesWithCalculatedPositions = () => {
      return nodes.map((node) => ({
        ...node,
        position: getGridPosition(node),
      }))
    }

    // Helper function to detect overlapping connections and assign arc offsets
    const getConnectionArcOffsets = (
      edges: FlowEdge[],
      nodesWithPositions: ReturnType<typeof getNodesWithCalculatedPositions>,
    ) => {
      const arcOffsets: Record<string, number> = {}

      // First, identify backward connections and give them automatic offset
      const backwardConnections = new Set<string>()

      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        const targetNode = nodes.find((n) => n.id === edge.target)

        if (sourceNode && targetNode) {
          // Check if connection goes backward (higher column to lower column)
          if (sourceNode.position.column > targetNode.position.column) {
            backwardConnections.add(edge.id)
            arcOffsets[edge.id] = 100 // Give backward connections a 100px arc offset
          }
        }
      })

      // Calculate connection info for remaining edges (forward connections)
      const forwardConnectionInfo = edges
        .filter((edge) => !backwardConnections.has(edge.id))
        .map((edge) => {
          const sourceNode = nodesWithPositions.find((n) => n.id === edge.source)
          const targetNode = nodesWithPositions.find((n) => n.id === edge.target)

          if (!sourceNode || !targetNode) return null

          const startX = sourceNode.position.x + NODE_WIDTH
          const startY = sourceNode.position.y + CONNECTION_DOT_Y_OFFSET + CONNECTION_DOT_SIZE / 2
          const endX = targetNode.position.x
          const endY = targetNode.position.y + CONNECTION_DOT_Y_OFFSET + CONNECTION_DOT_SIZE / 2

          // Calculate midpoint and direction
          const midX = (startX + endX) / 2
          const midY = (startY + endY) / 2
          const direction = Math.atan2(endY - startY, endX - startX)

          return {
            id: edge.id,
            startX,
            startY,
            endX,
            endY,
            midX,
            midY,
            direction,
            length: Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2),
          }
        })
        .filter(Boolean)

      // Group forward connections that are close to each other
      const groups: string[][] = []
      const processed = new Set<string>()

      forwardConnectionInfo.forEach((conn1) => {
        if (processed.has(conn1.id)) return

        const group = [conn1.id]
        processed.add(conn1.id)

        forwardConnectionInfo.forEach((conn2) => {
          if (conn1.id === conn2.id || processed.has(conn2.id)) return

          // Check if connections are close enough to be considered overlapping
          const midDistance = Math.sqrt((conn1.midX - conn2.midX) ** 2 + (conn1.midY - conn2.midY) ** 2)
          const directionDiff = Math.abs(conn1.direction - conn2.direction)
          const normalizedDirectionDiff = Math.min(directionDiff, Math.PI * 2 - directionDiff)

          // Connections are considered overlapping if:
          // 1. Their midpoints are close (within 60px)
          // 2. They have similar directions (within 30 degrees)
          // 3. OR they have very close midpoints (within 30px) regardless of direction
          if (
            (midDistance < 60 && normalizedDirectionDiff < Math.PI / 6) || // 30 degrees
            midDistance < 30
          ) {
            group.push(conn2.id)
            processed.add(conn2.id)
          }
        })

        if (group.length > 1) {
          groups.push(group)
        }
      })

      // Assign arc offsets to grouped forward connections
      groups.forEach((group) => {
        group.forEach((edgeId, index) => {
          // First connection stays normal (offset 0)
          // Subsequent connections get increasing upward arcs with larger spacing
          arcOffsets[edgeId] = index * 80 // 80px spacing between arcs
        })
      })

      // Forward connections not in any group get no offset
      edges.forEach((edge) => {
        if (!(edge.id in arcOffsets) && !backwardConnections.has(edge.id)) {
          arcOffsets[edge.id] = 0
        }
      })

      return arcOffsets
    }

    // Generate SVG path for connections with improved curves and arc offset support
    const generateConnectionPath = (
      edge: FlowEdge,
      nodesWithPositions: ReturnType<typeof getNodesWithCalculatedPositions>,
      arcOffset = 0,
    ) => {
      const sourceNode = nodesWithPositions.find((n) => n.id === edge.source)
      const targetNode = nodesWithPositions.find((n) => n.id === edge.target)

      if (!sourceNode || !targetNode) return ""

      const startX = sourceNode.position.x + NODE_WIDTH
      const startY = sourceNode.position.y + CONNECTION_DOT_Y_OFFSET + CONNECTION_DOT_SIZE / 2
      const endX = targetNode.position.x
      const endY = targetNode.position.y + CONNECTION_DOT_Y_OFFSET + CONNECTION_DOT_SIZE / 2

      // Improved curve calculation for better arrowhead appearance
      const distance = Math.abs(endX - startX)
      const heightDiff = Math.abs(endY - startY)

      // Make curves wider and more rounded
      const baseControlOffset = Math.max(80, distance * 0.5) // Increased from 0.35 to 0.5
      const heightAdjustment = Math.min(40, heightDiff * 0.3) // Add height-based adjustment

      const controlOffset = baseControlOffset + heightAdjustment
      const controlX1 = startX + controlOffset
      const controlX2 = endX - controlOffset

      // Apply arc offset to control points (negative to arc upward)
      const controlY1 = startY - arcOffset
      const controlY2 = endY - arcOffset

      return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`
    }

    // Get connection midpoint with arc offset consideration
    const getConnectionMidpoint = (path: string, arcOffset = 0) => {
      const coords = path.match(/[\d.-]+/g)
      if (!coords || coords.length < 8) return { x: 0, y: 0 }

      // Extract path coordinates
      const startX = Number.parseFloat(coords[0])
      const startY = Number.parseFloat(coords[1])
      const controlX1 = Number.parseFloat(coords[2])
      const controlY1 = Number.parseFloat(coords[3])
      const controlX2 = Number.parseFloat(coords[4])
      const controlY2 = Number.parseFloat(coords[5])
      const endX = Number.parseFloat(coords[6])
      const endY = Number.parseFloat(coords[7])

      // Calculate the actual midpoint of the bezier curve (t = 0.5)
      const t = 0.5
      const x =
        Math.pow(1 - t, 3) * startX +
        3 * Math.pow(1 - t, 2) * t * controlX1 +
        3 * (1 - t) * Math.pow(t, 2) * controlX2 +
        Math.pow(t, 3) * endX
      const y =
        Math.pow(1 - t, 3) * startY +
        3 * Math.pow(1 - t, 2) * t * controlY1 +
        3 * (1 - t) * Math.pow(t, 2) * controlY2 +
        Math.pow(t, 3) * endY

      return { x, y }
    }

    // Calculate canvas dimensions based on grid positions
    useEffect(() => {
      const calculateCanvasSize = () => {
        // For infinite canvas, use much larger dimensions
        const infiniteSize = 10000 // Large canvas size for infinite feel

        setCanvasDimensions({
          width: infiniteSize,
          height: infiniteSize,
        })
      }

      calculateCanvasSize()
    }, [nodes])

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
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (e.button === 0 && !e.target.closest(".connection-dot") && !e.target.closest(".connection-element")) {
          const nodeElement = e.target.closest(".flow-node")

          if (nodeElement) {
            const nodeId = nodeElement.getAttribute("data-node-id")
            const node = nodes.find((n) => n.id === nodeId)

            if (node && selectedNodeId === nodeId && !isPlacingNewNode) {
              // Start dragging selected node
              const rect = canvasRef.current?.getBoundingClientRect()
              if (rect) {
                const nodePos = getGridPosition(node)
                setDragStartPos({ x: e.clientX, y: e.clientY })
                setDragOffset({
                  x: e.clientX - (rect.left + nodePos.x * transform.scale + transform.x),
                  y: e.clientY - (rect.top + nodePos.y * transform.scale + transform.y),
                })
              }
            } else if (node && !isPlacingNewNode) {
              // Select node (don't open panel yet)
              setSelectedNodeId(nodeId)
              setShowFloatingPanel(false)
            }
          } else {
            // Click on empty canvas
            if (isPlacingNewNode && highlightedCell && onNodeAdd) {
              // Place new node
              const newNode: FlowNode = {
                id: `node-${nanoid()}`,
                type: "step",
                title: "New Step",
                position: { row: highlightedCell.row, column: highlightedCell.column },
                role: "",
                tools: [],
                duration: { value: 1, unit: "days" },
                tags: [],
                attachments: [],
              }

              onNodeAdd(newNode)
              setSelectedNodeId(newNode.id)
              setShowFloatingPanel(true)
              exitPlacementMode()
            } else if (!isPlacingNewNode) {
              // Start panning
              setIsPanning(true)
              setLastPanPoint({ x: e.clientX, y: e.clientY })
              setSelectedNodeId(null)
              setShowFloatingPanel(false)
              setConnectingFromNode(null)
              setSelectedConnectionId(null)
              setEditingConnectionId(null)
            }
          }
        }
      },
      [selectedNodeId, nodes, transform, isPlacingNewNode, highlightedCell, onNodeAdd],
    )

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
        } else if (dragStartPos && selectedNodeId && !isDragging && !isPlacingNewNode) {
          // Check if we've moved enough to start dragging
          const deltaX = e.clientX - dragStartPos.x
          const deltaY = e.clientY - dragStartPos.y
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

          if (distance > 5) {
            // 5px threshold to start drag
            setIsDragging(true)
          }
        } else if (isDragging && selectedNodeId && !isPlacingNewNode) {
          // Update highlighted cell during drag
          const rect = canvasRef.current?.getBoundingClientRect()
          if (rect) {
            const canvasX = (e.clientX - rect.left - transform.x) / transform.scale
            const canvasY = (e.clientY - rect.top - transform.y) / transform.scale

            const gridPos = canvasToGridPosition(canvasX, canvasY)
            setHighlightedCell(gridPos)
          }
        } else if (isPlacingNewNode) {
          // Update highlighted cell during placement mode
          const rect = canvasRef.current?.getBoundingClientRect()
          if (rect) {
            const canvasX = (e.clientX - rect.left - transform.x) / transform.scale
            const canvasY = (e.clientY - rect.top - transform.y) / transform.scale

            const gridPos = canvasToGridPosition(canvasX, canvasY)

            // Only highlight if cell is not occupied
            const isOccupied = nodes.some(
              (node) => node.position.row === gridPos.row && node.position.column === gridPos.column,
            )

            if (!isOccupied && gridPos.row >= 0 && gridPos.column >= 0) {
              setHighlightedCell(gridPos)
            } else {
              setHighlightedCell(null)
            }
          }
        }
      },
      [isPanning, lastPanPoint, dragStartPos, selectedNodeId, isDragging, transform, isPlacingNewNode, nodes],
    )

    const handleMouseUp = useCallback(() => {
      if (isDragging && selectedNodeId && highlightedCell) {
        // Find nearest empty cell and update node position
        const nearestCell = findNearestEmptyCell(highlightedCell.row, highlightedCell.column, nodes)
        onNodeUpdate(selectedNodeId, {
          position: { row: nearestCell.row, column: nearestCell.column },
        })
      }

      setIsPanning(false)
      setIsDragging(false)
      setDragStartPos(null)
      if (!isPlacingNewNode) {
        setHighlightedCell(null)
      }
    }, [isDragging, selectedNodeId, highlightedCell, nodes, onNodeUpdate, isPlacingNewNode])

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

    // Fit to frame ONLY on initial load, not on every node change
    useEffect(() => {
      const fitToFrame = () => {
        if (nodes.length === 0 || hasInitiallyFitted) return

        const maxCol = Math.max(...nodes.map((node) => node.position.column))
        const maxRow = Math.max(...nodes.map((node) => node.position.row))
        const minCol = Math.min(...nodes.map((node) => node.position.column))
        const minRow = Math.min(...nodes.map((node) => node.position.row))

        const contentWidth = (maxCol - minCol + 1) * NODE_WIDTH + (maxCol - minCol) * GRID_COL_GAP
        const contentHeight = (maxRow - minRow + 1) * NODE_HEIGHT + (maxRow - minRow) * GRID_ROW_GAP

        if (canvasRef.current) {
          const containerWidth = canvasRef.current.clientWidth
          const containerHeight = canvasRef.current.clientHeight

          const scaleX = (containerWidth - CANVAS_PADDING_X * 2) / contentWidth
          const scaleY = (containerHeight - CANVAS_PADDING_Y * 2) / contentHeight
          const scale = Math.min(1, Math.min(scaleX, scaleY))

          const centerX = CANVAS_PADDING_X + minCol * GRID_X_SPACING + contentWidth / 2
          const centerY = CANVAS_PADDING_Y + minRow * GRID_Y_SPACING + contentHeight / 2

          const x = containerWidth / 2 - centerX * scale
          const y = containerHeight / 2 - centerY * scale

          setTransform({ x, y, scale })
          setHasInitiallyFitted(true)
        }
      }

      fitToFrame()
    }, [nodes.length, hasInitiallyFitted]) // Only depend on nodes.length, not the full nodes array

    // Handle keyboard events for connection editing and deletion
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (editingConnectionId) {
          if (e.key === "Enter") {
            saveConnectionLabel()
          } else if (e.key === "Escape") {
            cancelConnectionEdit()
          }
        } else if (selectedConnectionId && (e.key === "Delete" || e.key === "Backspace")) {
          deleteConnection(selectedConnectionId)
          setSelectedConnectionId(null)
        } else if (isPlacingNewNode && e.key === "Escape") {
          exitPlacementMode()
        }
      }

      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }, [selectedConnectionId, editingConnectionId, isPlacingNewNode])

    // Focus input when editing starts
    useEffect(() => {
      if (editingConnectionId && editInputRef.current) {
        editInputRef.current.focus()
        editInputRef.current.select()
      }
    }, [editingConnectionId])

    // Handle connection creation
    const handleNodeConnectionClick = (nodeId: string) => {
      if (connectingFromNode === nodeId) {
        // Cancel connection
        setConnectingFromNode(null)
      } else if (connectingFromNode && connectingFromNode !== nodeId) {
        // Create connection
        const existingConnection = edges.find((edge) => edge.source === connectingFromNode && edge.target === nodeId)

        if (!existingConnection && onEdgeAdd) {
          const newEdge: FlowEdge = {
            id: `edge-${Date.now()}`,
            source: connectingFromNode,
            target: nodeId,
            label: "", // Optional label
          }
          onEdgeAdd(newEdge)
        }
        setConnectingFromNode(null)
      } else {
        // Start connection
        setConnectingFromNode(nodeId)
      }
    }

    // Delete connection
    const deleteConnection = (edgeId: string) => {
      if (onEdgeDelete) {
        onEdgeDelete(edgeId)
      }
    }

    // Start editing connection label
    const startEditingConnection = (connectionId: string) => {
      const connection = edges.find((edge) => edge.id === connectionId)
      if (connection) {
        setEditingConnectionId(connectionId)
        setEditingLabel(connection.label || "")
        setSelectedConnectionId(null)
      }
    }

    // Save connection label
    const saveConnectionLabel = () => {
      if (editingConnectionId && onEdgeUpdate) {
        onEdgeUpdate(editingConnectionId, { label: editingLabel.trim() })
      }
      setEditingConnectionId(null)
      setEditingLabel("")
    }

    // Cancel connection edit
    const cancelConnectionEdit = () => {
      setEditingConnectionId(null)
      setEditingLabel("")
    }

    const handleConnectionClick = (connectionId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedConnectionId(connectionId)
    }

    const nodesWithPositions = getNodesWithCalculatedPositions()
    const arcOffsets = getConnectionArcOffsets(edges, nodesWithPositions)

    // Calculate grid offset for infinite feel
    const baseGridSize = 20
    const gridSize = Math.max(12, baseGridSize / Math.max(0.5, transform.scale)) // Adjusted scaling with minimum grid size
    const gridOffsetX =
      ((transform.x % (gridSize * transform.scale)) + gridSize * transform.scale) % (gridSize * transform.scale)
    const gridOffsetY =
      ((transform.y % (gridSize * transform.scale)) + gridSize * transform.scale) % (gridSize * transform.scale)

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

        {/* Connection mode indicator */}
        {connectingFromNode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
            <strong>Connection mode:</strong> Click on another node to connect, or click the same node to cancel
          </div>
        )}

        {/* Placement mode indicator */}
        {isPlacingNewNode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
            <strong>Placement mode:</strong> Click on an empty grid cell to place a new node
          </div>
        )}

        {/* Interactive Canvas Layer - Full viewport for mouse events */}
        <div
          ref={canvasRef}
          className={`absolute inset-0 ${isPlacingNewNode ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}
          onMouseDown={handleMouseDown}
        >
          {/* Transformed Content Container */}
          <div
            ref={contentRef}
            className="absolute top-0 left-0"
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: "0 0",
              width: `${canvasDimensions.width}px`,
              height: `${canvasDimensions.height}px`,
            }}
          >
            {/* SVG for connections */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              viewBox={`0 0 ${canvasDimensions.width} ${canvasDimensions.height}`}
              style={{ zIndex: 10 }}
            >
              {edges.map((edge) => {
                const arcOffset = arcOffsets[edge.id] || 0
                const path = generateConnectionPath(edge, nodesWithPositions, arcOffset)
                if (!path) return null
                const midpoint = getConnectionMidpoint(path, arcOffset)
                const isSelected = selectedConnectionId === edge.id
                const isHovered = hoveredConnectionId === edge.id
                const isEditing = editingConnectionId === edge.id
                const isHighlighted = isSelected || isHovered
                const hasLabel = edge.label && edge.label.trim().length > 0

                return (
                  <g
                    key={edge.id}
                    onMouseEnter={() => !isEditing && setHoveredConnectionId(edge.id)}
                    onMouseLeave={() => setHoveredConnectionId(null)}
                  >
                    {/* Invisible wider path for easier hover detection */}
                    <path
                      d={path}
                      stroke="transparent"
                      strokeWidth={Math.max(8, 12 / transform.scale)}
                      fill="none"
                      style={{ pointerEvents: "stroke", cursor: "pointer" }}
                      onClick={(e) => handleConnectionClick(edge.id, e)}
                      className="connection-element"
                    />
                    {/* Visible connection line */}
                    <path
                      d={path}
                      stroke={isSelected || isEditing ? "rgb(139 92 246)" : "rgb(196 181 253)"}
                      strokeWidth={Math.max(1, (isSelected || isEditing ? 3 : 2) / transform.scale)}
                      fill="none"
                      strokeDasharray={
                        isSelected || isEditing
                          ? "none"
                          : `${Math.max(3, 5 / transform.scale)},${Math.max(2, 3 / transform.scale)}`
                      }
                      markerEnd={`url(#arrowhead-${isSelected || isEditing ? "selected" : "normal"})`}
                      style={{ pointerEvents: "none" }}
                    />

                    {/* Connection label pill or edit button - positioned at midpoint */}
                    {(hasLabel || isEditing) && (
                      <g>
                        {(() => {
                          const displayText = isEditing ? editingLabel : edge.label
                          const labelWidth = Math.min(120, Math.max(60, (displayText?.length || 0) * 8 + 16))

                          return (
                            <>
                              {/* Pill background */}
                              <rect
                                x={midpoint.x - labelWidth / 2}
                                y={midpoint.y - 10}
                                width={labelWidth}
                                height={20}
                                rx={10}
                                fill={isSelected || isEditing ? "rgb(139 92 246)" : "rgb(196 181 253)"}
                                stroke={isSelected || isEditing ? "rgb(139 92 246)" : "rgb(196 181 253)"}
                                strokeWidth="1"
                                style={{ pointerEvents: "all", cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!isEditing) {
                                    startEditingConnection(edge.id)
                                  }
                                }}
                                className="connection-element"
                              />
                              {/* Label text or input */}
                              {isEditing ? (
                                <foreignObject
                                  x={midpoint.x - labelWidth / 2 + 8}
                                  y={midpoint.y - 8}
                                  width={labelWidth - 16}
                                  height={16}
                                  style={{ pointerEvents: "all" }}
                                  className="connection-element"
                                >
                                  <input
                                    ref={editInputRef}
                                    type="text"
                                    value={editingLabel}
                                    onChange={(e) => setEditingLabel(e.target.value)}
                                    onBlur={saveConnectionLabel}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        saveConnectionLabel()
                                      } else if (e.key === "Escape") {
                                        cancelConnectionEdit()
                                      }
                                      e.stopPropagation()
                                    }}
                                    className="w-full h-4 text-xs text-white bg-transparent border-none outline-none placeholder-violet-200"
                                    placeholder="Label..."
                                    style={{ fontSize: "11px", lineHeight: "16px" }}
                                  />
                                </foreignObject>
                              ) : (
                                <text
                                  x={midpoint.x}
                                  y={midpoint.y}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fill="white"
                                  fontSize="11"
                                  fontWeight="500"
                                  className="pointer-events-none select-none"
                                  style={{ maxWidth: `${labelWidth - 8}px` }}
                                >
                                  {edge.label && edge.label.length > 15
                                    ? edge.label.substring(0, 15) + "..."
                                    : edge.label}
                                </text>
                              )}
                            </>
                          )
                        })()}
                      </g>
                    )}

                    {/* Edit button for selected connection without label */}
                    {isSelected && !hasLabel && !isEditing && (
                      <g>
                        <circle
                          cx={midpoint.x}
                          cy={midpoint.y}
                          r="12"
                          fill="rgb(139 92 246)"
                          className="cursor-pointer hover:fill-violet-700"
                          style={{ pointerEvents: "all" }}
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditingConnection(edge.id)
                          }}
                          className="connection-element"
                        >
                          <title>Add connection label</title>
                        </circle>
                        <text
                          x={midpoint.x}
                          y={midpoint.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="white"
                          fontSize="10"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          ✎
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
              {/* Grid cell highlighting during drag or placement */}
              {highlightedCell && (isDragging || isPlacingNewNode) && (
                <rect
                  x={CANVAS_PADDING_X + highlightedCell.column * GRID_X_SPACING}
                  y={CANVAS_PADDING_Y + highlightedCell.row * GRID_Y_SPACING}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx="12"
                  fill="rgba(139, 92, 246, 0.08)"
                  stroke="rgb(139, 92, 246)"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  className="pointer-events-none"
                />
              )}
              <defs>
                <marker id="arrowhead-normal" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="rgb(196 181 253)" />
                </marker>
                <marker id="arrowhead-selected" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="rgb(139 92 246)" />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {nodesWithPositions.map((node) => {
              const isSelected = selectedNodeId === node.id
              const isDraggingThis = isDragging && selectedNodeId === node.id

              return (
                <div
                  key={node.id}
                  className="flow-node relative"
                  data-node-id={node.id}
                  style={{
                    zIndex: isSelected ? 25 : 20,
                  }}
                >
                  {/* Connection dots remain the same */}
                  <div
                    className={`connection-dot absolute w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer transition-all ${
                      connectingFromNode && connectingFromNode !== node.id
                        ? "bg-green-500 hover:bg-green-600 ring-2 ring-green-300 animate-pulse"
                        : connectingFromNode === node.id
                          ? "bg-orange-500 hover:bg-orange-600 ring-2 ring-orange-300"
                          : "bg-violet-500 hover:bg-violet-600"
                    }`}
                    style={{
                      left: node.position.x - 8,
                      top: node.position.y + CONNECTION_DOT_Y_OFFSET,
                      zIndex: 30,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNodeConnectionClick(node.id)
                    }}
                    title={
                      connectingFromNode === node.id
                        ? "Cancel connection"
                        : connectingFromNode
                          ? "Complete connection to this node"
                          : "Start connection from this node"
                    }
                  />

                  <div
                    className={`connection-dot absolute w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer transition-all ${
                      connectingFromNode === node.id
                        ? "bg-orange-500 hover:bg-orange-600 ring-2 ring-orange-300"
                        : connectingFromNode
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-violet-500 hover:bg-violet-600"
                    }`}
                    style={{
                      left: node.position.x + NODE_WIDTH - 8,
                      top: node.position.y + CONNECTION_DOT_Y_OFFSET,
                      zIndex: 30,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!connectingFromNode || connectingFromNode === node.id) {
                        handleNodeConnectionClick(node.id)
                      }
                    }}
                    title={
                      connectingFromNode === node.id
                        ? "Cancel connection"
                        : connectingFromNode
                          ? "Cannot start new connection while connecting"
                          : "Start connection from this node"
                    }
                  />

                  <FlowNodeComponent
                    node={node}
                    isSelected={isSelected}
                    onSelect={setSelectedNodeId}
                    onEdit={handleNodeEdit}
                    onDelete={handleNodeDelete} // Added onDelete prop
                    style={{
                      cursor: isSelected ? (isDraggingThis ? "grabbing" : "grab") : "pointer",
                      opacity: isDraggingThis ? 0.7 : 1,
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Floating Panel */}
        {selectedNode &&
          showFloatingPanel &&
          (() => {
            const nodeWithPosition = nodesWithPositions.find((n) => n.id === selectedNode.id)
            if (!nodeWithPosition) return null

            // Calculate the panel position
            const baseX = (nodeWithPosition.position.x + NODE_WIDTH + 20) * transform.scale + transform.x
            const baseY = nodeWithPosition.position.y * transform.scale + transform.y

            // Get canvas container bounds
            const canvasContainer = canvasRef.current
            if (!canvasContainer) return null

            const containerRect = canvasContainer.getBoundingClientRect()

            // Account for header (64px) and footer (64px) heights
            const headerHeight = 64
            const footerHeight = 64
            const availableTop = headerHeight
            const availableBottom = window.innerHeight - footerHeight
            const availableHeight = availableBottom - availableTop

            // Floating panel approximate height (400px)
            const panelHeight = 400

            // Calculate constrained Y position
            let constrainedY = baseY

            // If panel would go below the footer, move it up
            if (baseY + panelHeight > availableBottom) {
              constrainedY = availableBottom - panelHeight - 10 // 10px margin
            }

            // If panel would go above the header, move it down
            if (constrainedY < availableTop) {
              constrainedY = availableTop + 10 // 10px margin
            }

            return (
              <FloatingPanel
                node={selectedNode}
                position={{
                  x: baseX,
                  y: constrainedY,
                }}
                onClose={() => {
                  setSelectedNodeId(null)
                  setShowFloatingPanel(false)
                }}
                onUpdate={onNodeUpdate}
                onDelete={handleNodeDelete} // Added onDelete prop
                className="floating-panel"
              />
            )
          })()}

        {/* Zoom Controls */}
        <div className="zoom-controls fixed bottom-20 right-4 bg-white rounded-md shadow-md border p-2 space-y-1">
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
              if (nodes.length === 0) return

              const maxCol = Math.max(...nodes.map((node) => node.position.column))
              const maxRow = Math.max(...nodes.map((node) => node.position.row))
              const minCol = Math.min(...nodes.map((node) => node.position.column))
              const minRow = Math.min(...nodes.map((node) => node.position.row))

              const contentWidth = (maxCol - minCol + 1) * NODE_WIDTH + (maxCol - minCol) * GRID_COL_GAP
              const contentHeight = (maxRow - minRow + 1) * NODE_HEIGHT + (maxRow - minRow) * GRID_ROW_GAP

              if (canvasRef.current) {
                const containerWidth = canvasRef.current.clientWidth
                const containerHeight = canvasRef.current.clientHeight

                const scaleX = (containerWidth - CANVAS_PADDING_X * 2) / contentWidth
                const scaleY = (containerHeight - CANVAS_PADDING_Y * 2) / contentHeight
                const scale = Math.min(1, Math.min(scaleX, scaleY))

                const centerX = CANVAS_PADDING_X + minCol * GRID_X_SPACING + contentWidth / 2
                const centerY = CANVAS_PADDING_Y + minRow * GRID_Y_SPACING + contentHeight / 2

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
  },
)

Canvas.displayName = "Canvas"
