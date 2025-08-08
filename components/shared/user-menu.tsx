"use client"

import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LogOut, SettingsIcon, User } from 'lucide-react'

export function UserMenu() {
  const [apiDataEnabled, setApiDataEnabled] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("process-mapper:api-data-enabled")
      setApiDataEnabled(saved === "true")
    } catch {
      // ignore
    }
  }, [])

  const handleApiDataToggle = (checked: boolean) => {
    setApiDataEnabled(checked)
    try {
      localStorage.setItem("process-mapper:api-data-enabled", String(checked))
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pm:api-data-changed", { detail: { enabled: checked } }))
    }
  }

  return (
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
              <p className="text-xs text-gray-500">Use API to generate screen JSON</p>
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
  )
}
