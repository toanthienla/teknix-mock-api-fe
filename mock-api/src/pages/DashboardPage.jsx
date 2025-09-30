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

import { toast } from "react-toastify";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [allStatefulEndpoints, setAllStatefulEndpoints] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentWsId, setCurrentWsId] = useState(
    () => localStorage.getItem("currentWorkspace") || null
  );
  const [targetWsId, setTargetWsId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("Recently created");

  const [openProjectsMap, setOpenProjectsMap] = useState(
    () => JSON.parse(localStorage.getItem("openProjectsMap")) || {}
  );
  const [openEndpointsMap, setOpenEndpointsMap] = useState(
    () => JSON.parse(localStorage.getItem("openEndpointsMap")) || {}
  );
  const [openFoldersMap, setOpenFoldersMap] = useState(
    () => JSON.parse(localStorage.getItem("openFoldersMap")) || {}
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("isSidebarCollapsed")) ?? false
  );

  const [openNewProject, setOpenNewProject] = useState(false);
  const [openEditProject, setOpenEditProject] = useState(false);
  const [openDeleteProject, setOpenDeleteProject] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);

  const [openEditWs, setOpenEditWs] = useState(false);
  const [confirmDeleteWs, setConfirmDeleteWs] = useState(null);
  const [editWsId, setEditWsId] = useState(null);
  const [editWsName, setEditWsName] = useState("");

  const [openNewWs, setOpenNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    fetchWorkspaces();
    fetchProjects();
    fetchEndpoints();
    fetchAllStatefulEndpoints();
    fetchFolders();
  }, []);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => String(p.id) === String(projectId));
      if (project) {
        setCurrentWsId(project.workspace_id);
        setOpenProjectsMap((prev) => ({
          ...prev,
          [project.workspace_id]: true,
        }));
      }
    }
  }, [projectId, projects]);

  useEffect(() => {
    const savedWs = localStorage.getItem("currentWorkspace");
    if (savedWs) setCurrentWsId(savedWs);

    // Listen for localStorage changes (from breadcrumb clicks)
    const handleStorageChange = () => {
      const updatedWs = localStorage.getItem("currentWorkspace");
      if (updatedWs && updatedWs !== currentWsId) {
        setCurrentWsId(updatedWs);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for manual localStorage updates in same tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, arguments);
      if (key === 'currentWorkspace') {
        handleStorageChange();
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, [currentWsId]);

  useEffect(() => {
    localStorage.setItem("openProjectsMap", JSON.stringify(openProjectsMap));
  }, [openProjectsMap]);

  useEffect(() => {
    localStorage.setItem("openEndpointsMap", JSON.stringify(openEndpointsMap));
  }, [openEndpointsMap]);

  useEffect(() => {
    localStorage.setItem("isSidebarCollapsed", JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem("openFoldersMap", JSON.stringify(openFoldersMap));
  }, [openFoldersMap]);

  // -------------------- Fetch --------------------
  const fetchWorkspaces = () => {
    fetch(`${API_ROOT}/workspaces`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        setWorkspaces(sorted);
        // if (sorted.length > 0 && !currentWsId) setCurrentWsId(sorted[0].id);
      })
      .catch(() => toast.error("Failed to load workspaces"));
  };

  const fetchProjects = () => {
    fetch(`${API_ROOT}/projects`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        setProjects(sorted);
      })
      .catch(() => toast.error("Failed to load projects"));
  };

  const fetchEndpoints = () => {
    fetch(`${API_ROOT}/endpoints`)
      .then((res) => res.json())
      .then((data) => setEndpoints(data));
  };

  const fetchAllStatefulEndpoints = () => {
    fetch(`${API_ROOT}/stateful_endpoints`)
      .then((res) => res.json())
      .then((data) => setAllStatefulEndpoints(data))
      .catch((err) => console.error("Error fetching all stateful endpoints:", err));
  };


  const fetchFolders = async () => {
    try {
      console.log('DashboardPage: Fetching folders...');
      const response = await fetch(`${API_ROOT}/folders`);
      const data = await response.json();
      console.log('DashboardPage: Folders fetched:', data);
      setFolders(data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleAddFolder = (projectId) => {
    console.log('Add folder for project:', projectId);
    // Navigate to project page to create folder
    navigate(`/dashboard/${projectId}`);
  };

  const handleEditFolder = (folder) => {
    console.log('Edit folder:', folder);
    // Navigate to project page with folder selected for editing
    navigate(`/dashboard/${folder.project_id}?folderId=${folder.id}&action=edit`);
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      // Get all endpoints in this folder
      const endpointsRes = await fetch(`${API_ROOT}/endpoints`);
      const allEndpoints = await endpointsRes.json();
      const endpointsToDelete = allEndpoints.filter(e => String(e.folder_id) === String(folderId));

      // Delete all endpoints in the folder first
      await Promise.all(
        endpointsToDelete.map(e =>
          fetch(`${API_ROOT}/endpoints/${e.id}`, { method: "DELETE" })
        )
      );

      // Delete the folder
      await fetch(`${API_ROOT}/folders/${folderId}`, { method: "DELETE" });

      // Update local state
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setEndpoints(prev => prev.filter(e => String(e.folder_id) !== String(folderId)));

      toast.success(`Folder and its ${endpointsToDelete.length} endpoints deleted successfully`);
    } catch (error) {
      console.error('Delete folder error:', error);
      toast.error("Failed to delete folder");
    }
  };

  // -------------------- Filtering & Sorting --------------------
  const currentProjects = projects.filter(
    (p) => String(p.workspace_id) === String(currentWsId)
  );

  const filteredProjects = currentProjects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let sortedProjects = [...filteredProjects];
  if (sortOption === "A → Z")
    sortedProjects.sort((a, b) => a.name.localeCompare(b.name));
  if (sortOption === "Z → A")
    sortedProjects.sort((a, b) => b.name.localeCompare(a.name));

  const currentProject = projectId
    ? projects.find((p) => String(p.id) === String(projectId))
    : null;

  const currentWorkspace = workspaces.find(
    (w) => String(w.id) === String(currentWsId)
  );

  // -------------------- Workspace --------------------
  const validateWsName = (name, excludeId = null) => {
    const trimmed = name.trim();
    if (!trimmed) return "Workspace name cannot be empty";
    if (!/^[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9]*( [A-Za-zÀ-ỹ0-9]+)*$/.test(trimmed))
      return "Must start with a letter, no special chars, single spaces allowed";
    if (trimmed.length > 20) return "Workspace name max 20 chars";
    if (
      workspaces.some(
        (w) =>
          w.name.toLowerCase() === trimmed.toLowerCase() && w.id !== excludeId
      )
    )
      return "Workspace name already exists";
    return "";
  };

  const handleAddWorkspace = (name) => {
    const err = validateWsName(name);
    if (err) {
      toast.warning(err);
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
        localStorage.setItem("currentWorkspace", createdWs.id);
        setOpenProjectsMap((prev) => ({ ...prev, [createdWs.id]: true }));
        toast.success("Workspace created successfully");
      })
      .catch(() => toast.error("Failed to create workspace"));
  };

  const handleEditWorkspace = () => {
    const err = validateWsName(editWsName, editWsId);
    if (err) {
      toast.warning(err);
      return;
    }

    // Kiểm tra nếu tên workspace không thay đổi
    const original = workspaces.find(w => w.id === editWsId);
    if (original && editWsName.trim() === original.name) {
      setOpenEditWs(false);
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
        toast.success("Workspace updated successfully");
      })
      .catch(() => toast.error("Failed to update workspace"));
  };

  const handleDeleteWorkspace = async (id) => {
    try {
      // 1. Get all projects in this workspace
      const projectsRes = await fetch(`${API_ROOT}/projects`);
      const allProjects = await projectsRes.json();
      const projectsToDelete = allProjects.filter((p) => String(p.workspace_id) === String(id));
      const projectIds = projectsToDelete.map(p => p.id);

      // 2. Get all folders in these projects
      const foldersRes = await fetch(`${API_ROOT}/folders`);
      const allFolders = await foldersRes.json();
      const foldersToDelete = allFolders.filter((f) =>
        projectIds.some(pid => String(f.project_id) === String(pid))
      );
      const folderIds = foldersToDelete.map(f => f.id);

      // 3. Get all endpoints in these projects/folders
      const endpointsRes = await fetch(`${API_ROOT}/endpoints`);
      const allEndpoints = await endpointsRes.json();
      const endpointsToDelete = allEndpoints.filter((e) =>
        projectIds.some(pid => String(e.project_id) === String(pid)) ||
        folderIds.some(fid => String(e.folder_id) === String(fid))
      );

      // 4. Delete all endpoints first
      await Promise.all(
        endpointsToDelete.map((e) =>
          fetch(`${API_ROOT}/endpoints/${e.id}`, { method: "DELETE" })
        )
      );

      // 5. Delete all folders
      await Promise.all(
        foldersToDelete.map((f) =>
          fetch(`${API_ROOT}/folders/${f.id}`, { method: "DELETE" })
        )
      );

      // 6. Delete all projects
      await Promise.all(
        projectsToDelete.map((p) =>
          fetch(`${API_ROOT}/projects/${p.id}`, { method: "DELETE" })
        )
      );

      // 7. Finally delete the workspace
      await fetch(`${API_ROOT}/workspaces/${id}`, { method: "DELETE" });

      // 8. Update local state
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      setProjects((prev) => prev.filter((p) => String(p.workspace_id) !== String(id)));
      setFolders((prev) => prev.filter((f) =>
        !projectIds.some(pid => String(f.project_id) === String(pid))
      ));
      setEndpoints((prev) => prev.filter((e) =>
        !projectIds.some(pid => String(e.project_id) === String(pid)) &&
        !folderIds.some(fid => String(e.folder_id) === String(fid))
      ));

      if (String(currentWsId) === String(id)) setCurrentWsId(null);

      toast.success(`Workspace and all its content (${projectsToDelete.length} projects, ${foldersToDelete.length} folders, ${endpointsToDelete.length} endpoints) deleted successfully`);
    } catch (error) {
      console.error('Delete workspace error:', error);
      toast.error("Failed to delete workspace or its content");
    }
  };

  // -------------------- Project --------------------
  const validateProject = (title, desc, editMode = false, editId = null) => {
    const titleTrim = title.trim();
    const descTrim = desc.trim();

    if (!titleTrim) {
      toast.warning("Project name cannot be empty");
      return false;
    }
    if (titleTrim.length > 50) {
      toast.warning("Project name cannot exceed 50 chars");
      return false;
    }
    if (/^[0-9]/.test(titleTrim)) {
      toast.warning("Project name cannot start with a number");
      return false;
    }
    if (/ {2,}/.test(titleTrim)) {
      toast.warning("Project name cannot contain multiple spaces");
      return false;
    }
    if (!/^[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9 ]*$/.test(titleTrim)) {
      toast.warning(
        "Only letters, numbers, and spaces allowed (no special characters)"
      );
      return false;
    }
    if (!descTrim) {
      toast.info("Project description cannot be empty");
      return false;
    }
    if (descTrim.length > 200) {
      toast.warning("Project description max 200 chars");
      return false;
    }

    const duplicate = projects.some(
      (p) =>
        p.workspace_id === currentWsId &&
        (!editMode || p.id !== editId) &&
        p.name.toLowerCase() === titleTrim.toLowerCase()
    );
    if (duplicate) {
      toast.warning("Project name already exists in this workspace");
      return false;
    }
    return true;
  };

  const handleCreateProject = () => {
    if (!validateProject(newTitle, newDesc)) return;
    const newProject = {
      name: newTitle.trim(),
      description: newDesc.trim(),
      workspace_id: targetWsId || currentWsId,
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

        // mở workspace tương ứng
        setCurrentWsId(createdProject.workspace_id);
        localStorage.setItem("currentWorkspace", createdProject.workspace_id);

        setOpenProjectsMap((prev) => ({
          ...prev,
          [createdProject.workspace_id]: true,
        }));

        setNewTitle("");
        setNewDesc("");
        setTargetWsId(null); // reset sau khi tạo xong
        setOpenNewProject(false);
        toast.success("Project created successfully");
      })
      .catch(() => toast.error("Failed to create project"));
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

    // Kiểm tra nếu không có thay đổi thì đóng dialog
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
        created_at: original.created_at, //Giữ lại created_at
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

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;

    try {
      // 1. Get all folders in this project
      const foldersRes = await fetch(`${API_ROOT}/folders`);
      const allFolders = await foldersRes.json();
      const foldersToDelete = allFolders.filter((f) =>
        String(f.project_id) === String(deleteProjectId)
      );
      const folderIds = foldersToDelete.map(f => f.id);

      // 2. Get all endpoints in this project or its folders
      const endpointsRes = await fetch(`${API_ROOT}/endpoints`);
      const allEndpoints = await endpointsRes.json();
      const endpointsToDelete = allEndpoints.filter((e) =>
        String(e.project_id) === String(deleteProjectId) ||
        folderIds.some(fid => String(e.folder_id) === String(fid))
      );

      // 3. Delete all endpoints first
      await Promise.all(
        endpointsToDelete.map((e) =>
          fetch(`${API_ROOT}/endpoints/${e.id}`, { method: "DELETE" })
        )
      );

      // 4. Delete all folders
      await Promise.all(
        foldersToDelete.map((f) =>
          fetch(`${API_ROOT}/folders/${f.id}`, { method: "DELETE" })
        )
      );

      // 5. Delete the project
      await fetch(`${API_ROOT}/projects/${deleteProjectId}`, { method: "DELETE" });

      // 6. Update local state
      setProjects((prev) => prev.filter((p) => p.id !== deleteProjectId));
      setFolders((prev) => prev.filter((f) =>
        String(f.project_id) !== String(deleteProjectId)
      ));
      setEndpoints((prev) => prev.filter((e) =>
        String(e.project_id) !== String(deleteProjectId) &&
        !folderIds.some(fid => String(e.folder_id) === String(fid))
      ));

      setDeleteProjectId(null);
      setOpenDeleteProject(false);

      toast.success(`Project and all its content (${foldersToDelete.length} folders, ${endpointsToDelete.length} endpoints) deleted successfully`);
    } catch (error) {
      console.error('Delete project error:', error);
      toast.error("Failed to delete project");
    }
  };

  // -------------------- Render --------------------
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Sidebar + Main */}
      <div className="flex min-h-screen bg-white">
        <aside
          className={`border-slate-100 bg-white transition-all duration-300 ${!isSidebarCollapsed ? "border-r" : "border-none"
            }`}
        >
          <Sidebar
            workspaces={workspaces}
            projects={projects}
            endpoints={endpoints}
            statefulEndpoints={allStatefulEndpoints}
            folders={folders}
            current={currentWsId}
            setCurrent={setCurrentWsId}
            onWorkspaceChange={setCurrentWsId}
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
            openFoldersMap={openFoldersMap}
            setOpenFoldersMap={setOpenFoldersMap}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            onAddProject={(workspaceId) => {
              setTargetWsId(workspaceId);
              setOpenNewProject(true);
            }}
            onAddFolder={handleAddFolder}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            setOpenNewWs={setOpenNewWs}   // 👈 Thêm dòng này
          />

        </aside>

        {/* Main */}
        <main className="pt-8 flex-1 transition-all duration-300">
          <Topbar
            breadcrumb={
              currentWorkspace
                ? [
                  {
                    label: currentWorkspace.name,
                    WORKSPACE_ID: currentWorkspace.id,
                    href: "/dashboard",
                  },
                ]
                : []
            }
            onSearch={setSearchTerm}
            onNewProject={() => setOpenNewProject(true)}
            showNewProjectButton={true}
            showNewResponseButton={false}
          />

          <div
            className={`transition-all duration-300 px-8 pt-4 pb-8
              ${isSidebarCollapsed
                ? "w-[calc(100%+16rem)] -translate-x-64"
                : "w-full"
              }
            `}
          >
            {currentProject ? (
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  {currentProject.name}
                </h2>
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
                <div className="flex pl-8 pr-8 items-center justify-between mb-4">
                  <div>
                    {currentWorkspace && (
                      <h2 className="mt-4 text-3xl font-bold text-slate-900 mb-2">
                        {currentWorkspace.name}
                      </h2>
                    )}
                    <h3 className="text-base text-slate-600 ml-2">
                      All Projects
                    </h3>
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
                      <DropdownMenuItem
                        onClick={() => setSortOption("Recently created")}
                      >
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-8">
                  {sortedProjects.length > 0 ? (
                    sortedProjects.map((p) => {
                      // Lấy tất cả folders của project này
                      const projectFolders = folders.filter(
                        (f) => String(f.project_id) === String(p.id)
                      );
                      const folderIds = projectFolders.map((f) => String(f.id));

                      // Lấy tất cả endpoints trong các folder đó
                      const projectEndpoints = endpoints.filter((ep) =>
                        folderIds.includes(String(ep.folder_id))
                      );

                      return (
                        <ProjectCard
                          key={p.id}
                          project={{ ...p, endpoints: projectEndpoints }}
                          onClick={() => navigate(`/dashboard/${p.id}`)}
                          onEdit={() => openEditProjectDialog(p)}
                          onDelete={() => openDeleteProjectDialog(p.id)}
                        />
                      );
                    })
                  ) : (
                    <p className="text-slate-500 col-span-full">No projects found.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}

      {/* New Project */}
      <Dialog open={openNewProject} onOpenChange={setOpenNewProject}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">New Project</DialogTitle>
            <div className="mt-1 text-sm text-slate-500">Project details</div>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <Input
                placeholder="Project name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateProject();
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <Textarea
                placeholder="Project description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                maxLength={200}
                className="min-h-[50px] resize-y"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateProject();
                  }
                }}
              />
              <p className="text-xs text-slate-400 text-right mt-1">
                {newDesc.length}/200
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNewProject(false)}>
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-black/90"
              onClick={handleCreateProject}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project */}
      <Dialog open={openEditProject} onOpenChange={setOpenEditProject}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Project</DialogTitle>
            <div className="mt-1 text-sm text-slate-500">Project details</div>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <Input
                placeholder="Project name"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (
                      editTitle.trim() === (projects.find((p) => p.id === editId)?.name || "") &&
                      editDesc.trim() === (projects.find((p) => p.id === editId)?.description || "")
                    ) {
                      setOpenEditProject(false);
                    } else {
                      handleUpdateProject();
                    }
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <Textarea
                placeholder="Project description"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                maxLength={200}
                className="min-h-[80px] resize-y"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (
                      editTitle.trim() === (projects.find((p) => p.id === editId)?.name || "") &&
                      editDesc.trim() === (projects.find((p) => p.id === editId)?.description || "")
                    ) {
                      setOpenEditProject(false);
                    } else {
                      handleUpdateProject();
                    }
                  }
                }}
              />
              <p className="text-xs text-slate-400 text-right mt-1">
                {editDesc.length}/200
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setOpenEditProject(false)}>
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-black/90"
              onClick={handleUpdateProject}
              disabled={
                editTitle.trim() === (projects.find((p) => p.id === editId)?.name || "") &&
                editDesc.trim() === (projects.find((p) => p.id === editId)?.description || "")
              }
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project */}
      <Dialog open={openDeleteProject} onOpenChange={setOpenDeleteProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this project?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteProject(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ New Workspace */}
      <Dialog open={openNewWs} onOpenChange={setOpenNewWs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <Input
              placeholder="Workspace name"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddWorkspace(newWsName);
                  setNewWsName("");
                  setOpenNewWs(false);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNewWs(false)}>
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => {
                handleAddWorkspace(newWsName);
                setNewWsName("");
                setOpenNewWs(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workspace */}
      <Dialog open={openEditWs} onOpenChange={setOpenEditWs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <Input
              placeholder="Workspace name"
              value={editWsName}
              onChange={(e) => setEditWsName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditWs(false)}>
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={handleEditWorkspace}
              disabled={
                editWsName.trim() === (workspaces.find((w) => w.id === editWsId)?.name || "")
              }
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Workspace */}
      <Dialog open={!!confirmDeleteWs} onOpenChange={() => setConfirmDeleteWs(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this workspace and all its projects?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteWs(null)}>
              Cancel
            </Button>
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
    </div>
  );
}
