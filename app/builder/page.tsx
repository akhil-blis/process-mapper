"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import type { FlowData, FlowNode, FlowEdge } from "@/types/flow"
import { TopNavigation } from "@/components/flow-builder/top-navigation"
import { ToolPalette } from "@/components/flow-builder/tool-palette"
import { Canvas, type CanvasRef } from "@/components/flow-builder/canvas"
import { FooterSummary } from "@/components/flow-builder/footer-summary"
import { AILoading } from "@/components/ai-loading"
import { JSONOverrideModal } from "@/components/flow-builder/json-override-modal"

// Updated hiring process data with row/column positioning
const initialFlowData: FlowData = {
  title: "Hiring Process - Mid-Level Role",
  nodes: [
    {
      id: "start-1",
      type: "start",
      title: "Headcount Approved",
      role: "Department Lead",
      tools: ["Workday"],
      position: { row: 1, column: 1 },
      tags: ["trigger"],
      duration: { value: 0, unit: "days" },
      attachments: [],
    },
    {
      id: "step-1",
      type: "step",
      title: "Create Job Description",
      role: "Hiring Manager",
      tools: ["Google Docs"],
      position: { row: 1, column: 2 },
      tags: [],
      duration: { value: 1, unit: "days" },
      attachments: [
        {
          name: "Job Description Template",
          type: "file",
          url: "https://company.docs/templates/job-description.docx",
        },
      ],
    },
    {
      id: "step-2",
      type: "branch",
      title: "Distribute Job Posting",
      role: "HR Specialist",
      tools: ["LinkedIn", "Company Site", "Referrals"],
      position: { row: 1, column: 3 },
      tags: [],
      duration: { value: 1, unit: "days" },
      attachments: [],
    },
    {
      id: "step-3a",
      type: "step",
      title: "Inbound Applications Review",
      role: "HR Assistant",
      tools: ["ATS"],
      position: { row: 0, column: 4 },
      tags: ["friction"],
      duration: { value: 2, unit: "days" },
      attachments: [],
    },
    {
      id: "step-3b",
      type: "step",
      title: "Referrals Review",
      role: "Hiring Manager",
      tools: ["Email"],
      position: { row: 2, column: 4 },
      tags: [],
      duration: { value: 1, unit: "days" },
      attachments: [],
    },
    {
      id: "step-4",
      type: "step",
      title: "Initial Phone Screen",
      role: "Recruiter",
      tools: ["Zoom", "ATS"],
      position: { row: 1, column: 5 },
      tags: ["handoff"],
      duration: { value: 2, unit: "days" },
      attachments: [
        {
          name: "Screening Script",
          type: "file",
          url: "https://company.docs/recruiting/screening-checklist.pdf",
        },
      ],
    },
    {
      id: "step-5",
      type: "step",
      title: "Schedule Interview Loop",
      role: "Recruiting Coordinator",
      tools: ["Calendly", "Google Calendar"],
      position: { row: 1, column: 6 },
      tags: ["friction", "automated"],
      duration: { value: 3, unit: "days" },
      attachments: [],
    },
    {
      id: "step-6",
      type: "step",
      title: "Interview Panel Evaluation",
      role: "Team Leads",
      tools: ["Notion", "ATS"],
      position: { row: 1, column: 7 },
      tags: ["handoff"],
      duration: { value: 2, unit: "days" },
      attachments: [
        {
          name: "Interview Scorecard",
          type: "file",
          url: "https://company.notion.com/eval-scorecard-template",
        },
      ],
    },
    {
      id: "step-7",
      type: "branch",
      title: "Decision: Move Forward?",
      role: "Hiring Committee",
      tools: ["Slack", "Zoom"],
      position: { row: 1, column: 8 },
      tags: [],
      duration: { value: 1, unit: "days" },
      attachments: [],
    },
    {
      id: "step-8a",
      type: "step",
      title: "Candidate Rejected",
      role: "Recruiter",
      tools: ["ATS"],
      position: { row: 0, column: 9 },
      tags: ["friction"],
      duration: { value: 0, unit: "days" },
      attachments: [],
    },
    {
      id: "step-8b",
      type: "step",
      title: "Make Offer",
      role: "HR Business Partner",
      tools: ["DocuSign"],
      position: { row: 2, column: 9 },
      tags: [],
      duration: { value: 1, unit: "days" },
      attachments: [
        {
          name: "Offer Letter Template",
          type: "file",
          url: "https://company.docs/hr/offer-template.pdf",
        },
      ],
    },
    {
      id: "step-9",
      type: "step",
      title: "Offer Accepted",
      role: "Candidate",
      tools: [],
      position: { row: 2, column: 10 },
      tags: ["trigger"],
      duration: { value: 0, unit: "days" },
      attachments: [],
    },
    {
      id: "subprocess-1",
      type: "subprocess",
      title: "Onboarding Sequence",
      role: "IT + HR",
      tools: ["Slack", "BambooHR", "Jira"],
      position: { row: 3, column: 11 },
      tags: [],
      duration: { value: 7, unit: "days" },
      attachments: [
        {
          name: "Onboarding Checklist",
          type: "file",
          url: "https://company.notion.com/onboarding-checklist",
        },
        {
          name: "IT Setup Form",
          type: "file",
          url: "https://company.docs/it/asset-setup-request",
        },
      ],
    },
    {
      id: "end-1",
      type: "end",
      title: "Fully Onboarded",
      role: "",
      tools: [],
      position: { row: 2, column: 12 },
      tags: [],
      duration: { value: 0, unit: "days" },
      attachments: [],
    },
  ],
  edges: [
    { id: "e1", source: "start-1", target: "step-1" },
    { id: "e2", source: "step-1", target: "step-2" },
    { id: "e3", source: "step-2", target: "step-3a", label: "Public apps" },
    { id: "e4", source: "step-2", target: "step-3b", label: "Referrals" },
    { id: "e5", source: "step-3a", target: "step-4" },
    { id: "e6", source: "step-3b", target: "step-4" },
    { id: "e7", source: "step-4", target: "step-5" },
    { id: "e8", source: "step-5", target: "step-6" },
    { id: "e9", source: "step-6", target: "step-7", label: "Evaluated" },
    { id: "e10", source: "step-7", target: "step-8a", label: "Reject" },
    { id: "e11", source: "step-7", target: "step-8b", label: "Proceed" },
    { id: "e12", source: "step-8b", target: "step-9" },
    { id: "e13", source: "step-9", target: "subprocess-1", label: "Accepted" },
    { id: "e14", source: "subprocess-1", target: "end-1" },
    { id: "e15", source: "step-8a", target: "step-3a", label: "Retry" },
  ],
}

export default function FlowBuilder() {
  const [flowData, setFlowData] = useState<FlowData>(initialFlowData)
  const [isLoading, setIsLoading] = useState(() => {
    // Only show loading if we haven't processed this page in this session
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("builder-processed")
    }
    return true
  })
  const searchParams = useSearchParams()
  const inputFromHome = searchParams.get("input")
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)
  const canvasRef = useRef<CanvasRef>(null)

  useEffect(() => {
    if (inputFromHome) {
      // In a real app, this would trigger AI processing of the input
      // For now, we'll just show a notification or update the title
      console.log("Processing input from homepage:", inputFromHome)

      // You could update the flow title based on the input
      setFlowData((prev) => ({
        ...prev,
        title: inputFromHome.length > 50 ? "Custom Process" : inputFromHome,
      }))
    }
  }, [inputFromHome])

  const handleNodeUpdate = (nodeId: string, updates: Partial<FlowNode>) => {
    setFlowData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)),
    }))
  }

  const handleNodeAdd = (node: FlowNode) => {
    setFlowData((prev) => ({
      ...prev,
      nodes: [...prev.nodes, node],
    }))
  }

  const handleEdgeAdd = (edge: FlowEdge) => {
    setFlowData((prev) => ({
      ...prev,
      edges: [...prev.edges, edge],
    }))
  }

  const handleEdgeDelete = (edgeId: string) => {
    setFlowData((prev) => ({
      ...prev,
      edges: prev.edges.filter((edge) => edge.id !== edgeId),
    }))
  }

  const handleEdgeUpdate = (edgeId: string, updates: Partial<FlowEdge>) => {
    setFlowData((prev) => ({
      ...prev,
      edges: prev.edges.map((edge) => (edge.id === edgeId ? { ...edge, ...updates } : edge)),
    }))
  }

  const handleFlowOverride = (newFlowData: FlowData) => {
    setFlowData(newFlowData)
  }

  const handleAddNodeClick = () => {
    if (canvasRef.current) {
      canvasRef.current.enterPlacementMode()
    }
  }

  const handleExport = async () => {
    try {
      // Generate JSON export
      const jsonData = JSON.stringify(flowData, null, 2)
      const jsonBlob = new Blob([jsonData], { type: "application/json" })
      const jsonUrl = URL.createObjectURL(jsonBlob)

      // Generate image export
      if (!canvasRef.current) {
        throw new Error("Canvas not ready for export")
      }

      const imageDataUrl = await canvasRef.current.exportAsImage()

      // Convert data URL to blob for download
      const response = await fetch(imageDataUrl)
      const imageBlob = await response.blob()
      const imageUrl = URL.createObjectURL(imageBlob)

      // Create download links
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      const baseName = flowData.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()

      // Download JSON
      const jsonLink = document.createElement("a")
      jsonLink.href = jsonUrl
      jsonLink.download = `${baseName}_${timestamp}.json`
      document.body.appendChild(jsonLink)
      jsonLink.click()
      document.body.removeChild(jsonLink)

      // Download Image
      const imageLink = document.createElement("a")
      imageLink.href = imageUrl
      imageLink.download = `${baseName}_${timestamp}.jpg`
      document.body.appendChild(imageLink)
      imageLink.click()
      document.body.removeChild(imageLink)

      // Clean up URLs
      URL.revokeObjectURL(jsonUrl)
      URL.revokeObjectURL(imageUrl)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    }
  }

  return (
    <div className="h-screen bg-gray-50">
      {isLoading && (
        <AILoading
          title="Generating Your Flow"
          subtitle="Converting your process description into a visual workflow"
          onComplete={() => {
            setIsLoading(false)
            if (typeof window !== "undefined") {
              sessionStorage.setItem("builder-processed", "true")
            }
          }}
          duration={2500}
        />
      )}

      {!isLoading && (
        <>
          <TopNavigation title="Flow Builder" status="Auto-saved" />
          <main className="h-full pt-16 pb-16">
            <Canvas
              ref={canvasRef}
              nodes={flowData.nodes}
              edges={flowData.edges}
              onNodeUpdate={handleNodeUpdate}
              onNodeAdd={handleNodeAdd}
              onEdgeAdd={handleEdgeAdd}
              onEdgeDelete={handleEdgeDelete}
              onEdgeUpdate={handleEdgeUpdate}
            />
          </main>
          <ToolPalette
            onOverrideClick={() => setIsOverrideModalOpen(true)}
            onExportClick={handleExport}
            onAddNodeClick={handleAddNodeClick}
          />
          <FooterSummary flowData={flowData} />
        </>
      )}
      <JSONOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onSubmit={handleFlowOverride}
      />
    </div>
  )
}
