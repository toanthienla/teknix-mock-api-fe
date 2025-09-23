import React, {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import {Input} from "@/components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { Textarea } from "@/components/ui/textarea";
import EndpointCard from "@/components/EndpointCard.jsx";
import Topbar from "@/components/Topbar.jsx";
import {toast} from "react-toastify";
import createIcon from "@/assets/create.svg";
import pathIcon from "@/assets/path.svg";
import methodIcon from "@/assets/method.svg";
import timeIcon from "@/assets/time&date.svg";
import LogCard from "@/components/LogCard.jsx";
import exportIcon from "@/assets/export.svg";
import refreshIcon from "@/assets/refresh.svg";

export default function Dashboard() {
  const navigate = useNavigate();
  const {projectId} = useParams();
  const [activeTab, setActiveTab] = useState("endpoints");

  const [logs, setLogs] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allEndpoints, setAllEndpoints] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  // const [endpointResponse, setEndpointResponse] = useState(null);

  const [currentWsId, setCurrentWsId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("Recently created");

  const [openProjectsMap, setOpenProjectsMap] = useState(
    () => JSON.parse(localStorage.getItem("openProjectsMap")) || {}
  );
  const [openEndpointsMap, setOpenEndpointsMap] = useState(
    () => JSON.parse(localStorage.getItem("openEndpointsMap")) || {}
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("isSidebarCollapsed")) ?? false
  );
  const [openNewProject, setOpenNewProject] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [targetWsId, setTargetWsId] = useState(null);

  const [openEditWs, setOpenEditWs] = useState(false);
  const [confirmDeleteWs, setConfirmDeleteWs] = useState(null);
  const [editWsId, setEditWsId] = useState(null);
  const [editWsName, setEditWsName] = useState("");

  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [timeFilter, setTimeFilter] = useState("All time");

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

  // edit endpoint state
  const [editId, setEditId] = useState(null);
  const [editEName, setEditEName] = useState("");
  const [editEPath, setEditEPath] = useState("");
  const [editEMethod, setEditEMethod] = useState("");

  // dialogs
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // state cho pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Regex to check route + query
  const validPath =
    /^\/[a-zA-Z0-9\-_]*(\/[a-zA-Z0-9\-_]*)*(\/:[a-zA-Z0-9\-_]+)*(?:\?[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+(?:&[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+)*)?$/;
  const validName = /^[A-Za-z_][A-Za-z0-9_-]*(?: [A-Za-z0-9_-]+)*$/;

  // Validation for creating an endpoint
  const validateCreateEndpoint = (name, path, method) => {
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
        String(ep.project_id) === String(projectId) &&
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
    const duplicateEndpoint = endpoints.some(
      (ep) =>
        String(ep.project_id) === String(projectId) &&
        ep.path.trim() === path.trim() &&
        ep.method.toUpperCase() === method.toUpperCase()
    );
    if (duplicateEndpoint) {
      toast.warning(
        `Endpoint with method ${method.toUpperCase()} and path "${path}" already exists`
      );
      return false;
    }

    if (!method) {
      toast.info("Method is required");
      return false;
    }

    return true;
  };

  // Validate for edit (note: exclude editing endpoint)
  const validateEditEndpoint = (id, name, path, method) => {
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
        String(ep.project_id) === String(projectId) &&
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

    const duplicateEndpoint = endpoints.some(
      (ep) =>
        ep.id !== id &&
        String(ep.project_id) === String(projectId) &&
        ep.path.trim() === path.trim() &&
        ep.method.toUpperCase() === method.toUpperCase()
    );
    if (duplicateEndpoint) {
      toast.warning(
        `Endpoint with method ${method.toUpperCase()} and path "${path}" already exists`
      );
      return false;
    }

    if (!method) {
      toast.info("Method is required");
      return false;
    }

    return true;
  };

  // fetch workspaces + projects + endpoints
  useEffect(() => {
    fetchWorkspaces();
    fetchProjects();
    fetchAllEndpoints();
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchEndpoints(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    localStorage.setItem("openProjectsMap", JSON.stringify(openProjectsMap));
  }, [openProjectsMap]);

  useEffect(() => {
    localStorage.setItem("openEndpointsMap", JSON.stringify(openEndpointsMap));
  }, [openEndpointsMap]);

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
    fetch(`${API_ROOT}/workspaces`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        setWorkspaces(sorted);
        if (sorted.length > 0 && !currentWsId) setCurrentWsId(sorted[0].id);
      })
      .catch(() =>
        toast.error("Failed to load workspaces", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
        })
      );
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

  const fetchAllEndpoints = () => {
    fetch(`${API_ROOT}/endpoints`)
      .then((res) => res.json())
      .then((data) => setAllEndpoints(data))
      .catch((err) => console.error("Error fetching all endpoints:", err));
  };

  const fetchEndpoints = (pid) => {
    if (!pid) return;
    fetch(`${API_ROOT}/endpoints?project_id=${pid}`)
      .then((res) => res.json())
      .then((data) => setEndpoints(data))
      .catch((err) => console.error("Error fetching endpoints:", err));
  };

  // const fetchEndpointsResponses = (eid) => {
  //   if (!eid) return;
  //   fetch(`${API_ROOT}/endpoint_responses/${eid}`)
  //     .then((res) => res.json())
  //     .then((data) => setEndpoints(data))
  //     .catch((err) => console.error("Error fetching endpoints:", err));
  // };

  const fetchLogs = (pid) => {
    if (!pid) return;
    fetch(`${API_ROOT}/project_request_logs?project_id=${pid}`)
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error("Error fetching logs:", err));
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
  const filteredEndpoints = endpoints.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
       workspace_id: targetWsId || currentWsId, // ưu tiên workspace được chọn
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

  // create endpoint
  const handleCreateEndpoint = () => {
    if (!validateCreateEndpoint(newEName, newEPath, newEMethod)) {
      return;
    }

    const maxId =
      allEndpoints.length > 0
        ? Math.max(...allEndpoints.map((ep) => Number(ep.id)))
        : 0;
    const newId = (maxId + 1).toString();

    const newEndpoint = {
      id: newId,
      name: newEName,
      path: newEPath,
      method: newEMethod,
      project_id: String(projectId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    fetch(`${API_ROOT}/endpoints`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newEndpoint),
    })
      .then((res) => res.json())
      .then((createdEndpoint) => {
        setEndpoints((prev) => [...prev, createdEndpoint]);
        setOpenProjectsMap((prev) => ({...prev, [currentWsId]: true}));
        setNewEName("");
        setNewEPath("");
        setNewEMethod("");
        setOpenNew(false);

        fetchAllEndpoints();
        toast.success("Create endpoint successfully!");
      })
      .catch((error) => {
        console.error("Error creating endpoint:", error);
        toast.error("Failed to create endpoint!");
      });
  };

  // edit endpoint
  const openEditEndpoint = (p) => {
    setEditId(p.id);
    setEditEName(p.name);
    setEditEPath(p.path);
    setEditEMethod(p.method || "GET");
    setOpenEdit(true);
  };

  const handleUpdateEndpoint = () => {
    if (!validateEditEndpoint(editId, editEName, editEPath, editEMethod)) {
      return;
    }

    fetch(`${API_ROOT}/endpoints/${editId}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        id: editId,
        name: editEName,
        path: editEPath,
        method: editEMethod,
        project_id: Number(projectId),
        updated_at: new Date().toISOString(),
      }),
    })
      .then(() => {
        setEndpoints((prev) =>
          prev.map((ep) =>
            ep.id === editId
              ? {...ep, name: editEName, path: editEPath, method: editEMethod}
              : ep
          )
        );
        setOpenEdit(false);

        toast.success("Update endpoint successfully!");
      })
      .catch((error) => {
        console.error("Error updating endpoint:", error.message);
        toast.error("Failed to update endpoint!");
      });
  };

  // delete endpoint
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
            endpoints={allEndpoints}
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
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            onAddProject={(workspaceId) => {
    setTargetWsId(workspaceId); // lưu workspace đang chọn
    setOpenNewProject(true);    // mở modal tạo project
  }}
          />
        </aside>

        {/* Main Content */}
        <main
          className="pt-8 flex-1 transition-all duration-300"
        >
          {/* Top Navbar */}
          <Topbar
            breadcrumb={
              currentWorkspace
                ? currentProject
                  ? [
                    {
                      label: currentWorkspace.name,
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
                      href: "/dashboard",
                    },
                  ]
                : []
            }
            onSearch={setSearchTerm}
            showNewProjectButton={false}
            showNewResponseButton={false}
          />

          {/* Content Area */}
          <div
            className={`transition-all duration-300 px-8 pt-4 pb-8
            ${isSidebarCollapsed ? "w-[calc(100%+16rem)] -translate-x-64" : "w-full"
            }`}
          >
            <div className="flex flex-col">
              <div className="flex border-b border-gray-200 mb-4 text-stone-500">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("endpoints")}
                  className={`rounded-none px-4 py-2 -mb-px ${activeTab === "endpoints"
                    ? "border-b-2 border-stone-900 text-stone-900"
                    : ""
                  }`}
                >
                  Endpoints
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setActiveTab("logs");
                    fetchLogs(projectId);
                  }}
                  className={`rounded-none px-4 py-2 -mb-px ${activeTab === "logs"
                    ? "border-b-2 border-stone-900 text-stone-900"
                    : ""
                  }`}
                >
                  Logs
                </Button>
              </div>

              {activeTab === "endpoints" ? (
                <>
                  {/* View all Endpoints */}
                  <div className="mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {sortedEndpoints.length} Endpoints
                      </h2>

                      {/* Filter + Sort + New Endpoint */}
                      <div className="ml-auto flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-gray-100"
                            >
                              All <ChevronDown className="w-4 h-4"/>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>All</DropdownMenuItem>
                            <DropdownMenuItem>Active</DropdownMenuItem>
                            <DropdownMenuItem>Inactive</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

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
                            <DropdownMenuItem
                              onClick={() => setSortOption("Recently created")}
                            >
                              Recently created
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSortOption("Oldest first")}
                            >
                              Oldest first
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSortOption("Alphabetical (A-Z)")}
                            >
                              Alphabetical (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSortOption("Alphabetical (Z-A)")}
                            >
                              Alphabetical (Z-A)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* New Endpoint Button + Dialog */}
                        <Dialog open={openNew} onOpenChange={setOpenNew}>
                          <Button
                            onClick={() => setOpenNew(true)}
                            className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 rounded-md"
                          >
                            <img
                              src={createIcon}
                              alt="Create Icon"
                              className="w-4 h-4 object-contain"
                            />
                            New Endpoint
                          </Button>
                          <DialogContent
                            className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleCreateEndpoint();
                              }
                            }}
                          >
                            <DialogHeader>
                              <DialogTitle>New Endpoint</DialogTitle>
                              <DialogDescription>
                                Fill in details to create a new endpoint.
                              </DialogDescription>
                            </DialogHeader>

                            <h3 className="text-sm font-semibold text-slate-700 mt-2">
                              Endpoint Detail
                            </h3>
                            <div className="mt-2 space-y-4">
                              <h3 className="text-sm font-semibold text-slate-700 mt-2">
                                Name
                              </h3>
                              <Input
                                placeholder=" Enter Endpoint Name"
                                value={newEName}
                                onChange={(e) => setNewEName(e.target.value)}
                              />

                              <h3 className="text-sm font-semibold text-slate-700 mt-2">
                                Path
                              </h3>
                              <Input
                                placeholder="/example/path/:number"
                                value={newEPath}
                                onChange={(e) => setNewEPath(e.target.value)}
                              />

                              <h3 className="text-sm font-semibold text-slate-700 mt-2">
                                Method
                              </h3>
                              <Select
                                value={newEMethod}
                                onValueChange={setNewEMethod}
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

                            <DialogFooter>
                              <Button
                                className="text-black hover:text-red-600"
                                variant="outline"
                                onClick={() => setOpenNew(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={handleCreateEndpoint}
                              >
                                Create
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>

                  {/* Endpoint Table */}
                  <div className="w-full overflow-x-auto">
                    <Table className="border-t border-b border-gray-300">
                      <TableHeader>
                        <TableRow className="border-b border-gray-300">
                          <TableHead className="w-1/3 border-r border-gray-300">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">Aa</span>
                            </div>
                          </TableHead>
                          <TableHead className="w-1/3 border-r border-gray-300">
                            <div className="flex items-center gap-2">
                              <img src={pathIcon} alt="Path icon" className="w-4 h-4"/>
                              <span>Path</span>
                            </div>
                          </TableHead>
                          <TableHead className="w-1/6 border-r border-gray-300 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <img src={methodIcon} alt="Method icon"
                                   className="w-4 h-4"/>
                              <span>Method</span>
                            </div>
                          </TableHead>
                          <TableHead className="w-1/6">
                            <div className="flex items-center gap-2">
                              <img src={timeIcon} alt="Time icon" className="w-4 h-4"/>
                              <span>Time & Date</span>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {sortedEndpoints?.length > 0 ? (
                          sortedEndpoints.map((e) => (
                            <EndpointCard
                              key={e.id}
                              endpoint={e}
                              onEdit={() => openEditEndpoint(e)}
                              onDelete={() => handleDeleteEndpoint(e.id)}
                              onClick={() =>
                                navigate(`/dashboard/${projectId}/endpoint/${e.id}`)
                              }
                            />
                          ))
                        ) : (
                          <TableRow>
                            <TableHead
                              colSpan={4}
                              className="text-center text-slate-500 py-4"
                            >
                              No endpoints found.
                            </TableHead>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Edit Endpoint Dialog */}
                  <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                    <DialogContent
                      className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleUpdateEndpoint();
                        }
                      }}
                    >
                      <DialogHeader>
                        <DialogTitle>Edit Endpoint</DialogTitle>
                      </DialogHeader>
                      <h3 className="text-sm font-semibold text-slate-700 mt-2">
                        Endpoint Detail
                      </h3>
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 mt-2">
                          Name
                        </h3>
                        <Input
                          placeholder=" Enter Endpoint Name"
                          value={editEName}
                          onChange={(e) => setEditEName(e.target.value)}
                        />
                        <h3 className="text-sm font-semibold text-slate-700 mt-2">
                          Path
                        </h3>
                        <Input
                          placeholder="/example/path/:number"
                          value={editEPath}
                          onChange={(e) => setEditEPath(e.target.value)}
                        />

                        <h3 className="text-sm font-semibold text-slate-700 mt-2">
                          Method
                        </h3>
                        <Select value={editEMethod} onValueChange={setEditEMethod}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a method"/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Method</SelectLabel>
                              <SelectItem value="GET">GET</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                              <SelectItem value="POST">POST</SelectItem>
                              <SelectItem value="DELETE">DELETE</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
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
                          className="bg-blue-600 text-white hover:bg-blue-700"
                          onClick={handleUpdateEndpoint}
                        >
                          Update
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              ) : activeTab === "logs" ? (
                <> {/* Logs */}
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
                        <Button variant="outline" onClick={fetchLogs}>
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

                <DialogFooter className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setOpenNewProject(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleCreateProject}
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
    </div>
  );
}