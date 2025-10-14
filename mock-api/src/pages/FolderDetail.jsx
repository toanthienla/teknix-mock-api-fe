import React, {useEffect, useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {ChevronDown, ChevronsUpDown} from "lucide-react";
import Sidebar from "@/components/Sidebar.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {API_ROOT} from "@/utils/constants.js";
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Label} from "@/components/ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import {Textarea} from "@/components/ui/textarea";
import EndpointCard from "@/components/EndpointCard.jsx";
import Topbar from "@/components/Topbar.jsx";
import {toast} from "react-toastify";
import createIcon from "@/assets/create.svg";
import pathIcon from "@/assets/path.svg";
import methodIcon from "@/assets/method.svg";
import timeIcon from "@/assets/time&date.svg";
import statusIcon from "@/assets/status.svg";
import actionsIcon from "@/assets/actions.svg";
import {getCurrentUser} from "@/services/api.js";
import webBg from "@/assets/dot_web.svg";
import tiktokIcon from "@/assets/tiktok.svg";
import fbIcon from "@/assets/facebook.svg";
import linkedinIcon from "@/assets/linkedin.svg";

export default function Dashboard() {
  const navigate = useNavigate();
  const {projectId, folderId} = useParams();

  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentWsId, setCurrentWsId] = useState(
    () => localStorage.getItem("currentWorkspace") || null
  );

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
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [targetWsId, setTargetWsId] = useState(null);
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
  const [newFolderMode, setNewFolderMode] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [deleteFolderId, setDeleteFolderId] = useState(null);
  const [openDeleteFolder, setOpenDeleteFolder] = useState(false);

  const currentProject = projectId
    ? projects.find((p) => String(p.id) === String(projectId))
    : null;

  const currentWorkspace = workspaces.find(
    (w) => String(w.id) === String(currentWsId)
  );

  // new endpoint state
  const [newEName, setNewEName] = useState("");
  const [newEPath, setNewEPath] = useState("");
  const [newEMethod, setNewEMethod] = useState("");
  const [newEFolderId, setNewEFolderId] = useState(folderId || "");
  const [newEType, setNewEType] = useState(false); // false = stateless, true = stateful
  const [statusFilter, setStatusFilter] = useState("All");

  // edit endpoint state
  const [editId, setEditId] = useState(null);
  const [editEName, setEditEName] = useState("");
  const [editEPath, setEditEPath] = useState("");
  const [editEFolderId, setEditEFolderId] = useState(folderId || "");
  const [editEMethod, setEditEMethod] = useState("");

  // dialogs
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

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

  // Regex
  const validPath =
    /^\/[a-zA-Z0-9\-_]+(\/[a-zA-Z0-9\-_]*)*(\/:[a-zA-Z0-9\-_]+)*(?:\?[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+(?:&[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+)*)?$/;
  const validName = /^[A-Za-z_][A-Za-z0-9_-]*(?: [A-Za-z0-9_-]+)*$/;

  // validation helpers (unchanged)...
  const validateCreateEndpoint = (name, path, method, type) => {
    if (!name.trim()) {
      toast.info("Name is required");
      return false;
    }
    if (name.trim().length > 20) {
      toast.info("Name must be less than 20 characters");
      return false;
    }
    if (!validName.test(name)) {
      toast.info(
        "Name must start with a letter and contain only letters, numbers, a space, underscores and dashes"
      );
      return false;
    }
    const duplicateName = endpoints.some(
      (ep) =>
        String(ep.folder_id) === String(folderId) &&
        ep.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicateName) {
      toast.warning("Name already exists");
      return false;
    }

    if (!path.trim()) {
      toast.info("Path is required");
      return false;
    }
    if (!path.startsWith("/")) {
      toast.info("Path must start with '/'");
      return false;
    }
    if (path.length > 1 && path.endsWith("/")) {
      toast.info("Path must not end with '/'");
      return false;
    }
    if (!validPath.test(path.trim())) {
      toast.info("Path format is invalid. Example: /users/:id or /users?id=2");
      return false;
    }

    if (!type) {
      const duplicateEndpoint = endpoints.some(
        (ep) =>
          String(ep.folder_id) === String(folderId) &&
          ep.path.trim() === path.trim() &&
          ep.method.toUpperCase() === method.toUpperCase()
      );
      if (duplicateEndpoint) {
        toast.warning(
          `Endpoint with method ${method.toUpperCase()} and path "${path}" already exists`
        );
        return false;
      }
    }

    if (!method) {
      toast.info("Method is required");
      return false;
    }

    return true;
  };

  const validateEditEndpoint = (id, name) => {
    if (!name.trim()) {
      toast.info("Name is required");
      return false;
    }
    if (name.trim().length > 20) {
      toast.info("Name must be less than 20 characters");
      return false;
    }
    if (!validName.test(name.trim())) {
      toast.info(
        "Name must start with a letter and contain only letters, numbers, spaces, underscores and dashes"
      );
      return false;
    }
    const duplicateName = endpoints.find(
      (ep) =>
        ep.id !== id &&
        String(ep.folder_id) === String(folderId) &&
        ep.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicateName) {
      toast.warning("Name already exists");
      return false;
    }

    return true;
  };

  // fetch workspaces + projects + endpoints + stateful_endpoints
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        fetchWorkspaces();
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

  const fetchProjects = async (wsId) => {
    if (!wsId) return;

    try {
      const res = await fetch(`${API_ROOT}/projects?workspace_id=${wsId}`);
      const rData = await res.json();
      const projectsArr = Array.isArray(rData) ? rData : rData.data || [];
      setProjects(projectsArr);

      // reset trước khi nạp mới
      setFolders([]);
      setEndpoints([]);

      // tạo mảng tạm để gom toàn bộ dữ liệu
      const allFolders = [];
      const allEndpoints = [];

      for (const p of projectsArr) {
        const fRes = await fetch(`${API_ROOT}/folders?project_id=${p.id}`);
        const fData = await fRes.json();
        const fArr = Array.isArray(fData) ? fData : fData.data || [];

        // gom folder
        fArr.forEach(f => {
          if (!allFolders.some(ff => ff.id === f.id)) {
            allFolders.push(f);
          }
        });

        // gom endpoint của từng folder
        for (const f of fArr) {
          const eRes = await fetch(`${API_ROOT}/endpoints?folder_id=${f.id}`);
          const eData = await eRes.json();
          const eArr = Array.isArray(eData) ? eData : eData.data || [];

          eArr.forEach(e => {
            if (!allEndpoints.some(ee => ee.id === e.id)) {
              allEndpoints.push({...e, project_id: f.project_id});
            }
          });
        }
      }

      // set 1 lần duy nhất để tránh mất dữ liệu
      setFolders(allFolders);
      setEndpoints(allEndpoints);
    } catch (error) {
      console.error(`Failed to fetch projects or nested data:`, error);
    }
  };


  // -------------------- Folder helpers (unchanged) --------------------
  const handleAddFolder = (targetProjectId = null) => {
    setTargetProjectId(targetProjectId || projectId);
    setOpenNewFolder(true);
  };

  const handleEditFolder = (folder) => {
    setNewFolderName(folder.name);
    setNewFolderDesc(folder.description || "");
    setEditingFolderId(folder.id);
    setOpenNewFolder(true);
  };

  const handleDeleteFolder = async (folderIdParam) => {
    setDeleteFolderId(folderIdParam);
    setOpenDeleteFolder(true);
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolderId) return;

    try {
      const endpointsRes = await fetch(`${API_ROOT}/endpoints`);
      const allEndpoints = await endpointsRes.json();
      const endpointsToDelete = allEndpoints.filter(e => String(e.folder_id) === String(deleteFolderId));

      await Promise.all(
        endpointsToDelete.map(e =>
          fetch(`${API_ROOT}/endpoints/${e.id}`, {method: "DELETE"})
        )
      );

      await fetch(`${API_ROOT}/folders/${deleteFolderId}`, {method: "DELETE"});

      setFolders(prev => prev.filter(f => f.id !== deleteFolderId));

      toast.dismiss();
      toast.success(`Folder and its ${endpointsToDelete.length} endpoints deleted successfully`);

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
    if (!editingFolderId) return true;
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

  // -------------------- Workspace (unchanged) --------------------
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
        "Only letters, numbers, and spaces allowed (no special characters)");
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
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newProject),
    })
      .then((res) => res.json())
      .then((createdProject) => {
        setProjects((prev) => [...prev, createdProject]);

        setCurrentWsId(createdProject.workspace_id);
        localStorage.setItem("currentWorkspace", createdProject.workspace_id);

        setOpenProjectsMap((prev) => ({
          ...prev,
          [createdProject.workspace_id]: true,
        }));

        setNewTitle("");
        setNewDesc("");
        setTargetWsId(null);
        setOpenNewProject(false);
        toast.success("Project created successfully");
      })
      .catch(() => toast.error("Failed to create project"));
  };

  // Create endpoint
  const handleCreateEndpoint = async () => {
    if (!validateCreateEndpoint(newEName, newEPath, newEMethod)) return;
    try {
      const newEndpoint = {
        name: newEName.trim(),
        path: newEPath.trim(),
        method: newEMethod,
        folder_id: Number(newEFolderId),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const res = await fetch(`${API_ROOT}/endpoints`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newEndpoint),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setEndpoints(prev => [...prev, created]);
      setOpenNew(false);
      toast.success("Endpoint created!");
    } catch {
      toast.error("Failed to create endpoint");
    }
  };

  // edit endpoint
  const [currentEndpoint, setCurrentEndpoint] = useState(null);
  const openEditEndpoint = (e) => {
    setEditId(e.id);
    setEditEName(e.name);
    setEditEPath(e.path);
    setEditEFolderId(e.folder_id);
    setEditEMethod(e.method);

    setCurrentEndpoint(e);
    setOpenEdit(true);
  };

  const hasEdited = useMemo(() => {
    if (!currentEndpoint) return false;
    return (
      editEName !== currentEndpoint.name ||
      editEFolderId !== currentEndpoint.folder_id ||
      editEPath !== currentEndpoint.path ||
      editEMethod !== currentEndpoint.method
    );
  }, [editEName, editEFolderId, editEPath, editEMethod, currentEndpoint]);

  const handleUpdateEndpoint = () => {
    if (!validateEditEndpoint(editId, editEName, editEPath, editEMethod)) return;
    const updated = {
      id: editId,
      name: editEName,
      path: editEPath,
      method: editEMethod,
      folder_id: Number(editEFolderId),
      updated_at: new Date().toISOString(),
    };

    fetch(`${API_ROOT}/endpoints/${editId}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(updated),
    })
      .then(() => {
        // Cập nhật danh sách endpoints trong bảng
        setEndpoints((prev) =>
          prev.map((ep) => (ep.id === editId ? {...ep, ...updated} : ep))
        );

        // Cập nhật danh sách allEndpoints để Sidebar nhận đúng folder mới
        setEndpoints((prev) =>
          prev.map((ep) => (ep.id === editId ? {...ep, ...updated} : ep))
        );

        setOpenEdit(false);
        toast.success("Update endpoint successfully!");
      })
      .catch(() => toast.error("Failed to update endpoint!"));
  };

  // delete endpoint stateless
  const handleDeleteEndpoint = (id) => {
    fetch(`${API_ROOT}/endpoints/${id}`, {method: "DELETE"})
      .then(() => {
        setEndpoints((prev) => prev.filter((e) => e.id !== id));
        toast.success("Delete endpoint successfully!");
      })
      .catch((error) => {
        console.error("Error deleting endpoint:", error.message);
        toast.error("Failed to delete endpoint!");
      });
  };

  // Filter + sort
  let filtered = endpoints.filter(e =>
    String(e.folder_id) === String(folderId) &&
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (statusFilter !== "All") {
    filtered = filtered.filter(e =>
      statusFilter === "Active" ? e.is_active : !e.is_active
    );
  }

  let sorted = [...filtered];
  if (sortOption === "Recently created") {
    sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortOption === "Oldest first") {
    sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sortOption === "Alphabetical (A-Z)") {
    sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (sortOption === "Alphabetical (Z-A)") {
    sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
  }

  // Get current folder info
  const currentFolder = folderId ? folders.find(f => String(f.id) === String(folderId)) : null;

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
            onAddProject={(workspaceId) => {
              setTargetWsId(workspaceId);
              setOpenNewProject(true);
            }}
            onAddFolder={handleAddFolder}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            setOpenNewWs={setOpenNewWs}
            username={currentUsername}
          />
        </aside>

        {/* Main Content */}
        <main
          className="pt-8 flex-1 transition-all duration-300 relative"
          style={{
            backgroundImage: `url(${webBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <Topbar
            breadcrumb={
              currentWorkspace
                ? currentProject
                  ? currentFolder
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
                      {
                        label: currentFolder.name,
                        href: `/dashboard/${currentProject.id}?folderId=${currentFolder.id}`,
                      },
                    ]
                    : [
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
            showActiveEndpoint={true}
            showSettingsButton={true}
            activeEndpointCount={filtered.filter(e => e.is_active).length}
            currentFolder={currentFolder} // 👈 thêm dòng này để Topbar nhận folder hiện tại
          />

          <div
            className={`transition-all duration-300 px-8 pt-4 pb-8
            ${isSidebarCollapsed ? "w-[calc(100%+16rem)] -translate-x-64" : "w-full"
            }`}
          >
            <div className="flex flex-col">
              {/* Bảng endpoints chung */}
              <div className="mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {currentWorkspace ? (
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {currentWorkspace.name}
                      {currentProject && <> {" - "}{currentProject.name}</>}
                      {currentFolder && <> {" / "}{currentFolder.name}</>}
                      {" - "}
                      {sorted.length} Endpoints
                    </h2>
                  ) : (
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Loading...</h2>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    {/* Status filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-gray-100"
                        >
                          {statusFilter === "All" ? "All" : `${statusFilter}`} <ChevronDown className="w-4 h-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setStatusFilter("All")}>All</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("Active")}>Active</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>Inactive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-gray-100"
                        >
                          {sortOption} <ChevronsUpDown className="w-4 h-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSortOption("Recently created")}>Recently
                          created</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortOption("Oldest first")}>Oldest first</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortOption("Alphabetical (A-Z)")}>Alphabetical
                          (A-Z)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortOption("Alphabetical (Z-A)")}>Alphabetical
                          (Z-A)</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* New Endpoint */}
                    <Button
                      onClick={() => {
                        setNewEType(false);
                        setNewEFolderId(folderId || "");
                        setNewEName("");
                        setNewEPath("");
                        setNewEMethod("");
                        setOpenNew(true);
                      }}
                      className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950 px-3 py-1 rounded-md"
                    >
                      <img src={createIcon} alt="Create Icon" className="w-4 h-4 object-contain brightness-0"/>
                      New Endpoint
                    </Button>
                  </div>
                </div>
              </div>

              {/* Endpoint Table */}
              <div className="w-full overflow-x-auto">
                <Table className="border-t border-b border-gray-300">
                  <TableHeader>
                    <TableRow className="border-b border-gray-300">
                      <TableHead className="w-1/4 border-r border-gray-300">
                        <span>Aa</span>
                      </TableHead>
                      <TableHead className="w-1/4 border-r border-gray-300">
                        <div className="flex items-center gap-2">
                          <img src={pathIcon} alt="Path icon" className="w-4 h-4"/>
                          <span>Path</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-1/12 border-r border-gray-300 text-center">
                        <div className="flex items-center gap-2">
                          <img src={methodIcon} alt="Method icon" className="w-4 h-4"/>
                          <span>Method</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-1/4 border-r border-gray-300">
                        <div className="flex items-center gap-2">
                          <img src={timeIcon} alt="Time & Date icon" className="w-4 h-4"/>
                          <span>Time & Date</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-1/12 border-r border-gray-300 text-center">
                        <div className="flex items-center gap-2">
                          <img src={statusIcon} alt="Status icon" className="w-4 h-4"/>
                          <span>Status</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-1/12 text-center">
                        <div className="flex items-center gap-2">
                          <img src={actionsIcon} alt="Actions icon" className="w-4 h-4"/>
                          <span>Actions</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.length > 0 ? (
                      sorted.map((e) => (
                        <EndpointCard
                          key={e.id}
                          endpoint={e}
                          onEdit={() => openEditEndpoint(e)}
                          onDelete={() => handleDeleteEndpoint(e.id)}
                          onClick={() => navigate(`/dashboard/${projectId}/endpoint/${e.id}`)}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableHead colSpan={6} className="text-center text-slate-500 py-4">
                          No endpoints found.
                        </TableHead>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* New Endpoint Button + Dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent
          className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // avoid Enter triggering when selecting inside selects; create explicitly on button
              e.preventDefault();
              handleCreateEndpoint();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              New Endpoint
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">Endpoint details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Name</h3>
              <Input
                placeholder="Enter endpoint name"
                value={newEName}
                onChange={(e) => setNewEName(e.target.value)}
              />
            </div>

            {/* Folder select - only folders for current project */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Folder</h3>
              <Select value={String(newEFolderId || "")} onValueChange={(v) => setNewEFolderId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Folders</SelectLabel>
                    {folders
                      .filter((f) => String(f.project_id) === String(projectId))
                      .map((f) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Path */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Path</h3>
              <Input
                placeholder="/examples/example/:id"
                value={newEPath}
                onChange={(e) => setNewEPath(e.target.value)}
              />
            </div>

            {/* Method */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Method</h3>
              <Select
                value={newEMethod}
                onValueChange={(v) => setNewEMethod(v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a method"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Method</SelectLabel>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              className="text-black hover:text-red-600"
              variant="outline"
              onClick={() => {
                setOpenNew(false);
                setNewEName("");
                setNewEPath("");
                setNewEMethod("");
                setNewEFolderId(folderId || "");
                setNewEType(false);
              }}
            >
              Cancel
            </Button>

            <Button
              className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
              onClick={handleCreateEndpoint}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Endpoint Dialog (unchanged) */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter" && hasEdited) {
              e.preventDefault();
              handleUpdateEndpoint();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Endpoint</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-slate-800">Endpoint details</DialogDescription>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Name</h3>
              <Input
                placeholder="Enter endpoint name"
                value={editEName}
                onChange={(e) => setEditEName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="text-black hover:text-red-600"
              variant="outline"
              onClick={() => setOpenEdit(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEndpoint}
              className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
              disabled={!hasEdited}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Project Dialog */}
      <Dialog open={openNewProject} onOpenChange={setOpenNewProject}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">New Project</DialogTitle>
            <div className="mt-1 text-sm text-slate-500">Project details</div>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
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
              <p className="text-xs text-slate-400 text-right mt-1">{newDesc.length}/200</p>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setOpenNewProject(false)}>Cancel</Button>
            <Button
              className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
              onClick={handleCreateProject}
            >
              Create
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
              className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
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
            <Button type="button" className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
                    onClick={handleEditWorkspace}>Update</Button>
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
                setEditingFolderId(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || !hasChanges() || isCreatingFolder}
              className="px-4 py-2  bg-yellow-300 hover:bg-yellow-400 text-indigo-950 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              {isCreatingFolder ? (editingFolderId ? "Updating..." : "Creating...") : (editingFolderId ? "Update" : "Create")}
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
          <p>Are you sure you want to delete this workspace and all its projects?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteWs(null)}>Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => {
              handleDeleteWorkspace(confirmDeleteWs);
              setConfirmDeleteWs(null);
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={openDeleteFolder} onOpenChange={setOpenDeleteFolder}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-xl rounded-xl border-0">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-semibold text-gray-900">Delete Folder</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm text-gray-600">Are you sure you want to delete this folder and all its endpoints? This
              action cannot be undone.</p>
          </div>

          <DialogFooter className="pt-4 flex gap-2">
            <Button variant="ghost" onClick={() => {
              setOpenDeleteFolder(false);
              setDeleteFolderId(null);
            }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">Cancel</Button>
            <Button onClick={confirmDeleteFolder}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* footer */}
      <div className="absolute left-72 bottom-4 text-xs font-semibold text-gray-700">
        © Teknik Corp. All rights reserved.
      </div>

      <div className="absolute right-6 bottom-4 flex items-center gap-3 text-xs text-gray-700">
        <img src={tiktokIcon} alt="tiktok" className="w-4 h-4" />
        <img src={fbIcon} alt="facebook" className="w-4 h-4" />
        <img src={linkedinIcon} alt="linkedin" className="w-4 h-4" />
        <a className="hover:underline font-semibold" href="">About</a>
        <span>·</span>
        <a className="hover:underline font-semibold" href="">Support</a>
      </div>
    </div>
  );
}
