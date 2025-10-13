import React, {useEffect, useState, useRef} from "react";
import { getCurrentUser } from "@/services/api.js";
import {Button} from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Sidebar from "@/components/Sidebar.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {API_ROOT} from "@/utils/constants.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input.jsx";
import {Label} from "@/components/ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import {MoreVertical} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Topbar from "@/components/Topbar.jsx";
import {toast} from "react-toastify";
import LogCard from "@/components/LogCard.jsx";

import exportIcon from "@/assets/export.svg";
import refreshIcon from "@/assets/refresh.svg";
import blueFolder from "@/assets/blue_folder.svg"
import userCogIcon from "@/assets/fa-solid_user-cog.svg";
import folderPublic from "@/assets/folder-public.svg";
import folderPrivate from "@/assets/folder-private.svg";
import birdIcon from "@/assets/Bird.svg";
import editIcon from "@/assets/Edit Icon.svg";
import Group from "@/assets/Group.svg";
import deleteIcon from "@/assets/Trash Icon.svg";

export default function Dashboard() {
  const navigate = useNavigate();
  const {projectId, folderId} = useParams();
  // const location = useLocation();
  const [activeTab, setActiveTab] = useState("folders");

  const [logs, setLogs] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentWsId, setCurrentWsId] = useState(
    () => localStorage.getItem("currentWorkspace") || null
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption] = useState("Recently created");

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
  // const [targetWsId, setTargetWsId] = useState(null);
  const [targetProjectId, setTargetProjectId] = useState(null);

  const [openEditWs, setOpenEditWs] = useState(false);
  const [confirmDeleteWs, setConfirmDeleteWs] = useState(null);
  const [editWsId, setEditWsId] = useState(null);
  const [editWsName, setEditWsName] = useState("");

  const [openNewWs, setOpenNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState("");

  // folder state
  const [openNewFolder, setOpenNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [deleteFolderId, setDeleteFolderId] = useState(null);
  const [openDeleteFolder, setOpenDeleteFolder] = useState(false);

  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [timeFilter, setTimeFilter] = useState("All time");

  const [folderMode, setFolderMode] = useState("public"); // mặc định public
  const [newFolderMode, setNewFolderMode] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [showPermission, setShowPermission] = useState(false);
  const popupRef = useRef(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderOwner, setFolderOwner] = useState(""); // username của owner
  const [isOwner, setIsOwner] = useState(false); // xem user hiện tại có phải owner không
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
    if (!selectedFolder?.id || !showPermission) return;

    const fetchFolderDetail = async () => {
      try {
        const res = await fetch(`${API_ROOT}/folders/${selectedFolder.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        // Cập nhật folderMode từ is_public (true = public, false = private)
        setFolderMode(data.is_public ? "public" : "private");
      } catch (err) {
        console.error("Failed to fetch folder detail:", err);
      }
    };

    fetchFolderDetail();
  }, [selectedFolder, showPermission]);

  useEffect(() => {
    if (!selectedFolder?.id) return; // nếu chưa có folder thì thôi

    // --- Lấy owner ---
    const fetchOwner = async () => {
      try {
        const res = await fetch(`${API_ROOT}/folders/getOwner/${selectedFolder.id}`, {
          credentials: "include", // nếu cần gửi cookie
        });
        const data = await res.json();
        setFolderOwner(data.username || "Unknown");
      } catch (err) {
        console.error("Error fetching folder owner:", err);
        setFolderOwner("Unknown");
      }
    };

    // --- Kiểm tra user hiện tại có phải owner ---
    const checkOwner = async () => {
      try {
        const res = await fetch(`${API_ROOT}/folders/checkOwner/${selectedFolder.id}`, {
          credentials: "include", // gửi cookie JWT
        });
        const data = await res.json();
        setIsOwner(data.success); // success = true → là owner
      } catch (err) {
        console.error("Error checking folder owner:", err);
        setIsOwner(false);
      }
    };

    fetchOwner();
    checkOwner();
  }, [selectedFolder]);

  const currentProject = projectId
    ? projects.find((p) => String(p.id) === String(projectId))
    : null;

  const currentWorkspace = workspaces.find(
    (w) => String(w.id) === String(currentWsId)
  );

  // state cho pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // fetch workspaces + projects + endpoints
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        fetchWorkspaces();
        // Wait a bit for all to complete
        setTimeout(() => setIsLoading(false), 1000);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (currentWsId) {
      fetchProjects(currentWsId);
    } else {
      setProjects([]);
    }
  }, [currentWsId]);

  useEffect(() => {
    localStorage.setItem("openProjectsMap", JSON.stringify(openProjectsMap));
  }, [openProjectsMap]);

  useEffect(() => {
    localStorage.setItem("openEndpointsMap", JSON.stringify(openEndpointsMap));
  }, [openEndpointsMap]);

  useEffect(() => {
    localStorage.setItem("openFoldersMap", JSON.stringify(openFoldersMap));
  }, [openFoldersMap]);

  useEffect(() => {
    localStorage.setItem("isSidebarCollapsed", JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Keep sidebar expanded for selected project when navigating into project view
  useEffect(() => {
    if (!projectId || projects.length === 0) return;
    const p = projects.find((proj) => String(proj.id) === String(projectId));
    if (!p) return;

    if (String(currentWsId) !== String(p.workspace_id)) {
      setCurrentWsId(p.workspace_id);
    }
    setOpenProjectsMap((prev) => ({...prev, [p.workspace_id]: true}));
    setOpenEndpointsMap((prev) => ({...prev, [p.id]: true}));
  }, [projectId, projects, currentWsId]);

  const fetchWorkspaces = () => {
    return fetch(`${API_ROOT}/workspaces`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        setWorkspaces(sorted);
        if (sorted.length > 0 && !currentWsId) {
          setCurrentWsId(sorted[0].id);
          localStorage.setItem("currentWorkspace", sorted[0].id);
        }
      })
      .catch(() =>
        toast.error("Failed to load workspaces", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
        })
      );
  };

  const fetchProjects = (wsId) => {
    if (!wsId) return;

    fetch(`${API_ROOT}/projects?workspace_id=${wsId}`)
      .then(r => r.json())
      .then(rData => {
        const projectsArr = Array.isArray(rData) ? rData : rData.data || [];
        setProjects(projectsArr);

        // reset folders + endpoints trước khi fetch mới
        setFolders([]);
        setEndpoints([]);

        projectsArr.forEach((p) => {
          // fetch folders của từng project
          fetch(`${API_ROOT}/folders?project_id=${p.id}`)
            .then(r => r.json())
            .then(fData => {
              const fArr = Array.isArray(fData) ? fData : fData.data || [];
              setFolders(prev => {
                const merged = [...prev];
                fArr.forEach(f => {
                  if (!merged.some(ff => ff.id === f.id)) {
                    merged.push(f);
                  }
                });
                return merged;
              });

              // fetch endpoints cho từng folder
              fArr.forEach((f) => {
                fetch(`${API_ROOT}/endpoints?folder_id=${f.id}`)
                  .then(r2 => r2.json())
                  .then(eData => {
                    const eArr = Array.isArray(eData) ? eData : eData.data || [];

                    const withProjectId = eArr.map(e => ({
                      ...e,
                      project_id: f.project_id
                    }));

                    setEndpoints(prev => {
                      const merged = [...prev];
                      withProjectId.forEach(e => {
                        if (!merged.some(ee => ee.id === e.id)) {
                          merged.push(e);
                        }
                      });
                      return merged;
                    });
                  })
                  .catch(() => console.error(`Failed to fetch endpoints for folder ${f.id}`));
              });
            })
            .catch(() => console.error(`Failed to fetch folders for project ${p.id}`));
        });
      })
      .catch(() => console.error(`Failed to fetch projects for workspace ${wsId}`));
  };

  const fetchLogs = async (pid) => {
    if (!pid) return;
    try {
      const res = await fetch(`${API_ROOT}/project_request_logs?project_id=${pid}`);
      const data = await res.json();

      // enrich logs với endpoint + project_id
      const enrichedLogs = await Promise.all(
        data.map(async (log) => {
          if (!log.endpoint_id) return log;

          const endpoint = endpoints.find((ep) => String(ep.id) === String(log.endpoint_id));
          const endpointName = endpoint ? endpoint.name : "Unknown endpoint";

          try {
            const res = await fetch(`${API_ROOT}/endpoint_responses?endpoint_id=${log.endpoint_id}`);
            const responses = await res.json();

            const matched = responses.find(r => String(r.id) === String(log.response_id)) || responses[0];

            return {
              ...log,
              project_id: endpoint ? endpoint.project_id : null, // ✅ bổ sung project_id
              endpointResponseName: matched ? `${endpointName} - ${matched.name}` : endpointName,
            };
          } catch (err) {
            console.error("Error fetching endpoint_responses:", err);
            return {
              ...log,
              project_id: endpoint ? endpoint.project_id : null, // ✅ luôn có project_id
              endpointResponseName: endpointName,
            };
          }
        })
      );

      setLogs(enrichedLogs);
    } catch (err) {
      console.error("Error fetching logs:", err);
      toast.error("Failed to load logs");
    }
  };

  // -------------------- Folder --------------------
  const handleAddFolder = (targetProjectId = null) => {
    // Nếu có targetProjectId từ sidebar, dùng nó, nếu không dùng projectId hiện tại
    setTargetProjectId(targetProjectId || projectId);
    setOpenNewFolder(true);
  };

  const handleEditFolder = (folder) => {
    setNewFolderName(folder.name);
    setNewFolderDesc(folder.description || "");
    setEditingFolderId(folder.id);
    setOpenNewFolder(true);
  };

  const handleDeleteFolder = async (folderId) => {
    setDeleteFolderId(folderId);
    setOpenDeleteFolder(true);
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolderId) return;

    try {
      // Get all endpoints in this folder
      const endpointsRes = await fetch(`${API_ROOT}/endpoints`);
      const allEndpoints = await endpointsRes.json();
      const endpointsToDelete = allEndpoints.filter(e => String(e.folder_id) === String(deleteFolderId));

      // Delete all endpoints in the folder first
      await Promise.all(
        endpointsToDelete.map(e =>
          fetch(`${API_ROOT}/endpoints/${e.id}`, {method: "DELETE"})
        )
      );

      // Delete the folder
      await fetch(`${API_ROOT}/folders/${deleteFolderId}`, {method: "DELETE", credentials: "include",});

      // Update local state
      setFolders(prev => prev.filter(f => f.id !== deleteFolderId));

      toast.dismiss();
      toast.success(`Folder and its ${endpointsToDelete.length} endpoints deleted successfully`);

      // If currently viewing the deleted folder, navigate back to project view
      if (folderId === deleteFolderId) {
        navigate(`/projects/${projectId}`);
      }

      setOpenDeleteFolder(false);
      setDeleteFolderId(null);
    } catch (error) {
      console.error('Delete folder error:', error);
      toast.error("Failed to delete folder");
    }
  };

  const validateFolderName = (name) => {
    const trimmed = name.trim();

    if (!trimmed) {
      return "Folder name cannot be empty";
    }

    if (!/^[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9]*( [A-Za-zÀ-ỹ0-9]+)*$/.test(trimmed)) {
      return "Must start with a letter, no special chars, single spaces allowed";
    }

    if (trimmed.length > 20) {
      return "Folder name max 20 chars";
    }

    // Check for duplicate folder names in the current project (exclude current folder when editing)
    const projectFolders = folders.filter(f =>
      String(f.project_id) === String(projectId) &&
      f.id !== editingFolderId
    );
    if (projectFolders.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
      return "Folder name already exists in this project";
    }

    return "";
  };

  const hasChanges = () => {
    if (!editingFolderId) return true; // Always allow create

    const originalFolder = folders.find(f => f.id === editingFolderId);
    if (!originalFolder) return true;

    return newFolderName.trim() !== originalFolder.name ||
      newFolderDesc.trim() !== (originalFolder.description || "");
  };

  const handleCreateFolder = async () => {
    // Clear any existing toasts first
    toast.dismiss();

    // Check if no changes when editing
    if (editingFolderId) {
      const originalFolder = folders.find(f => f.id === editingFolderId);
      if (originalFolder &&
        newFolderName.trim() === originalFolder.name &&
        newFolderDesc.trim() === (originalFolder.description || "")) {
        // No changes, just close dialog
        setOpenNewFolder(false);
        setNewFolderName("");
        setNewFolderDesc("");
        setEditingFolderId(null);
        return;
      }
    }

    const validationError = validateFolderName(newFolderName);
    if (validationError) {
      toast.warning(validationError);
      return;
    }

    if (isCreatingFolder) {
      return; // Prevent double submission
    }

    setIsCreatingFolder(true);

    try {
      const folderData = {
        name: newFolderName.trim(),
        description: newFolderDesc.trim(),
        project_id: targetProjectId || projectId,
        is_public: newFolderMode === "public",
        created_at: editingFolderId ? undefined : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let response;
      if (editingFolderId) {
        // Update existing folder
        response = await fetch(`${API_ROOT}/folders/${editingFolderId}`, {
          method: "PUT",
          credentials: "include",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({id: editingFolderId, ...folderData}),
        });
      } else {
        // Create new folder
        response = await fetch(`${API_ROOT}/folders`, {
          method: "POST",
          credentials: "include",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(folderData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save folder');
      }

      const savedFolder = await response.json();

      if (editingFolderId) {
        setFolders((prev) => prev.map(f => f.id === editingFolderId ? savedFolder : f));
        toast.success(`Folder "${savedFolder.name}" updated successfully!`);
      } else {
        setFolders((prev) => [...prev, savedFolder]);
        toast.success(`Folder "${savedFolder.name}" created successfully!`);
        // Không auto navigate, để user ở project page
      }

      setNewFolderName("");
      setNewFolderDesc("");
      setEditingFolderId(null);
      setTargetProjectId(null);
      setOpenNewFolder(false);
    } catch (error) {
      console.error('Error saving folder:', error);
      toast.error('Failed to save folder. Please try again.');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleChangeFolderMode = async (mode) => {
    if (!selectedFolder?.id) return;
    try {
      const res = await fetch(`${API_ROOT}/folders/${selectedFolder.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: mode === "public" }),
      });

      if (res.status === 403) {
        toast.error("Unauthorized: You do not have permission to change this folder mode!");
        return;
      }

      if (!res.ok) throw new Error("Failed to update folder mode");

      setFolderMode(mode);
      toast.success(`Folder is now ${mode}!`);
      // Cập nhật luôn state folders để UI đồng bộ
      setFolders((prev) =>
        prev.map((f) =>
          f.id === selectedFolder.id ? { ...f, is_public: mode === "public" } : f
        )
      );
    } catch (err) {
      toast.error("Failed to update folder mode!");
      console.error(err);
    }
  };

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
      headers: {"Content-Type": "application/json"},
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
        setOpenProjectsMap((prev) => ({...prev, [createdWs.id]: true}));
        toast.success("Create workspace successfully!");
        fetchWorkspaces();
      })
      .catch(() => toast.error("Failed to create workspace"));
  };

  const handleEditWorkspace = () => {
    const err = validateWsName(editWsName, editWsId);
    if (err) {
      toast.warning(err);
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
        toast.success("Update workspace successfully!");
      })
      .catch(() => toast.error("Failed to update workspace"));
  };

  const handleDeleteWorkspace = async (id) => {
    try {
      const res = await fetch(`${API_ROOT}/projects`);
      const allProjects = await res.json();
      const projectsToDelete = allProjects.filter((p) => p.workspace_id === id);

      await Promise.all(
        projectsToDelete.map((p) =>
          fetch(`${API_ROOT}/projects/${p.id}`, {method: "DELETE"})
        )
      );

      await fetch(`${API_ROOT}/workspaces/${id}`, {method: "DELETE"});

      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      setProjects((prev) => prev.filter((p) => p.workspace_id !== id));
      if (currentWsId === id) setCurrentWsId(null);

      toast.success("Delete workspace successfully!");
    } catch {
      toast.error("Failed to delete workspace!");
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const projectOk = String(log.project_id) === String(projectId);

    const methodOk =
      methodFilter === "All Methods" ||
      log.request_method?.toUpperCase() === methodFilter.toUpperCase();

    const statusOk =
      statusFilter === "All Status" ||
      String(log.response_status_code) === String(statusFilter);

    let timeOk = true;
    if (timeFilter && timeFilter !== "All time") {
      const logTime = new Date(log.created_at);
      if (!isNaN(logTime)) {
        const now = Date.now();
        if (timeFilter === "Last 24 hours") {
          timeOk = logTime.getTime() >= now - 24 * 60 * 60 * 1000;
        } else if (timeFilter === "Last 7 days") {
          timeOk = logTime.getTime() >= now - 7 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === "Last 30 days") {
          timeOk = logTime.getTime() >= now - 30 * 24 * 60 * 60 * 1000;
        }
      }
    }
    return projectOk && methodOk && statusOk && timeOk;
  });

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

  // logs hiển thị theo trang
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // filter + sort endpoints
  let filteredEndpoints = endpoints.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Nếu có folderId → chỉ lấy folder đó
  if (folderId) {
    filteredEndpoints = filteredEndpoints.filter(
      (e) => String(e.folder_id) === String(folderId)
    );
  }

  // sort endpoints based on sortOption
  let sortedEndpoints = [...filteredEndpoints];

  if (sortOption === "Recently created") {
    sortedEndpoints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortOption === "Oldest first") {
    sortedEndpoints.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sortOption === "Alphabetical (A-Z)") {
    sortedEndpoints.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === "Alphabetical (Z-A)") {
    sortedEndpoints.sort((a, b) => b.name.localeCompare(a.name));
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPermission(false);
      }
    };

    if (showPermission) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPermission]);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`border-slate-100 bg-white transition-all duration-300 ${!isSidebarCollapsed ? "border-r" : "border-none"}`}
        >
          <Sidebar
            workspaces={workspaces}
            projects={projects}
            endpoints={endpoints}
            folders={folders}
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
            openFoldersMap={openFoldersMap}
            setOpenFoldersMap={setOpenFoldersMap}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            setOpenNewWs={setOpenNewWs}
            onAddFolder={handleAddFolder}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            username={currentUsername}
          />
        </aside>

        {/* Main Content */}
        <main
          className="pt-8 flex-1 transition-all duration-300 "
        >
          {/* Top Navbar */}
          <Topbar
            breadcrumb={
              currentWorkspace
                ? currentProject
                  ? [
                    {
                      label: currentWorkspace.name,
                      WORKSPACE_ID: currentWorkspace.id,
                      href: "/dashboard",
                    },
                    {
                      label: currentProject.name,
                      href: `/dashboard/${currentProject.id}`,
                    },
                  ]
                  : [
                    {
                      label: currentWorkspace.name,
                      WORKSPACE_ID: currentWorkspace.id,
                      href: "/dashboard",
                    },
                  ]
                : []
            }
            onSearch={setSearchTerm}
            onNewFolder={() => setOpenNewFolder(true)}
            showNewProjectButton={false}
            showNewFolderButton={true}
            showNewResponseButton={false}
          />

          {/* Content Area */}
          <div
            className={`transition-all duration-300 px-8 pt-4 pb-8
            ${isSidebarCollapsed ? "w-[calc(100%+16rem)] -translate-x-64" : "w-full"
            }`}
          >
            <div className="flex flex-col">
              <div className="flex ml-auto border-b border-gray-200 mb-4 text-stone-500">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("folders")}
                  className={`rounded-none px-6 py-4 -mb-px ${activeTab === "folders"
                    ? "border-b-2 border-stone-900 text-stone-900"
                    : ""
                  }`}
                >
                  <span className="text-lg">Folders</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setActiveTab("logs");
                    fetchLogs(projectId);
                  }}
                  className={`rounded-none px-6 py-4 -mb-px ${activeTab === "logs"
                    ? "border-b-2 border-stone-900 text-stone-900"
                    : ""
                  }`}
                >
                  <span className="text-lg">Logs</span>
                </Button>
              </div>

              {activeTab === "folders" ? (
                <>
                  {/* Folder List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 px-8">
                    {folders.filter(f => String(f.project_id) === String(projectId)).length === 0 ? (
                      <div className="col-span-full text-center text-slate-500 py-8">
                        No folders found in this project.
                      </div>
                    ) : (
                      folders
                        .filter(f => String(f.project_id) === String(projectId))
                        .map((folder) => (
                          <div
                            key={folder.id}
                            className="relative flex flex-col items-center group"
                          >
                            {/* Folder Image */}
                            <img
                              src={blueFolder}
                              alt="Folder"
                              className="w-32 h-18 cursor-pointer hover:opacity-80"
                              onClick={() =>
                                navigate(`/dashboard/${projectId}/folder/${folder.id}`)
                              }
                            />
                            <span className="mt-1 text-sm font-medium text-gray-800 text-center">
                              {folder.name}
                            </span>

                            {/* === Dropdown Menu (Actions) === */}
                            <div
                              className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded-full hover:bg-gray-100">
                                    <MoreVertical className="w-5 h-5 text-gray-600"/>
                                  </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator/>

                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFolder(folder);
                                      setNewFolderName(folder.name);
                                      setEditDialogOpen(true);
                                    }}
                                  >
                                    <img src={editIcon} alt="edit" className="w-4 h-4"/>
                                    Edit
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFolder(folder);
                                      setShowPermission(true);
                                    }}
                                  >
                                    <img src={Group} className="w-4 h-4"/> Folder Permission
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFolder(folder);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <img src={deleteIcon} alt="delete" className="w-4 h-4"/>
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* === Edit Folder Dialog === */}
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Folder</DialogTitle>
                      </DialogHeader>

                      <div className="mt-4 space-y-2">
                        <Label htmlFor="folderName">Name</Label>
                        <Input
                          id="folderName"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Enter folder name..."
                        />
                      </div>

                      <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={async () => {
                            try {
                              const res = await fetch(`${API_ROOT}/folders/${selectedFolder.id}`, {
                                method: "PUT",
                                credentials: "include",
                                headers: {"Content-Type": "application/json"},
                                body: JSON.stringify({name: newFolderName}),
                              });

                              if (!res.ok) throw new Error("Failed to update folder");

                              setFolders((prev) =>
                                prev.map((f) =>
                                  f.id === selectedFolder.id ? {...f, name: newFolderName} : f
                                )
                              );

                              toast.success("Folder updated successfully!");
                              setEditDialogOpen(false);
                            } catch (err) {
                              toast.error("Failed to update folder!");
                            }
                          }}
                        >
                          Update
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* === Delete Confirmation Dialog === */}
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Delete Folder</DialogTitle>
                      </DialogHeader>

                      <p className="mt-2 text-gray-600">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{selectedFolder?.name}</span>?<br/>
                        <span className="text-red-500 text-sm">
                          This action cannot be undone.
                        </span>
                      </p>

                      <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={async () => {
                            try {
                              if (!selectedFolder?.id) throw new Error("No folder selected");

                              const res = await fetch(`${API_ROOT}/folders/${selectedFolder.id}`, {
                                method: "DELETE",
                                credentials: "include",
                              });

                              if (!res.ok) throw new Error("Failed to delete folder");

                              setFolders((prev) =>
                                prev.filter((f) => f.id !== selectedFolder.id)
                              );

                              toast.success("Folder deleted successfully!");
                              setDeleteDialogOpen(false);
                            } catch (err) {
                              toast.error("Failed to delete folder!");
                              console.error(err);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* === Folder Permission Popup === */}
                  {showPermission && (
                    <div
                      ref={popupRef}
                      className="absolute right-[0px] top-12 w-[540px] bg-neutral-100 rounded-2xl shadow-2xl border border-gray-300 p-6 z-50"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={userCogIcon}
                          alt="User cog icon"
                          className="w-6 h-6 text-gray-700"
                        />
                        <h3 className="text-xl font-bold text-gray-900">
                          Users Permission
                        </h3>
                      </div>

                      {/* User Info */}
                      <div
                        className="border border-gray-300 bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img
                            src={birdIcon}
                            alt="User avatar"
                            className="w-7 h-7 object-contain"
                          />
                          <div>
                            <div className="font-semibold text-[16px]">
                              {folderOwner || "Unknown"}
                            </div>

                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-700 underline">
                          Owner
                        </div>
                      </div>

                      {/* Folder Protection */}
                      <div className="flex justify-between items-center bg-gray-100 rounded-xl px-4 py-3 mt-4">
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                          <span>
                            Data in folder{" "}
                            <span className="font-semibold text-black-700">
                              {selectedFolder?.name || "this folder"}
                            </span>{" "}
                            is protected
                          </span>
                        </div>

                        <div className="flex items-center">
                          <button
                            className={`flex flex-col items-center justify-center gap-1 text-sm border-2 border-r-0 border-stone-400 rounded-l-lg px-4 py-2 w-[60px] h-[45px] ${
                              folderMode === "public"
                                ? "bg-white text-black"
                                : "bg-gray-300 text-gray-500"
                            }`}
                            onClick={() => handleChangeFolderMode("public")}
                          >
                            <img src={folderPublic} alt="Public folder" className="w-4 h-4"/>
                            <span className="text-xs font-semibold">Public</span>
                          </button>
                          <button
                            className={`flex flex-col items-center justify-center gap-1 text-sm border-2 border-stone-400 rounded-r-lg px-4 py-2 w-[60px] h-[45px] ${
                              folderMode === "private"
                                ? "bg-white text-black"
                                : "bg-gray-300 text-gray-500"
                            }`}
                            onClick={() => handleChangeFolderMode("private")}
                          >
                            <img src={folderPrivate} alt="Private folder" className="w-4 h-4"/>
                            <span className="text-xs font-semibold">Private</span>
                          </button>
                        </div>
                      </div>

                      {/* Permissions Table */}
                      <div className="border-t border-gray-300 pt-4 mt-4">
                        <div className="font-semibold text-gray-900 text-[16px] mb-3">
                          Your Permissions
                        </div>
                        <div className="border bg-white border-gray-300 rounded-xl">
                          <div
                            className="grid grid-cols-3 bg-gray-50 text-[15px] font-semibold mx-2 my-1 px-2 py-1 rounded-t-xl">
                            <span>Permissions</span>
                            <span className="text-center">Allowed</span>
                            <span className="text-center">Not Allowed</span>
                          </div>

                          <div className="grid grid-cols-3 items-center px-4 py-2 text-sm text-gray-700">
                            <span>Set folder mode</span>
                            <div className="flex justify-center">
                              <input
                                type="radio"
                                name="setMode"
                                className="accent-black"
                                checked={isOwner === true}
                                readOnly
                              />
                            </div>
                            <div className="flex justify-center">
                              <input
                                type="radio"
                                name="setMode"
                                className="accent-black"
                                checked={isOwner === false}
                                readOnly
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 items-center px-4 py-2 text-sm text-gray-700">
                            <span>Sharing Data</span>
                            <div className="flex justify-center">
                              <input
                                type="radio"
                                name="sharing"
                                className="accent-black"
                                checked={folderMode === "public"}
                                readOnly
                              />
                            </div>
                            <div className="flex justify-center">
                              <input
                                type="radio"
                                name="sharing"
                                className="accent-black"
                                checked={folderMode === "private"}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </>
              ) : activeTab === "logs" ? (
                <>

                  {/* Logs */}
                  <div className="w-full overflow-x-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        {/* Method Filter */}
                        <Select
                          value={methodFilter}
                          onValueChange={setMethodFilter}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Methods"/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All Methods">All Methods</SelectItem>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Status"/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All Status">All Status</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                            <SelectItem value="400">400</SelectItem>
                            <SelectItem value="404">404</SelectItem>
                            <SelectItem value="500">500</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Time Filter */}
                        <Select
                          value={timeFilter}
                          onValueChange={setTimeFilter}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="All time"/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All time">All time</SelectItem>
                            <SelectItem value="Last 24 hours">
                              Last 24 hours
                            </SelectItem>
                            <SelectItem value="Last 7 days">
                              Last 7 days
                            </SelectItem>
                            <SelectItem value="Last 30 days">
                              Last 30 days
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline">
                          <img
                            src={exportIcon}
                            alt="Export Icon"
                            className="w-4 h-4 object-contain"
                          />
                          Export
                        </Button>
                        <Button variant="outline" onClick={() => fetchLogs(projectId)}>
                          <img
                            src={refreshIcon}
                            alt="Refresh Icon"
                            className="w-4 h-4 object-contain"
                          />
                          Refresh
                        </Button>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="col-span-3">Timestamp</TableHead>
                          <TableHead className="col-span-1">Method</TableHead>
                          <TableHead className="col-span-2">Path</TableHead>
                          <TableHead className="col-span-2">Latency</TableHead>
                          <TableHead className="col-span-1">Status</TableHead>
                          <TableHead className="col-span-3">
                            Matched Response
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {logs.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center text-slate-500 py-4"
                            >
                              No logs available.
                            </TableCell>
                          </TableRow>
                        ) : filteredLogs.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center text-slate-500 py-4"
                            >
                              No logs found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedLogs.map((log, i) => <LogCard key={i} log={log}/>)
                        )}
                      </TableBody>
                    </Table>

                    <div className="flex items-center justify-end mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Rows per page</span>
                        <Select
                          value={rowsPerPage.toString()}
                          onValueChange={(val) => {
                            setRowsPerPage(Number(val));
                            setPage(1); // reset về trang 1 khi đổi size
                          }}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue/>
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 20, 50].map((size) => (
                              <SelectItem key={size} value={size.toString()}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 1}
                          onClick={() => setPage((p) => p - 1)}
                        >
                          ‹
                        </Button>
                        <span className="text-sm">
                          Page {page} of {totalPages || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === totalPages || totalPages === 0}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          ›
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </main>
      </div>

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
              className="bg-blue-600 text-white hover:bg-blue-700"
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
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-800">
              Edit Workspace
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Workspace Name
              </label>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenEditWs(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleEditWorkspace}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={openNewFolder} onOpenChange={setOpenNewFolder}>
        <DialogContent
          className="bg-white text-slate-800 sm:max-w-md shadow-xl rounded-xl border-0"
        >
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {editingFolderId ? "Edit Folder" : "New Folder"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Folder Name */}
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-sm font-medium text-gray-700">
                Name
              </Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim() && !isCreatingFolder) {
                    e.preventDefault();
                    if (hasChanges()) {
                      handleCreateFolder();
                    } else {
                      // No changes, just close dialog
                      setOpenNewFolder(false);
                      setNewFolderName("");
                      setNewFolderDesc("");
                      setEditingFolderId(null);
                    }
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setOpenNewFolder(false);
                    setNewFolderName("");
                    setNewFolderDesc("");
                    setEditingFolderId(null);
                  }
                }}
              />
            </div>

            {/* Folder Mode */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Folder Mode</Label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="folderMode"
                    value="public"
                    checked={newFolderMode === "public"}
                    onChange={() => setNewFolderMode("public")}
                    className="accent-blue-600"
                  />
                  <span>Public</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="folderMode"
                    value="private"
                    checked={newFolderMode === "private"}
                    onChange={() => setNewFolderMode("private")}
                    className="accent-blue-600"
                  />
                  <span>Private</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setOpenNewFolder(false);
                setNewFolderName("");
                setNewFolderDesc("");
                setNewFolderMode("");
                setEditingFolderId(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || !hasChanges() || isCreatingFolder}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              {isCreatingFolder
                ? (editingFolderId ? "Updating..." : "Creating...")
                : (editingFolderId ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Workspace */}
      <Dialog
        open={!!confirmDeleteWs}
        onOpenChange={() => setConfirmDeleteWs(null)}
      >
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this workspace and all its projects?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteWs(null)}
            >
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

      {/* Delete Folder Dialog */}
      <Dialog open={openDeleteFolder} onOpenChange={setOpenDeleteFolder}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-xl rounded-xl border-0">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Delete Folder
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this folder and all its endpoints? This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="pt-4 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setOpenDeleteFolder(false);
                setDeleteFolderId(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteFolder}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}