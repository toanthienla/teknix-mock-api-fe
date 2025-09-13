"use client"

import { Edit, Trash2, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function ProjectGrid({ projects, onEditProject, onDeleteProject }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="group relative overflow-hidden">
          {/* Project Background/Thumbnail */}
          <div
            className="h-32 flex items-center justify-center text-white font-bold text-lg relative"
            style={{
              backgroundColor:
                project.background && project.background.startsWith("data:image")
                  ? undefined
                  : project.background || "#e5e7eb",
              color:
                project.background && project.background.startsWith("data:image")
                  ? undefined
                  : project.background
                  ? "white"
                  : "#6b7280",
            }}
          >
            {project.background && project.background.startsWith("data:image") ? (
              <img
                src={project.background}
                alt={project.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 0 }}
              />
            ) : null}
            <span className="relative z-10">
              {project.background && !project.background.startsWith("data:image") ? (
                project.name === "Project 1" ? (
                  "ACME"
                ) : project.name === "Project 4" ? (
                  "zoroyokai"
                ) : (
                  project.name
                )
              ) : (
                <Link className="w-8 h-8" />
              )}
            </span>
          </div>

          {/* Project Info */}
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-1">{project.name}</h3>
            <p className="text-sm text-gray-500">{project.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={() => onEditProject(project)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
              onClick={() => onDeleteProject(project.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
