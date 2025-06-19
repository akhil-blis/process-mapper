"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowRight, Sparkles, LucideX } from "lucide-react"

type AIAssistantProps = {
  onSuggestion: (suggestion: string) => void
  onToggle?: (isOpen: boolean) => void // To notify parent about open/close state
}

export function AIAssistant({ onSuggestion, onToggle }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [response, setResponse] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const toggleChat = () => {
    const newIsOpenState = !isOpen
    setIsOpen(newIsOpenState)
    if (onToggle) {
      onToggle(newIsOpenState)
    }
  }

  useEffect(() => {
    // Optional: Close chat if clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
        const fabButton = document.getElementById("ai-assistant-fab")
        if (fabButton && !fabButton.contains(event.target as Node)) {
          // setIsOpen(false) // This might be too aggressive, let's keep it manual for now
          // if (onToggle) onToggle(false);
        }
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onToggle])

  const handleSubmit = () => {
    if (!prompt.trim()) return

    setIsProcessing(true)
    setResponse("")

    setTimeout(() => {
      // Always add the evaluator dashboard regardless of user input
      const confirmationResponse =
        "I've added an 'Evaluator Dashboard' screen that helps HR reviewers sort candidates by AI-assigned scores, review edge cases, and leave final comments. This supports human-in-the-loop decision making."

      setResponse(confirmationResponse)
      onSuggestion("add_evaluator_dashboard") // Send a specific action identifier
      setIsProcessing(false)
      setPrompt("") // Clear the prompt after submission
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const quickSuggestions = [
    "Add evaluator dashboard for HR reviewer",
    "Include candidate comparison view",
    "Add scoring feedback collection",
    "Create batch processing screen",
  ]

  return (
    <>
      {isOpen && (
        <div
          ref={chatContainerRef}
          className="absolute bottom-0 right-0 bg-white rounded-xl border border-gray-300 shadow-2xl w-80 h-80 z-50 flex flex-col transition-all duration-300 ease-in-out transform-gpu"
          style={{ opacity: 1, transform: "translateY(0)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">AI Prototype Assistant</h3>
            </div>
            <button
              onClick={toggleChat}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <LucideX className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Area (can be scrollable if content overflows) */}
          <div className="flex-grow p-3 space-y-3 overflow-y-auto">
            {isProcessing && (
              <div className="bg-blue-50 rounded-md p-2.5 text-xs text-blue-700 animate-pulse">Thinking...</div>
            )}
            {response && !isProcessing && (
              <div className="bg-green-50 rounded-md p-2.5 text-xs text-green-700 border border-green-200">
                {response}
              </div>
            )}
            {!isProcessing && !response && (
              <div className="text-xs text-gray-500 p-2 text-center">
                Ask me to modify your prototype plan. For example, "Add a screen for user settings."
              </div>
            )}
          </div>

          {/* Quick Suggestions (only if no response yet) */}
          {!response && !isProcessing && (
            <div className="px-3 pt-2 pb-1 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1.5">Suggestions:</div>
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.slice(0, 2).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="bg-white border border-gray-300 rounded-lg focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition-all">
              <div className="p-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Add a settings screen"
                  className="w-full resize-none outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm leading-5 min-h-[20px] max-h-[80px] overflow-y-auto"
                  rows={1}
                  style={{
                    height: "auto",
                    minHeight: "20px",
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = "auto"
                    target.style.height = Math.min(target.scrollHeight, 80) + "px"
                  }}
                />
              </div>
              <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {prompt.length > 0 ? (isMac() ? "⌘+Enter" : "Ctrl+Enter") : "Type your request..."}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isProcessing}
                  className={`p-2 rounded-md transition-all flex-shrink-0 ${
                    prompt.trim() && !isProcessing
                      ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <div
          id="ai-assistant-fab"
          onClick={toggleChat}
          className={`absolute bottom-0 right-0 w-80 bg-violet-600 text-white shadow-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-200 ease-in-out cursor-pointer rounded-lg`}
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        >
          <div className="flex items-center gap-2 px-4 py-3 justify-start">
            <div className="w-6 h-6 bg-violet-100 rounded-md flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-violet-600" />
            </div>
            <span className="font-medium text-sm">Chat with AI Assistant</span>
          </div>
        </div>
      )}
    </>
  )
}

// Helper to detect Mac for keyboard shortcut display
const isMac = () => typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
