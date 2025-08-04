"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import type { PrototypePlan } from "@/types/prototype"
import { Breadboard } from "@/components/analysis/breadboard"
import { PrototypeOverrideModal } from "@/components/prototype/prototype-override-modal"
import { ArrowLeft, Files, Code } from "lucide-react"
import { Logo } from "@/components/logo"
import type { PrototypeConnection, PrototypeScreen } from "@/types/prototype"

const initialPrototypePlan: PrototypePlan = {
  screens: [
    {
      id: "screen-1",
      title: "Resume Upload",
      position: { x: 50, y: 50 },
      elements: [
        { id: "elem-1", type: "input", label: "Upload Resume", screenId: "screen-1", position: { x: 10, y: 10 } },
        { id: "elem-2", type: "input", label: "Upload Cover Letter", screenId: "screen-1", position: { x: 10, y: 45 } },
        {
          id: "elem-3",
          type: "input",
          label: "Enter Application ID",
          screenId: "screen-1",
          position: { x: 10, y: 80 },
        },
      ],
    },
    {
      id: "screen-2",
      title: "Resume Parser",
      position: { x: 400, y: 50 },
      elements: [
        { id: "elem-4", type: "info", label: "Extracted Skills", screenId: "screen-2", position: { x: 10, y: 10 } },
        { id: "elem-5", type: "info", label: "Experience Summary", screenId: "screen-2", position: { x: 10, y: 45 } },
        { id: "elem-6", type: "info", label: "Education Tags", screenId: "screen-2", position: { x: 10, y: 80 } },
      ],
    },
    {
      id: "screen-3",
      title: "AI Scorecard",
      position: { x: 750, y: 50 },
      elements: [
        { id: "elem-7", type: "info", label: "Match %", screenId: "screen-3", position: { x: 10, y: 10 } },
        { id: "elem-8", type: "info", label: "Top Strengths", screenId: "screen-3", position: { x: 10, y: 45 } },
        { id: "elem-9", type: "info", label: "Areas of Concern", screenId: "screen-3", position: { x: 10, y: 80 } },
        { id: "elem-10", type: "info", label: "Confidence Level", screenId: "screen-3", position: { x: 10, y: 115 } },
      ],
    },
    {
      id: "screen-4",
      title: "Review & Tag",
      position: { x: 400, y: 300 },
      elements: [
        { id: "elem-11", type: "input", label: "HR Notes", screenId: "screen-4", position: { x: 10, y: 10 } },
        {
          id: "elem-12",
          type: "action",
          label: "Flag for Manual Review",
          screenId: "screen-4",
          position: { x: 10, y: 45 },
        },
        {
          id: "elem-13",
          type: "action",
          label: "Add to Talent Pool",
          screenId: "screen-4",
          position: { x: 10, y: 80 },
        },
      ],
    },
  ],
  connections: [
    { id: "conn-1", fromElementId: "elem-1", toScreenId: "screen-2" },
    { id: "conn-2", fromElementId: "elem-4", toScreenId: "screen-3" },
    { id: "conn-3", fromElementId: "elem-7", toScreenId: "screen-4" },
  ],
}

export default function PrototypePlanPage() {
  const router = useRouter()
  const params = useParams()
  const opportunityId = params.id as string

  const [prototypePlan, setPrototypePlan] = useState<PrototypePlan>(initialPrototypePlan)
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)
  // Remove loading state entirely - just render immediately

  const handleOverrideSubmit = (newPrototypePlan: PrototypePlan) => {
    setPrototypePlan(newPrototypePlan)
    // Optionally save to localStorage or send to server
    if (typeof window !== "undefined") {
      localStorage.setItem(`prototype-plan-${opportunityId}`, JSON.stringify(newPrototypePlan))
    }
  }

  const handleAISuggestionForPrototype = (suggestionText: string) => {
    if (suggestionText === "add_evaluator_dashboard") {
      // Check if the evaluator dashboard already exists
      const existingDashboard = prototypePlan.screens.find((screen) => screen.title === "Evaluator Dashboard")

      if (!existingDashboard) {
        // Create the new Evaluator Dashboard screen
        const newScreen: PrototypeScreen = {
          id: `screen-${Date.now()}`,
          title: "Evaluator Dashboard",
          position: { x: 0, y: 0 }, // Will be calculated by grid layout
          elements: [
            {
              id: `element-${Date.now()}-1`,
              type: "action",
              label: "Filter by Score",
              screenId: `screen-${Date.now()}`,
              position: { x: 0, y: 0 },
            },
            {
              id: `element-${Date.now()}-2`,
              type: "info",
              label: "View Flagged Candidates",
              screenId: `screen-${Date.now()}`,
              position: { x: 0, y: 0 },
            },
            {
              id: `element-${Date.now()}-3`,
              type: "input",
              label: "Leave Comments",
              screenId: `screen-${Date.now()}`,
              position: { x: 0, y: 0 },
            },
            {
              id: `element-${Date.now()}-4`,
              type: "action",
              label: "Mark as Shortlisted",
              screenId: `screen-${Date.now()}`,
              position: { x: 0, y: 0 },
            },
          ],
        }

        // Find the "Add to Talent Pool" element in Review & Tag to connect from
        const reviewTagScreen = prototypePlan.screens.find((screen) => screen.title === "Review & Tag")
        const addToTalentPoolElement = reviewTagScreen?.elements.find(
          (element) => element.label === "Add to Talent Pool",
        )

        // Create connection from "Add to Talent Pool" to new dashboard screen
        const newConnection: PrototypeConnection = {
          id: `conn-${Date.now()}`,
          fromElementId: addToTalentPoolElement?.id || "",
          toScreenId: newScreen.id,
        }

        // Update the prototype plan
        setPrototypePlan({
          ...prototypePlan,
          screens: [...prototypePlan.screens, newScreen],
          connections: [...prototypePlan.connections, newConnection],
        })
      }
    }

    // Call the original onAISuggestion for any additional handling
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity"
              >
                <Logo />
                <span className="ml-2.5 font-semibold text-gray-800 text-lg">Process Mapper</span>
              </button>
            </div>
            <div className="hidden md:block">
              <h2 className="text-lg font-medium text-gray-700">Prototype Plan</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsOverrideModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
              >
                <Code className="h-4 w-4" />
                Override Data
              </button>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Auto-saved</span>
              </div>
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-xs">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Prototype Plan Section (Breadboard) */}
          <Breadboard
            prototypePlan={prototypePlan}
            onUpdate={setPrototypePlan}
            onAISuggestion={handleAISuggestionForPrototype}
          />
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-violet-600 border-t border-violet-700 py-4 shadow-lg z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => router.push(`/opportunity/${opportunityId}`)}
            className="text-sm text-violet-100 hover:text-white hover:bg-violet-700 transition-colors flex items-center gap-2 px-3 py-2 rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Opportunity Report
          </button>
          <div className="flex items-center gap-4">
            <div className="text-xs text-violet-200 font-mono hidden sm:block">
              {prototypePlan.screens.length} screens &bull;{" "}
              {prototypePlan.screens.reduce((total, screen) => total + screen.elements.length, 0)} elements &bull;{" "}
              {prototypePlan.connections.length} interactions
            </div>
            <button
              onClick={() => router.push(`/prototype-handover/${opportunityId}`)}
              className="text-sm font-medium px-4 py-2 rounded-md bg-white text-violet-600 hover:bg-violet-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Files className="h-4 w-4" />
              Continue to Handover
            </button>
          </div>
        </div>
      </footer>

      {/* Override Modal */}
      <PrototypeOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onSubmit={handleOverrideSubmit}
      />
    </div>
  )
}
