"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import type { FlowData, FlowNode } from "@/types/flow"
import { TopNavigation } from "@/components/flow-builder/top-navigation"
import { ToolPalette } from "@/components/flow-builder/tool-palette"
import { Canvas } from "@/components/flow-builder/canvas"
import { FooterSummary } from "@/components/flow-builder/footer-summary"
import { AILoading } from "@/components/ai-loading"

// Sample flow data for "New Employee Onboarding"
const initialFlowData: FlowData = {
  title: "New Employee Onboarding",
  nodes: [
    {
      id: "1",
      type: "step",
      title: "Submit Hiring Request",
      role: "Hiring Manager",
      tools: ["HRIS", "Email"],
      position: { x: 100, y: 100 },
      tags: ["trigger"],
      duration: { value: 15, unit: "minutes" },
      attachments: [{ name: "Job Description Template.docx", type: "file" }],
    },
    {
      id: "2",
      type: "step",
      title: "Create Job Listing",
      role: "HR Specialist",
      tools: ["ATS", "Job Board"],
      position: { x: 400, y: 100 },
      tags: [],
      duration: { value: 2, unit: "hours" },
    },
    {
      id: "3",
      type: "step",
      title: "Post to Platforms",
      role: "HR Specialist",
      tools: ["LinkedIn", "Indeed", "Company Website"],
      position: { x: 700, y: 100 },
      tags: ["automated"],
      duration: { value: 30, unit: "minutes" },
    },
    {
      id: "4",
      type: "step",
      title: "Screen Candidates",
      role: "HR Specialist",
      tools: ["ATS", "Phone"],
      position: { x: 1000, y: 100 },
      tags: ["friction"],
      duration: { value: 4, unit: "hours" },
      attachments: [
        { name: "Screening Checklist.pdf", type: "file" },
        { name: "Interview Questions.docx", type: "file" },
      ],
    },
    {
      id: "5",
      type: "step",
      title: "Interview Rounds",
      role: "Hiring Manager",
      tools: ["Zoom", "Calendar"],
      position: { x: 400, y: 300 },
      tags: ["handoff"],
      duration: { value: 3, unit: "hours" },
    },
    {
      id: "6",
      type: "step",
      title: "Make Offer",
      role: "HR Manager",
      tools: ["DocuSign", "Email"],
      position: { x: 700, y: 300 },
      tags: ["handoff"],
      duration: { value: 1, unit: "hours" },
      attachments: [{ name: "Offer Letter Template.docx", type: "file" }],
    },
    {
      id: "7",
      type: "step",
      title: "Set Up IT Access",
      role: "IT Administrator",
      tools: ["Active Directory", "Slack", "Google Workspace"],
      position: { x: 1000, y: 300 },
      tags: ["friction"],
      duration: { value: 2, unit: "days" },
      attachments: [
        { name: "IT Setup Checklist.pdf", type: "file" },
        { name: "Security Guidelines", type: "link", url: "https://company.com/security" },
      ],
    },
    {
      id: "8",
      type: "step",
      title: "Welcome Session",
      role: "HR Specialist",
      tools: ["Zoom", "Presentation"],
      position: { x: 700, y: 500 },
      tags: [],
      duration: { value: 1, unit: "hours" },
      attachments: [{ name: "Welcome Presentation.pptx", type: "file" }],
    },
  ],
  edges: [
    { id: "e1", source: "1", target: "2" },
    { id: "e2", source: "2", target: "3" },
    { id: "e3", source: "3", target: "4" },
    { id: "e4", source: "4", target: "5" },
    { id: "e5", source: "5", target: "6" },
    { id: "e6", source: "6", target: "7" },
    { id: "e7", source: "7", target: "8" },
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
            <Canvas nodes={flowData.nodes} edges={flowData.edges} onNodeUpdate={handleNodeUpdate} />
          </main>
          <ToolPalette />
          <FooterSummary flowData={flowData} />
        </>
      )}
    </div>
  )
}
