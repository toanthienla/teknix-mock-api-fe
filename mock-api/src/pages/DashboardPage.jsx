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
  const [currentWsId, setCurrentWsId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("Recently created")
  const [openProjectsMap, setOpenProjectsMap] = useState({})

  // dialogs
  const [openNew, setOpenNew] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false) // dialog xóa project
  const [deleteProjectId, setDeleteProjectId] = useState(null)

  // new project state
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newTitleError, setNewTitleError] = useState("")
  const [newDescError, setNewDescError] = useState("")

  // edit project state
  const [editId, setEditId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editTitleError, setEditTitleError] = useState("")
  const [editDescError, setEditDescError] = useState("")

  useEffect(() => {
    fetchWorkspaces()
    fetchProjects()
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

  const currentProjects = projects.filter(
    (p) => String(p.workspace_id) === String(currentWsId)
  )
  const filteredProjects = currentProjects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  let sortedProjects = [...filteredProjects]
  if (sortOption === "A → Z") sortedProjects.sort((a, b) => a.name.localeCompare(b.name))
  if (sortOption === "Z → A") sortedProjects.sort((a, b) => b.name.localeCompare(a.name))

  // validate new project
  const validateNewProject = () => {
    let valid = true
    setNewTitleError("")
    setNewDescError("")

    if (!newTitle.trim()) {
      setNewTitleError("Project name cannot be empty")
      valid = false
    } else if (newTitle.length > 20) {
      setNewTitleError("Project name cannot exceed 20 characters")
      valid = false
    }

    if (!newDesc.trim()) {
      setNewDescError("Project description cannot be empty")
      valid = false
    } else if (newDesc.length > 200) {
      setNewDescError("Project description cannot exceed 200 characters")
      valid = false
    }

    const duplicate = projects.some(
      (p) =>
        p.workspace_id === currentWsId &&
        p.name.toLowerCase() === newTitle.trim().toLowerCase()
    )
    if (duplicate) {
      setNewTitleError("Project name already exists in this workspace")
      valid = false
    }

    return valid
  }

  const handleCreateProject = () => {
    if (!validateNewProject()) return

    const newProject = {
      name: newTitle.trim(),
      description: newDesc.trim(),
      workspace_id: currentWsId,
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
        setProjects((prev) => [...prev, createdProject])
        setOpenProjectsMap((prev) => ({ ...prev, [currentWsId]: true }))
        setNewTitle("")
        setNewDesc("")
        setOpenNew(false)
      })
  }

  // edit project
  const openEditProject = (p) => {
    setEditId(p.id)
    setEditTitle(p.name)
    setEditDesc(p.description || "")
    setEditTitleError("")
    setEditDescError("")
    setOpenEdit(true)
  }

  const validateEditProject = () => {
    let valid = true
    setEditTitleError("")
    setEditDescError("")

    if (!editTitle.trim()) {
      setEditTitleError("Project name cannot be empty")
      valid = false
    } else if (editTitle.length > 20) {
      setEditTitleError("Project name cannot exceed 20 characters")
      valid = false
    }

    if (!editDesc.trim()) {
      setEditDescError("Project description cannot be empty")
      valid = false
    } else if (editDesc.length > 200) {
      setEditDescError("Project description cannot exceed 200 characters")
      valid = false
    }

    const duplicate = projects.some(
      (p) =>
        p.workspace_id === currentWsId &&
        p.name.toLowerCase() === editTitle.trim().toLowerCase() &&
        p.id !== editId
    )
    if (duplicate) {
      setEditTitleError("Project name already exists in this workspace")
      valid = false
    }

    return valid
  }

  const handleUpdateProject = () => {
    if (!validateEditProject()) return

    fetch(`${API_ROOT}/projects/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editId,
        name: editTitle.trim(),
        description: editDesc.trim(),
        workspace_id: currentWsId,
        updated_at: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((updatedProject) => {
        setProjects((prev) =>
          prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        )
        setOpenEdit(false)
      })
  }

  // open delete dialog
  const openDeleteDialog = (id) => {
    setDeleteProjectId(id)
    setOpenDelete(true)
  }

  const handleDeleteProject = () => {
    if (!deleteProjectId) return
    fetch(`${API_ROOT}/projects/${deleteProjectId}`, { method: "DELETE" }).then(() => {
      setProjects((prev) => prev.filter((p) => p.id !== deleteProjectId))
      setDeleteProjectId(null)
      setOpenDelete(false)
    })
  }

  const currentProject = projectId
    ? projects.find((p) => String(p.id) === String(projectId))
    : null

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="flex">
        <aside className="w-72 border-r border-slate-100 bg-white">
          <Sidebar
            workspaces={workspaces}
            projects={projects}
            current={currentWsId}
            setCurrent={setCurrentWsId}
            onAddWorkspace={(name) => {
              if (!name.trim()) return
              fetch(`${API_ROOT}/workspaces`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
              })
                .then((res) => res.json())
                .then((createdWs) => {
                  setWorkspaces((prev) => [...prev, createdWs])
                  setCurrentWsId(createdWs.id)
                  setOpenProjectsMap((prev) => ({ ...prev, [createdWs.id]: true }))
                })
            }}
            onEditWorkspace={(id) => {
              const ws = workspaces.find((w) => w.id === id)
              if (!ws) return
              const name = prompt("Edit workspace name", ws.name)
              if (name) fetch(`${API_ROOT}/workspaces/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, updated_at: new Date().toISOString() }) })
                .then(() => setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, name } : w))))
            }}
            onDeleteWorkspace={(id) => {
              const confirmed = window.confirm("Are you sure you want to delete this workspace and all its projects?")
              if (!confirmed) return
              fetch(`${API_ROOT}/workspaces/${id}`, { method: "DELETE" }).then(() => {
                setWorkspaces((prev) => prev.filter((w) => w.id !== id))
                setProjects((prev) => prev.filter((p) => p.workspace_id !== id))
                if (currentWsId === id) setCurrentWsId(null)
              })
            }}
            openProjectsMap={openProjectsMap}
            setOpenProjectsMap={setOpenProjectsMap}
          />
        </aside>

        <main className="flex-1 p-8">
          <Topbar onSearch={setSearchTerm} onNewProject={() => setOpenNew(true)} />

          {currentProject ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">{currentProject.name}</h2>
              <p className="text-slate-600">{currentProject.description}</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
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
                  <DropdownMenuContent align="end" className="w-40 bg-white shadow-md rounded-md">
                    <DropdownMenuItem onClick={() => setSortOption("Recently created")}>Recently created</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("A → Z")}>A → Z</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("Z → A")}>Z → A</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-col gap-4">
                {sortedProjects.length > 0 ? (
                  sortedProjects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onEdit={() => openEditProject(p)}
                      onDelete={() => openDeleteDialog(p.id)} // mở dialog xác nhận xóa
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
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mt-2">Name</h3>
              <Input
                placeholder="Enter Project Name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              {newTitleError && <p className="text-red-600 text-sm mt-1">{newTitleError}</p>}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mt-2">Description</h3>
              <Textarea
                placeholder="Type Here"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              {newDescError && <p className="text-red-600 text-sm mt-1">{newDescError}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleCreateProject}>Create</Button>
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
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mt-2">Name</h3>
              <Input
                placeholder="Enter Project Name"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              {editTitleError && <p className="text-red-600 text-sm mt-1">{editTitleError}</p>}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mt-2">Description</h3>
              <Textarea
                placeholder="Type Here"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
              {editDescError && <p className="text-red-600 text-sm mt-1">{editDescError}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleUpdateProject}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p className="text-slate-700 mt-2">
            Are you sure you want to delete this project? This action cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProject}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
