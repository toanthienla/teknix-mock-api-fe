"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import ProjectCard from "../components/ProjectCard"
import { ChevronDown } from "lucide-react"
import { API_ROOT } from "../utils/constants"

import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [workspaces, setWorkspaces] = useState([])
  const [projects, setProjects] = useState([])
  const [currentWsId, setCurrentWsId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("Recently created")
  const [openProjectsMap, setOpenProjectsMap] = useState({})
  const [openNew, setOpenNew] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [confirmDeleteWs, setConfirmDeleteWs] = useState(null) 

  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")

  const [editId, setEditId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")

  
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
  if (sortOption === "A → Z") {
    sortedProjects.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortOption === "Z → A") {
    sortedProjects.sort((a, b) => b.name.localeCompare(a.name))
  }

  
  const handleCreateProject = () => {
    if (!currentWsId) {
      alert("Workspace không hợp lệ")
      return
    }
    if (!newTitle.trim()) return

    const newProject = {
      name: newTitle,
      description: newDesc,
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

  
  const handleDeleteProject = (id) => {
    fetch(`${API_ROOT}/projects/${id}`, { method: "DELETE" }).then(() => {
      setProjects((prev) => prev.filter((p) => p.id !== id))
    })
  }

  
  const handleAddWorkspace = (name) => {
    if (!name.trim()) return

    if (name.length > 20) {
      alert("Tên workspace quá dài (tối đa 20 ký tự)")
      return
    }

    if (workspaces.some((w) => w.name.toLowerCase() === name.toLowerCase())) {
      alert("Tên workspace đã tồn tại")
      return
    }

    const newWs = {
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
        setOpenProjectsMap((prev) => ({ ...prev, [createdWs.id]: true }))
      })
  }

  const handleEditWorkspace = (id, name) => {
    if (!name.trim()) return

    if (name.length > 20) {
      alert("Tên workspace quá dài (tối đa 20 ký tự)")
      return
    }

    if (
      workspaces.some(
        (w) => w.id !== id && w.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      alert("Tên workspace đã tồn tại")
      return
    }

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

      const projectsToDelete = projects.filter((p) => p.workspace_id === id)

      projectsToDelete.forEach((p) => {
        fetch(`${API_ROOT}/projects/${p.id}`, { method: "DELETE" })
      })

      setProjects((prev) => prev.filter((p) => p.workspace_id !== id))
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
            onAddWorkspace={handleAddWorkspace}
            onEditWorkspace={(id) => {
              const ws = workspaces.find((w) => w.id === id)
              if (!ws) return
              const name = prompt("Edit workspace name", ws.name)
              if (name) handleEditWorkspace(id, name)
            }}
            onDeleteWorkspace={(id) => setConfirmDeleteWs(id)} 
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

     
      <Dialog open={!!confirmDeleteWs} onOpenChange={() => setConfirmDeleteWs(null)}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this workspace? This action will also remove all projects inside.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteWs(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteWorkspace(confirmDeleteWs)
                setConfirmDeleteWs(null)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
