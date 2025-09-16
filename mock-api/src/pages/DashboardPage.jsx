  "use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import ProjectCard from "../components/ProjectCard"
import { ChevronDown } from "lucide-react"
import { API_ROOT } from "../utils/constants"

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

  const [workspaces, setWorkspaces] = useState([])
  const [projects, setProjects] = useState([])
  const [endpoints, setEndpoints] = useState([])
  const [currentWsId, setCurrentWsId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("Recently created")
  const [openProjectsMap, setOpenProjectsMap] = useState({}) // track open workspace project lists

  // dialogs
  const [openNew, setOpenNew] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)

  // new project state
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")

  // edit project state
  const [editId, setEditId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")

  // 🔹 fetch workspaces + projects
  useEffect(() => {
    fetchWorkspaces()
    fetchProjects()
    fetchEndpoints()
  }, [])

  const fetchWorkspaces = () => {
    fetch(`${API_ROOT}/workspaces`)
      .then((res) => res.json())
      .then((data) => {
        setWorkspaces(data)
        if (data.length > 0 && !currentWsId) setCurrentWsId(data[0].id)
      })
  }

  const fetchProjects = () => {
    fetch(`${API_ROOT}/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data))
  }

  const fetchEndpoints = () => {
    fetch(`${API_ROOT}/endpoints `)
        .then((res) => res.json())
        .then((data) => setEndpoints(data))
  }

  // 🔹 filter + sort projects
  const currentProjects = projects.filter(
    (p) => String(p.workspace_id) === String(currentWsId)
  )
  const filteredProjects = currentProjects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  let sortedProjects = [...filteredProjects]
  if (sortOption === "A → Z") {
    sortedProjects.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortOption === "Z → A") {
    sortedProjects.sort((a, b) => b.name.localeCompare(a.name))
  }

  // 🔹 create project
  const handleCreateProject = () => {
    if (!newTitle.trim()) return

    // Tự động tăng id
    const maxId = projects.length > 0 ? Math.max(...projects.map(p => Number(p.id))) : 0
    const newId = maxId + 1

    const newProject = {
      id: newId,
      name: newTitle,
      description: newDesc,
      workspace_id: Number(currentWsId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    fetch(`${API_ROOT}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    })
      .then((res) => res.json())
      .then((createdProject) => {
        // Thêm project mới vào state trực tiếp
        setProjects((prev) => [...prev, createdProject])
        setOpenProjectsMap((prev) => ({ ...prev, [currentWsId]: true })) // mở workspace chứa project mới
        setNewTitle("")
        setNewDesc("")
        setOpenNew(false)
      })
  }

  // 🔹 edit project
  const openEditProject = (p) => {
    setEditId(p.id)
    setEditTitle(p.name)
    setEditDesc(p.description || "")
    setOpenEdit(true)
  }

  const handleUpdateProject = () => {
    fetch(`${API_ROOT}/projects/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editId,
        name: editTitle,
        description: editDesc,
        workspace_id: Number(currentWsId),
        updated_at: new Date().toISOString(),
      }),
    }).then(() => {
      setProjects((prev) =>
        prev.map((p) => (p.id === editId ? { ...p, name: editTitle, description: editDesc } : p))
      )
      setOpenEdit(false)
    })
  }

  // 🔹 delete project
  const handleDeleteProject = (id) => {
    fetch(`${API_ROOT}/projects/${id}`, { method: "DELETE" }).then(() => {
      setProjects((prev) => prev.filter((p) => p.id !== id))
    })
  }

  // 🔹 workspace actions
  const handleAddWorkspace = (name) => {
    if (!name.trim()) return

    // Tự động tăng id
    const maxId = workspaces.length > 0 ? Math.max(...workspaces.map(w => Number(w.id))) : 0
    const newId = maxId + 1

    const newWs = {
      id: newId,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    fetch(`${API_ROOT}/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWs),
    })
      .then((res) => res.json())
      .then((createdWs) => {
        setWorkspaces((prev) => [...prev, createdWs])
        setCurrentWsId(createdWs.id)
        setOpenProjectsMap((prev) => ({ ...prev, [createdWs.id]: true })) // mở workspace mới
      })
  }

  const handleEditWorkspace = (id, name) => {
    fetch(`${API_ROOT}/workspaces/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, updated_at: new Date().toISOString() }),
    }).then(() => {
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === id ? { ...w, name } : w))
      )
    })
  }

  const handleDeleteWorkspace = (id) => {
    fetch(`${API_ROOT}/workspaces/${id}`, { method: "DELETE" }).then(() => {
      setWorkspaces((prev) => prev.filter((w) => w.id !== id))
      if (currentWsId === id) setCurrentWsId(null)
    })
  }

  // Current project detail
  const currentProject = projectId
    ? projects.find((p) => String(p.id) === String(projectId))
    : null

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 border-r border-slate-100 bg-white">
          <Sidebar
            workspaces={workspaces}
            projects={projects}
            endpoints={endpoints}
            current={currentWsId}
            setCurrentWS={setCurrentWsId}
            onAddWorkspace={handleAddWorkspace}
            onEditWorkspace={(id) => {
              const ws = workspaces.find((w) => w.id === id)
              if (!ws) return
              const name = prompt("Edit workspace name", ws.name)
              if (name) handleEditWorkspace(id, name)
            }}
            onDeleteWorkspace={handleDeleteWorkspace}
            openProjectsMap={openProjectsMap}
            setOpenProjectsMap={setOpenProjectsMap}
          />
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          <Topbar onSearch={setSearchTerm} onNewProject={() => setOpenNew(true)} />

          {currentProject ? (
              <div>
                <h2 className="text-2xl font-semibold mb-4">{currentProject.name}</h2>
                <p className="text-slate-600">{currentProject.description}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/dashboard")}
                >
                  Back to all projects
                </Button>
              </div>
          ) : (
            <>
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
                    <DropdownMenuItem onClick={() => setSortOption("Recently created")}>
                      Recently created
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("A → Z")}>
                      A → Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("Z → A")}>
                      Z → A
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-col gap-4">
                {sortedProjects?.length > 0 ? (
                  sortedProjects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onEdit={() => openEditProject(p)}
                      onDelete={() => handleDeleteProject(p.id)}
                      onClick={() => navigate(`/dashboard/${p.id}`)}
                    />
                  ))
                ) : (
                  <p className="text-slate-500">No projects found.</p>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* New Project Dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>

          <h3 className="text-sm font-semibold text-slate-700 mt-2">Project Detail</h3>

          <div className="mt-2 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 mt-2">Name</h3>
            <Input
              placeholder=" Enter Project Name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <h3 className="text-sm font-semibold text-slate-700 mt-2">Description</h3>
            <Textarea
              placeholder="Type Here"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <h3 className="text-sm font-semibold text-slate-700 mt-2">Project Detail</h3>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 mt-2">Name</h3>
            <Input
              placeholder=" Enter Project Name"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <h3 className="text-sm font-semibold text-slate-700 mt-2">Description</h3>
            <Textarea
              placeholder="Type Here"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
