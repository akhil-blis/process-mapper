"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import type {
  PrototypePlan,
  PrototypeScreen,
  PrototypeElement,
  PrototypeConnection,
  ElementType,
} from "@/types/prototype"
import { Plus, X, Info, MousePointer, FormInput, Trash2 } from "lucide-react"
import { AIAssistant } from "./ai-assistant" // Import the AI Assistant

// --- ADJUSTED LAYOUT CONSTANTS for a more compact design ---
const SCREEN_CARD_WIDTH = 260
const SCREEN_CARD_HEADER_HEIGHT = 45
const SCREEN_ELEMENTS_CONTAINER_PADDING_Y = 8
const ELEMENT_CHIP_HEIGHT = 32
const ELEMENT_CHIP_SPACING_Y = 6

const SCREEN_CONNECTION_DOT_SIZE = 20
const SCREEN_CONNECTION_DOT_Y_OFFSET_FROM_TOP = 20
const SCREEN_CONNECTION_DOT_CENTER_Y = SCREEN_CONNECTION_DOT_Y_OFFSET_FROM_TOP + SCREEN_CONNECTION_DOT_SIZE / 2

const GRID_COLS = 3
const GRID_COL_GAP = 60
const GRID_ROW_GAP = 60
const SCREEN_CARD_MIN_HEIGHT_FOR_LAYOUT = 180
const GRID_X_SPACING = SCREEN_CARD_WIDTH + GRID_COL_GAP
// GRID_Y_SPACING will be dynamic based on maxScreenHeight

const CANVAS_PADDING_X = 40
const CANVAS_PADDING_Y = 40
// --- END LAYOUT CONSTANTS ---

type BreadboardProps = {
  prototypePlan?: PrototypePlan
  onUpdate: (plan: PrototypePlan) => void
  onAISuggestion: (suggestion: string) => void
}

export function Breadboard({ prototypePlan, onUpdate, onAISuggestion }: BreadboardProps) {
  // Initialize with the Auto-score Candidates flow if no prototypePlan is provided
  const initialPrototypePlan: PrototypePlan = {
    screens: [
      {
        id: "screen-resume-upload",
        title: "Resume Upload",
        position: { x: 0, y: 0 },
        elements: [
          {
            id: "element-upload-resume",
            type: "input",
            label: "Upload Resume",
            screenId: "screen-resume-upload",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-upload-cover-letter",
            type: "input",
            label: "Upload Cover Letter",
            screenId: "screen-resume-upload",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-enter-application-id",
            type: "input",
            label: "Enter Application ID",
            screenId: "screen-resume-upload",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-submit-application",
            type: "action",
            label: "Submit Application",
            screenId: "screen-resume-upload",
            position: { x: 0, y: 0 },
          },
        ],
      },
      {
        id: "screen-resume-parser",
        title: "Resume Parser",
        position: { x: 0, y: 0 },
        elements: [
          {
            id: "element-extracted-skills",
            type: "info",
            label: "Extracted Skills",
            screenId: "screen-resume-parser",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-experience-summary",
            type: "info",
            label: "Experience Summary",
            screenId: "screen-resume-parser",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-education-tags",
            type: "info",
            label: "Education Tags",
            screenId: "screen-resume-parser",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-send-to-scoring-engine",
            type: "action",
            label: "Send to Scoring Engine",
            screenId: "screen-resume-parser",
            position: { x: 0, y: 0 },
          },
        ],
      },
      {
        id: "screen-ai-scorecard",
        title: "AI Scorecard",
        position: { x: 0, y: 0 },
        elements: [
          {
            id: "element-match-percentage",
            type: "info",
            label: "Match %",
            screenId: "screen-ai-scorecard",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-top-strengths",
            type: "info",
            label: "Top Strengths",
            screenId: "screen-ai-scorecard",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-areas-of-concern",
            type: "info",
            label: "Areas of Concern",
            screenId: "screen-ai-scorecard",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-confidence-level",
            type: "info",
            label: "Confidence Level",
            screenId: "screen-ai-scorecard",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-send-for-review",
            type: "action",
            label: "Send for Review",
            screenId: "screen-ai-scorecard",
            position: { x: 0, y: 0 },
          },
        ],
      },
      {
        id: "screen-review-tag",
        title: "Review & Tag",
        position: { x: 0, y: 0 },
        elements: [
          {
            id: "element-hr-notes",
            type: "input",
            label: "HR Notes",
            screenId: "screen-review-tag",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-flag-manual-review",
            type: "action",
            label: "Flag for Manual Review",
            screenId: "screen-review-tag",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-add-to-talent-pool",
            type: "action",
            label: "Add to Talent Pool",
            screenId: "screen-review-tag",
            position: { x: 0, y: 0 },
          },
          {
            id: "element-open-evaluator-tools",
            type: "action",
            label: "Open Evaluator Tools",
            screenId: "screen-review-tag",
            position: { x: 0, y: 0 },
          },
        ],
      },
    ],
    connections: [
      {
        id: "conn-submit-to-parser",
        fromElementId: "element-submit-application",
        toScreenId: "screen-resume-parser",
      },
      {
        id: "conn-parser-to-scorecard",
        fromElementId: "element-send-to-scoring-engine",
        toScreenId: "screen-ai-scorecard",
      },
      {
        id: "conn-scorecard-to-review",
        fromElementId: "element-send-for-review",
        toScreenId: "screen-review-tag",
      },
    ],
  }

  const currentPlan = prototypePlan || initialPrototypePlan

  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null)
  const [connectingFromElement, setConnectingFromElement] = useState<string | null>(null)
  const [showElementMenu, setShowElementMenu] = useState<string | null>(null)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 800 })
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null)
  const [isChatAssistantOpen, setIsChatAssistantOpen] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const breadboardContainerRef = useRef<HTMLDivElement>(null)

  const elementIcons = {
    info: <Info className="h-3 w-3" />,
    action: <MousePointer className="h-3 w-3" />,
    input: <FormInput className="h-3 w-3" />,
  }

  const elementColors: Record<ElementType, string> = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    action: "bg-green-50 text-green-700 border-green-200",
    input: "bg-purple-50 text-purple-700 border-purple-200",
  }

  useEffect(() => {
    const calculateCanvasSize = () => {
      if (!breadboardContainerRef.current) return

      let maxScreenHeight = SCREEN_CARD_MIN_HEIGHT_FOR_LAYOUT
      if (currentPlan.screens.length > 0) {
        maxScreenHeight = currentPlan.screens.reduce((maxH, screen) => {
          const elementsHeight =
            screen.elements.length * (ELEMENT_CHIP_HEIGHT + ELEMENT_CHIP_SPACING_Y) -
            (screen.elements.length > 0 ? ELEMENT_CHIP_SPACING_Y : 0)
          const totalHeight = SCREEN_CARD_HEADER_HEIGHT + SCREEN_ELEMENTS_CONTAINER_PADDING_Y * 2 + elementsHeight
          return Math.max(maxH, totalHeight, SCREEN_CARD_MIN_HEIGHT_FOR_LAYOUT)
        }, SCREEN_CARD_MIN_HEIGHT_FOR_LAYOUT)
      }

      const numRows = Math.max(1, Math.ceil(currentPlan.screens.length / GRID_COLS))
      const requiredHeight = CANVAS_PADDING_Y * 2 + numRows * maxScreenHeight + Math.max(0, numRows - 1) * GRID_ROW_GAP

      const numCols = Math.min(currentPlan.screens.length, GRID_COLS)
      const requiredWidth = CANVAS_PADDING_X * 2 + numCols * SCREEN_CARD_WIDTH + Math.max(0, numCols - 1) * GRID_COL_GAP

      const parentWidth = breadboardContainerRef.current.clientWidth

      setCanvasDimensions({
        width: Math.max(parentWidth - CANVAS_PADDING_X * 2, requiredWidth), // Ensure it fits parent or expands
        height: Math.max(requiredHeight, 400), // Ensure minimum height for smaller AI assistant (320px chat + 80px padding)
      })
    }

    calculateCanvasSize()
    window.addEventListener("resize", calculateCanvasSize)
    return () => window.removeEventListener("resize", calculateCanvasSize)
  }, [currentPlan.screens])

  const getGridPosition = (index: number) => {
    let maxScreenHeightInRows = SCREEN_CARD_MIN_HEIGHT_FOR_LAYOUT
    if (currentPlan.screens.length > 0) {
      maxScreenHeightInRows = currentPlan.screens.reduce((maxH, screen) => {
        const elementsHeight =
          screen.elements.length * (ELEMENT_CHIP_HEIGHT + ELEMENT_CHIP_SPACING_Y) -
          (screen.elements.length > 0 ? ELEMENT_CHIP_SPACING_Y : 0)
        const totalHeight = SCREEN_CARD_HEADER_HEIGHT + SCREEN_ELEMENTS_CONTAINER_PADDING_Y * 2 + elementsHeight
        return Math.max(maxH, totalHeight, SCREEN_CARD_MIN_HEIGHT_FOR_LAYOUT)
      }, SCREEN_CARD_MIN_HEIGHT_FOR_LAYOUT)
    }
    const dynamicGridYSpacing = maxScreenHeightInRows + GRID_ROW_GAP

    const col = index % GRID_COLS
    const row = Math.floor(index / GRID_COLS)
    return {
      x: CANVAS_PADDING_X + col * GRID_X_SPACING,
      y: CANVAS_PADDING_Y + row * dynamicGridYSpacing,
    }
  }

  const getScreensWithCalculatedPositions = () => {
    return currentPlan.screens.map((screen, index) => ({
      ...screen,
      position: getGridPosition(index),
    }))
  }

  const addScreen = () => {
    const newScreen: PrototypeScreen = {
      id: `screen-${Date.now()}`,
      title: "New Screen",
      position: { x: 0, y: 0 },
      elements: [],
    }
    onUpdate({ ...currentPlan, screens: [...currentPlan.screens, newScreen] })
  }

  const updateScreenTitle = (screenId: string, title: string) => {
    onUpdate({
      ...currentPlan,
      screens: currentPlan.screens.map((s) => (s.id === screenId ? { ...s, title } : s)),
    })
  }

  const deleteScreen = (screenId: string) => {
    onUpdate({
      screens: currentPlan.screens.filter((s) => s.id !== screenId),
      connections: currentPlan.connections.filter(
        (conn) =>
          conn.toScreenId !== screenId &&
          !currentPlan.screens.find((s) => s.id === screenId)?.elements.some((e) => e.id === conn.fromElementId),
      ),
    })
  }

  const addElementToScreen = (screenId: string, type: ElementType) => {
    const screen = currentPlan.screens.find((s) => s.id === screenId)
    if (!screen) return
    const newElement: PrototypeElement = {
      id: `element-${Date.now()}`,
      type,
      label: `New ${type}`,
      screenId,
      position: { x: 0, y: 0 },
    }
    onUpdate({
      ...currentPlan,
      screens: currentPlan.screens.map((s) =>
        s.id === screenId ? { ...s, elements: [...s.elements, newElement] } : s,
      ),
    })
    setShowElementMenu(null)
  }

  const updateElementLabel = (elementId: string, label: string) => {
    onUpdate({
      ...currentPlan,
      screens: currentPlan.screens.map((s) => ({
        ...s,
        elements: s.elements.map((el) => (el.id === elementId ? { ...el, label } : el)),
      })),
    })
  }

  const deleteElementFromScreen = (elementId: string) => {
    onUpdate({
      ...currentPlan,
      screens: currentPlan.screens.map((s) => ({
        ...s,
        elements: s.elements.filter((el) => el.id !== elementId),
      })),
      connections: currentPlan.connections.filter((conn) => conn.fromElementId !== elementId),
    })
  }

  const handleElementDotClick = (elementId: string) => {
    setConnectingFromElement((prev) => (prev === elementId ? null : elementId))
  }

  const handleScreenDotClick = (screenId: string) => {
    if (connectingFromElement) {
      const existing = currentPlan.connections.find(
        (c) => c.fromElementId === connectingFromElement && c.toScreenId === screenId,
      )
      if (!existing) {
        const newConnection: PrototypeConnection = {
          id: `conn-${Date.now()}`,
          fromElementId: connectingFromElement,
          toScreenId: screenId,
        }
        onUpdate({ ...currentPlan, connections: [...currentPlan.connections, newConnection] })
      }
      setConnectingFromElement(null)
    }
  }

  const deleteConnection = (connectionId: string) => {
    onUpdate({ ...currentPlan, connections: currentPlan.connections.filter((c) => c.id !== connectionId) })
  }

  const generateConnectionPath = (
    connection: PrototypeConnection,
    screensWithPositions: (PrototypeScreen & { position: { x: number; y: number } })[],
  ) => {
    const fromElement = screensWithPositions.flatMap((s) => s.elements).find((e) => e.id === connection.fromElementId)
    const toScreen = screensWithPositions.find((s) => s.id === connection.toScreenId)
    const fromScreen = screensWithPositions.find((s) => s.elements.some((e) => e.id === connection.fromElementId))

    if (!fromElement || !toScreen || !fromScreen) return ""

    const fromElementIndex = fromScreen.elements.findIndex((el) => el.id === fromElement.id)
    if (fromElementIndex === -1) return ""

    const startX = fromScreen.position.x + SCREEN_CARD_WIDTH
    const startY =
      fromScreen.position.y +
      SCREEN_CARD_HEADER_HEIGHT +
      SCREEN_ELEMENTS_CONTAINER_PADDING_Y +
      fromElementIndex * (ELEMENT_CHIP_HEIGHT + ELEMENT_CHIP_SPACING_Y) +
      ELEMENT_CHIP_HEIGHT / 2

    const endX = toScreen.position.x
    const endY = toScreen.position.y + SCREEN_CONNECTION_DOT_CENTER_Y

    const controlOffset = Math.max(40, Math.abs(endX - startX) * 0.35)
    const controlX1 = startX + controlOffset
    const controlX2 = endX - controlOffset

    return `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`
  }

  const getConnectionMidpoint = (path: string) => {
    const coords = path.match(/[\d.-]+/g)
    if (!coords || coords.length < 8) return { x: 0, y: 0 }
    const x1 = Number.parseFloat(coords[0])
    const y1 = Number.parseFloat(coords[1])
    const x2 = Number.parseFloat(coords[6])
    const y2 = Number.parseFloat(coords[7])
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
  }

  const screensToRender = getScreensWithCalculatedPositions()

  const handleAISuggestion = (suggestion: string) => {
    if (suggestion === "add_interview_confirmation_screen") {
      // Check if the confirmation screen already exists
      const existingConfirmationScreen = currentPlan.screens.find((screen) => screen.title === "Interview Confirmation")

      if (!existingConfirmationScreen) {
        // Create the new Interview Confirmation screen
        const newScreen: PrototypeScreen = {
          id: `screen-${Date.now()}`,
          title: "Interview Confirmation",
          position: { x: 0, y: 0 }, // Will be calculated by grid layout
          elements: [
            {
              id: `element-${Date.now()}-1`,
              type: "info",
              label: "Interview Date & Time",
              screenId: `screen-${Date.now()}`,
              position: { x: 0, y: 0 },
            },
            {
              id: `element-${Date.now()}-2`,
              type: "info",
              label: "Meeting Link",
              screenId: `screen-${Date.now()}`,
              position: { x: 0, y: 0 },
            },
            {
              id: `element-${Date.now()}-3`,
              type: "info",
              label: "Interviewer Details",
              screenId: `screen-${Date.now()}`,
              position: { x: 0, y: 0 },
            },
            {
              id: `element-${Date.now()}-4`,
              type: "action",
              label: "Add to Calendar",
              screenId: `screen-${Date.now()}`,
              position: { x: 0, y: 0 },
            },
            {
              id: `element-${Date.now()}-5`,
              type: "action",
              label: "Back to Dashboard",
              screenId: `screen-${Date.now()}`,
              position: { x: 0, y: 0 },
            },
          ],
        }

        // Find the "Confirm Interview" element in Interview Scheduler to connect from
        const interviewSchedulerScreen = currentPlan.screens.find((screen) => screen.title === "Interview Scheduler")
        const confirmInterviewElement = interviewSchedulerScreen?.elements.find(
          (element) => element.label === "Confirm Interview",
        )

        // Create connection from "Confirm Interview" to new confirmation screen
        const newConnection: PrototypeConnection = {
          id: `conn-${Date.now()}`,
          fromElementId: confirmInterviewElement?.id || "",
          toScreenId: newScreen.id,
        }

        // Find the "Back to Dashboard" element in new screen to connect back
        const backToDashboardElement = newScreen.elements.find((element) => element.label === "Back to Dashboard")
        const candidateDashboardScreen = currentPlan.screens.find((screen) => screen.title === "Candidate Dashboard")

        const backConnection: PrototypeConnection = {
          id: `conn-${Date.now()}-back`,
          fromElementId: backToDashboardElement?.id || "",
          toScreenId: candidateDashboardScreen?.id || "",
        }

        // Update the prototype plan
        onUpdate({
          ...currentPlan,
          screens: [...currentPlan.screens, newScreen],
          connections: [...currentPlan.connections, newConnection, backConnection],
        })
      }
    }

    if (suggestion === "add_evaluator_dashboard") {
      // Check if the evaluator dashboard already exists
      const existingDashboard = currentPlan.screens.find((screen) => screen.title === "Evaluator Dashboard")

      if (!existingDashboard) {
        // Create the new Evaluator Dashboard screen
        const newScreen: PrototypeScreen = {
          id: "screen-evaluator-dashboard",
          title: "Evaluator Dashboard",
          position: { x: 0, y: 0 }, // Will be calculated by grid layout
          elements: [
            {
              id: "element-filter-by-score",
              type: "input",
              label: "Filter by Score",
              screenId: "screen-evaluator-dashboard",
              position: { x: 0, y: 0 },
            },
            {
              id: "element-view-flagged-candidates",
              type: "info",
              label: "View Flagged Candidates",
              screenId: "screen-evaluator-dashboard",
              position: { x: 0, y: 0 },
            },
            {
              id: "element-add-final-comments",
              type: "input",
              label: "Add Final Comments",
              screenId: "screen-evaluator-dashboard",
              position: { x: 0, y: 0 },
            },
            {
              id: "element-mark-as-shortlisted",
              type: "action",
              label: "Mark as Shortlisted",
              screenId: "screen-evaluator-dashboard",
              position: { x: 0, y: 0 },
            },
          ],
        }

        // Create connection from "Open Evaluator Tools" to new dashboard
        const newConnection: PrototypeConnection = {
          id: "conn-review-to-dashboard",
          fromElementId: "element-open-evaluator-tools",
          toScreenId: "screen-evaluator-dashboard",
        }

        // Update the prototype plan
        onUpdate({
          ...currentPlan,
          screens: [...currentPlan.screens, newScreen],
          connections: [...currentPlan.connections, newConnection],
        })
      }
    }

    // Call the original onAISuggestion for any additional handling
    onAISuggestion(suggestion)
  }

  // Helper function to check if a screen can be connected to
  const canConnectToScreen = (screenId: string) => {
    if (!connectingFromElement) return false
    // Don't allow connecting to the same screen as the source element
    const sourceScreen = currentPlan.screens.find((s) => s.elements.some((e) => e.id === connectingFromElement))
    return sourceScreen?.id !== screenId
  }

  return (
    <div ref={breadboardContainerRef} className="bg-white shadow-sm rounded-lg p-6 md:p-8 relative">
      {" "}
      {/* Added relative positioning for AI Assistant */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 id="prototype-plan-title" className="text-2xl font-semibold text-gray-900 mb-1">
            Prototype Plan
          </h2>
          <p className="text-gray-600 text-sm">Design your prototype structure using the breadboard interface below.</p>
        </div>
        <button
          onClick={addScreen}
          className="flex items-center gap-2 px-3.5 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" /> Add Screen
        </button>
      </div>
      {connectingFromElement && (
        <div className="mb-4 bg-violet-50 border border-violet-200 rounded-md p-3 text-sm text-violet-700">
          <strong>Connection mode:</strong> Click on a highlighted screen dot to complete the connection, or click the
          element's dot again to cancel.
        </div>
      )}
      <div
        className={`relative bg-gray-50 rounded-lg border border-gray-200 overflow-auto transition-opacity duration-300 ${isChatAssistantOpen ? "opacity-50 pointer-events-none" : "opacity-100"}`}
        style={{ height: `${canvasDimensions.height + 12}px` }}
      >
        <div
          ref={canvasRef}
          className="relative p-6"
          style={{ width: canvasDimensions.width, height: canvasDimensions.height }}
          onClick={() => {
            setSelectedScreenId(null)
            setShowElementMenu(null)
            setConnectingFromElement(null)
          }}
        >
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            viewBox={`0 0 ${canvasDimensions.width} ${canvasDimensions.height}`}
            style={{ zIndex: 10 }}
          >
            {currentPlan.connections.map((connection) => {
              const path = generateConnectionPath(connection, screensToRender)
              if (!path) return null
              const midpoint = getConnectionMidpoint(path)
              return (
                <g
                  key={connection.id}
                  onMouseEnter={() => setHoveredConnectionId(connection.id)}
                  onMouseLeave={() => setHoveredConnectionId(null)}
                >
                  {/* Invisible wider path for easier hover detection */}
                  <path
                    d={path}
                    stroke="transparent"
                    strokeWidth="12"
                    fill="none"
                    style={{ pointerEvents: "stroke", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConnection(connection.id)
                    }}
                  />
                  {/* Visible connection line */}
                  <path
                    d={path}
                    stroke={hoveredConnectionId === connection.id ? "rgb(239 68 68)" : "rgb(139 92 246)"}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,3"
                    markerEnd={`url(#arrowhead-prototype-${hoveredConnectionId === connection.id ? "hovered" : "normal"})`}
                    style={{ pointerEvents: "none" }}
                  />
                  {/* Delete button on hover */}
                  {hoveredConnectionId === connection.id && (
                    <>
                      <circle
                        cx={midpoint.x}
                        cy={midpoint.y}
                        r="10"
                        fill="#ef4444"
                        className="cursor-pointer hover:fill-red-600"
                        style={{ pointerEvents: "all" }}
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConnection(connection.id)
                        }}
                      >
                        <title>Delete connection</title>
                      </circle>
                      <text
                        x={midpoint.x}
                        y={midpoint.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        ×
                      </text>
                    </>
                  )}
                </g>
              )
            })}
            <defs>
              <marker id="arrowhead-prototype-normal" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="rgb(139 92 246)" />
              </marker>
              <marker id="arrowhead-prototype-hovered" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="rgb(239 68 68)" />
              </marker>
            </defs>
          </svg>

          {screensToRender.map((screen) => (
            <div
              key={screen.id}
              className={`absolute bg-white rounded-lg border shadow-md transition-all duration-150 ${
                selectedScreenId === screen.id
                  ? "border-violet-500 ring-2 ring-violet-500/30"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{
                left: screen.position.x,
                top: screen.position.y,
                width: SCREEN_CARD_WIDTH,
                zIndex: 5,
              }}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedScreenId(screen.id)
              }}
            >
              <div
                className={`absolute -left-2.5 top-[${SCREEN_CONNECTION_DOT_Y_OFFSET_FROM_TOP}px] w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer transition-all ${
                  connectingFromElement && canConnectToScreen(screen.id)
                    ? "bg-green-500 hover:bg-green-600 ring-2 ring-green-300 animate-pulse"
                    : connectingFromElement
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-violet-500 hover:bg-violet-600"
                }`}
                style={{ top: `${SCREEN_CONNECTION_DOT_Y_OFFSET_FROM_TOP}px`, zIndex: 6 }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (canConnectToScreen(screen.id)) {
                    handleScreenDotClick(screen.id)
                  }
                }}
                title={
                  connectingFromElement && canConnectToScreen(screen.id)
                    ? "Complete connection to this screen"
                    : connectingFromElement
                      ? "Cannot connect to same screen"
                      : "Screen connection point"
                }
              />
              <div className="flex items-center justify-between p-2.5 border-b border-gray-200">
                <input
                  type="text"
                  value={screen.title}
                  onChange={(e) => updateScreenTitle(screen.id, e.target.value)}
                  className="font-medium text-gray-700 bg-transparent border-none outline-none flex-1 text-sm placeholder-gray-400"
                  placeholder="Screen Title"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex items-center">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowElementMenu(showElementMenu === screen.id ? null : screen.id)
                      }}
                      className="p-1 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    {showElementMenu === screen.id && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[120px]">
                        {(["info", "action", "input"] as ElementType[]).map((type) => (
                          <button
                            key={type}
                            onClick={(e) => {
                              e.stopPropagation()
                              addElementToScreen(screen.id, type)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 capitalize"
                          >
                            {React.cloneElement(elementIcons[type], { className: "h-3 w-3" })} {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteScreen(screen.id)
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded ml-0.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-2 space-y-1.5 min-h-[40px]">
                {screen.elements.map((element) => (
                  <div
                    key={element.id}
                    className={`relative flex items-center p-1.5 rounded border ${elementColors[element.type]} group text-xs`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {React.cloneElement(elementIcons[element.type], { className: "h-3 w-3 flex-shrink-0" })}
                      <input
                        type="text"
                        value={element.label}
                        onChange={(e) => updateElementLabel(element.id, e.target.value)}
                        className="bg-transparent border-none outline-none flex-1 min-w-0 placeholder-gray-400"
                        placeholder={`New ${element.type}`}
                      />
                    </div>
                    <div
                      className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-white shadow-sm cursor-pointer transition-all ${
                        connectingFromElement === element.id
                          ? "bg-orange-500 hover:bg-orange-600 ring-2 ring-orange-300 animate-pulse"
                          : connectingFromElement
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-violet-500 hover:bg-violet-600"
                      }`}
                      style={{ zIndex: 6 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!connectingFromElement || connectingFromElement === element.id) {
                          handleElementDotClick(element.id)
                        }
                      }}
                      title={
                        connectingFromElement === element.id
                          ? "Cancel connection"
                          : connectingFromElement
                            ? "Cannot start new connection while connecting"
                            : "Start connection from this element"
                      }
                    />
                    <button
                      onClick={() => deleteElementFromScreen(element.id)}
                      className="ml-1 p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
                {screen.elements.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-xs">Click + to add elements</div>
                )}
              </div>
            </div>
          ))}
          {screensToRender.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-lg shadow">
                <div className="text-gray-400 mb-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto text-gray-300"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <p className="text-gray-500 mb-2.5 text-xs">Your prototype plan is empty.</p>
                <button
                  onClick={addScreen}
                  className="px-3 py-1.5 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors text-xs flex items-center gap-1.5 mx-auto"
                >
                  <Plus className="h-3 w-3" /> Add First Screen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* AI Assistant - positioned as collapsed chat bar below canvas */}
      <div className="relative mt-4 mb-16">
        <AIAssistant onSuggestion={handleAISuggestion} onToggle={setIsChatAssistantOpen} />
      </div>
    </div>
  )
}
