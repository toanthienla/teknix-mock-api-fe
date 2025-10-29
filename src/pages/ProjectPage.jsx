import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import Topbar from "../components/Topbar";
import ProjectCard from "../components/ProjectCard";
import {API_ROOT} from "../utils/constants";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

import {toast} from "react-toastify";
import {getCurrentUser} from "@/services/api.js";
import tiktokIcon from "@/assets/tiktok.svg";
import fbIcon from "@/assets/facebook.svg";
import linkedinIcon from "@/assets/linkedin.svg";
import searchIcon from "@/assets/search.svg";
import pDesc from "@/assets/project_desc.svg";
import workspaceIcon from "@/assets/workspace-icon.svg";
import folderIcon from "@/assets/project-icon.svg";
import dateIcon from "@/assets/date.svg";
import statelessIcon from "@/assets/stateless.svg";
import statefulIcon from "@/assets/stateful.svg";
import trashIcon from "@/assets/Trash Icon.svg";

export default function ProjectPage() {
  const navigate = useNavigate();
  const {projectId} = useParams();

  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentWsId, setCurrentWsId] = useState(
    () => localStorage.getItem("currentWorkspace") || null
  );
  const [targetWsId, setTargetWsId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [openProjectsMap, setOpenProjectsMap] = useState(
    () => JSON.parse(localStorage.getItem("openProjectsMap")) || {}
  );

  const [openNewProject, setOpenNewProject] = useState(false);
  const [openEditProject, setOpenEditProject] = useState(false);
  const [openDeleteProject, setOpenDeleteProject] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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

  const [currentUsername, setCurrentUsername] = useState("Unknown");

  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        const res = await getCurrentUser();

        if (res?.data?.username) {
          setCurrentUsername(res.data.username); // lưu toàn bộ thông tin user
          console.log("Logged in user:", res.data.username);
        } else {
          toast.error("Please log in to continue.");
          navigate("/login");
        }
      } catch (err) {
        console.error("User not logged in:", err);
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      }
    };

    checkUserLogin();
  }, []);

  useEffect(() => {
    fetchWorkspaces();
    fetchProjects();
    fetchEndpoints();
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
    localStorage.setItem = function (key, value) {
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

  const fetchFolders = async () => {
    try {
      console.log('ProjectPage: Fetching folders...');
      const response = await fetch(`${API_ROOT}/folders`);
      const data = await response.json();
      console.log('ProjectPage: Folders fetched:', data);
      setFolders(data);
    } catch (error) {
      console.error('Error fetching folders:', error);
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

  const currentWorkspace = workspaces.find(
    (w) => String(w.id) === String(currentWsId)
  );

  // -------------------- Workspace --------------------
  const validateWsName = (name, excludeId = null) => {
    if (!name.trim()) return "Workspace name cannot be empty";
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(name))
      return "Must start with a letter, only English, digits, '-' and '_' allowed (no spaces)";
    if (name.trim().length > 20) return "Workspace name max 20 chars";
    if (
      workspaces.some(
        (w) =>
          w.name.toLowerCase() === name.toLowerCase() && w.id !== excludeId
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
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        name: name.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (!result.success || !result.data) {
          toast.error("Failed to create workspace");
          return;
        }
        const createdWs = result.data;

        setWorkspaces((prev) => [...prev, createdWs]);
        setCurrentWsId(String(createdWs.id));
        localStorage.setItem("currentWorkspace", String(createdWs.id));
        setOpenProjectsMap((prev) => ({ ...prev, [createdWs.id]: true }));

        toast.success("Workspace created successfully");
        setNewWsName("");
        setOpenNewWs(false);

        fetchWorkspaces();
      })
      .catch((err) => {
        console.error("Error creating workspace:", err);
        toast.error("Failed to create workspace");
      });
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
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        name: editWsName.trim(),
        updated_at: new Date().toISOString(),
      }),
    })
      .then(() => {
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === editWsId ? {...w, name: editWsName.trim()} : w
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
          fetch(`${API_ROOT}/endpoints/${e.id}`, {method: "DELETE"})
        )
      );

      // 5. Delete all folders
      await Promise.all(
        foldersToDelete.map((f) =>
          fetch(`${API_ROOT}/folders/${f.id}`, {method: "DELETE"})
        )
      );

      // 6. Delete all projects
      await Promise.all(
        projectsToDelete.map((p) =>
          fetch(`${API_ROOT}/projects/${p.id}`, {method: "DELETE"})
        )
      );

      // 7. Finally delete the workspace
      await fetch(`${API_ROOT}/workspaces/${id}`, {method: "DELETE"});

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
  const validateProject = (title, desc, editMode = false, editId = null, workspaceId) => {
    // const title.trim() = title.trim();
    // const desc.trim() = desc.trim();

    if (!title.trim()) {
      toast.warning("Project name cannot be empty");
      return false;
    }
    if (title.trim().length > 50) {
      toast.warning("Project name cannot exceed 50 chars");
      return false;
    }
    if (/^[0-9]/.test(title.trim())) {
      toast.warning("Project name cannot start with a number");
      return false;
    }
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(title.trim())) {
      toast.warning(
        "Only letters, numbers, dashes and underscores allowed (no special characters)"
      );
      return false;
    }
    if (!desc.trim()) {
      toast.info("Project description cannot be empty");
      return false;
    }

    const duplicate = projects.some(
      (p) =>
        String(p.workspace_id) === String(workspaceId) &&
        (!editMode || p.id !== editId) &&
        p.name.toLowerCase() === title.trim().toLowerCase()
    );
    if (duplicate) {
      toast.warning("Project name already exists in this workspace");
      return false;
    }
    return true;
  };

  const handleCreateProject = () => {
    const workspaceId = targetWsId || currentWsId;
    if (!validateProject(newTitle, newDesc, false, null, workspaceId)) return;

    const newProject = {
      name: newTitle.trim(),
      description: newDesc.trim(),
      workspace_id: targetWsId || currentWsId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    fetch(`${API_ROOT}/projects`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newProject),
    })
      .then(async (res) => {
        const data = await res.json();

        // Kiểm tra phản hồi từ API có success = false
        if (!res.ok || data.success === false) {
          if (data?.errors?.length > 0) {
            // Lấy tất cả message lỗi và hiển thị toast
            data.errors.forEach((err) => {
              toast.error(err.message || "Invalid input");
            });
          } else if (data?.message) {
            toast.error(data.message);
          } else {
            toast.error("Failed to create project");
          }
          throw new Error("Validation error");
        }

        // Thành công
        const createdProject = data;
        setProjects((prev) => [...prev, createdProject]);

        // mở workspace tương ứng
        setCurrentWsId(createdProject.workspace_id);
        localStorage.setItem("currentWorkspace", createdProject.workspace_id);

        setOpenProjectsMap({[createdProject.workspace_id]: true});

        setNewTitle("");
        setNewDesc("");
        setTargetWsId(null); // reset sau khi tạo xong
        setOpenNewProject(false);
        toast.success("Project created successfully");
      })
      .catch((err) => {
        console.error("Error creating project:", err);
        if (!err.message.includes("Validation")) {
          toast.error("Failed to create project");
        }
      });
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

    if (!validateProject(editTitle, editDesc, true, editId, original.workspace_id)) return;

    fetch(`${API_ROOT}/projects/${editId}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        id: editId,
        name: editTitle.trim(),
        description: editDesc.trim(),
        workspace_id: original.workspace_id,
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
          fetch(`${API_ROOT}/endpoints/${e.id}`, {method: "DELETE"})
        )
      );

      // 4. Delete all folders
      await Promise.all(
        foldersToDelete.map((f) =>
          fetch(`${API_ROOT}/folders/${f.id}`, {method: "DELETE"})
        )
      );

      // 5. Delete the project
      await fetch(`${API_ROOT}/projects/${deleteProjectId}`, {method: "DELETE"});

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
      setOpenDetail(false);

      toast.success(`Project and all its content (${foldersToDelete.length} folders, ${endpointsToDelete.length} endpoints) deleted successfully`);
    } catch (error) {
      console.error('Delete project error:', error);
      toast.error("Failed to delete project");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalPages = Math.ceil(sortedProjects.length / rowsPerPage);
  const currentPageProjects = sortedProjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currentWsId]);

  // -------------------- Render --------------------
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Topbar full chiều ngang */}
      <div className="mt-8 w-full bg-white shadow-sm z-20">
        <Topbar
          workspaces={workspaces}
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
          setOpenNewWs={setOpenNewWs}
          breadcrumb={
            currentWorkspace
              ? [
                {
                  label: currentWorkspace.name,
                  WORKSPACE_ID: currentWorkspace.id,
                  href: "/dashboard",
                  icon: workspaceIcon,
                },
              ]
              : []
          }
          onSearch={setSearchTerm}
          onNewProject={() => setOpenNewProject(true)}
          showNewProjectButton={true}
          showNewResponseButton={false}
          username={currentUsername}
        />
      </div>
      <main className="flex-1 w-full flex justify-center bg-white">
        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-4">
            <p className="text-xl font-semibold text-gray-700">
              No available workspaces.
            </p>
            <p className="text-gray-500">
              Create a new workspace to get started.
            </p>
            <Button
              className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950 text-md font-bold px-5"
              onClick={() => setOpenNewWs(true)}
            >
              New workspace
            </Button>
          </div>
        ) : (
          <div className="w-[90%] max-w-6xl pt-6 pb-4">
            {/* Tiêu đề + Nút New Project */}
            <div className="flex items-center justify-between mb-6">
              {currentWorkspace && (
                <h2 className="text-3xl font-bold text-black">
                  {currentWorkspace.name} - {sortedProjects.length} projects
                </h2>
              )}
              <Button
                onClick={() => setOpenNewProject(true)}
                className="bg-yellow-200 hover:bg-yellow-300 rounded-xs text-black font-bold px-5"
              >
                New Project
              </Button>
            </div>

            {/* ==== Project Table ==== */}
            <div className="mt-6">
              <div className="rounded-md overflow-hidden">
                <Table className="w-full">
                  {/* ==== Header ==== */}
                  <TableHeader className="bg-white">
                    <TableRow className="border-none">
                      <TableHead className="w-1/4 text-black font-semibold text-sm">
                        Project Name
                      </TableHead>
                      <TableHead className="w-1/3 text-black font-semibold text-sm">
                        Folders
                      </TableHead>
                      <TableHead className="text-center text-black font-semibold text-sm">
                        Endpoints
                      </TableHead>
                      <TableHead className="text-black text-right font-semibold text-sm">
                        Date Created
                      </TableHead>
                      <TableHead className="text-right text-black font-semibold text-sm">
                        Action
                      </TableHead>
                    </TableRow>
                    <TableRow className="border-b border-slate-200">
                      <TableHead colSpan={5}>
                        <div className="flex items-center gap-2 w-1/4">
                          <div className="relative w-full">
                            <img
                              src={searchIcon}
                              alt="search"
                              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 opacity-70"
                            />
                            <Input
                              type="text"
                              placeholder="Search projects..."
                              className="pl-5 pr-3 h-9 text-sm border-none shadow-none w-full"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                      </TableHead>
                    </TableRow>
                    <TableRow className="border-none">
                      <TableHead colSpan={5} className="py-1">
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  {/* ==== Body ==== */}
                  <TableBody>
                    {sortedProjects.length > 0 ? (
                      currentPageProjects.map((p) => (
                        <ProjectCard
                          key={p.id}
                          project={p}
                          folders={folders}
                          endpoints={endpoints}
                          onClick={() => navigate(`/dashboard/${p.id}`)}
                          onView={() => {
                            setSelectedProject(p);
                            setOpenDetail(true);
                          }}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="5" className="text-center py-6 text-gray-500">
                          No projects found.
                        </TableCell>
                      </TableRow>
                    )}

                    {/* ==== Lấp đầy hàng trống (đảm bảo vùng hiển thị cố định) ==== */}
                    {Array.from({
                      length: Math.max(0, rowsPerPage - currentPageProjects.length),
                    }).map((_, i) => (
                      <TableRow
                        key={`empty-${i}`}
                        className="h-[64px] bg-white border-none">
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* ==== Pagination ==== */}
              <div className="flex items-center justify-between mt-4 px-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          className={currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {Array.from({length: totalPages}).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={currentPage === i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>

                <div className="flex items-center gap-2">
                  <span>Rows per page</span>
                  <Select
                    value={String(rowsPerPage)}
                    onValueChange={(value) => {
                      setRowsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[80px] h-8 border-gray-300 text-sm">
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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
              className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
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
              className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
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

      {/* New Workspace */}
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
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNewWs(false)}>
              Cancel
            </Button>
            <Button
              className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
              onClick={() => {
                handleAddWorkspace(newWsName);
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
              className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
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

      {/* Project Detail */}
      <Sheet open={openDetail} onOpenChange={setOpenDetail}>
        <SheetContent
          side="right"
          className="!max-w-none w-[420px] sm:w-[500px] md:w-[600px] bg-white shadow-lg overflow-y-auto p-6"
        >
          {selectedProject && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl font-semibold">Details</SheetTitle>
                <SheetDescription></SheetDescription>
              </SheetHeader>

              <div className="space-y-5">

                {/* Description */}
                <div className="border rounded-lg p-4 bg-slate-50">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <img src={pDesc} alt="description" className="w-4 h-4"/>
                    <h3 className="font-semibold text-gray-700">Description</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedProject.description || "No description provided."}
                  </p>
                </div>

                {/* Folders & Endpoints */}
                <div className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <img src={folderIcon} alt="folders" className="w-4 h-4"/>
                      <h3 className="font-semibold text-gray-800">FOLDERS</h3>
                    </div>
                    <h3 className="font-semibold text-gray-800">ENDPOINTS</h3>
                  </div>

                  <div className="space-y-2">
                    {folders
                      .filter((f) => f.project_id === selectedProject.id)
                      .map((f) => {
                        const statelessCount = endpoints.filter(
                          (e) => e.folder_id === f.id && e.is_stateful === false
                        ).length;
                        const statefulCount = endpoints.filter(
                          (e) => e.folder_id === f.id && e.is_stateful === true
                        ).length;

                        return (
                          <div key={f.id} className="flex justify-between items-center">
                            {/* Folder name */}
                            <span className="text-gray-900 font-medium">{f.name}</span>

                            {/* Endpoint badge */}
                            <div
                              className="flex items-center bg-neutral-800 text-white rounded-full px-3 py-1.5 min-w-[90px] justify-between text-xs font-semibold">
                              {/* Stateless */}
                              <div className="flex items-center gap-1">
                                <span className="text-gray-300">{statelessCount}</span>
                                <img
                                  src={statelessIcon}
                                  alt="stateless"
                                  className="w-3.5 h-3.5 opacity-90"
                                />
                              </div>

                              {/* Divider */}
                              <span className="opacity-60">|</span>

                              {/* Stateful */}
                              <div className="flex items-center gap-1">
                                <span className="text-gray-300">{statefulCount}</span>
                                <img
                                  src={statefulIcon}
                                  alt="stateful"
                                  className="w-3.5 h-3.5 opacity-90 inverted"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Date */}
                <div className="border rounded-lg p-4 bg-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <img src={dateIcon} alt="calendar" className="w-4 h-4"/>
                    <span>Date</span>
                  </div>
                  <div className="text-right text-sm text-gray-700">
                    {new Date(selectedProject.created_at).toLocaleDateString()} •{" "}
                    {new Date(selectedProject.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              <SheetFooter className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span>Expand new tab</span> <span>•</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="bg-white hover:bg-red-400 text-indigo-950"
                    onClick={() => {
                      openDeleteProjectDialog(selectedProject?.id);
                    }}
                  >
                    <img src={trashIcon} alt="trash" className="w-5 h-5 brightness-0"/>
                  </Button>
                  <Button
                    className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
                    onClick={() => {
                      openEditProjectDialog(selectedProject);
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => setOpenDetail(false)}>
                    Close
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* footer */}
      <footer
        className="mt-auto w-full flex justify-between items-center px-8 py-4 text-xs font-semibold text-gray-700 border-t bg-white">
        <span>© Teknix Corp. All rights reserved.</span>
        <div className="flex items-center gap-3 text-gray-700">
          <img src={tiktokIcon} alt="tiktok" className="w-4 h-4"/>
          <img src={fbIcon} alt="facebook" className="w-4 h-4"/>
          <img src={linkedinIcon} alt="linkedin" className="w-4 h-4"/>
          <a className="hover:underline font-semibold" href="">About</a>
          <span>·</span>
          <a className="hover:underline font-semibold" href="">Support</a>
        </div>
      </footer>
    </div>
  );
}