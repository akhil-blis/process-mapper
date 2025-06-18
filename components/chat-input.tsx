"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, X, Paperclip, FileText, ImageIcon, FileSpreadsheet, FileVideo, File } from "lucide-react"
import { useRouter } from "next/navigation"

type FileChip = {
  id: string
  name: string
  type: "file" | "link"
  url?: string
}

type ChatInputProps = {
  inputValue?: string
  onInputChange?: (value: string) => void
}

const getFileIcon = (fileName: string, type: "file" | "link") => {
  if (type === "link") {
    return <Paperclip className="h-4 w-4" />
  }

  const extension = fileName.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "pdf":
    case "doc":
    case "docx":
    case "txt":
      return <FileText className="h-4 w-4" />
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return <ImageIcon className="h-4 w-4" />
    case "xls":
    case "xlsx":
    case "csv":
      return <FileSpreadsheet className="h-4 w-4" />
    case "mp4":
    case "avi":
    case "mov":
      return <FileVideo className="h-4 w-4" />
    default:
      return <File className="h-4 w-4" />
  }
}

const getFileType = (fileName: string, type: "file" | "link") => {
  if (type === "link") {
    return "Link"
  }

  const extension = fileName.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "pdf":
      return "PDF Document"
    case "doc":
    case "docx":
      return "Word Document"
    case "txt":
      return "Text File"
    case "jpg":
      return "JPEG Image"
    case "jpeg":
      return "JPEG Image"
    case "png":
      return "PNG Image"
    case "gif":
      return "GIF Image"
    case "svg":
      return "SVG Image"
    case "xls":
    case "xlsx":
      return "Excel Spreadsheet"
    case "csv":
      return "CSV File"
    case "mp4":
      return "MP4 Video"
    case "avi":
      return "AVI Video"
    case "mov":
      return "MOV Video"
    default:
      return extension ? `${extension.toUpperCase()} File` : "File"
  }
}

export function ChatInput({ inputValue = "", onInputChange }: ChatInputProps) {
  const [chips, setChips] = useState<FileChip[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  const handleSubmit = () => {
    if (inputValue.trim()) {
      // Navigate to flow builder with the input as a query parameter
      router.push(`/builder?input=${encodeURIComponent(inputValue)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newChips = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: "file" as const,
      }))
      setChips([...chips, ...newChips])
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text")
    if (text.startsWith("http")) {
      e.preventDefault()
      const urlPattern = /(https?:\/\/[^\s]+)/g
      const urls = text.match(urlPattern)

      if (urls) {
        const newChips = urls.map((url) => ({
          id: Math.random().toString(36).substring(7),
          name: new URL(url).hostname,
          type: "link" as const,
          url,
        }))
        setChips([...chips, ...newChips])
      }
    }
  }

  const removeChip = (id: string) => {
    setChips(chips.filter((chip) => chip.id !== id))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newChips = Array.from(e.dataTransfer.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: "file" as const,
      }))
      setChips([...chips, ...newChips])
    }
  }

  // Detect if user is on Mac for keyboard shortcut display
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0

  return (
    <div className="w-full">
      <div
        className="relative bg-gray-50 border border-gray-200 rounded-lg focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-100 transition-all"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="min-h-[64px] p-4">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => onInputChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Describe your process… e.g. 'I get a request from sales, then…'"
            className="w-full resize-none outline-none bg-transparent text-gray-900 placeholder-gray-500 py-1 min-h-[32px] max-h-[200px] overflow-y-auto text-base"
            rows={1}
          />
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {chips.map((chip) => (
                <div
                  key={chip.id}
                  className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow max-w-[240px] px-1 py-1"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-sm flex items-center justify-center text-gray-600">
                    {getFileIcon(chip.name, chip.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{chip.name}</div>
                    <div className="text-xs text-gray-500">{getFileType(chip.name, chip.type)}</div>
                  </div>
                  <button
                    onClick={() => removeChip(chip.id)}
                    className="flex-shrink-0 w-5 h-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-sm transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-3 bg-white rounded-b-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Paperclip className="h-4 w-4" />
              Attach files
            </button>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-400">{isMac ? "⌘+Enter" : "Ctrl+Enter"} to send</div>
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className={`p-2 rounded-md transition-all ${
                  inputValue.trim()
                    ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm hover:shadow-md"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
        </div>
      </div>
    </div>
  )
}
