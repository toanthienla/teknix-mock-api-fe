"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProjectCard from "../components/ProjectCard";
import { ChevronDown, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { API_ROOT } from "../utils/constants";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [currentWsId, setCurrentWsId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("Recently created");
  const [openProjectsMap, setOpenProjectsMap] = useState({});
  const [openEndpointsMap, setOpenEndpointsMap] = useState({});

  const [openNewProject, setOpenNewProject] = useState(false);
  const [openEditProject, setOpenEditProject] = useState(false);
  const [openDeleteProject, setOpenDeleteProject] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);

  const [openEditWs, setOpenEditWs] = useState(false);
  const [confirmDeleteWs, setConfirmDeleteWs] = useState(null);
  const [editWsId, setEditWsId] = useState(null);
  const [editWsName, setEditWsName] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    fetchWorkspaces();
    fetchProjects();
    fetchEndpoints();
  }, []);

  // ✅ thêm useEffect này để khi đổi projectId thì giữ nguyên workspace
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => String(p.id) === String(projectId));
      if (project) {
        setCurrentWsId(project.workspace_id);
        setOpenProjectsMap((prev) => ({
          ...prev,
          [project.workspace_id]: true, // expand workspace chứa project
        }));
      }
    }
  }, [projectId, projects]);

  // -------------------- Toast Config --------------------
  const toastConfig = {
    success: { icon: <CheckCircle className="text-green-500" /> },
    warning: { icon: <AlertTriangle className="text-yellow-500" /> },
    info: { icon: <Info className="text-blue-500" /> },
    error: { icon: <AlertTriangle className="text-red-500" /> },
  };

  const showToast = (type, message) => {
    toast(message, {
      ...(toastConfig[type] || {}),
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
    });
  };

  // -------------------- Fetch --------------------
  const fetchWorkspaces = () => {
    fetch(`${API_ROOT}/workspaces`)
      .then((res) => res.json())
      .then((data) => {
        setWorkspaces(data);
        if (data.length > 0 && !currentWsId) setCurrentWsId(data[0].id);
      })
      .catch(() => showToast("error", "Failed to load workspaces"));
  };

  const fetchProjects = () => {
    fetch(`${API_ROOT}/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(() => showToast("error", "Failed to load projects"));
  };

  const fetchEndpoints = () => {
    fetch(`${API_ROOT}/endpoints `)
      .then((res) => res.json())
      .then((data) => setEndpoints(data));
  };

  // -------------------- Filtering & Sorting --------------------
  const currentProjects = projects.filter(
    (p) => String(p.workspace_id) === String(currentWsId)
  );

  const filteredProjects = currentProjects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let sortedProjects = [...filteredProjects];
  if (sortOption === "A → Z") sortedProjects.sort((a, b) => a.name.localeCompare(b.name));
  if (sortOption === "Z → A") sortedProjects.sort((a, b) => b.name.localeCompare(a.name));

  const currentProject = projectId
    ? projects.find((p) => String(p.id) === String(projectId))
    : null;

  const currentWorkspace = workspaces.find((w) => String(w.id) === String(currentWsId));

  // -------------------- Workspace --------------------
  const validateWsName = (name, excludeId = null) => {
    const trimmed = name.trim();
    if (!trimmed) return "Workspace name cannot be empty";
    if (!/^[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9]*( [A-Za-zÀ-ỹ0-9]+)*$/.test(trimmed))
      return "Must start with a letter, no special chars, single spaces allowed";
    if (trimmed.length > 20) return "Workspace name max 20 chars";
    if (
      workspaces.some(
        (w) => w.name.toLowerCase() === trimmed.toLowerCase() && w.id !== excludeId
      )
    )
      return "Workspace name already exists";
    return "";
  };

  const handleAddWorkspace = (name) => {
    const err = validateWsName(name);
    if (err) {
      showToast("warning", err);
      return;
    }
    fetch(`${API_ROOT}/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((createdWs) => {
        setWorkspaces((prev) => [...prev, createdWs]);
        setCurrentWsId(createdWs.id);
        setOpenProjectsMap((prev) => ({ ...prev, [createdWs.id]: true }));
        showToast("success", "Workspace created successfully");
      })
      .catch(() => showToast("error", "Failed to create workspace"));
  };

  const handleEditWorkspace = () => {
    const err = validateWsName(editWsName, editWsId);
    if (err) {
      showToast("warning", err);
      return;
    }
    fetch(`${API_ROOT}/workspaces/${editWsId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editWsName.trim(),
        updated_at: new Date().toISOString(),
      }),
    })
      .then(() => {
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === editWsId ? { ...w, name: editWsName.trim() } : w
          )
        );
        setOpenEditWs(false);
        setEditWsName("");
        setEditWsId(null);
        showToast("success", "Workspace updated successfully");
      })
      .catch(() => showToast("error", "Failed to update workspace"));
  };

  const handleDeleteWorkspace = async (id) => {
    try {
      const res = await fetch(`${API_ROOT}/projects`);
      const allProjects = await res.json();
      const projectsToDelete = allProjects.filter((p) => p.workspace_id === id);

      await Promise.all(
        projectsToDelete.map((p) =>
          fetch(`${API_ROOT}/projects/${p.id}`, { method: "DELETE" })
        )
      );

      await fetch(`${API_ROOT}/workspaces/${id}`, { method: "DELETE" });

      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      setProjects((prev) => prev.filter((p) => p.workspace_id !== id));
      if (currentWsId === id) setCurrentWsId(null);

      showToast("success", "Workspace and its projects deleted successfully");
    } catch {
      showToast("error", "Failed to delete workspace or its projects");
    }
  };

  // -------------------- Project --------------------
  const validateProject = (title, desc, editMode = false, editId = null) => {
    const titleTrim = title.trim();
    const descTrim = desc.trim();

    if (!titleTrim) {
      showToast("warning", "Project name cannot be empty");
      return false;
    }
    if (titleTrim.length > 50) {
      showToast("warning", "Project name cannot exceed 50 chars");
      return false;
    }
    if (/^[0-9]/.test(titleTrim)) {
      showToast("warning", "Project name cannot start with a number");
      return false;
    }
    if (/ {2,}/.test(titleTrim)) {
      showToast("warning", "Project name cannot contain multiple spaces");
      return false;
    }
    if (!/^[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9 ]*$/.test(titleTrim)) {
      showToast("warning", "Only letters, numbers, and spaces allowed (no special characters)");
      return false;
    }
    if (!descTrim) {
      showToast("info", "Project description cannot be empty");
      return false;
    }
    if (descTrim.length > 200) {
      showToast("warning", "Project description max 200 chars");
      return false;
    }

    const duplicate = projects.some(
      (p) =>
        p.workspace_id === currentWsId &&
        (!editMode || p.id !== editId) &&
        p.name.toLowerCase() === titleTrim.toLowerCase()
    );
    if (duplicate) {
      showToast("warning", "Project name already exists in this workspace");
      return false;
    }
    return true;
  };

  const handleCreateProject = () => {
    if (!validateProject(newTitle, newDesc)) return;
    const newProject = {
      name: newTitle.trim(),
      description: newDesc.trim(),
      workspace_id: currentWsId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    fetch(`${API_ROOT}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    })
      .then((res) => res.json())
      .then((createdProject) => {
        setProjects((prev) => [...prev, createdProject]);
        setOpenProjectsMap((prev) => ({ ...prev, [currentWsId]: true }));
        setNewTitle("");
        setNewDesc("");
        setOpenNewProject(false);
        showToast("success", "Project created successfully");
      })
      .catch(() => showToast("error", "Failed to create project"));
  };

  const openEditProjectDialog = (p) => {
    setEditId(p.id);
    setEditTitle(p.name);
    setEditDesc(p.description || "");
    setOpenEditProject(true);
  };

  const handleUpdateProject = () => {
    const original = projects.find((p) => p.id === editId);
    if (!original) return;

    if (
      editTitle.trim() === (original.name || "") &&
      editDesc.trim() === (original.description || "")
    ) {
      setOpenEditProject(false);
      return;
    }

    if (!validateProject(editTitle, editDesc, true, editId)) return;

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
        );
        setOpenEditProject(false);
        showToast("success", "Project updated successfully");
      })
      .catch(() => showToast("error", "Failed to update project"));
  };

  const openDeleteProjectDialog = (id) => {
    setDeleteProjectId(id);
    setOpenDeleteProject(true);
  };

  const handleDeleteProject = () => {
    if (!deleteProjectId) return;
    fetch(`${API_ROOT}/projects/${deleteProjectId}`, { method: "DELETE" })
      .then(() => {
        setProjects((prev) => prev.filter((p) => p.id !== deleteProjectId));
        setDeleteProjectId(null);
        setOpenDeleteProject(false);
        showToast("success", "Project deleted successfully");
      })
      .catch(() => showToast("error", "Failed to delete project"));
  };

  // -------------------- Render --------------------
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Sidebar + Main */}
      <div className="flex">
        <aside className="w-72 border-r border-slate-100 bg-white">
          <Sidebar
            workspaces={workspaces}
            projects={projects}
            endpoints={endpoints}
            current={currentWsId}
            setCurrent={setCurrentWsId}
            onAddWorkspace={handleAddWorkspace}
            onEditWorkspace={(ws) => {
              setEditWsId(ws.id);
              setEditWsName(ws.name);
              setOpenEditWs(true);
            }}
            onDeleteWorkspace={(id) => setConfirmDeleteWs(id)}
            openProjectsMap={openProjectsMap}
            setOpenProjectsMap={setOpenProjectsMap}
            openEndpointsMap={openEndpointsMap}
            setOpenEndpointsMap={setOpenEndpointsMap}
          />
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          <Topbar onSearch={setSearchTerm} onNewProject={() => setOpenNewProject(true)} />

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
                <div>
                  {currentWorkspace && (
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      {currentWorkspace.name}
                    </h2>
                  )}
                  <h3 className="text-base text-slate-600 ml-2">All Projects</h3>
                </div>
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
                {sortedProjects.length > 0 ? (
                  sortedProjects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onEdit={() => openEditProjectDialog(p)}
                      onDelete={() => openDeleteProjectDialog(p.id)}
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
      {/* Dialogs */}
      {/* New Project */}
      <Dialog open={openNewProject} onOpenChange={setOpenNewProject}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Project Detail</h3>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mt-2">Name</h4>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateProject();
                  }
                }}
                placeholder="Enter Project Name"
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mt-2">Description</h4>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateProject();
                  }
                }}
                placeholder="Type Here"
              />
              <p className="text-right text-slate-400 text-xs mt-1">{newDesc.length} / 200</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNewProject(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleCreateProject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project */}
      <Dialog open={openEditProject} onOpenChange={setOpenEditProject}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mt-2">Name</h4>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUpdateProject();
                  }
                }}
                placeholder="Enter Project Name"
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mt-2">Description</h4>
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleUpdateProject();
                  }
                }}
                placeholder="Type Here"
              />
              <p className="text-right text-slate-400 text-xs mt-1">{editDesc.length} / 200</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditProject(false)}>Cancel</Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={handleUpdateProject}
              disabled={
                editTitle.trim() === (projects.find(p => p.id === editId)?.name || "") &&
                editDesc.trim() === (projects.find(p => p.id === editId)?.description || "")
              }
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project */}
      <Dialog open={openDeleteProject} onOpenChange={setOpenDeleteProject}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this project?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteProject(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteProject}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workspace */}
      <Dialog open={openEditWs} onOpenChange={setOpenEditWs}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-800">Edit Workspace</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Workspace Name</label>
              <Input
                value={editWsName}
                onChange={(e) => setEditWsName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleEditWorkspace();
                  }
                }}
                placeholder="Enter workspace name"
                autoFocus
                className="h-10"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setOpenEditWs(false)}>Cancel</Button>
            <Button type="button" className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleEditWorkspace}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Workspace */}
      <Dialog open={!!confirmDeleteWs} onOpenChange={() => setConfirmDeleteWs(null)}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this workspace and all its projects?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteWs(null)}>Cancel</Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                handleDeleteWorkspace(confirmDeleteWs);
                setConfirmDeleteWs(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} />
    </div>
  );
}
