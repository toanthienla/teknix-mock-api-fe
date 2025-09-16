import React, {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export default function Dashboard() {
    const navigate = useNavigate()
    const {projectId} = useParams()
    const [activeTab, setActiveTab] = useState("endpoints")
    const [logs, setLogs] = useState([])

    const [workspaces, setWorkspaces] = useState([])
    const [projects, setProjects] = useState([])
    const [endpoints, setEndpoints] = useState([])
    const [currentWsId, setCurrentWsId] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortOption, setSortOption] = useState("Recently created")
    const [openProjectsMap, setOpenProjectsMap] = useState({}) // track open workspace project lists
    const [query, setQuery] = useState("");

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (setSearchTerm) setSearchTerm(value);
    };

    // new endpoint state
    const [newEName, setNewEName] = useState("")
    const [newEPath, setNewEPath] = useState("")
    const [newEMethod, setNewEMethod] = useState("")

    // edit project state
    const [editId, setEditId] = useState(null)
    const [editEName, setEditEName] = useState("")
    const [editEPath, setEditEPath] = useState("")
    const [editEMethod, setEditEMethod] = useState("")

    // dialogs
    const [openNew, setOpenNew] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)

    // Use toast to validate
    const validateCreateEndpoint = (name, path, method) => {

        // Validate endpoint name
        // Regex pattern
        const validPattern = /^[a-zA-Z_][a-zA-Z0-9_\-\s]*$/;

        if (!name.trim()) {
            toast.error("Name is required");
            return false;
        }
        if (name.trim().length > 20) {
            toast.error("Name must be less than 20 characters");
            return false;
        }

        if (!validPattern.test(name.trim())) {
            toast.error("Name must start with a letter and contain only letters, numbers, spaces, underscores and dashes");
            return false;
        }

        const duplicateName = endpoints.find((ep) => ep.name.toLowerCase() === name.toLowerCase())
        if (duplicateName) {
            toast.error("Name already exists");
            return false;
        }

        if (!path.trim()) {
            toast.error("Path is required");
            return false;
        } else if (!path.startsWith("/")) {
            toast.error("Path must start with '/'");
            return false;
        }

        // Validate Path
        if (!path.trim()) {
            toast.error("Path is required");
            return false;
        }
        if (!path.startsWith("/")) {
            toast.error("Path must start with '/'");
            return false;
        }
        if (path.length > 1 && path.endsWith("/")) {
            toast.error("Path must not end with '/'");
            return false;
        }

        // Regex to check route + query
        //     ^ … $ : khớp toàn bộ chuỗi.
        //     \/ : path bắt buộc bắt đầu bằng /.
        //     [a-zA-Z0-9\-_]* : segment đầu tiên có thể rỗng hoặc là users, api_v1.
        //     (\/[a-zA-Z0-9\-_]*)* : cho phép nhiều segment, ví dụ /users/profile/details.
        //     (\/:[a-zA-Z0-9\-_]+)* : cho phép parameter động, ví dụ /users/:id.
        //     (?:\?[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+(?:&[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+)*)? : phần query string, ví dụ ?id=1&sort=asc.
        const validPath = /^\/[a-zA-Z0-9\-_]*(\/[a-zA-Z0-9\-_]*)*(\/:[a-zA-Z0-9\-_]+)*(?:\?[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+(?:&[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+)*)?$/;

        if (!validPath.test(path.trim())) {
            toast.error("Path format is invalid. Example: /users/:id or /users?id=2");
            return false;
        }

        // Check duplicate path + method
        const duplicateEndpoint = endpoints.some(
            (ep) =>
                ep.path.toLowerCase().trim() === path.toLowerCase().trim() &&
                ep.method.toUpperCase() === method.toUpperCase()
        );
        if (duplicateEndpoint) {
            toast.error(`Endpoint with method ${method.toUpperCase()} and path "${path}" already exists`);
            return false;
        }

        if (!method) {
            toast.error("Method is required");
            return false;
        }

        return true;
    };

    // Validate for edit (note: exclude editing endpoint)
    const validateEditEndpoint = (id, name, path, method) => {
        // Validate endpoint name
        const validPattern = /^[a-zA-Z_][a-zA-Z0-9_\-\s]*$/;

        if (!name.trim()) {
            toast.error("Name is required");
            return false;
        }
        if (name.trim().length > 20) {
            toast.error("Name must be less than 20 characters");
            return false;
        }
        if (!validPattern.test(name.trim())) {
            toast.error("Name must start with a letter and contain only letters, numbers, spaces, underscores and dashes");
            return false;
        }
        const duplicateName = endpoints.find(
            (ep) => ep.id !== id && ep.name.toLowerCase() === name.toLowerCase()
        );
        if (duplicateName) {
            toast.error("Name already exists");
            return false;
        }

        // Validate path
        if (!path.trim()) {
            toast.error("Path is required");
            return false;
        }
        if (!path.startsWith("/")) {
            toast.error("Path must start with '/'");
            return false;
        }
        if (path.length > 1 && path.endsWith("/")) {
            toast.error("Path must not end with '/'");
            return false;
        }

        const validPath = /^\/[a-zA-Z0-9\-_]*(\/[a-zA-Z0-9\-_]*)*(\/:[a-zA-Z0-9\-_]+)*(?:\?[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+(?:&[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+)*)?$/;
        if (!validPath.test(path.trim())) {
            toast.error("Path format is invalid. Example: /users/:id or /users?id=2");
            return false;
        }

        const duplicateEndpoint = endpoints.some(
            (ep) =>
                ep.id !== id &&
                ep.path.toLowerCase().trim() === path.toLowerCase().trim() &&
                ep.method.toUpperCase() === method.toUpperCase()
        );
        if (duplicateEndpoint) {
            toast.error(`Endpoint with method ${method.toUpperCase()} and path "${path}" already exists`);
            return false;
        }

        // Validate method
        if (!method) {
            toast.error("Method is required");
            return false;
        }

        return true;
    };

    // fetch workspaces + projects
    useEffect(() => {
        fetchWorkspaces()
        fetchProjects()
        fetchEndpoints()
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

    const fetchEndpoints = () => {
        fetch(`${API_ROOT}/endpoints`)
            .then((res) => res.json())
            .then((data) => setEndpoints(data))
    }

    const fetchLogs = () => {
        fetch(`${API_ROOT}/logs`)
            .then((res) => res.json())
            .then((data) => setLogs(data))
            .catch((err) => console.error("Error fetching logs:", err))
    }

    // filter + sort endpoints
    const currentEndpoints = endpoints.filter(
        (p) => String(p.project_id) === String(projectId)
    )
    const filteredEndpoints = currentEndpoints.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

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

    // workspace actions
    const handleAddWorkspace = (name) => {
        if (!name.trim()) return

        // Tự động tăng id
        const maxId = workspaces.length > 0 ? Math.max(...workspaces.map(w => Number(w.id))) : 0
        const newId = maxId + 1

        const newWs = {
            id: newId,
            name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        fetch(`${API_ROOT}/workspaces`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newWs),
        })
            .then((res) => res.json())
            .then((createdWs) => {
                setWorkspaces((prev) => [...prev, createdWs])
                setCurrentWsId(createdWs.id)
                setOpenProjectsMap((prev) => ({...prev, [createdWs.id]: true})) // mở workspace mới
            })
    }

    const handleEditWorkspace = (id, name) => {
        fetch(`${API_ROOT}/workspaces/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, updated_at: new Date().toISOString()}),
        }).then(() => {
            setWorkspaces((prev) =>
                prev.map((w) => (w.id === id ? {...w, name} : w))
            )
        })
    }

    const handleDeleteWorkspace = (id) => {
        fetch(`${API_ROOT}/workspaces/${id}`, {method: "DELETE"}).then(() => {
            setWorkspaces((prev) => prev.filter((w) => w.id !== id))
            if (currentWsId === id) setCurrentWsId(null)
        })
    }

    // create endpoint
    const handleCreateEndpoint = () => {
        if (!validateCreateEndpoint(newEName, newEPath, newEMethod)) {
            return;
        }

        // Tự động tăng id
        const maxId = endpoints.length > 0 ? Math.max(...endpoints.map(ep => Number(ep.id))) : 0
        const newId = (maxId + 1).toString()

        const newEndpoint = {
            id: newId,
            name: newEName,
            path: newEPath,
            method: newEMethod,
            project_id: Number(projectId),
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

                toast.success("Create endpoint successfully!");
            })
            .catch((error) => {
                console.error("Error creating endpoint:", error);
                toast.error("Error creating endpoint!");
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
        })
    }

    //  delete endpoint
    const handleDeleteEndpoint = (id) => {
        fetch(`${API_ROOT}/endpoints/${id}`, {method: "DELETE"}).then(() => {
            setEndpoints((prev) => prev.filter((e) => e.id !== id))
        })

        toast.success("Delete endpoint successfully!");
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-72 border-r border-slate-100 bg-white">
                <Sidebar
                    workspaces={workspaces}
                    projects={projects}
                    endpoints={endpoints}
                    current={currentWsId}
                    setCurrentWS={setCurrentWsId}
                    onAddWorkspace={handleAddWorkspace}
                    onEditWorkspace={(id) => {
                        const ws = workspaces.find((w) => w.id === id)
                        if (!ws) return
                        const name = prompt("Edit workspace name", ws.name)
                        if (name) handleEditWorkspace(id, name)
                    }}
                    onDeleteWorkspace={handleDeleteWorkspace}
                    openProjectsMap={openProjectsMap}
                    setOpenProjectsMap={setOpenProjectsMap}
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
                                        placeholder="Search endpoints..."
                                        value={query}
                                        onChange={handleChange}
                                        className="pl-10 pr-4 py-2"
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
                        <div className="flex border-b border-gray-200 mb-4 text-gray-600">
                            <Button
                                variant="ghost"
                                onClick={() => setActiveTab("endpoints")}
                                className={`rounded-none px-4 py-2 -mb-px ${activeTab === "endpoints" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}
                            >
                                Endpoints
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setActiveTab("logs")
                                    fetchLogs()
                                }}
                                className={`rounded-none px-4 py-2 -mb-px ${activeTab === "logs" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}
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
                                                    className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-md"
                                                >
                                                    + New Endpoint
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
                                                        <Button variant="outline" onClick={() => setOpenNew(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button onClick={handleCreateEndpoint}>Create</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                    </div>
                                </div>

                                {/* Endpoint Table Header */}
                                <div
                                    className="grid grid-cols-[2fr_0.7fr_1fr] items-center py-2 text-xs font-medium text-gray-500 tracking-wide">
                                    <div className="pl-1">Aa</div>
                                    <div>Method</div>
                                    <div>Time & Date</div>
                                </div>
                                <Separator/>

                                {/* Endpoint Rows */}
                                <div>
                                    {sortedEndpoints?.length > 0 ? (
                                        sortedEndpoints.map((e) => (
                                            <EndpointCard
                                                key={e.id}
                                                endpoint={e}
                                                onEdit={() => openEditEndpoint(e)}
                                                onDelete={() => handleDeleteEndpoint(e.id)}
                                                onClick={() => navigate(`/dashboard/${projectId}/${e.id}`)}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-slate-500">No projects found.</p>
                                    )}
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
                                            <Button variant="outline" onClick={() => setOpenEdit(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleUpdateEndpoint}>Update</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        ) : (
                            <> {/* Logs */}
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    Logs
                                </h2>
                                <div className="space-y-2">
                                    {logs.map((log, i) => (
                                        <div
                                            key={i}
                                            className="p-3 border rounded-md text-sm text-slate-700 bg-slate-50"
                                        >
                                            <div><b>Endpoint:</b> {log.endpoint_name || log.endpoint_id}</div>
                                            <div><b>Method:</b> {log.method}</div>
                                            <div><b>Status:</b> {log.status}</div>
                                            <div><b>Time:</b> {new Date(log.created_at).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
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