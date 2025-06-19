"use client"

import { useState, useRef } from "react"
import { ChatInput } from "@/components/chat-input"
import { SuggestionCards } from "@/components/suggestion-cards"
import { GitBranch } from "lucide-react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"

export default function Home() {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleCardClick = (description: string) => {
    setInputValue(description)
    // Scroll to input with smooth behavior
    setTimeout(() => {
      inputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity"
              >
                <Logo />
                <span className="ml-2.5 font-semibold text-gray-800 text-lg">Process Mapper</span>
              </button>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-xs">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-16 lg:pt-12">
          {/* Left Column - Header Content */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-32">
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Welcome to Process Mapper
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Transform your business processes into clear, visual maps that help you identify bottlenecks, streamline
                workflows, and unlock AI opportunities.
              </p>
              <div className="space-y-4 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  <span>Describe your process in natural language</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Get an instant visual workflow map</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Identify optimization opportunities</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Content */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="space-y-12">
              {/* Chat Input Section */}
              <div ref={inputRef} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-3xl">Describe Your Process</h3>
                  <p className="text-gray-600">Start by telling us how work gets done in your organization.</p>
                </div>
                <ChatInput inputValue={inputValue} onInputChange={setInputValue} />
              </div>

              {/* Suggestion Cards Section */}
              <div>
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-2 text-3xl">
                    Or choose from common business process templates
                  </h3>
                </div>
                <SuggestionCards onCardClick={handleCardClick} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-violet-600 border-t border-violet-700 py-4 shadow-lg z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div></div>
          <div className="flex items-center">
            <span className="text-sm text-violet-100 mr-4">Prefer to build visually?</span>
            <button
              onClick={() => router.push("/builder")}
              className="text-sm font-medium px-4 py-2 rounded-md bg-white text-violet-600 hover:bg-violet-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <GitBranch className="h-4 w-4" />
              Open Flow Builder
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
