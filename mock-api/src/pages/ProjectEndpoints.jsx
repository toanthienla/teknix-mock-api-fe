import React, {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    ChevronDown,
    ChevronsUpDown, Search,
} from 'lucide-react';
import Sidebar from "@/components/Sidebar.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {API_ROOT} from "@/utils/constants.js";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.jsx";
import {Input} from "@/components/ui/input.jsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.jsx"

import EndpointCard from "@/components/EndpointCard.jsx";
import {toast} from 'react-toastify';
import createIcon from "@/assets/create.svg";
import pathIcon from "@/assets/path.svg";
import methodIcon from "@/assets/method.svg"
import timeIcon from "@/assets/time&date.svg"
import LogCard from "@/components/LogCard.jsx";
import exportIcon from "@/assets/export.svg"
import refreshIcon from "@/assets/refresh.svg"

export default function Dashboard() {
    const navigate = useNavigate()
    const {projectId} = useParams()
    const [activeTab, setActiveTab] = useState("endpoints")
    const [logs, setLogs] = useState([])

    const [workspaces, setWorkspaces] = useState([])
    const [projects, setProjects] = useState([])
    const [allEndpoints, setAllEndpoints] = useState([])
    const [endpoints, setEndpoints] = useState([])
    const [currentWsId, setCurrentWsId] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortOption, setSortOption] = useState("Recently created")
    const [openProjectsMap, setOpenProjectsMap] = useState({}) // track open workspace project lists
    const [openEndpointsMap, setOpenEndpointsMap] = useState({});

    const [openEditWs, setOpenEditWs] = useState(false);
    const [confirmDeleteWs, setConfirmDeleteWs] = useState(null);
    const [editWsId, setEditWsId] = useState(null);
    const [editWsName, setEditWsName] = useState("");

    const [query, setQuery] = useState("");

    const [methodFilter, setMethodFilter] = useState("All Methods");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [timeFilter, setTimeFilter] = useState("All time");

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (setSearchTerm) setSearchTerm(value);
    };

    // new endpoint state
    const [newEName, setNewEName] = useState("")
    const [newEPath, setNewEPath] = useState("")
    const [newEMethod, setNewEMethod] = useState("")

    // edit endpoint state
    const [editId, setEditId] = useState(null)
    const [editEName, setEditEName] = useState("")
    const [editEPath, setEditEPath] = useState("")
    const [editEMethod, setEditEMethod] = useState("")

    // dialogs
    const [openNew, setOpenNew] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)

    // state cho pagination
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Regex to check route + query
    //     ^ … $                 : khớp toàn bộ chuỗi.
    //     \/                    : path bắt buộc bắt đầu bằng /.
    //     [a-zA-Z0-9\-_]*       : segment đầu tiên có thể rỗng hoặc là users, api_v1.
    //     (\/[a-zA-Z0-9\-_]*)*  : cho phép nhiều segment, ví dụ /users/profile/details.
    //     (\/:[a-zA-Z0-9\-_]+)* : cho phép parameter động, ví dụ /users/:id.
    //
    //     (?:\?[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+(?:&[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+)*)? : phần query string, ví dụ ?id=1&sort=asc.
    const validPath = /^\/[a-zA-Z0-9\-_]*(\/[a-zA-Z0-9\-_]*)*(\/:[a-zA-Z0-9\-_]+)*(?:\?[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+(?:&[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+)*)?$/;
    // Regex pattern for endpoint name
    const validName = /^[A-Za-z_][A-Za-z0-9_-]*(?: [A-Za-z0-9_-]+)*$/;

    // Validation for creating an endpoint
    const validateCreateEndpoint = (name, path, method) => {
        // Validate endpoint name
        if (!name.trim()) {
            toast.info("Name is required");
            return false;
        }
        if (name.trim().length > 20) {
            toast.info("Name must be less than 20 characters");
            return false;
        }
        if (!validName.test(name)) {
            toast.info("Name must start with a letter and contain only letters, numbers, a space, underscores and dashes");
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

        // Validate Path
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
        // Check duplicate path + method
        const duplicateEndpoint = endpoints.some(
            (ep) =>
                String(ep.project_id) === String(projectId) &&
                ep.path.trim() === path.trim() &&
                ep.method.toUpperCase() === method.toUpperCase()
        );
        if (duplicateEndpoint) {
            toast.warning(`Endpoint with method ${method.toUpperCase()} and path "${path}" already exists`);
            return false;
        }

        // Validate method
        if (!method) {
            toast.info("Method is required");
            return false;
        }

        return true;
    };

    // Validate for edit (note: exclude editing endpoint)
    const validateEditEndpoint = (id, name, path, method) => {
        // Validate endpoint name
        if (!name.trim()) {
            toast.info("Name is required");
            return false;
        }
        if (name.trim().length > 20) {
            toast.info("Name must be less than 20 characters");
            return false;
        }
        if (!validName.test(name.trim())) {
            toast.info("Name must start with a letter and contain only letters, numbers, spaces, underscores and dashes");
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

        // Validate path
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
            toast.warning(`Endpoint with method ${method.toUpperCase()} and path "${path}" already exists`);
            return false;
        }

        // Validate method
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

    const fetchLogs = () => {
        fetch(`${API_ROOT}/logs`)
            .then((res) => res.json())
            .then((data) => setLogs(data))
            .catch((err) => console.error("Error fetching logs:", err))
    }

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

    const totalPages = Math.ceil(filteredLogs.length / rowsPerPage)

    // logs hiển thị theo trang
    const paginatedLogs = filteredLogs.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    )

    // filter + sort endpoints
    const filteredEndpoints = endpoints.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // sort endpoints based on sortOption
    let sortedEndpoints = [...filteredEndpoints]

    if (sortOption === "Recently created") {
        sortedEndpoints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortOption === "Oldest first") {
        sortedEndpoints.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else if (sortOption === "Alphabetical (A-Z)") {
        sortedEndpoints.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortOption === "Alphabetical (Z-A)") {
        sortedEndpoints.sort((a, b) => b.name.localeCompare(a.name))
    }

    // -------------------- Workspace --------------------
    const validateWsName = (name, excludeId = null) => {
        const trimmed = name.trim();
        if (!trimmed) return "Workspace name cannot be empty";
        if (!/^[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9]*( [A-Za-zÀ-ỹ0-9]+)*$/.test(trimmed))
            return "Must start with a letter, no special chars, single spaces allowed";
        if (trimmed.length > 20) return "Workspace name max 20 chars";
        if (workspaces.some((w) => w.name.toLowerCase() === trimmed.toLowerCase() && w.id !== excludeId))
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
            body: JSON.stringify({name: editWsName.trim(), updated_at: new Date().toISOString()}),
        })
            .then(() => {
                setWorkspaces((prev) =>
                    prev.map((w) => (w.id === editWsId ? {...w, name: editWsName.trim()} : w))
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
            const projectsToDelete = allProjects.filter(p => p.workspace_id === id);

            await Promise.all(
                projectsToDelete.map(p => fetch(`${API_ROOT}/projects/${p.id}`, {method: "DELETE"}))
            );

            await fetch(`${API_ROOT}/workspaces/${id}`, {method: "DELETE"});

            setWorkspaces(prev => prev.filter(w => w.id !== id));
            setProjects(prev => prev.filter(p => p.workspace_id !== id));
            if (currentWsId === id) setCurrentWsId(null);

            toast.success("Delete workspace successfully!");
        } catch {
            toast.error("Failed to delete workspace!");
        }
    };

    // create endpoint
    const handleCreateEndpoint = () => {
        if (!validateCreateEndpoint(newEName, newEPath, newEMethod)) {
            return;
        }

        // Tự động tăng id
        const maxId = allEndpoints.length > 0 ? Math.max(...allEndpoints.map(ep => Number(ep.id))) : 0
        const newId = (maxId + 1).toString()

        const newEndpoint = {
            id: newId,
            name: newEName,
            path: newEPath,
            method: newEMethod,
            project_id: String(projectId),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        fetch(`${API_ROOT}/endpoints`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newEndpoint),
        })
            .then((res) => res.json())
            .then((createdEndpoint) => {
                // Thêm endpoint mới vào state trực tiếp
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

    }

    // edit endpoint
    const openEditEndpoint = (p) => {
        setEditId(p.id)
        setEditEName(p.name)
        setEditEPath(p.path)
        setEditEMethod(p.method || "GET")
        setOpenEdit(true)
    }

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
        }).then(() => {
            setEndpoints((prev) =>
                prev.map((ep) =>
                    ep.id === editId
                        ? {...ep, name: editEName, path: editEPath, method: editEMethod}
                        : ep
                )
            )
            setOpenEdit(false)

            toast.success("Update endpoint successfully!");
        }).catch((error) => {
            console.error("Error updating endpoint:", error.message);
            toast.error("Failed to update endpoint!");
        })
    }

    //  delete endpoint
    const handleDeleteEndpoint = (id) => {
        fetch(`${API_ROOT}/endpoints/${id}`, {method: "DELETE"}).then(() => {
            setEndpoints((prev) => prev.filter((e) => e.id !== id))

            toast.success("Delete endpoint successfully!");
        }).catch((error) => {
            console.error("Error deleting endpoint:", error.message);
            toast.error("Failed to delete endpoint!");
        })
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-72 border-r border-slate-100 bg-white">
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
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 p8">
                {/* Top Navbar */}
                <header className="bg-white border-b border-gray-200 p-4 flex items-center shadow-sm z-10">
                    <div className="relative flex-grow mr-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex-1 flex justify-center">
                                <div className="relative w-full max-w-md">
                                    <Input
                                        placeholder="Search"
                                        value={query}
                                        onChange={handleChange}
                                        className="pl-9 pr-3 py-2 h-10 bg-slate-100 rounded-lg text-[15px] font-medium placeholder:font-medium"
                                    />
                                    <div
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                        <Search size={16}/>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="mr-2 flex items-center gap-1">
                                <Badge className="bg-blue-500 text-white px-2 py-0.5 rounded-lg text-xs">
                                    {sortedEndpoints.length}
                                </Badge>
                                Active
                            </Button>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1">
                                <Play className="w-4 h-4"/> {/* Assuming a play icon for "Start all" */}
                                Start all
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 items-center justify-between mb-4">
                    <div className="bg-white shadow p-6">
                        {/* Breadcrumb hiển thị Workspace / Project */}
                        <div className="mb-4">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {(() => {
                                        const project = projects.find(p => String(p.id) === String(projectId));
                                        const workspace = project ? workspaces.find(w =>
                                            String(w.id) === String(project.workspace_id)) : null;
                                        return (
                                            <>
                                                {workspace && (
                                                    <BreadcrumbItem>
                                                        <BreadcrumbLink>
                                                            {workspace.name}
                                                        </BreadcrumbLink>
                                                    </BreadcrumbItem>
                                                )}
                                                {workspace && <BreadcrumbSeparator />}
                                                {project && (
                                                    <BreadcrumbItem>
                                                        <BreadcrumbLink>
                                                            {project.name}
                                                        </BreadcrumbLink>
                                                    </BreadcrumbItem>
                                                )}
                                            </>
                                        );
                                    })()}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <div className="flex border-b border-gray-200 mb-4 text-stone-500">
                            <Button
                                variant="ghost"
                                onClick={() => setActiveTab("endpoints")}
                                className={`rounded-none px-4 py-2 -mb-px ${activeTab === "endpoints" ? "border-b-2 border-stone-900 text-stone-900" : ""}`}
                            >
                                Endpoints
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setActiveTab("logs")
                                    fetchLogs()
                                }}
                                className={`rounded-none px-4 py-2 -mb-px ${activeTab === "logs" ? "border-b-2 border-stone-900 text-stone-900" : ""}`}
                            >
                                Logs
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setActiveTab("statistic")
                                    // fetchLogs()
                                }}
                                className={`rounded-none px-4 py-2 -mb-px ${activeTab === "statistic" ? "border-b-2 border-stone-900 text-stone-900" : ""}`}
                            >
                                Statistic
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
                                                    <DropdownMenuItem onClick={() => setSortOption("Recently created")}>
                                                        Recently created
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setSortOption("Oldest first")}>
                                                        Oldest first
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setSortOption("Alphabetical (A-Z)")}>
                                                        Alphabetical (A-Z)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setSortOption("Alphabetical (Z-A)")}>
                                                        Alphabetical (Z-A)
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            {/* New Endpoint Button + Dialog */}
                                            <Dialog open={openNew} onOpenChange={setOpenNew}>
                                                <Button
                                                    onClick={() => setOpenNew(true)}
                                                    className="bg-white text-black hover:bg-green-300 px-3 py-1 rounded-md"
                                                >
                                                    <img
                                                        src={createIcon}
                                                        alt="Create Icon"
                                                        className="w-4 h-4 object-contain"
                                                    />
                                                    New Endpoint
                                                </Button>
                                                <DialogContent
                                                    className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg">
                                                    <DialogHeader>
                                                        <DialogTitle>New Endpoint</DialogTitle>
                                                    </DialogHeader>

                                                    <h3 className="text-sm font-semibold text-slate-700 mt-2">Endpoint
                                                        Detail</h3>
                                                    <div className="mt-2 space-y-4">
                                                        <h3 className="text-sm font-semibold text-slate-700 mt-2">Name</h3>
                                                        <Input
                                                            placeholder=" Enter Endpoint Name"
                                                            value={newEName}
                                                            onChange={(e) => setNewEName(e.target.value)}
                                                        />

                                                        <h3 className="text-sm font-semibold text-slate-700 mt-2">Path</h3>
                                                        <Input
                                                            placeholder="/example/path/:number"
                                                            value={newEPath}
                                                            onChange={(e) => setNewEPath(e.target.value)}
                                                        />

                                                        <h3 className="text-sm font-semibold text-slate-700 mt-2">Method</h3>
                                                        <Select value={newEMethod} onValueChange={setNewEMethod}>
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
                                                            variant="outline" onClick={() => setOpenNew(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            className="bg-blue-600 text-white hover:bg-blue-700"
                                                            onClick={handleCreateEndpoint}>
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
                                                        <img src={methodIcon} alt="Method icon" className="w-4 h-4"/>
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
                                    <DialogContent className="bg-white text-slate-800 sm:max-w-lg shadow-lg rounded-lg">
                                        <DialogHeader>
                                            <DialogTitle>Edit Endpoint</DialogTitle>
                                        </DialogHeader>
                                        <h3 className="text-sm font-semibold text-slate-700 mt-2">Endpoint Detail</h3>
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-700 mt-2">Name</h3>
                                            <Input
                                                placeholder=" Enter Endpoint Name"
                                                value={editEName}
                                                onChange={(e) => setEditEName(e.target.value)}
                                            />
                                            <h3 className="text-sm font-semibold text-slate-700 mt-2">Path</h3>
                                            <Input
                                                placeholder="/example/path/:number"
                                                value={editEPath}
                                                onChange={(e) => setEditEPath(e.target.value)}
                                            />

                                            <h3 className="text-sm font-semibold text-slate-700 mt-2">Method</h3>
                                            <Select value={editEMethod} onValueChange={setEditEMethod}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Select a method"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Method</SelectLabel>
                                                        <SelectItem value="GET">Get</SelectItem>
                                                        <SelectItem value="PUT">Put</SelectItem>
                                                        <SelectItem value="POST">Post</SelectItem>
                                                        <SelectItem value="DELETE">Delete</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                        </div>
                                        <DialogFooter>
                                            <Button
                                                className="text-black hover:text-red-600"
                                                variant="outline" onClick={() => setOpenEdit(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                className="bg-blue-600 text-white hover:bg-blue-700"
                                                onClick={handleUpdateEndpoint}>
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
                                            <Select value={methodFilter} onValueChange={setMethodFilter}>
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
                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                                            <Select value={timeFilter} onValueChange={setTimeFilter}>
                                                <SelectTrigger className="w-[160px]">
                                                    <SelectValue placeholder="All time"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All time">All time</SelectItem>
                                                    <SelectItem value="Last 24 hours">Last 24 hours</SelectItem>
                                                    <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                                                    <SelectItem value="Last 30 days">Last 30 days</SelectItem>
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
                                                <TableHead className="col-span-3">Matched Response</TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {logs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center text-slate-500 py-4">
                                                        No logs available.
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredLogs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center text-slate-500 py-4">
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
                                                    setRowsPerPage(Number(val))
                                                    setPage(1) // reset về trang 1 khi đổi size
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
                        ) : activeTab === "statistic" ? (
                            <> {/* Statistic content */}
                                <div className="p-4">
                                    <h2 className="text-xl font-bold mb-4">Statistics</h2>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Method Count */}
                                        <div className="border rounded-lg p-4 shadow-sm">
                                            <h3 className="text-lg font-semibold mb-2">Requests by Method</h3>
                                            <ul className="space-y-1 text-sm">
                                                {["GET", "POST", "PUT", "DELETE"].map((method) => {
                                                    const count = logs.filter(
                                                        (log) => String(log.project_id) === String(projectId) &&
                                                            log.request_method === method
                                                    ).length;
                                                    return (
                                                        <li key={method} className="flex justify-between">
                                                            <span>{method}</span>
                                                            <span className="font-mono">{count}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>

                                        {/* Status Count */}
                                        <div className="border rounded-lg p-4 shadow-sm">
                                            <h3 className="text-lg font-semibold mb-2">Responses by Status</h3>
                                            <ul className="space-y-1 text-sm">
                                                {[200, 201, 400, 401, 403, 404, 500].map((status) => {
                                                    const count = logs.filter(
                                                        (log) => log.project_id === projectId && log.response_status_code === status
                                                    ).length;
                                                    return (
                                                        <li key={status} className="flex justify-between">
                                                            <span>{status}</span>
                                                            <span className="font-mono">{count}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </main>
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
                        <Button type="button" className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={handleEditWorkspace}>Update</Button>
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
        </div>
    );
}

// Placeholder for Play icon, assuming it comes from lucide-react or similar
function Play(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
    );
}