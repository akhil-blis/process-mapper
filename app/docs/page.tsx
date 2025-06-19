"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Copy, Check, FileText, File, Database, Package } from "lucide-react"
import { Logo } from "@/components/logo"
import { AILoading } from "@/components/ai-loading"

type DownloadableFile = {
  id: string
  title: string
  type: "pdf" | "txt" | "json"
  description: string
  size: string
}

export default function PrototypingDocsPage() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(() => {
    // Only show loading if we haven't processed this page in this session
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("docs-processed")
    }
    return true
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Redirect to a default opportunity for now
    router.replace("/prototype-handover/auto-score-candidates")
  }, [router])

  const downloadableFiles: DownloadableFile[] = [
    {
      id: "success-framework",
      title: "Process Mapping Success.pdf",
      type: "pdf",
      description: "Reference framework for successful process mapping",
      size: "2.1 MB",
    },
    {
      id: "onboarding-sop",
      title: "New Employee Onboarding SOP.txt",
      type: "txt",
      description: "Original process description and requirements",
      size: "12 KB",
    },
    {
      id: "prototype-flow",
      title: "prototype_flow.json",
      type: "json",
      description: "Structured flow data from the visual builder",
      size: "8 KB",
    },
    {
      id: "ai-opportunities",
      title: "ai_opportunities.json",
      type: "json",
      description: "Selected AI enhancement suggestions and priorities",
      size: "4 KB",
    },
    {
      id: "process-summary",
      title: "process_summary.txt",
      type: "txt",
      description: "Process metrics, roles, tools, and insights summary",
      size: "6 KB",
    },
  ]

  const projectInstructions = `# New Employee Onboarding Prototype

## Purpose
Create an interactive prototype for the New Employee Onboarding process that demonstrates AI-powered optimizations and streamlined workflows.

## Included Screens & Flows
- Job Request Form → Candidate Dashboard → Interview Scheduler → Interview Confirmation
- 4 main screens with 15 interactive elements
- 5 connection flows between screens

## Design & Development Requirements
- Use Next.js App Router with TypeScript
- Implement with shadcn/ui components and Tailwind CSS
- Focus on realistic data and interactions (no lorem ipsum)
- Include AI opportunity callouts where relevant
- Responsive design for desktop and mobile
- Accessible with proper ARIA labels

## AI Enhancements Integrated
- Auto-scoring candidates (high impact)
- Interview feedback summarization (medium impact) 
- Smart IT provisioning automation (high impact)
- Personalized onboarding checklist generation (medium impact)

## Key Constraints
- Prototype should feel realistic and production-ready
- Include actual form validation and state management
- Show loading states and success/error feedback
- Reference the uploaded knowledge sources for context`

  const startingPrompt = `Create a comprehensive prototype for a New Employee Onboarding system based on the uploaded knowledge sources. 

Build these 4 main screens with realistic interactions:

1. **Job Request Form** - Allow hiring managers to submit new position requests with job title, department, requirements, and approval workflow
2. **Candidate Dashboard** - Show application status, interview scheduling, and next steps for candidates  
3. **Interview Scheduler** - Calendar interface for selecting interview times with automatic confirmation
4. **Interview Confirmation** - Detailed confirmation screen with meeting links, interviewer info, and calendar integration

Connect these screens with a logical flow that matches the process map in the knowledge sources. Include AI-powered features like:
- Candidate auto-scoring with confidence indicators
- Interview feedback summarization 
- Smart IT access provisioning based on role
- Personalized onboarding checklist generation

Use realistic sample data throughout - no placeholder text. Make it feel like a production application that could be deployed immediately. Include proper loading states, form validation, and responsive design.

Reference the process_summary.txt and ai_opportunities.json files for specific requirements and enhancement details.`

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-600" />
      case "txt":
        return <File className="h-5 w-5 text-blue-600" />
      case "json":
        return <Database className="h-5 w-5 text-green-600" />
      default:
        return <File className="h-5 w-5 text-gray-600" />
    }
  }

  const handleCopyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemId)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleDownloadFile = (fileId: string) => {
    // In a real app, this would trigger actual file download
    console.log(`Downloading file: ${fileId}`)
    // Simulate download
    const link = document.createElement("a")
    link.href = `/api/download?file=${fileId}`
    link.download = downloadableFiles.find((f) => f.id === fileId)?.title || "file"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadAll = () => {
    // In a real app, this would download a ZIP bundle
    console.log("Downloading all files as ZIP bundle")
    const link = document.createElement("a")
    link.href = "/api/download?bundle=all"
    link.download = "process-mapping-knowledge-sources.zip"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && (
        <AILoading
          title="Preparing Your Handover"
          subtitle="Generating documentation and v0 scaffolding for your prototype"
          onComplete={() => {
            setIsLoading(false)
            if (typeof window !== "undefined") {
              sessionStorage.setItem("docs-processed", "true")
            }
          }}
          duration={3000}
        />
      )}

      {!isLoading && (
        <>
          {/* Top Navigation */}
          <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0 flex items-center">
                    <Logo />
                    <span className="ml-2.5 font-semibold text-gray-800 text-lg">Process Mapper</span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <h2 className="text-lg font-medium text-gray-700">Prototyping Docs Handover</h2>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span>Docs Ready</span>
                  </div>
                  <div className="ml-4 w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-xs">
                    JD
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="py-8 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Your project scaffolding is ready to use in Vercel v0
                </h1>
                <p className="text-lg text-gray-600">Download or copy everything you need below.</p>
              </div>

              <div className="space-y-8">
                {/* Section 1: Project Knowledge Sources */}
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">🗂 Project Knowledge Sources</h2>
                      <p className="text-gray-600 text-sm">
                        Download these files and upload them as Knowledge Sources in v0.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadAll}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors text-sm font-medium"
                    >
                      <Package className="h-4 w-4" />
                      Download All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {downloadableFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <h3 className="font-medium text-gray-900 truncate text-sm">{file.title}</h3>
                            <span className="text-xs text-gray-400 font-mono flex-shrink-0">{file.size}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{file.description}</p>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(file.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 2: Project Instructions */}
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">📄 Project Instructions</h2>
                      <p className="text-gray-600 text-sm">Paste this into the Instructions section in Vercel v0</p>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(projectInstructions, "instructions")}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {copiedItem === "instructions" ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed p-4">
                      {projectInstructions}
                    </pre>
                  </div>
                </section>

                {/* Section 3: Starting Prompt */}
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">💬 Starting Prompt</h2>
                      <p className="text-gray-600 text-sm">Use this as the first message in the v0 chat</p>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(startingPrompt, "prompt")}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {copiedItem === "prompt" ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed p-4">
                      {startingPrompt}
                    </pre>
                  </div>
                </section>

                {/* Call to Action */}
                <section className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="h-6 w-6 text-violet-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 19.777h20L12 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-violet-900 mb-2">Ready to build your prototype?</h3>
                      <p className="text-violet-700 text-sm mb-4">
                        Head over to Vercel v0, upload your knowledge sources, paste the instructions, and start with
                        the provided prompt. Your prototype will be ready in minutes!
                      </p>
                      <a
                        href="https://v0.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors text-sm font-medium"
                      >
                        Open Vercel v0
                      </a>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>

          {/* Sticky Footer */}
          <footer className="fixed bottom-0 left-0 right-0 bg-violet-600 border-t border-violet-700 py-4 shadow-lg z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <button
                onClick={() => router.push("/analysis")}
                className="text-sm text-violet-100 hover:text-white hover:bg-violet-700 transition-colors flex items-center gap-2 px-3 py-2 rounded-md"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Prototype Plan
              </button>
              <div></div>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}
