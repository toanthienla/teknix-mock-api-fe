"use client"

import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import ProjectCard from "../components/ProjectCard"
import { ChevronDown } from "lucide-react"


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const navigate = useNavigate()
  const { projectId } = useParams()


  const [workspaces, setWorkspaces] = useState([
    {
      id: "ws1",
      name: "Workspace 1",
      projects: [
        { id: "p1", title: "Project 1", description: "" },
        { id: "p2", title: "Project 2", description: "" },
        { id: "p3", title: "Project 3", description: "" },
        { id: "p4", title: "Project 4", description: "" },
        { id: "p5", title: "Project 5", description: "" },
        { id: "p6", title: "Project 6", description: "" },
      ],
    },
    {
      id: "ws2",
      name: "Workspace 2",
      projects: [
        { id: "p1", title: "Project 1", description: "" },
        { id: "p2", title: "Project 2", description: "" },
        { id: "p3", title: "Project 3", description: "" },
        { id: "p4", title: "Project 4", description: "" },
        { id: "p5", title: "Project 5", description: "" },
        { id: "p6", title: "Project 6", description: "" },
      ],
    },
    {
      id: "ws3",
      name: "Workspace 3",
      projects: [
        { id: "p1", title: "Project 1", description: "" },
        { id: "p2", title: "Project 2", description: "" },
        { id: "p3", title: "Project 3", description: "" },
        { id: "p4", title: "Project 4", description: "" },
        { id: "p5", title: "Project 5", description: "" },
        { id: "p6", title: "Project 6", description: "" },
      ],
    },
    {
      id: "ws4",
      name: "Workspace 4",
      projects: [
        { id: "p1", title: "Project 1", description: "" },
        { id: "p2", title: "Project 2", description: "" },
        { id: "p3", title: "Project 3", description: "" },
        { id: "p4", title: "Project 4", description: "" },
        { id: "p5", title: "Project 5", description: "" },
        { id: "p6", title: "Project 6", description: "" },
      ],
    },
  ])

  const [currentWsId, setCurrentWsId] = useState("ws1")
  const [searchTerm, setSearchTerm] = useState("")


  const [openNew, setOpenNew] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)


  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")

  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editId, setEditId] = useState(null)


  const [sortOption, setSortOption] = useState("Recently created")


  const handleAddWorkspace = (name) => {
    const newWs = { id: `ws${Date.now()}`, name, projects: [] }
    setWorkspaces((prev) => [...prev, newWs])
    setCurrentWsId(newWs.id)
  }

  const handleEditWorkspace = (id) => {
    const ws = workspaces.find((w) => w.id === id)
    const newName = prompt("Edit workspace name:", ws.name)
    if (newName) {
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === id ? { ...w, name: newName } : w))
      )
    }
  }

  const handleDeleteWorkspace = (id) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== id))
    if (currentWsId === id && workspaces.length > 1) {
      setCurrentWsId(workspaces[0].id)
    }
  }


  const currentWorkspace = workspaces.find((w) => w.id === currentWsId)
  const filteredProjects = currentWorkspace?.projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  )


  let sortedProjects = [...(filteredProjects || [])]
  if (sortOption === "A → Z") {
    sortedProjects.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortOption === "Z → A") {
    sortedProjects.sort((a, b) => b.title.localeCompare(a.title))
  }

  const handleCreateProject = () => {
    if (!newTitle.trim()) return
    const newProject = {
      id: `p${Date.now()}`,
      title: newTitle,
      description: newDesc,
    }
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === currentWsId
          ? { ...w, projects: [...w.projects, newProject] }
          : w
      )
    )
    setNewTitle("")
    setNewDesc("")
    setOpenNew(false)
  }

  const openEditProject = (p) => {
    setEditId(p.id)
    setEditTitle(p.title)
    setEditDesc(p.description || "")
    setOpenEdit(true)
  }


  const handleUpdateProject = () => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === currentWsId
          ? {
            ...ws,
            projects: ws.projects.map((p) =>
              p.id === editId
                ? { ...p, title: editTitle, description: editDesc }
                : p
            ),
          }
          : ws
      )
    )
    setOpenEdit(false)
  }

  const handleDeleteProject = (id) => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === currentWsId
          ? { ...ws, projects: ws.projects.filter((p) => p.id !== id) }
          : ws
      )
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="flex">

        <aside className="w-72 border-r border-slate-100 bg-white">
          <Sidebar
            workspaces={workspaces}
            current={currentWsId}
            setCurrent={setCurrentWsId}
            onAddWorkspace={handleAddWorkspace}
            onEditWorkspace={handleEditWorkspace}
            onDeleteWorkspace={handleDeleteWorkspace}
          />
        </aside>


        <main className="flex-1 p-8">
          <Topbar
            onSearch={setSearchTerm}
            workspace={currentWorkspace}
            onNewProject={() => setOpenNew(true)}
          />


          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">All Projects</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
                  <span>{sortOption}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 bg-white shadow-md rounded-md"
              >
                <DropdownMenuItem
                  onClick={() => setSortOption("Recently created")}
                  className="hover:bg-gray-100"
                >
                  Recently created
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortOption("A → Z")}
                  className="hover:bg-gray-100"
                >
                  A → Z
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortOption("Z → A")}
                  className="hover:bg-gray-100"
                >
                  Z → A
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>


          <div className="grid grid-cols-3 gap-6">
            {sortedProjects?.length > 0 ? (
              sortedProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onEdit={() => openEditProject(p)}
                  onDelete={() => handleDeleteProject(p.id)}
                />
              ))
            ) : (
              <p className="text-slate-500">No projects found.</p>
            )}
          </div>
        </main>
      </div>

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <p className="text-sm text-slate-500">Project details</p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Enter project name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Type here"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                maxLength={200}
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">
                {newDesc.length}/200
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenNew(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <p className="text-sm text-slate-500">Project details</p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Enter project name"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Type here"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                maxLength={200}
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">
                {editDesc.length}/200
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProject}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
