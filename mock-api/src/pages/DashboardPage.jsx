"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProjectCard from "../components/ProjectCard";
import { ChevronDown } from "lucide-react";
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
  const [currentWsId, setCurrentWsId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("Recently created");
  const [openProjectsMap, setOpenProjectsMap] = useState({});

  const [openNewProject, setOpenNewProject] = useState(false);
  const [openEditProject, setOpenEditProject] = useState(false);
  const [openDeleteProject, setOpenDeleteProject] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);

  const [openEditWs, setOpenEditWs] = useState(false);
  const [confirmDeleteWs, setConfirmDeleteWs] = useState(null);
  const [editWsId, setEditWsId] = useState(null);
  const [editWsName, setEditWsName] = useState("");

  const [wsName, setWsName] = useState("");
  const [wsError, setWsError] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTitleError, setNewTitleError] = useState("");
  const [newDescError, setNewDescError] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTitleError, setEditTitleError] = useState("");
  const [editDescError, setEditDescError] = useState("");

  useEffect(() => {
    fetchWorkspaces();
    fetchProjects();
  }, []);

  const fetchWorkspaces = () => {
    fetch(`${API_ROOT}/workspaces`)
      .then((res) => res.json())
      .then((data) => {
        setWorkspaces(data);
        if (data.length > 0 && !currentWsId) setCurrentWsId(data[0].id);
      })
      .catch(() => toast.error("Failed to load workspaces"));
  };

  const fetchProjects = () => {
    fetch(`${API_ROOT}/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(() => toast.error("Failed to load projects"));
  };

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

  const validateWsName = (name, excludeId = null) => {
    const trimmed = name.trim();
    if (!trimmed) return "Workspace name cannot be empty";
    if (!/^[A-Za-z][A-Za-z0-9]*( [A-Za-z0-9]+)*$/.test(trimmed))
      return "Must start with a letter, no special chars, single spaces allowed";
    if (trimmed.length > 50) return "Workspace name max 50 chars";
    if (workspaces.some((w) => w.name.toLowerCase() === trimmed.toLowerCase() && w.id !== excludeId))
      return "Workspace name already exists";
    return "";
  };

  const handleAddWorkspace = (name) => {
    const err = validateWsName(name);
    if (err) {
      toast.error(err);
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
        toast.success("Workspace created successfully");
      })
      .catch(() => toast.error("Failed to create workspace"));
  };

  const handleEditWorkspace = () => {
    const err = validateWsName(editWsName, editWsId);
    if (err) {
      setWsError(err);
      return;
    }
    fetch(`${API_ROOT}/workspaces/${editWsId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editWsName.trim(), updated_at: new Date().toISOString() }),
    })
      .then(() => {
        setWorkspaces((prev) =>
          prev.map((w) => (w.id === editWsId ? { ...w, name: editWsName.trim() } : w))
        );
        setOpenEditWs(false);
        setEditWsName("");
        setEditWsId(null);
        setWsError("");
        toast.success("Workspace updated successfully");
      })
      .catch(() => toast.error("Failed to update workspace"));
  };

  const handleDeleteWorkspace = async (id) => {
    try {
      const res = await fetch(`${API_ROOT}/projects`);
      const allProjects = await res.json();
      const projectsToDelete = allProjects.filter(p => p.workspace_id === id);


      await Promise.all(
        projectsToDelete.map(p => fetch(`${API_ROOT}/projects/${p.id}`, { method: "DELETE" }))
      );

      await fetch(`${API_ROOT}/workspaces/${id}`, { method: "DELETE" });

      setWorkspaces(prev => prev.filter(w => w.id !== id));
      setProjects(prev => prev.filter(p => p.workspace_id !== id));
      if (currentWsId === id) setCurrentWsId(null);

      toast.success("Workspace and its projects deleted successfully");
    } catch (err) {
      toast.error("Failed to delete workspace or its projects");
    }
  };

  const validateProject = (title, desc) => {
    let valid = true;
    setNewTitleError("");
    setNewDescError("");

    const titleTrim = title.trim();
    const descTrim = desc.trim();

    if (!titleTrim) {
      setNewTitleError("Project name cannot be empty");
      valid = false;
    } else if (titleTrim.length > 50) {
      setNewTitleError("Project name cannot exceed 50 chars");
      valid = false;
    } else if (!/^[A-Za-zÀ-ỹ0-9][A-Za-zÀ-ỹ0-9 ]*$/.test(titleTrim)) {
      setNewTitleError("Must start with a letter, no special chars, single spaces allowed");
      valid = false;
    }


    if (!descTrim) {
      setNewDescError("Project description cannot be empty");
      valid = false;
    } else if (descTrim.length > 200) {
      setNewDescError("Project description max 200 chars");
      valid = false;
    }

    const duplicate = projects.some(
      (p) =>
        p.workspace_id === currentWsId &&
        p.name.toLowerCase() === titleTrim.toLowerCase()
    );
    if (duplicate) {
      setNewTitleError("Project name already exists in this workspace");
      valid = false;
    }
    return valid;
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
        toast.success("Project created successfully");
      })
      .catch(() => toast.error("Failed to create project"));
  };

  const openEditProjectDialog = (p) => {
    setEditId(p.id);
    setEditTitle(p.name);
    setEditDesc(p.description || "");
    setEditTitleError("");
    setEditDescError("");
    setOpenEditProject(true);
  };

  const handleUpdateProject = () => {
    let valid = true;
    setEditTitleError("");
    setEditDescError("");

    const titleTrim = editTitle.trim();
    const descTrim = editDesc.trim();

    if (!titleTrim) {
      setEditTitleError("Project name cannot be empty");
      valid = false;
    } else if (titleTrim.length > 50) {
      setEditTitleError("Project name cannot exceed 50 chars");
      valid = false;
    } else if (!/^[A-Za-zÀ-ỹ0-9][A-Za-zÀ-ỹ0-9 ]*$/.test(titleTrim)) {
      setEditTitleError("Must start with a letter, no special chars, single spaces allowed");
      valid = false;
    }


    if (!descTrim) {
      setEditDescError("Project description cannot be empty");
      valid = false;
    } else if (descTrim.length > 200) {
      setEditDescError("Project description max 200 chars");
      valid = false;
    }

    if (!valid) return;

    fetch(`${API_ROOT}/projects/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editId,
        name: titleTrim,
        description: descTrim,
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
        toast.success("Project updated successfully");
      })
      .catch(() => toast.error("Failed to update project"));
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
        toast.success("Project deleted successfully");
      })
      .catch(() => toast.error("Failed to delete project"));
  };

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
            onEditWorkspace={(ws) => {
              setEditWsId(ws.id);
              setEditWsName(ws.name);
              setOpenEditWs(true);
            }}
            onDeleteWorkspace={(id) => setConfirmDeleteWs(id)}
            openProjectsMap={openProjectsMap}
            setOpenProjectsMap={setOpenProjectsMap}
          />
        </aside>

        <main className="flex-1 p-8">
          <Topbar onSearch={setSearchTerm} onNewProject={() => setOpenNewProject(true)} />

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
                    <DropdownMenuItem onClick={() => setSortOption("Recently created")}>
                      Recently created
                    </DropdownMenuItem>
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

      {/* New Project Dialog */}
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
                placeholder="Enter Project Name"
              />
              {newTitleError && <p className="text-red-600 text-sm mt-1">{newTitleError}</p>}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mt-2">Description</h4>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Type Here"
              />

              <p className="text-right text-slate-400 text-xs mt-1">
                {newDesc.length} / 200
              </p>
              {newDescError && <p className="text-red-600 text-sm mt-1">{newDescError}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNewProject(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleCreateProject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Edit Project Dialog */}
      <Dialog open={openEditProject} onOpenChange={setOpenEditProject}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mt-2">Name</h3>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              {editTitleError && <p className="text-red-600 text-sm mt-1">{editTitleError}</p>}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mt-2">Description</h3>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              <p className="text-right text-slate-400 text-xs mt-1">
                {editDesc.length} / 200
              </p>
              {editDescError && <p className="text-red-600 text-sm mt-1">{editDescError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditProject(false)}>
              Cancel
            </Button>
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
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleDeleteProject}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workspace */}
      <Dialog open={openEditWs} onOpenChange={setOpenEditWs}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <Input value={editWsName} onChange={(e) => setEditWsName(e.target.value)} placeholder="Enter Workspace Name" />
            {wsError && <p className="text-red-600 text-sm mt-1">{wsError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditWs(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleEditWorkspace}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Workspace */}
      <Dialog open={!!confirmDeleteWs} onOpenChange={() => setConfirmDeleteWs(null)}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this workspace? This will remove all projects inside.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteWs(null)}>Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => { handleDeleteWorkspace(confirmDeleteWs); setConfirmDeleteWs(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}
