"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { ProjectGrid } from "@/components/project-grid"
import { NewProjectModal } from "@/components/new-project-modal"
import { EditProjectModal } from "@/components/edit-project-modal"


export default function Dashboard() {
  const [projects, setProjects] = useState([
    {
      id: "1",
      name: "Project 1",
      description: "Description",
      background: "#10b981",
      owner: "hancontam",
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Project 2",
      description: "Description",
      background: "#10b981",
      owner: "hancontam",
      createdAt: new Date(),
    },
    {
      id: "3",
      name: "Project 3",
      description: "Description",
      owner: "hancontam",
      createdAt: new Date(),
    },
    {
      id: "4",
      name: "Project 4",
      description: "Description",
      background: "#3b82f6",
      owner: "hancontam",
      createdAt: new Date(),
    },
    {
      id: "5",
      name: "Project 5",
      description: "Description",
      owner: "hancontam",
      createdAt: new Date(),
    },
    {
      id: "6",
      name: "Project 6",
      description: "Description",
      owner: "hancontam",
      createdAt: new Date(),
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setProjects([...projects, newProject])
    setIsNewProjectOpen(false)
  }

  const handleUpdateProject = (updatedProject) => {
    setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)))
    setEditingProject(null)
  }

  const handleDeleteProject = (projectId) => {
    setProjects(projects.filter((p) => p.id !== projectId))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">MockAPI</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Menu className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setIsNewProjectOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                New Project
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">All Projects</h2>
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>Recently created</option>
              <option>Name A-Z</option>
              <option>Name Z-A</option>
            </select>
          </div>

          <ProjectGrid
            projects={filteredProjects}
            onEditProject={setEditingProject}
            onDeleteProject={handleDeleteProject}
          />
        </div>
      </main>

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <EditProjectModal
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onUpdateProject={handleUpdateProject}
      />
    </div>
  )
}
