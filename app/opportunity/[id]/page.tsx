"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Edit3,
  Plus,
  Trash2,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  Clock,
  DollarSign,
  Shield,
  Zap,
  BarChart3,
  Gauge,
  Star,
  Database,
  Lightbulb,
  Download,
  FileText,
  CodeIcon,
  SquareGanttChartIcon as SquareChartGantt,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OpportunityOverrideModal } from "@/components/opportunity/opportunity-override-modal"

// Types
type OpportunityData = {
  id: string
  title: string
  summary: string
  processStep: string
  rolesInvolved: string[]
  impactEstimate: string
  whyMatters: Array<{
    id: string
    type:
      | "bottleneck"
      | "quality"
      | "scale"
      | "cost"
      | "compliance"
      | "risk"
      | "accuracy"
      | "speed"
      | "consistency"
      | "capacity"
      | "innovation"
      | "experience"
      | "data"
    title: string
    description: string
  }>
  howItWorks: Array<{
    id: string
    title: string
    description: string
  }>
  mvpPlan: {
    conceptValidation: {
      duration: string
      steps: Array<{
        id: string
        title: string
        description: string
      }>
    }
    prototypeDevelopment: {
      duration: string
      steps: Array<{
        id: string
        title: string
        description: string
      }>
    }
    mvpIntegration: {
      duration: string
      steps: Array<{
        id: string
        title: string
        description: string
      }>
    }
  }
}

// Sample data with proper initialization
const sampleOpportunityData: OpportunityData = {
  id: "auto-score-candidates",
  title: "Auto-score candidates",
  summary:
    "Use AI to automatically score candidates based on resume content and role criteria, reducing manual screening time by 70%.",
  processStep: "Screen Candidates",
  rolesInvolved: ["HR Specialist", "Hiring Manager"],
  impactEstimate: "70% reduction in screening time, 40% improvement in candidate quality",
  whyMatters: [
    {
      id: "1",
      type: "bottleneck",
      title: "Current bottleneck",
      description: "Manual resume screening takes 4+ hours per role and creates delays in the hiring pipeline.",
    },
    {
      id: "2",
      type: "consistency",
      title: "Inconsistent evaluation",
      description: "Different reviewers apply varying criteria, leading to missed qualified candidates.",
    },
    {
      id: "3",
      type: "scale",
      title: "Volume challenges",
      description: "With 200+ applications per role, thorough manual review becomes impractical.",
    },
    {
      id: "4",
      type: "cost",
      title: "High operational cost",
      description: "Current screening process costs $2,400 per month in HR specialist time across all open positions.",
    },
    {
      id: "5",
      type: "accuracy",
      title: "Human error risk",
      description: "Manual screening can miss key qualifications or overlook red flags due to fatigue or oversight.",
    },
  ],
  howItWorks: [
    {
      id: "1",
      title: "Resume parsing and analysis",
      description: "AI extracts key information from resumes including skills, experience, and qualifications.",
    },
    {
      id: "2",
      title: "Criteria matching",
      description: "System compares candidate profiles against predefined role requirements and scoring rubrics.",
    },
    {
      id: "3",
      title: "Automated scoring",
      description: "Each candidate receives a compatibility score with detailed reasoning for the assessment.",
    },
    {
      id: "4",
      title: "Ranked recommendations",
      description: "Top candidates are automatically flagged for human review with priority rankings.",
    },
  ],
  mvpPlan: {
    conceptValidation: {
      duration: "2-3 weeks",
      steps: [
        {
          id: "1",
          title: "Analyze current screening process",
          description: "Document existing workflow, pain points, and success criteria.",
        },
        {
          id: "2",
          title: "Define scoring criteria",
          description: "Work with hiring team to establish clear, measurable evaluation parameters.",
        },
        {
          id: "3",
          title: "Test with sample resumes",
          description: "Validate approach using historical data from successful hires.",
        },
      ],
    },
    prototypeDevelopment: {
      duration: "4-6 weeks",
      steps: [
        {
          id: "1",
          title: "Build resume parsing engine",
          description: "Develop AI model to extract and structure resume data accurately.",
        },
        {
          id: "2",
          title: "Create scoring algorithm",
          description: "Implement matching logic and scoring system based on defined criteria.",
        },
        {
          id: "3",
          title: "Design review interface",
          description: "Build dashboard for HR team to review scored candidates and provide feedback.",
        },
      ],
    },
    mvpIntegration: {
      duration: "3-4 weeks",
      steps: [
        {
          id: "1",
          title: "Integrate with ATS",
          description: "Connect the scoring system to existing applicant tracking workflow.",
        },
        {
          id: "2",
          title: "Train the team",
          description: "Onboard HR specialists and hiring managers on the new scoring system.",
        },
        {
          id: "3",
          title: "Monitor and optimize",
          description: "Track performance metrics and refine scoring criteria based on outcomes.",
        },
      ],
    },
  },
}

export default function OpportunityPage() {
  const router = useRouter()
  const params = useParams()
  const [data, setData] = useState<OpportunityData>(sampleOpportunityData)
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({})
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`opportunity-${params.id}`)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        // Ensure all required arrays exist with fallbacks
        const safeData: OpportunityData = {
          ...sampleOpportunityData,
          ...parsedData,
          whyMatters: parsedData.whyMatters || [],
          howItWorks: parsedData.howItWorks || [],
          rolesInvolved: parsedData.rolesInvolved || [],
          mvpPlan: {
            conceptValidation: {
              duration: parsedData.mvpPlan?.conceptValidation?.duration || "2-3 weeks",
              steps: parsedData.mvpPlan?.conceptValidation?.steps || [],
            },
            prototypeDevelopment: {
              duration: parsedData.mvpPlan?.prototypeDevelopment?.duration || "4-6 weeks",
              steps: parsedData.mvpPlan?.prototypeDevelopment?.steps || [],
            },
            mvpIntegration: {
              duration: parsedData.mvpPlan?.mvpIntegration?.duration || "3-4 weeks",
              steps: parsedData.mvpPlan?.mvpIntegration?.steps || [],
            },
          },
        }
        setData(safeData)
      } catch (error) {
        console.error("Error parsing saved data:", error)
        setData(sampleOpportunityData)
      }
    }
  }, [params.id])

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (data && data.id) {
      localStorage.setItem(`opportunity-${params.id}`, JSON.stringify(data))
    }
  }, [data, params.id])

  const startEditing = (section: string) => {
    setEditingSections((prev) => ({ ...prev, [section]: true }))
  }

  const stopEditing = (section: string) => {
    setEditingSections((prev) => ({ ...prev, [section]: false }))
  }

  const isEditing = (section: string) => editingSections[section] || false

  // Summary section editing
  const [summaryForm, setSummaryForm] = useState({
    title: data.title || "",
    summary: data.summary || "",
    processStep: data.processStep || "",
    rolesInvolved: (data.rolesInvolved || []).join(", "),
    impactEstimate: data.impactEstimate || "",
  })

  const saveSummary = () => {
    setData((prev) => ({
      ...prev,
      title: summaryForm.title,
      summary: summaryForm.summary,
      processStep: summaryForm.processStep,
      rolesInvolved: summaryForm.rolesInvolved
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean),
      impactEstimate: summaryForm.impactEstimate,
    }))
    stopEditing("summary")
  }

  // Why matters section editing
  const addWhyMatter = () => {
    const newItem = {
      id: Date.now().toString(),
      type: "bottleneck" as const,
      title: "",
      description: "",
    }
    setData((prev) => ({
      ...prev,
      whyMatters: [...(prev.whyMatters || []), newItem],
    }))
  }

  const updateWhyMatter = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      whyMatters: (prev.whyMatters || []).map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  const deleteWhyMatter = (id: string) => {
    setData((prev) => ({
      ...prev,
      whyMatters: (prev.whyMatters || []).filter((item) => item.id !== id),
    }))
  }

  // How it works section editing
  const addHowItWorksStep = () => {
    const newStep = {
      id: Date.now().toString(),
      title: "",
      description: "",
    }
    setData((prev) => ({
      ...prev,
      howItWorks: [...(prev.howItWorks || []), newStep],
    }))
  }

  const updateHowItWorksStep = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      howItWorks: (prev.howItWorks || []).map((step) => (step.id === id ? { ...step, [field]: value } : step)),
    }))
  }

  const deleteHowItWorksStep = (id: string) => {
    setData((prev) => ({
      ...prev,
      howItWorks: (prev.howItWorks || []).filter((step) => step.id !== id),
    }))
  }

  const moveHowItWorksStep = (id: string, direction: "up" | "down") => {
    setData((prev) => {
      const steps = [...(prev.howItWorks || [])]
      const index = steps.findIndex((step) => step.id === id)
      if (index === -1) return prev

      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= steps.length) return prev
      ;[steps[index], steps[newIndex]] = [steps[newIndex], steps[index]]
      return { ...prev, howItWorks: steps }
    })
  }

  // MVP section editing
  const updateMvpDuration = (phase: keyof OpportunityData["mvpPlan"], duration: string) => {
    setData((prev) => ({
      ...prev,
      mvpPlan: {
        ...prev.mvpPlan,
        [phase]: {
          ...prev.mvpPlan[phase],
          duration,
        },
      },
    }))
  }

  const addMvpStep = (phase: keyof OpportunityData["mvpPlan"]) => {
    const newStep = {
      id: Date.now().toString(),
      title: "",
      description: "",
    }
    setData((prev) => ({
      ...prev,
      mvpPlan: {
        ...prev.mvpPlan,
        [phase]: {
          ...prev.mvpPlan[phase],
          steps: [...(prev.mvpPlan[phase]?.steps || []), newStep],
        },
      },
    }))
  }

  const updateMvpStep = (phase: keyof OpportunityData["mvpPlan"], id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      mvpPlan: {
        ...prev.mvpPlan,
        [phase]: {
          ...prev.mvpPlan[phase],
          steps: (prev.mvpPlan[phase]?.steps || []).map((step) =>
            step.id === id ? { ...step, [field]: value } : step,
          ),
        },
      },
    }))
  }

  const deleteMvpStep = (phase: keyof OpportunityData["mvpPlan"], id: string) => {
    setData((prev) => ({
      ...prev,
      mvpPlan: {
        ...prev.mvpPlan,
        [phase]: {
          ...prev.mvpPlan[phase],
          steps: (prev.mvpPlan[phase]?.steps || []).filter((step) => step.id !== id),
        },
      },
    }))
  }

  const moveMvpStep = (phase: keyof OpportunityData["mvpPlan"], id: string, direction: "up" | "down") => {
    setData((prev) => {
      const steps = [...(prev.mvpPlan[phase]?.steps || [])]
      const index = steps.findIndex((step) => step.id === id)
      if (index === -1) return prev

      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= steps.length) return prev
      ;[steps[index], steps[newIndex]] = [steps[newIndex], steps[index]]
      return {
        ...prev,
        mvpPlan: {
          ...prev.mvpPlan,
          [phase]: {
            ...prev.mvpPlan[phase],
            steps,
          },
        },
      }
    })
  }

  // Export functionality
  const handleExportPDF = async () => {
    try {
      // Create a comprehensive export object
      const exportData = {
        exportedAt: new Date().toISOString(),
        opportunityId: params.id,
        ...data,
        metadata: {
          exportFormat: "PDF_DATA",
          version: "1.0",
        },
      }

      // For now, export as JSON since PDF generation requires additional libraries
      const jsonData = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      const fileName = `${data.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}_report_${timestamp}.json`

      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("Opportunity report exported successfully")
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    }
  }

  // Helper functions
  const getWhyMatterIcon = (type: string) => {
    switch (type) {
      case "bottleneck":
        return AlertTriangle
      case "quality":
        return CheckCircle2
      case "scale":
        return TrendingUp
      case "cost":
        return DollarSign
      case "compliance":
        return Shield
      case "risk":
        return Shield
      case "accuracy":
        return Target
      case "speed":
        return Zap
      case "consistency":
        return BarChart3
      case "capacity":
        return Gauge
      case "innovation":
        return Lightbulb
      case "experience":
        return Star
      case "data":
        return Database
      default:
        return Clock
    }
  }

  const getWhyMatterColor = (type: string) => {
    switch (type) {
      case "bottleneck":
        return "bg-red-50 border-red-200 text-red-700"
      case "quality":
        return "bg-green-50 border-green-200 text-green-700"
      case "scale":
        return "bg-blue-50 border-blue-200 text-blue-700"
      case "cost":
        return "bg-yellow-50 border-yellow-200 text-yellow-700"
      case "compliance":
        return "bg-purple-50 border-purple-200 text-purple-700"
      case "risk":
        return "bg-orange-50 border-orange-200 text-orange-700"
      case "accuracy":
        return "bg-teal-50 border-teal-200 text-teal-700"
      case "speed":
        return "bg-indigo-50 border-indigo-200 text-indigo-700"
      case "consistency":
        return "bg-cyan-50 border-cyan-200 text-cyan-700"
      case "capacity":
        return "bg-pink-50 border-pink-200 text-pink-700"
      case "innovation":
        return "bg-emerald-50 border-emerald-200 text-emerald-700"
      case "experience":
        return "bg-violet-50 border-violet-200 text-violet-700"
      case "data":
        return "bg-slate-50 border-slate-200 text-slate-700"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  // Reset form when starting to edit summary
  useEffect(() => {
    if (isEditing("summary")) {
      setSummaryForm({
        title: data.title || "",
        summary: data.summary || "",
        processStep: data.processStep || "",
        rolesInvolved: (data.rolesInvolved || []).join(", "),
        impactEstimate: data.impactEstimate || "",
      })
    }
  }, [isEditing("summary"), data])

  // Safety check - don't render if data is not properly initialized
  if (!data || !data.id) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading opportunity data...</p>
        </div>
      </div>
    )
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
              <h2 className="text-lg font-medium text-gray-700">Opportunity Report</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsOverrideModalOpen(true)}
                className="flex items-center gap-2 px-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors py-1.5"
              >
                <CodeIcon className="h-4 w-4" />
                Override Data
              </button>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                <span>Report Ready</span>
              </div>
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-xs">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
          {/* Opportunity Summary Section */}
          <section className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Opportunity Summary</h2>
              </div>
              <button
                onClick={() => startEditing("summary")}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            </div>

            {!isEditing("summary") ? (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">{data.summary}</p>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-blue-900 mb-2">Process Step</h4>
                        <p className="text-sm text-blue-700 opacity-90">{data.processStep}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-green-900 mb-2">Roles Involved</h4>
                        <p className="text-sm text-green-700 opacity-90">{(data.rolesInvolved || []).join(", ")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-purple-900 mb-2">Impact Estimate</h4>
                        <p className="text-sm text-purple-700 opacity-90">{data.impactEstimate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input
                    value={summaryForm.title}
                    onChange={(e) => setSummaryForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Opportunity title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                  <Textarea
                    value={summaryForm.summary}
                    onChange={(e) => setSummaryForm((prev) => ({ ...prev, summary: e.target.value }))}
                    placeholder="Brief description of the opportunity"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Process Step</label>
                    <Input
                      value={summaryForm.processStep}
                      onChange={(e) => setSummaryForm((prev) => ({ ...prev, processStep: e.target.value }))}
                      placeholder="Target process step"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roles Involved</label>
                    <Input
                      value={summaryForm.rolesInvolved}
                      onChange={(e) => setSummaryForm((prev) => ({ ...prev, rolesInvolved: e.target.value }))}
                      placeholder="Comma-separated roles"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Impact Estimate</label>
                    <Input
                      value={summaryForm.impactEstimate}
                      onChange={(e) => setSummaryForm((prev) => ({ ...prev, impactEstimate: e.target.value }))}
                      placeholder="Expected impact"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveSummary}>Save Changes</Button>
                  <Button variant="outline" onClick={() => stopEditing("summary")}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Why This Matters Section */}
          <section className="bg-white shadow-sm rounded-lg p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Why This Matters</h2>
                {!isEditing("whyMatters") && (
                  <p className="text-gray-600">
                    These are the issues in your current process that led to this AI suggestion.
                  </p>
                )}
              </div>
              <button
                onClick={() => startEditing("whyMatters")}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            </div>

            {!isEditing("whyMatters") ? (
              <div className="grid md:grid-cols-3 gap-4">
                {(data.whyMatters || []).map((item) => {
                  const IconComponent = getWhyMatterIcon(item.type)
                  return (
                    <div key={item.id} className={`rounded-lg border p-4 ${getWhyMatterColor(item.type)}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-2">{item.title}</h4>
                          <p className="text-sm opacity-90">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {(data.whyMatters || []).map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">Item {index + 1}</span>
                      <Button variant="outline" size="sm" onClick={() => deleteWhyMatter(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <Select value={item.type} onValueChange={(value) => updateWhyMatter(item.id, "type", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottleneck">Bottleneck</SelectItem>
                            <SelectItem value="quality">Quality Issue</SelectItem>
                            <SelectItem value="scale">Scale Challenge</SelectItem>
                            <SelectItem value="cost">Cost Issue</SelectItem>
                            <SelectItem value="compliance">Compliance Risk</SelectItem>
                            <SelectItem value="risk">Risk Management</SelectItem>
                            <SelectItem value="accuracy">Accuracy Problem</SelectItem>
                            <SelectItem value="speed">Speed Issue</SelectItem>
                            <SelectItem value="consistency">Consistency Problem</SelectItem>
                            <SelectItem value="capacity">Capacity Constraint</SelectItem>
                            <SelectItem value="innovation">Innovation Gap</SelectItem>
                            <SelectItem value="experience">Poor Experience</SelectItem>
                            <SelectItem value="data">Data Issue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <Input
                          value={item.title}
                          onChange={(e) => updateWhyMatter(item.id, "title", e.target.value)}
                          placeholder="Item title"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateWhyMatter(item.id, "description", e.target.value)}
                        placeholder="Detailed description"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addWhyMatter} className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>

                <div className="flex gap-2">
                  <Button onClick={() => stopEditing("whyMatters")}>Save Changes</Button>
                  <Button variant="outline" onClick={() => stopEditing("whyMatters")}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* How It Works Section */}
          <section className="bg-white shadow-sm rounded-lg p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">How It Works</h2>
                {!isEditing("howItWorks") && (
                  <p className="text-gray-600">Detailed breakdown of the AI solution and its implementation.</p>
                )}
              </div>
              <button
                onClick={() => startEditing("howItWorks")}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            </div>

            {!isEditing("howItWorks") ? (
              <div className="space-y-6">
                {(data.howItWorks || []).map((step, index) => {
                  const colors = [
                    "border-violet-500",
                    "border-blue-500",
                    "border-green-500",
                    "border-yellow-500",
                    "border-purple-500",
                    "border-orange-500",
                  ]
                  return (
                    <div key={step.id} className={`border-l-4 ${colors[index] || "border-gray-500"} pl-6`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {(data.howItWorks || []).map((step, index) => (
                  <div key={step.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveHowItWorksStep(step.id, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveHowItWorksStep(step.id, "down")}
                          disabled={index === (data.howItWorks || []).length - 1}
                        >
                          ↓
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteHowItWorksStep(step.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <Input
                          value={step.title}
                          onChange={(e) => updateHowItWorksStep(step.id, "title", e.target.value)}
                          placeholder="Step title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <Textarea
                          value={step.description}
                          onChange={(e) => updateHowItWorksStep(step.id, "description", e.target.value)}
                          placeholder="Step description"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addHowItWorksStep} className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>

                <div className="flex gap-2">
                  <Button onClick={() => stopEditing("howItWorks")}>Save Changes</Button>
                  <Button variant="outline" onClick={() => stopEditing("howItWorks")}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* MVP Plan Section */}
          <section className="bg-white shadow-sm rounded-lg p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">From Concept to MVP</h2>
                {!isEditing("mvp") && (
                  <p className="text-gray-600">
                    Progressive development approach to build and validate this AI solution.
                  </p>
                )}
              </div>
              <button
                onClick={() => startEditing("mvp")}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            </div>

            {!isEditing("mvp") ? (
              <div className="space-y-8">
                {/* Concept Validation */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Concept Validation</h3>
                      <p className="text-sm text-gray-500">
                        {data.mvpPlan?.conceptValidation?.duration || "2-3 weeks"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-11 space-y-3">
                    {(data.mvpPlan?.conceptValidation?.steps || []).map((step, index) => (
                      <div key={step.id} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                          <p className="text-xs text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prototype Development */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Prototype Development</h3>
                      <p className="text-sm text-gray-500">
                        {data.mvpPlan?.prototypeDevelopment?.duration || "4-6 weeks"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-11 space-y-3">
                    {(data.mvpPlan?.prototypeDevelopment?.steps || []).map((step, index) => (
                      <div key={step.id} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                          <p className="text-xs text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MVP Integration */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">MVP Integration</h3>
                      <p className="text-sm text-gray-500">{data.mvpPlan?.mvpIntegration?.duration || "3-4 weeks"}</p>
                    </div>
                  </div>

                  <div className="ml-11 space-y-3">
                    {(data.mvpPlan?.mvpIntegration?.steps || []).map((step, index) => (
                      <div key={step.id} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                          <p className="text-xs text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Concept Validation - Edit Mode */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Concept Validation</h3>
                      <Input
                        value={data.mvpPlan?.conceptValidation?.duration || ""}
                        onChange={(e) => updateMvpDuration("conceptValidation", e.target.value)}
                        placeholder="Duration (e.g., 2-3 weeks)"
                        className="max-w-xs"
                      />
                    </div>
                  </div>

                  <div className="ml-11 space-y-4">
                    {(data.mvpPlan?.conceptValidation?.steps || []).map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveMvpStep("conceptValidation", step.id, "up")}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveMvpStep("conceptValidation", step.id, "down")}
                              disabled={index === (data.mvpPlan?.conceptValidation?.steps || []).length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMvpStep("conceptValidation", step.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <Input
                              value={step.title}
                              onChange={(e) => updateMvpStep("conceptValidation", step.id, "title", e.target.value)}
                              placeholder="Step title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <Textarea
                              value={step.description}
                              onChange={(e) =>
                                updateMvpStep("conceptValidation", step.id, "description", e.target.value)
                              }
                              placeholder="Step description"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() => addMvpStep("conceptValidation")}
                      className="w-full bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>

                {/* Prototype Development - Edit Mode */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Prototype Development</h3>
                      <Input
                        value={data.mvpPlan?.prototypeDevelopment?.duration || ""}
                        onChange={(e) => updateMvpDuration("prototypeDevelopment", e.target.value)}
                        placeholder="Duration (e.g., 4-6 weeks)"
                        className="max-w-xs"
                      />
                    </div>
                  </div>

                  <div className="ml-11 space-y-4">
                    {(data.mvpPlan?.prototypeDevelopment?.steps || []).map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveMvpStep("prototypeDevelopment", step.id, "up")}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveMvpStep("prototypeDevelopment", step.id, "down")}
                              disabled={index === (data.mvpPlan?.prototypeDevelopment?.steps || []).length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMvpStep("prototypeDevelopment", step.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <Input
                              value={step.title}
                              onChange={(e) => updateMvpStep("prototypeDevelopment", step.id, "title", e.target.value)}
                              placeholder="Step title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <Textarea
                              value={step.description}
                              onChange={(e) =>
                                updateMvpStep("prototypeDevelopment", step.id, "description", e.target.value)
                              }
                              placeholder="Step description"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() => addMvpStep("prototypeDevelopment")}
                      className="w-full bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>

                {/* MVP Integration - Edit Mode */}
                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">MVP Integration</h3>
                      <Input
                        value={data.mvpPlan?.mvpIntegration?.duration || ""}
                        onChange={(e) => updateMvpDuration("mvpIntegration", e.target.value)}
                        placeholder="Duration (e.g., 3-4 weeks)"
                        className="max-w-xs"
                      />
                    </div>
                  </div>

                  <div className="ml-11 space-y-4">
                    {(data.mvpPlan?.mvpIntegration?.steps || []).map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveMvpStep("mvpIntegration", step.id, "up")}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveMvpStep("mvpIntegration", step.id, "down")}
                              disabled={index === (data.mvpPlan?.mvpIntegration?.steps || []).length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMvpStep("mvpIntegration", step.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <Input
                              value={step.title}
                              onChange={(e) => updateMvpStep("mvpIntegration", step.id, "title", e.target.value)}
                              placeholder="Step title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <Textarea
                              value={step.description}
                              onChange={(e) => updateMvpStep("mvpIntegration", step.id, "description", e.target.value)}
                              placeholder="Step description"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() => addMvpStep("mvpIntegration")}
                      className="w-full bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => stopEditing("mvp")}>Save Changes</Button>
                  <Button variant="outline" onClick={() => stopEditing("mvp")}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-violet-600 py-4 shadow-lg z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/process-analysis")}
            className="text-sm text-white hover:text-violet-200 transition-colors flex items-center gap-2 px-3 py-2 rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Process Analysis
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-violet-700 text-white rounded-md hover:bg-violet-800 transition-colors text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Export Report as JSON
            </button>
            <button
              onClick={() => router.push(`/prototype-plan/${params.id}`)}
              className="flex items-center gap-2 px-6 py-2 bg-white text-violet-700 rounded-md hover:bg-violet-50 transition-colors text-sm font-medium shadow-sm"
            >
              <SquareChartGantt className="h-4 w-4" />
              Start Prototype Planning
            </button>
          </div>
        </div>
      </footer>

      {/* Opportunity Override Modal */}
      <OpportunityOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onSubmit={(newData) => {
          setData(newData)
          setIsOverrideModalOpen(false)
        }}
      />
    </div>
  )
}
