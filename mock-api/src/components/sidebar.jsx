"use client"

import { useState } from "react"
import { ChevronDown, Folder, Archive, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const [expandedWorkspaces, setExpandedWorkspaces] = useState(["workspace1"])

  const toggleWorkspace = (workspaceId) => {
    setExpandedWorkspaces((prev) =>
      prev.includes(workspaceId)
        ? prev.filter((id) => id !== workspaceId)
        : [...prev, workspaceId]
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Workspaces Section */}
      <div className="p-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          WORKSPACES
        </h3>

        <div className="space-y-1">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start p-2 h-auto"
              onClick={() => toggleWorkspace("workspace1")}
            >
              <ChevronDown
                className={`w-4 h-4 mr-2 transition-transform ${
                  expandedWorkspaces.includes("workspace1")
                    ? "rotate-0"
                    : "-rotate-90"
                }`}
              />
              <span className="text-sm">Workspace 1</span>
            </Button>

            {expandedWorkspaces.includes("workspace1") && (
              <div className="ml-6 mt-1 space-y-1">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Button
                    key={num}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start p-2 h-auto text-gray-600"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    <span className="text-sm">Project {num}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {[2, 3, 4].map((num) => (
            <Button
              key={num}
              variant="ghost"
              size="sm"
              className="w-full justify-start p-2 h-auto"
              onClick={() => toggleWorkspace(`workspace${num}`)}
            >
              <ChevronDown className="w-4 h-4 mr-2 -rotate-90" />
              <span className="text-sm">Workspace {num}</span>
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start p-2 h-auto text-gray-600"
          >
            <Archive className="w-4 h-4 mr-2" />
            <span className="text-sm">Archive</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start p-2 h-auto text-gray-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="text-sm">New workspace...</span>
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">H</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              tuong nghi
            </p>
            <p className="text-xs text-gray-500 truncate">tuongnghi@gmail.com</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </aside>
  )
}
