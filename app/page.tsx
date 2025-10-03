"use client"

import { useState, useRef, useEffect } from "react"
import { ChatInput } from "@/components/chat-input"
import { SuggestionCards } from "@/components/suggestion-cards"
import { GitBranch } from 'lucide-react'
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { User, SettingsIcon, LogOut } from 'lucide-react'

export default function Home() {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const [apiDataEnabled, setApiDataEnabled] = useState(false)

  // Load persisted preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("process-mapper:api-data-enabled")
      setApiDataEnabled(saved === "true")
    } catch {
      // ignore read errors
    }
  }, [])

  // Persist and broadcast changes
  const handleApiDataToggle = (checked: boolean) => {
    setApiDataEnabled(checked)
    try {
      localStorage.setItem("process-mapper:api-data-enabled", String(checked))
    } catch {
      // ignore write errors
    }
    // Notify the app so other screens can react to this change
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pm:api-data-changed", { detail: { enabled: checked } }),
      )
    }
  }

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Open user menu"
                    className="inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-violet-100 text-violet-600 text-xs font-semibold">
                        JD
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="api-data-switch" className="text-sm font-medium">
                          API Data
                        </Label>
                        <p className="text-xs text-gray-500">
                          Use Claude API to generate screen JSON
                        </p>
                      </div>
                      <Switch
                        id="api-data-switch"
                        checked={apiDataEnabled}
                        onCheckedChange={handleApiDataToggle}
                        aria-label="Toggle API Data"
                      />
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
