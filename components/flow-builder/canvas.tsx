"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react"
import type { FlowNode, FlowEdge } from "@/types/flow"
import { FlowNodeComponent } from "./flow-node"
import { FloatingPanel } from "./floating-panel"

const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

type CanvasProps = {
  nodes: FlowNode[]
  edges: FlowEdge[]
  onNodeUpdate: (nodeId: string, updates: Partial<FlowNode>) => void
  onNodeAdd?: (node: FlowNode) => void
  onNodeDelete?: (nodeId: string) => void
  onEdgeAdd?: (edge: FlowEdge) => void
  onEdgeDelete?: (edgeId: string) => void
  onEdgeUpdate?: (edgeId: string, updates: Partial<FlowEdge>) => void
  onConnectDataSource?: (nodeId: string) => void
}

export type CanvasRef = {
  exportAsImage: () => Promise<string>
  enterPlacementMode: () => void
}

/* Layout constants */
const NODE_WIDTH = 240
const NODE_HEIGHT = 120
const GRID_COL_GAP = 160
const GRID_ROW_GAP = 200
const CANVAS_PADDING_X = 60
const CANVAS_PADDING_Y = 60
const GRID_X_SPACING = NODE_WIDTH + GRID_COL_GAP
const GRID_Y_SPACING = NODE_HEIGHT + GRID_ROW_GAP

/* Connection dot constants */
const CONNECTION_DOT_SIZE = 16
const CONNECTION_DOT_Y_OFFSET = 20

export const Canvas = forwardRef<CanvasRef, CanvasProps>(
  (
    { nodes, edges, onNodeUpdate, onNodeAdd, onNodeDelete, onEdgeAdd, onEdgeDelete, onEdgeUpdate, onConnectDataSource },
    ref,
  ) => {
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
    const [isPlacingNewNode, setIsPlacingNewNode] = useState(false)
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
    const [isGroupDragging, setIsGroupDragging] = useState(false)
    const [groupDragStartPos, setGroupDragStartPos] = useState<{ x: number; y: number } | null>(null)
    const [groupDragOffset, setGroupDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const [groupDragPreview, setGroupDragPreview] = useState<
      Array<{ nodeId: string; targetRow: number; targetCol: number }>
    >([])

    const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null
    const selectedNodes = nodes.filter((node) => selectedNodeIds.has(node.id))
    const minRow = nodes.length > 0 ? Math.min(...nodes.map((n) => n.position.row)) : 0
    const minCol = nodes.length > 0 ? Math.min(...nodes.map((n) => n.position.column)) : 0

    const handleNodeEdit = (nodeId: string) => {
      setShowFloatingPanel(true)
    }

    const handleNodeDelete = (nodeId: string) => {
      if (onNodeDelete) onNodeDelete(nodeId)
      setSelectedNodeId(null)
      setShowFloatingPanel(false)
    }

    const enterPlacementMode = () => {
      setIsPlacingNewNode(true)
      setSelectedNodeId(null)
      setShowFloatingPanel(false)
      setConnectingFromNode(null)
      setSelectedConnectionId(null)
      setEditingConnectionId(null)
    }
    const exitPlacementMode = () => {
      setIsPlacingNewNode(false)
      setHighlightedCell(null)
    }

    useImperativeHandle(ref, () => ({
      enterPlacementMode,
      exportAsImage: async () => {
        const html2canvas = (await import("html2canvas")).default
        if (!contentRef.current) throw new Error("Canvas not ready")

        const maxCol = Math.max(...nodes.map((node) => node.position.column))
        const maxRow = Math.max(...nodes.map((node) => node.position.row))
        const minCol = Math.min(...nodes.map((node) => node.position.column))
        const minRow = Math.min(...nodes.map((node) => node.position.row))

        const exportPadding = 200
        const baseContentWidth = (maxCol - minCol + 1) * NODE_WIDTH + (maxCol - minCol) * GRID_COL_GAP
        const baseContentHeight = (maxRow - minRow + 1) * NODE_HEIGHT + (maxRow - minRow) * GRID_ROW_GAP
        const contentWidth = baseContentWidth + exportPadding * 2
        const contentHeight = baseContentHeight + exportPadding * 2

        const contentLeft = CANVAS_PADDING_X + minCol * GRID_X_SPACING - exportPadding
        const contentTop = CANVAS_PADDING_Y + minRow * GRID_Y_SPACING - exportPadding

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
          const exportContainer = document.createElement("div")
          exportContainer.style.position = "absolute"
          exportContainer.style.left = "-9999px"
          exportContainer.style.top = "0"
          exportContainer.style.width = `${contentWidth}px`
          exportContainer.style.height = `${contentHeight}px`
          exportContainer.style.background = "var(--canvas-bg)"
          exportContainer.style.overflow = "hidden"
          document.body.appendChild(exportContainer)

          const clonedContent = contentRef.current.cloneNode(true) as HTMLElement
          clonedContent.style.transform = `translate(${-contentLeft}px, ${-contentTop}px)`
          clonedContent.style.transformOrigin = "0 0"
          clonedContent.style.position = "absolute"
          clonedContent.style.top = "0"
          clonedContent.style.left = "0"

          const interactiveElements = clonedContent.querySelectorAll(".connection-dot, .floating-panel")
          interactiveElements.forEach((el) => el.remove())
          exportContainer.appendChild(clonedContent)

          const gridSize = 20
          exportContainer.style.backgroundImage = `radial-gradient(circle, var(--grid-dot) 1px, transparent 1px)`
          exportContainer.style.backgroundSize = `${gridSize}px ${gridSize}px`

          const originalCanvas = await html2canvas(exportContainer, {
            width: contentWidth,
            height: contentHeight,
            backgroundColor: "var(--canvas-bg)",
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            removeContainer: false,
            foreignObjectRendering: false,
          })

          document.body.removeChild(exportContainer)

          const maxDimension = 8000
          let finalCanvas = originalCanvas
          if (originalCanvas.width > maxDimension || originalCanvas.height > maxDimension) {
            const scaleX = maxDimension / originalCanvas.width
            const scaleY = maxDimension / originalCanvas.height
            const scale = Math.min(scaleX, scaleY)
            const compressedWidth = Math.floor(originalCanvas.width * scale)
            const compressedHeight = Math.floor(originalCanvas.height * scale)
            const compressedCanvas = document.createElement("canvas")
            compressedCanvas.width = compressedWidth
            compressedCanvas.height = compressedHeight
            const ctx = compressedCanvas.getContext("2d")
            if (!ctx) throw new Error("Could not get canvas context")
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"
            ctx.drawImage(originalCanvas, 0, 0, compressedWidth, compressedHeight)
            finalCanvas = compressedCanvas
          }
          return finalCanvas.toDataURL("image/jpeg", 0.9)
        } finally {
          hiddenElements.forEach((el) => {
            el.style.display = ""
          })
        }
      },
    }))

    const findNearestEmptyCell = (targetRow: number, targetCol: number, nodes: FlowNode[]) => {
      const occupied = new Set(nodes.map((n) => `${n.position.row},${n.position.column}`))
      if (!occupied.has(`${targetRow},${targetCol}`)) return { row: targetRow, column: targetCol }
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
          if (!occupied.has(`${r},${c}`)) return { row: r, column: c }
        }
      }
      return { row: targetRow, column: targetCol }
    }

    const canvasToGridPosition = (canvasX: number, canvasY: number) => {
      const adjustedX = canvasX - CANVAS_PADDING_X
      const adjustedY = canvasY - CANVAS_PADDING_Y
      const column = Math.round(adjustedX / GRID_X_SPACING) + minCol
      const row = Math.round(adjustedY / GRID_Y_SPACING) + minRow
      return { row, column }
    }

    const getGridPosition = (node: FlowNode, minRow: number, minCol: number) => {
      return {
        x: CANVAS_PADDING_X + (node.position.column - minCol) * GRID_X_SPACING,
        y: CANVAS_PADDING_Y + (node.position.row - minRow) * GRID_Y_SPACING,
      }
    }

    const getNodesWithCalculatedPositions = () => {
      return nodes.map((node) => ({
        ...node,
        position: getGridPosition(node, minRow, minCol),
      }))
    }

    const getConnectionArcOffsets = (
      edges: FlowEdge[],
      nodesWithPositions: ReturnType<typeof getNodesWithCalculatedPositions>,
    ) => {
      const arcOffsets: Record<string, number> = {}
      const backwardConnections = new Set<string>()

      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        const targetNode = nodes.find((n) => n.id === edge.target)
        if (sourceNode && targetNode && sourceNode.position.column > targetNode.position.column) {
          backwardConnections.add(edge.id)
          arcOffsets[edge.id] = 100
        }
      })

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
        .filter(Boolean) as Array<{
        id: string
        startX: number
        startY: number
        endX: number
        endY: number
        midX: number
        midY: number
        direction: number
        length: number
      }>

      const groups: string[][] = []
      const processed = new Set<string>()

      forwardConnectionInfo.forEach((conn1) => {
        if (processed.has(conn1.id)) return
        const group = [conn1.id]
        processed.add(conn1.id)
        forwardConnectionInfo.forEach((conn2) => {
          if (conn1.id === conn2.id || processed.has(conn2.id)) return
          const midDistance = Math.sqrt((conn1.midX - conn2.midX) ** 2 + (conn1.midY - conn2.midY) ** 2)
          const directionDiff = Math.abs(conn1.direction - conn2.direction)
          const normalizedDirectionDiff = Math.min(directionDiff, Math.PI * 2 - directionDiff)
          if ((midDistance < 60 && normalizedDirectionDiff < Math.PI / 6) || midDistance < 30) {
            group.push(conn2.id)
            processed.add(conn2.id)
          }
        })
        if (group.length > 1) groups.push(group)
      })

      groups.forEach((group) => {
        group.forEach((edgeId, index) => {
          arcOffsets[edgeId] = index * 80
        })
      })

      edges.forEach((edge) => {
        if (!(edge.id in arcOffsets) && !backwardConnections.has(edge.id)) {
          arcOffsets[edge.id] = 0
        }
      })
      return arcOffsets
    }

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

      const distance = Math.abs(endX - startX)
      const heightDiff = Math.abs(endY - startY)
      const baseControlOffset = Math.max(80, distance * 0.5)
      const heightAdjustment = Math.min(40, heightDiff * 0.3)
      const controlOffset = baseControlOffset + heightAdjustment
      const controlX1 = startX + controlOffset
      const controlX2 = endX - controlOffset
      const controlY1 = startY - arcOffset
      const controlY2 = endY - arcOffset
      return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`
    }

    const getConnectionMidpoint = (path: string) => {
      const coords = path.match(/[\d.-]+/g)
      if (!coords || coords.length < 8) return { x: 0, y: 0 }
      const startX = Number.parseFloat(coords[0])
      const startY = Number.parseFloat(coords[1])
      const controlX1 = Number.parseFloat(coords[2])
      const controlY1 = Number.parseFloat(coords[3])
      const controlX2 = Number.parseFloat(coords[4])
      const controlY2 = Number.parseFloat(coords[5])
      const endX = Number.parseFloat(coords[6])
      const endY = Number.parseFloat(coords[7])

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

    useEffect(() => {
      const calculateCanvasSize = () => {
        const infiniteSize = 20000
        setCanvasDimensions({ width: infiniteSize, height: infiniteSize })
      }
      calculateCanvasSize()
    }, [nodes])

    const handleWheel = useCallback(
      (e: WheelEvent) => {
        e.preventDefault()
        if (e.ctrlKey || e.metaKey) {
          const delta = -e.deltaY * 0.01
          const newScale = Math.max(0.1, Math.min(3, transform.scale + delta))
          setTransform((prev) => ({ ...prev, scale: newScale }))
        } else {
          setTransform((prev) => ({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }))
        }
      },
      [transform.scale],
    )

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (e.button === 0 && !e.target.closest(".connection-dot") && !e.target.closest(".connection-element")) {
          const nodeElement = e.target.closest(".flow-node")
          if (nodeElement) {
            const nodeId = nodeElement.getAttribute("data-node-id")
            const node = nodes.find((n) => n.id === nodeId)
            if (node && !isPlacingNewNode) {
              if (e.shiftKey) {
                setSelectedNodeIds((prev) => {
                  const newSet = new Set(prev)
                  if (newSet.has(nodeId)) newSet.delete(nodeId)
                  else newSet.add(nodeId)
                  return newSet
                })
                setSelectedNodeId(null)
                setShowFloatingPanel(false)
              } else if (selectedNodeIds.has(nodeId)) {
                const rect = canvasRef.current?.getBoundingClientRect()
                if (rect) {
                  setGroupDragStartPos({ x: e.clientX, y: e.clientY })
                  setGroupDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                }
              } else {
                setSelectedNodeIds(new Set([nodeId]))
                setSelectedNodeId(nodeId)
                setShowFloatingPanel(false)
                const rect = canvasRef.current?.getBoundingClientRect()
                if (rect) {
                  const nodePos = getGridPosition(node, minRow, minCol)
                  setDragStartPos({ x: e.clientX, y: e.clientY })
                  setDragOffset({
                    x: e.clientX - (rect.left + nodePos.x * transform.scale + transform.x),
                    y: e.clientY - (rect.top + nodePos.y * transform.scale + transform.y),
                  })
                }
              }
            }
          } else {
            if (isPlacingNewNode && highlightedCell && onNodeAdd) {
              const newNode: FlowNode = {
                id: generateId(),
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
              setSelectedNodeIds(new Set([newNode.id]))
              setShowFloatingPanel(true)
              exitPlacementMode()
            } else if (!isPlacingNewNode) {
              setIsPanning(true)
              setLastPanPoint({ x: e.clientX, y: e.clientY })
              setSelectedNodeId(null)
              setSelectedNodeIds(new Set())
              setShowFloatingPanel(false)
              setConnectingFromNode(null)
              setSelectedConnectionId(null)
              setEditingConnectionId(null)
            }
          }
        }
      },
      [selectedNodeId, selectedNodeIds, nodes, transform, isPlacingNewNode, highlightedCell, onNodeAdd, minRow, minCol],
    )

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (isPanning) {
          const deltaX = e.clientX - lastPanPoint.x
          const deltaY = e.clientY - lastPanPoint.y
          setTransform((prev) => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }))
          setLastPanPoint({ x: e.clientX, y: e.clientY })
        } else if (groupDragStartPos && selectedNodeIds.size > 0 && !isGroupDragging && !isPlacingNewNode) {
          const deltaX = e.clientX - groupDragStartPos.x
          const deltaY = e.clientY - groupDragStartPos.y
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          if (distance > 5) setIsGroupDragging(true)
        } else if (isGroupDragging && selectedNodeIds.size > 0 && !isPlacingNewNode) {
          const rect = canvasRef.current?.getBoundingClientRect()
          if (rect) {
            const canvasX = (e.clientX - rect.left - transform.x) / transform.scale
            const canvasY = (e.clientY - rect.top - transform.y) / transform.scale
            const gridPos = canvasToGridPosition(canvasX, canvasY)
            const groupPositions = findNearestEmptyCellGroup(gridPos.row, gridPos.column, selectedNodeIds, nodes)
            setGroupDragPreview(groupPositions)
            if (groupPositions.length > 0) {
              const minRow = Math.min(...groupPositions.map((p) => p.targetRow))
              const minCol = Math.min(...groupPositions.map((p) => p.targetCol))
              setHighlightedCell({ row: minRow, column: minCol })
            }
          }
        } else if (dragStartPos && selectedNodeId && !isDragging && !isPlacingNewNode) {
          const deltaX = e.clientX - dragStartPos.x
          const deltaY = e.clientY - dragStartPos.y
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          if (distance > 5) setIsDragging(true)
        } else if (isDragging && selectedNodeId && !isPlacingNewNode) {
          const rect = canvasRef.current?.getBoundingClientRect()
          if (rect) {
            const canvasX = (e.clientX - rect.left - transform.x) / transform.scale
            const canvasY = (e.clientY - rect.top - transform.y) / transform.scale
            const gridPos = canvasToGridPosition(canvasX, canvasY)
            setHighlightedCell(gridPos)
          }
        } else if (isPlacingNewNode) {
          const rect = canvasRef.current?.getBoundingClientRect()
          if (rect) {
            const canvasX = (e.clientX - rect.left - transform.x) / transform.scale
            const canvasY = (e.clientY - rect.top - transform.y) / transform.scale
            const gridPos = canvasToGridPosition(canvasX, canvasY)
            const isOccupied = nodes.some(
              (node) => node.position.row === gridPos.row && node.position.column === gridPos.column,
            )
            if (!isOccupied) setHighlightedCell(gridPos)
            else setHighlightedCell(null)
          }
        }
      },
      [
        isPanning,
        lastPanPoint,
        groupDragStartPos,
        selectedNodeIds,
        isGroupDragging,
        dragStartPos,
        selectedNodeId,
        isDragging,
        transform,
        isPlacingNewNode,
        nodes,
        minRow,
        minCol,
      ],
    )

    const handleMouseUp = useCallback(() => {
      if (isGroupDragging && selectedNodeIds.size > 0 && groupDragPreview.length > 0) {
        groupDragPreview.forEach(({ nodeId, targetRow, targetCol }) => {
          onNodeUpdate(nodeId, { position: { row: targetRow, column: targetCol } })
        })
        setGroupDragPreview([])
      } else if (isDragging && selectedNodeId && highlightedCell) {
        const nearestCell = findNearestEmptyCell(highlightedCell.row, highlightedCell.column, nodes)
        onNodeUpdate(selectedNodeId, { position: { row: nearestCell.row, column: nearestCell.column } })
      }
      setIsPanning(false)
      setIsDragging(false)
      setIsGroupDragging(false)
      setDragStartPos(null)
      setGroupDragStartPos(null)
      if (!isPlacingNewNode) setHighlightedCell(null)
    }, [
      isGroupDragging,
      selectedNodeIds,
      groupDragPreview,
      isDragging,
      selectedNodeId,
      highlightedCell,
      nodes,
      onNodeUpdate,
      isPlacingNewNode,
    ])

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

    useEffect(() => {
      const fitToFrame = () => {
        if (nodes.length === 0 || !canvasRef.current) return
        const maxCol = Math.max(...nodes.map((node) => node.position.column))
        const maxRow = Math.max(...nodes.map((node) => node.position.row))
        const minCol = Math.min(...nodes.map((node) => node.position.column))
        const minRow = Math.min(...nodes.map((node) => node.position.row))
        const contentWidth = (maxCol - minCol + 1) * NODE_WIDTH + (maxCol - minCol) * GRID_COL_GAP
        const contentHeight = (maxRow - minRow + 1) * NODE_HEIGHT + (maxRow - minRow) * GRID_ROW_GAP
        const containerWidth = canvasRef.current.clientWidth
        const containerHeight = canvasRef.current.clientHeight
        const paddingX = 100
        const paddingY = 100
        const scaleX = (containerWidth - paddingX * 2) / contentWidth
        const scaleY = (containerHeight - paddingY * 2) / contentHeight
        const scale = Math.min(1, Math.min(scaleX, scaleY))
        const contentCenterX = CANVAS_PADDING_X + ((minCol + maxCol) * GRID_X_SPACING) / 2
        const contentCenterY = CANVAS_PADDING_Y + ((minRow + maxRow) * GRID_Y_SPACING) / 2
        const x = containerWidth / 2 - contentCenterX * scale
        const y = containerHeight / 2 - contentCenterY * scale
        setTransform({ x, y, scale })
      }
      fitToFrame()
    }, [nodes.length, minRow, minCol])

    useEffect(() => {
      if (editingConnectionId && editInputRef.current) {
        editInputRef.current.focus()
        editInputRef.current.select()
      }
    }, [editingConnectionId])

    const handleNodeConnectionClick = (nodeId: string) => {
      if (connectingFromNode === nodeId) setConnectingFromNode(null)
      else if (connectingFromNode && connectingFromNode !== nodeId) {
        const existingConnection = edges.find((edge) => edge.source === connectingFromNode && edge.target === nodeId)
        if (!existingConnection && onEdgeAdd) {
          const newEdge: FlowEdge = {
            id: `edge-${Date.now()}`,
            source: connectingFromNode,
            target: nodeId,
            label: "",
          }
          onEdgeAdd(newEdge)
        }
        setConnectingFromNode(null)
      } else {
        setConnectingFromNode(nodeId)
      }
    }

    const deleteConnection = (edgeId: string) => {
      if (onEdgeDelete) onEdgeDelete(edgeId)
    }

    const startEditingConnection = (connectionId: string) => {
      const connection = edges.find((edge) => edge.id === connectionId)
      if (connection) {
        setEditingConnectionId(connectionId)
        setEditingLabel(connection.label || "")
        setSelectedConnectionId(null)
      }
    }

    const saveConnectionLabel = () => {
      if (editingConnectionId && onEdgeUpdate) {
        onEdgeUpdate(editingConnectionId, { label: editingLabel.trim() })
      }
      setEditingConnectionId(null)
      setEditingLabel("")
    }
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

    const baseGridSize = 20
    const gridSize = Math.max(12, baseGridSize / Math.max(0.5, transform.scale))
    const gridOffsetX =
      ((transform.x % (gridSize * transform.scale)) + gridSize * transform.scale) % (gridSize * transform.scale)
    const gridOffsetY =
      ((transform.y % (gridSize * transform.scale)) + gridSize * transform.scale) % (gridSize * transform.scale)

    return (
      <div className="designer-canvas relative w-full h-full overflow-hidden">
        {/* Infinite Grid Background with proper offset for negative coordinates */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, var(--grid-dot) 1px, transparent 1px)`,
            backgroundSize: `${gridSize * transform.scale}px ${gridSize * transform.scale}px`,
            backgroundPosition: `${gridOffsetX - minCol * GRID_X_SPACING * transform.scale}px ${gridOffsetY - minRow * GRID_Y_SPACING * transform.scale}px`,
            width: "200%",
            height: "200%",
            left: "-50%",
            top: "-50%",
          }}
        />

        {connectingFromNode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-brand text-white px-4 py-2 rounded-pill shadow-e2 z-50 text-sm">
            <strong>Connection mode:</strong> Click on another node to connect, or click the same node to cancel
          </div>
        )}

        {isPlacingNewNode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-pill shadow-e2 z-50 text-sm">
            <strong>Placement mode:</strong> Click on an empty grid cell to place a new node
          </div>
        )}

        <div
          ref={canvasRef}
          className={`${isPlacingNewNode ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"} absolute inset-0`}
          onMouseDown={handleMouseDown}
        >
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
                const midpoint = getConnectionMidpoint(path)
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
                    <path
                      d={path}
                      stroke="transparent"
                      strokeWidth={Math.max(8, 12 / transform.scale)}
                      fill="none"
                      style={{ pointerEvents: "stroke", cursor: "pointer" }}
                      onClick={(e) => handleConnectionClick(edge.id, e)}
                      className="connection-element"
                    />
                    <path
                      d={path}
                      stroke={isSelected || isEditing ? "rgb(157 118 255)" : "rgb(210 197 255)"}
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

                    {(hasLabel || isEditing) && (
                      <g>
                        {(() => {
                          const displayText = isEditing ? editingLabel : edge.label
                          const labelWidth = Math.min(120, Math.max(60, (displayText?.length || 0) * 8 + 16))
                          return (
                            <>
                              <rect
                                x={midpoint.x - labelWidth / 2}
                                y={midpoint.y - 10}
                                width={labelWidth}
                                height={20}
                                rx={10}
                                fill={isSelected || isEditing ? "rgb(157 118 255)" : "rgb(210 197 255)"}
                                stroke="transparent"
                                style={{ pointerEvents: "all", cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!isEditing) startEditingConnection(edge.id)
                                }}
                                className="connection-element"
                              />
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
                                      if (e.key === "Enter") saveConnectionLabel()
                                      else if (e.key === "Escape") cancelConnectionEdit()
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
                                  {edge.label && edge.label.length > 15 ? edge.label.substring(0, 15) + "..." : edge.label}
                                </text>
                              )}
                            </>
                          )
                        })()}
                      </g>
                    )}

                    {isSelected && !hasLabel && !isEditing && (
                      <g>
                        <circle
                          cx={midpoint.x}
                          cy={midpoint.y}
                          r="12"
                          fill="rgb(157 118 255)"
                          style={{ pointerEvents: "all" }}
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditingConnection(edge.id)
                          }}
                          className="connection-element cursor-pointer"
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
              {highlightedCell && (isDragging || isPlacingNewNode) && (
                <rect
                  x={CANVAS_PADDING_X + (highlightedCell.column - minCol) * GRID_X_SPACING}
                  y={CANVAS_PADDING_Y + (highlightedCell.row - minRow) * GRID_Y_SPACING}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx="16"
                  fill="rgba(154, 126, 255, 0.08)"
                  stroke="rgb(154, 126, 255)"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  className="pointer-events-none"
                />
              )}
              <defs>
                <marker id="arrowhead-normal" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="rgb(210 197 255)" />
                </marker>
                <marker id="arrowhead-selected" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="rgb(157 118 255)" />
                </marker>
              </defs>
            </svg>

            {nodesWithPositions.map((node) => {
              const isSelected = selectedNodeId === node.id || selectedNodeIds.has(node.id)
              const isDraggingThis =
                (isDragging && selectedNodeId === node.id) || (isGroupDragging && selectedNodeIds.has(node.id))
              return (
                <div key={node.id} className="flow-node relative" data-node-id={node.id} style={{ zIndex: isSelected ? 25 : 20 }}>
                  {selectedNodeIds.has(node.id) && selectedNodeIds.size > 1 && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        left: node.position.x - 2,
                        top: node.position.y - 2,
                        width: NODE_WIDTH + 4,
                        height: NODE_HEIGHT + 4,
                        border: "2px dashed rgb(154, 126, 255)",
                        borderRadius: 16,
                        backgroundColor: "rgba(154, 126, 255, 0.04)",
                      }}
                    />
                  )}

                  {/* Connection dots */}
                  <div
                    className={`connection-dot absolute w-4 h-4 rounded-full border-2 border-white shadow-e1 cursor-pointer transition-all ${
                      connectingFromNode && connectingFromNode !== node.id
                        ? "bg-green-500 ring-2"
                        : connectingFromNode === node.id
                          ? "bg-orange-500 ring-2"
                          : "bg-brand"
                    }`}
                    style={{ left: node.position.x - 8, top: node.position.y + CONNECTION_DOT_Y_OFFSET, zIndex: 30 }}
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
                    className={`connection-dot absolute w-4 h-4 rounded-full border-2 border-white shadow-e1 cursor-pointer transition-all ${
                      connectingFromNode === node.id ? "bg-orange-500 ring-2" : connectingFromNode ? "bg-gray-400 cursor-not-allowed" : "bg-brand"
                    }`}
                    style={{ left: node.position.x + NODE_WIDTH - 8, top: node.position.y + CONNECTION_DOT_Y_OFFSET, zIndex: 30 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!connectingFromNode || connectingFromNode === node.id) handleNodeConnectionClick(node.id)
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
                    onDelete={handleNodeDelete}
                    onConnectDataSource={onConnectDataSource}
                    style={{ cursor: isSelected ? (isDraggingThis ? "grabbing" : "grab") : "pointer", opacity: isDraggingThis ? 0.92 : 1 }}
                  />
                </div>
              )
            })}

            {isGroupDragging && groupDragPreview.length > 0 && (
              <>
                {groupDragPreview.map(({ nodeId, targetRow, targetCol }) => (
                  <div
                    key={`preview-${nodeId}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: CANVAS_PADDING_X + (targetCol - minCol) * GRID_X_SPACING,
                      top: CANVAS_PADDING_Y + (targetRow - minRow) * GRID_Y_SPACING,
                      width: NODE_WIDTH,
                      height: NODE_HEIGHT,
                    }}
                  >
                    <div className="w-full h-full rounded-xl-token" style={{ border: "2px dashed rgb(154,126,255)", background: "rgba(154,126,255,0.06)" }} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Zoom controls remain the same */}
        <div className="zoom-controls fixed bottom-20 right-4 bg-surface rounded-md shadow-e1 border border-default p-2 space-y-1">
          <button
            onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }))}
            className="block w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-subtle rounded-sm transition-colors text-lg font-bold"
          >
            +
          </button>
          <button
            onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(0.1, prev.scale / 1.2) }))}
            className="block w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-subtle rounded-sm transition-colors text-lg font-bold"
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
                const paddingX = 100
                const paddingY = 100
                const scaleX = (containerWidth - paddingX * 2) / contentWidth
                const scaleY = (containerHeight - paddingY * 2) / contentHeight
                const scale = Math.min(1, Math.min(scaleX, scaleY))
                const contentCenterX = CANVAS_PADDING_X + ((minCol + maxCol) * GRID_X_SPACING) / 2
                const contentCenterY = CANVAS_PADDING_Y + ((minRow + maxRow) * GRID_Y_SPACING) / 2
                const x = containerWidth / 2 - contentCenterX * scale
                const y = containerHeight / 2 - contentCenterY * scale
                setTransform({ x, y, scale })
              }
            }}
            className="block w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-subtle rounded-sm transition-colors flex items-center justify-center"
            title="Fit to frame"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

/* Helper for group placement */
function findNearestEmptyCellGroup(
  targetRow: number,
  targetCol: number,
  selectedNodeIds: Set<string>,
  allNodes: FlowNode[],
) {
  const selectedNodes = allNodes.filter((node) => selectedNodeIds.has(node.id))
  const otherNodes = allNodes.filter((node) => !selectedNodeIds.has(node.id))
  if (selectedNodes.length === 0) return []
  const minRow = Math.min(...selectedNodes.map((n) => n.position.row))
  const minCol = Math.min(...selectedNodes.map((n) => n.position.column))
  const relativePositions = selectedNodes.map((node) => ({
    nodeId: node.id,
    deltaRow: node.position.row - minRow,
    deltaCol: node.position.column - minCol,
  }))
  for (let offsetRow = 0; offsetRow < 5; offsetRow++) {
    for (let offsetCol = 0; offsetCol < 5; offsetCol++) {
      const baseRow = targetRow + offsetRow
      const baseCol = targetCol + offsetCol
      const proposed = relativePositions.map((rel) => ({
        nodeId: rel.nodeId,
        targetRow: baseRow + rel.deltaRow,
        targetCol: baseCol + rel.deltaCol,
      }))
      const hasCollision = proposed.some((pos) =>
        otherNodes.some((node) => node.position.row === pos.targetRow && node.position.column === pos.targetCol),
      )
      if (!hasCollision) return proposed
    }
  }
  return selectedNodes.map((node) => ({ nodeId: node.id, targetRow: node.position.row, targetCol: node.position.column }))
}
