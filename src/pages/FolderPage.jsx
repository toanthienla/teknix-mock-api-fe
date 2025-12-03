import "@/styles/pages/folder-page.css";
import React, { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/services/api.js";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {Navigate, useNavigate, useParams} from "react-router-dom";
import { API_ROOT } from "@/utils/constants.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";

import Topbar from "@/components/Topbar.jsx";
import { toast } from "react-toastify";
import LogCard from "@/components/LogCard.jsx";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

import tiktokIcon from "@/assets/light/tiktok.svg";
import fbIcon from "@/assets/light/facebook.svg";
import linkedinIcon from "@/assets/light/linkedin.svg";
import folderIcon from "@/assets/light/folder-icon.svg";
import logsIcon from "@/assets/light/logs.svg";
import FolderCard from "@/components/FolderCard.jsx";
import searchIcon from "@/assets/light/search.svg";
import refreshIcon from "@/assets/light/refresh.svg";
import WSChannelSheet from "@/components/WSChannel.jsx";
import {useProjectWs} from "@/services/useProjectWs.js";

const BaseSchemaEditor = ({ folderData, folderId, onSave }) => {
  const [schemaFields, setSchemaFields] = useState([]);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSchema, setPendingSchema] = useState(null);

  // Khởi tạo schema (luôn có "id" mặc định)
  useEffect(() => {
    if (folderData?.schema && Object.keys(folderData.schema).length > 0) {
      const fields = Object.entries(folderData.schema).map(
        ([name, config], index) => ({
          id: `field-${index}`,
          name,
          type: config.type || "string",
          required: config.required || false,
        })
      );
      setSchemaFields(fields);
    } else {
      // Mặc định có sẵn "id"
      const defaultSchema = {
        id: { type: "number", required: false },
      };
      const fields = Object.entries(defaultSchema).map(
        ([name, config], index) => ({
          id: `field-${index}`,
          name,
          type: config.type,
          required: config.required,
        })
      );
      setSchemaFields(fields);
    }
  }, [folderData]);

  const validateField = (field) => {
    const newErrors = {};

    if (!field.name.trim()) {
      newErrors.name = "Field name cannot be empty";
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name)) {
      newErrors.name = "Invalid field name format";
    }

    return newErrors;
  };

  const validateAllFields = () => {
    const allErrors = {};
    let isValid = true;

    schemaFields.forEach((field) => {
      const fieldErrors = validateField(field);
      if (Object.keys(fieldErrors).length > 0) {
        allErrors[field.id] = fieldErrors;
        isValid = false;
      }
    });

    // Kiểm tra trùng tên (chỉ tính những field có name khác rỗng)
    const nameCounts = {};
    schemaFields.forEach((f) => {
      const name = f.name.trim();
      if (name) {
        nameCounts[name] = (nameCounts[name] || 0) + 1;
      }
    });

    schemaFields.forEach((f) => {
      const name = f.name.trim();
      if (name && nameCounts[name] > 1) {
        allErrors[f.id] = {
          ...(allErrors[f.id] || {}),
          name: "Field name already exists",
        };
        isValid = false;
      }
    });

    setErrors(allErrors);
    return isValid;
  };

  const handleAddField = () => {
    if (!validateAllFields()) {
      toast.error("Please fix errors before adding new field");
      return;
    }

    const newField = {
      id: `field-${Date.now()}`,
      name: "",
      type: "string",
      required: false,
    };

    setSchemaFields((prev) => [...prev, newField]);
  };

  const handleDeleteField = (id) => {
    const field = schemaFields.find((f) => f.id === id);
    if (field?.name === "id") {
      toast.error("Default field 'id' cannot be deleted");
      return;
    }

    setSchemaFields((prev) => prev.filter((f) => f.id !== id));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleChange = (id, key, value) => {
    setSchemaFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const prepareSchema = () => {
    const newSchema = {};
    schemaFields.forEach((field) => {
      if (field.name.trim()) {
        newSchema[field.name] = {
          type: field.type,
          required: field.required,
        };
      }
    });
    return newSchema;
  };

  const handleSave = () => {
    if (!validateAllFields()) {
      toast.error("Please fix all errors before saving");
      return;
    }

    const newSchema = prepareSchema();
    setPendingSchema(newSchema);
    setConfirmOpen(true);
  };

  const confirmSave = () => {
    if (pendingSchema) {
      onSave(pendingSchema);
    }
    setConfirmOpen(false);
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <Card className="folder-page-content p-4 border-none rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Schema Configuration
        </h2>

        {/* Header */}
        <div className="schema-header grid grid-cols-3 gap-4 font-semibold border rounded-lg px-4 py-2 mb-2">
          <div>Field Name</div>
          <div>Type</div>
          <div>Required</div>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {schemaFields.map((field) => (
            <div key={field.id} className="schema-body grid grid-cols-3 gap-4 border rounded-lg p-1 items-center">
              <Input
                value={field.name}
                onChange={(e) => handleChange(field.id, "name", e.target.value)}
                className={`${errors[field.id]?.name ? "border-red-500" : ""}`}
                placeholder="Field name"
                disabled={field.name === "id"}
              />

              <Select
                value={field.type}
                onValueChange={(value) => handleChange(field.id, "type", value)}
                disabled={field.name === "id"} // id luôn là number
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">string</SelectItem>
                  <SelectItem value="number">number</SelectItem>
                  <SelectItem value="boolean">boolean</SelectItem>
                  <SelectItem value="array">array</SelectItem>
                  <SelectItem value="object">object</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Select
                  value={field.required.toString()}
                  onValueChange={(value) =>
                    handleChange(field.id, "required", value === "true")
                  }
                  disabled={field.name === "id"} // id luôn required = false
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteField(field.id)}
                  disabled={field.name === "id"}
                >
                  <Trash2
                    className={`w-4 h-4 ${field.name === "id" ? "opacity-70" : "text-red-500"
                      }`}
                  />
                </Button>
              </div>

              {errors[field.id]?.name && (
                <div className="col-span-3 text-red-500 text-xs">
                  {errors[field.id].name}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleAddField}>
            <Plus className="w-4 h-4 mr-2" /> Add Field
          </Button>
          <Button
            className="bg-[#FBEB6B] hover:bg-[#FDE047] text-black dark:bg-[#5865F2] dark:hover:bg-[#4752C4] dark:text-white"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Schema Update</DialogTitle>
            <DialogDescription>
              Updating this folder's schema will <b>delete all endpoint data</b>{" "}
              that no longer fits the new schema.
              <br /> <br />
              Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="dark:hover:bg-red-500"
              onClick={confirmSave}
            >
              Yes, Save Anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function FolderPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("folder_active_tab") || "folders";
  });

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  // const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersReady, setFiltersReady] = useState(false);

  const [currentWsId, setCurrentWsId] = useState(
    () => localStorage.getItem("currentWorkspace") || null
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // const [targetWsId, setTargetWsId] = useState(null);
  const [targetProjectId, setTargetProjectId] = useState(null);

  const [openEditWs, setOpenEditWs] = useState(false);
  const [confirmDeleteWs, setConfirmDeleteWs] = useState(null);
  const [editWsId, setEditWsId] = useState(null);
  const [editWsName, setEditWsName] = useState("");

  const [openNewWs, setOpenNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);

  // folder state
  const [openNewFolder, setOpenNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [isEditingFolder, setIsEditingFolder] = useState(false);

  const [deleteFolderId, setDeleteFolderId] = useState(null);
  const [openDeleteFolder, setOpenDeleteFolder] = useState(false);

  const [timeFilter, setTimeFilter] = useState("Recent logs");

  const [newFolderMode, setNewFolderMode] = useState(false);
  const [openEditFolder, setOpenEditFolder] = useState(false);

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [currentUsername, setCurrentUsername] = useState("Unknown");

  const [openSchemaDialog, setOpenSchemaDialog] = useState(false);
  const [folderSchema, setFolderSchema] = useState(null);

  // new endpoint state
  const [newEName, setNewEName] = useState("");
  const [newEPath, setNewEPath] = useState("");
  const [newEMethod, setNewEMethod] = useState("");
  const [newEFolderId, setNewEFolderId] = useState("");
  const [newEType, setNewEType] = useState(false); // false = stateless, true = stateful
  const [isCreatingEndpoint, setIsCreatingEndpoint] = useState(false);

  // edit endpoint state
  const [editId, setEditId] = useState(null);
  const [editEName, setEditEName] = useState("");
  const [editEPath, setEditEPath] = useState("/");
  const [editEState, setEditEState] = useState(false);
  const [isEditingEndpoint, setIsEditingEndpoint] = useState(false);

  // dialogs
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [openWSDialog, setOpenWSDialog] = useState(false);

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
  useEffect(() => {
    checkUserLogin();
  }, []);

  useEffect(() => {
    if (!currentWsId) {
      localStorage.setItem("currentWorkspace", workspaces[0]?.id || null);
      navigate("/dashboard");
      return;
    }

    // Nếu đã load workspace list nhưng không tìm thấy workspace tương ứng
    if (workspaces.length > 0 && !currentWorkspace) {
      localStorage.setItem("currentWorkspace", workspaces[0]?.id || null);
      navigate("/dashboard");
    }
  }, [currentWsId, workspaces]);

  const currentProject = project;

  const currentWorkspace = workspaces.find(
    (w) => String(w.id) === String(currentWsId)
  );

  // state cho pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setSearchTerm(localStorage.getItem("logs_search") || "");
    setTimeFilter(localStorage.getItem("logs_timeSpan") || "Recent logs");
    setRowsPerPage(Number(localStorage.getItem("logs_limit") || 5));
    setPage(Number(localStorage.getItem("logs_page") || 1));

    setFiltersReady(true);
  }, []);

  // fetch workspaces + projects + endpoints
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        fetchWorkspaces();
        // Wait a bit for all to complete
        setTimeout(() => setIsLoading(false), 1000);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    fetchProject(projectId);
  }, [projectId]);

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
        }
      })
      .catch(() =>
        toast.error("Failed to load workspaces")
      );
  };

  const fetchProject = (projectId) => {
    if (!projectId) return;

    // Reset dữ liệu cũ trước khi load dữ liệu mới
    setProject(null);
    setFolders([]);
    setEndpoints([]);

    // 1. Fetch project
    fetch(`${API_ROOT}/projects/${projectId}`)
      .then((r) => r.json())
      .then((projData) => {
        setProject(projData);

        // 2. Fetch folders trong project
        return fetch(`${API_ROOT}/folders?project_id=${projectId}`, {
          credentials: "include",
        });
      })
      .then((r) => r.json())
      .then((foldersData) => {
        const folderArr = Array.isArray(foldersData)
          ? foldersData
          : foldersData.data || [];

        setFolders(folderArr);

        // 3. Fetch tất cả endpoints của từng folder
        folderArr.forEach((folder) => {
          fetch(`${API_ROOT}/endpoints?folder_id=${folder.id}`, {
            credentials: "include",
          })
            .then((r) => r.json())
            .then((eData) => {
              const eArr = Array.isArray(eData) ? eData : eData.data || [];

              // add project_id vào mỗi endpoint
              const withProjectId = eArr.map((e) => ({
                ...e,
                project_id: projectId,
              }));

              setEndpoints((prev) => {
                const merged = [...prev];
                withProjectId.forEach((e) => {
                  if (!merged.some((ee) => ee.id === e.id)) {
                    merged.push(e);
                  }
                });
                return merged;
              });
            })
            .catch(() =>
              console.error(`Failed to fetch endpoints for folder ${folder.id}`)
            );
        });
      })
      .catch(() => console.error(`Failed to fetch project ${projectId}`));
  };

  useEffect(() => {
    if (!filtersReady) return;
    if (!projectId) return;
    if (!endpoints || endpoints.length === 0) return;

    fetchLogs(projectId, page, rowsPerPage);
  }, [projectId, page, rowsPerPage, searchTerm, timeFilter]);

  const fetchLogs = async (pid, page = 1, limit = 10) => {
    if (!pid) return;
    setLoadingLogs(true);
    try {
      // Build API URL
      let url = `${API_ROOT}/project_request_logs?project_id=${pid}&page=${page}&limit=${limit}`;

      // Convert FE time filter → backend time_range
      let timeRange = "";
      if (timeFilter === "24h") timeRange = "1d";
      else if (timeFilter === "7d") timeRange = "7d";
      else if (timeFilter === "30d") timeRange = "30d";

      // Append time_range if exists
      if (timeRange) {
        url += `&time_range=${timeRange}`;
      }

      // Append search if exists
      if (searchTerm && searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }

      // Fetch logs
      const res = await fetch(url, { credentials: "include" });
      // toast.info("Logs loaded successfully");

      if (res.status === 401) {
        console.warn("Unauthorized (401) - rechecking user login...");
        await checkUserLogin();
        return;
      }

      if (!res.ok) throw new Error(`Logs not ok: ${res.status}`);

      const raw = await res.json();

      // Nếu không có dữ liệu hoặc items rỗng/null
      if (!raw || !raw.items || raw.items.length === 0) {
        setLogs([]);
        setTotalPages(raw.totalPages || 0);
        return;
      }

      setTotalPages(raw.totalPages || 0);
      setPage(raw.page || 1);
      const logsArray = raw.items;

      const endpointMap = new Map(endpoints.map((e) => [String(e.id), e]));

      const enrichedLogs = logsArray.map((log) => {
        if (!log) return log;

        const endpoint = endpointMap.get(String(log.endpoint_id));
        const endpointName = endpoint ? endpoint.name : "Unknown endpoint";

        // Ưu tiên:
        // 1. endpoint_response_name (stateless)
        // 2. stateful_endpoint_response_name (stateful)
        // 3. endpoint name fallback
        const responseName =
          log.endpoint_response_name ||
          log.stateful_endpoint_response_name ||
          endpointName;

        return {
          ...log,
          project_id: endpoint ? endpoint.project_id : log.project_id ?? pid,
          endpointResponseName: `${endpointName} - ${responseName}`,
        };
      });

      setLogs(enrichedLogs);
    } catch (err) {
      console.error("Error fetching logs:", err);
      toast.error("Failed to load logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  // -------------------- Folder --------------------
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
      const endpointsToDelete = allEndpoints.filter(
        (e) => String(e.folder_id) === String(deleteFolderId)
      );

      // Delete all endpoints in the folder first
      await Promise.all(
        endpointsToDelete.map((e) =>
          fetch(`${API_ROOT}/endpoints/${e.id}`, {
            method: "DELETE",
            credentials: "include",
          })
        )
      );

      // Delete the folder
      await fetch(`${API_ROOT}/folders/${deleteFolderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      // Update local state
      setFolders((prev) => prev.filter((f) => f.id !== deleteFolderId));

      toast.dismiss();
      toast.success(
        `Folder and its ${endpointsToDelete.length} endpoints deleted successfully`
      );

      setOpenDeleteFolder(false);
      setDeleteFolderId(null);
    } catch (error) {
      console.error("Delete folder error:", error);
      toast.error("Failed to delete folder");
    }
  };

  const validateFolderName = (name) => {
    if (!name.trim()) {
      return "Folder name cannot be empty";
    }

    if (!/^[A-Za-z][A-Za-z0-9_ ]*$/.test(name)) {
      return "Must start with a letter, only English, digits and underscores allowed.";
    }

    // Check for duplicate folder names in the current project (exclude current folder when editing)
    const projectFolders = folders.filter(
      (f) =>
        String(f.project_id) === String(projectId) && f.id !== editingFolderId
    );
    if (
      projectFolders.some(
        (f) => f.name.toLowerCase() === name.trim().toLowerCase()
      )
    ) {
      return "Folder name already exists in this project";
    }

    return "";
  };

  const hasChanges = () => {
    if (!editingFolderId) return true;
    const originalFolder = folders.find((f) => f.id === editingFolderId);
    if (!originalFolder) return false;
    return editFolderName.trim() !== originalFolder.name;
  };

  const handleCreateFolder = async () => {
    if (isCreatingFolder || isValidating) return;

    setIsValidating(true);
    setTimeout(() => setIsValidating(false), 1000);
    const validationError = validateFolderName(newFolderName);
    if (validationError) {
      toast.warning(validationError);
      return;
    }

    setIsCreatingFolder(true);
    try {
      const folderData = {
        name: newFolderName.trim(),
        description: newFolderDesc.trim(),
        project_id: targetProjectId || projectId,
        is_public: newFolderMode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const res = await fetch(`${API_ROOT}/folders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(folderData),
      });

      if (!res.ok) throw new Error("Failed to create folder");

      const saved = await res.json();

      setFolders((prev) => [...prev, saved]);
      toast.success(`Folder "${saved.name}" created successfully`);

      setOpenNewFolder(false);
      setNewFolderName("");
      setNewFolderDesc("");

    } catch (err) {
      console.error("Error creating folder:", err);
      toast.error("Failed to create folder");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUpdateFolder = async () => {
    if (isValidating || isEditingFolder) return;

    setIsValidating(true);
    setTimeout(() => setIsValidating(false), 1000);

    const validationError = validateFolderName(editFolderName);
    if (validationError) {
      toast.warning(validationError);
      return;
    }

    if (!hasChanges()) {
      setOpenEditFolder(false);
      return;
    }

    setIsEditingFolder(true);
    try {
      const res = await fetch(`${API_ROOT}/folders/${editingFolderId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editFolderName.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to update folder");

      const updated = await res.json();

      setFolders((prev) =>
        prev.map((f) => (f.id === editingFolderId ? updated : f))
      );

      toast.success("Folder updated successfully!");
      setOpenEditFolder(false);

    } catch (err) {
      console.error("Error updating folder:", err);
      toast.error("Failed to update folder");
    } finally {
      setIsEditingFolder(false);
    }
  };

  // --- Endpoint Handlers ---
  // Regex
  const validPath =
    /^\/(?:[a-zA-Z0-9\-_]+|:[a-zA-Z0-9\-_]+)(?:\/(?:[a-zA-Z0-9\-_]+|:[a-zA-Z0-9\-_]+))*(?:\?[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+(?:&[a-zA-Z0-9\-_]+=[a-zA-Z0-9\-_]+)*)?$/;
  const validName = /^[A-Za-z_][A-Za-z0-9_-]*(?: [A-Za-z0-9_-]+)*$/;

  // validation helpers (unchanged)...
  const validateCreateEndpoint = (name, path, method, type) => {
    if (!name.trim()) {
      toast.info("Name is required");
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
        String(ep.folder_id) === String(selectedFolder?.id) &&
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

    // Lấy toàn bộ folder trong project
    const foldersInSameProject = folders.filter(
      (f) => String(f.project_id) === String(projectId)
    );

    // Lấy toàn bộ endpoint trong các folder đó
    const endpointsInProject = endpoints.filter((ep) =>
      foldersInSameProject.some((f) => String(f.id) === String(ep.folder_id))
    );

    // Kiểm tra trùng path + method trong project
    if (!type) {
      const duplicatePath = endpointsInProject.some(
        (ep) =>
          ep.path.trim() === path.trim() &&
          ep.method.toUpperCase() === method.toUpperCase()
      );
      if (duplicatePath) {
        toast.warning(
          `Endpoint with method ${method.toUpperCase()} and path "${path}" already exists in this project`
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

  const validateEditEndpoint = async (id, name, path, state, method) => {
    if (!name.trim()) {
      toast.info("Name is required");
      return false;
    }
    if (!validName.test(name.trim())) {
      toast.info(
        "Name must start with a letter and contain only letters, numbers, underscores and dashes"
      );
      return false;
    }
    if (!validPath.test(path.trim())) {
      toast.info("Path format is invalid. Example: /users/:id or /users?id=2");
      return false;
    }

    const foldersInSameProject = folders.filter(
      (f) => String(f.project_id) === String(projectId)
    );
    const endpointsInProject = endpoints.filter((ep) =>
      foldersInSameProject.some((f) => String(f.id) === String(ep.folder_id))
    );
    const duplicatePath = endpointsInProject.some(
      (ep) =>
        ep.id !== id &&
        ep.path.trim() === path.trim() &&
        ep.method.toUpperCase() === method.toUpperCase()
    );
    if (duplicatePath) {
      toast.warning(
        `Endpoint with method ${method.toUpperCase()} and path "${path}" already exists in this project`
      );
      return false;
    }

    if (state) {
      // Stateful
      try {
        const res = await fetch(
          `${API_ROOT}/endpoints_ful?folder_id=${selectedFolder?.id}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to fetch stateful endpoints");
        const data = await res.json();
        const statefulArr = Array.isArray(data) ? data : data.data || [];

        const duplicateSF = statefulArr.find(
          (ep) =>
            ep.endpoint_id !== id &&
            String(ep.folder_id) === String(selectedFolder?.id) &&
            ep.name.toLowerCase() === name.toLowerCase()
        );
        if (duplicateSF) {
          toast.warning("Name already exists in this folder (stateful)");
          return false;
        }
      } catch (err) {
        console.error("Error checking stateful endpoints:", err);
        toast.error("Failed to validate stateful endpoint name");
        return false;
      }
    } else {
      // Stateless
      const duplicateSL = endpoints.find(
        (ep) =>
          ep.id !== id &&
          String(ep.folder_id) === String(selectedFolder?.id) &&
          ep.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicateSL) {
        toast.warning("Name already exists in this folder");
        return false;
      }
    }

    return true;
  };

  // Create endpoint
  const handleCreateEndpoint = async () => {
    if (isValidating || isCreatingEndpoint) return;

    setIsValidating(true);
    setTimeout(() => setIsValidating(false), 1000);

    if (!validateCreateEndpoint(newEName, newEPath, newEMethod)) return;

    setIsCreatingEndpoint(true);

    try {
      const newEndpoint = {
        name: newEName.trim(),
        folder_id: newEFolderId,
        method: newEMethod.toUpperCase(),
        path: newEPath,
      };

      const res = await fetch(`${API_ROOT}/endpoints`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEndpoint),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);

        if (errorData?.errors?.length) {
          errorData.errors.forEach((err) =>
            toast.error(`${err.field ? `${err.field}: ` : ""}${err.message}`)
          );
        } else {
          toast.error("Failed to create endpoint");
        }
        return;
      }

      const created = await res.json();
      setEndpoints((prev) => [...prev, created]);
      setOpenNew(false);
      toast.success("Endpoint created!");
    } catch (error) {
      console.error("Error creating endpoint:", error);
      toast.error("Failed to create endpoint");
    } finally {
      setIsCreatingEndpoint(false);
    }
  };

  // edit endpoint
  const [currentEndpoint, setCurrentEndpoint] = useState(null);
  const openEditEndpoint = (e) => {
    setEditId(e.id);
    setEditEName(e.name);
    setEditEPath(e.path);
    setEditEState(e.is_stateful);

    const folderOfEndpoint = folders.find(
      (f) => String(f.id) === String(e.folder_id)
    );
    setSelectedFolder(folderOfEndpoint);

    setCurrentEndpoint(e);
    setOpenEdit(true);
  };

  const hasEdited = useMemo(() => {
    if (!currentEndpoint) return false;
    return editEName !== currentEndpoint.name || editEPath !== currentEndpoint.path;
  }, [editEName, editEPath, currentEndpoint]);

  const handleUpdateEndpoint = async () => {
    if (isValidating || isEditingEndpoint) return;

    setIsValidating(true);
    setTimeout(() => setIsValidating(false), 1000);

    const isValid = await validateEditEndpoint(
      editId,
      editEName,
      editEPath,
      editEState,
      currentEndpoint.method
    );

    if (!isValid) return;

    setIsEditingEndpoint(true);

    try {
      const updated = {
        name: editEName.trim(),
        path: editEPath.trim(),
      };

      const res = await fetch(`${API_ROOT}/endpoints/${editId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Failed to update endpoint");

      const updatedEndpoint = await res.json();

      setEndpoints((prev) =>
        prev.map((ep) => (ep.id === editId ? updatedEndpoint : ep))
      );

      setOpenEdit(false);
      toast.success("Update endpoint successfully!");

    } catch (err) {
      console.error(err);
      toast.error("Failed to update endpoint!");
    } finally {
      setIsEditingEndpoint(false);
    }
  };

  // delete endpoint stateless
  const handleDeleteEndpoint = (id) => {
    fetch(`${API_ROOT}/endpoints/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => {
        setEndpoints((prev) => prev.filter((e) => e.id !== id));
        toast.success("Delete endpoint successfully!");
      })
      .catch((error) => {
        console.error("Error deleting endpoint:", error.message);
        toast.error("Failed to delete endpoint!");
      });
  };

  // -------------------- Workspace --------------------
  const validateWsName = (name, excludeId = null) => {
    if (!name.trim()) return "Workspace name cannot be empty";
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(name))
      return "Must start with a letter, only English letters, digits, '-' and '_' allowed (no spaces)";
    if (name.trim().length > 20) return "Workspace name max 20 chars";
    if (
      workspaces.some(
        (w) => w.name.toLowerCase() === name.toLowerCase() && w.id !== excludeId
      )
    )
      return "Workspace name already exists";
    return "";
  };

  const handleAddWorkspace = async (name) => {
    if (isCreatingWorkspace || isValidating) return;
    setIsValidating(true);
    setTimeout(() => setIsValidating(false), 1000);
    setIsCreatingWorkspace(true);

    const err = validateWsName(name);
    if (err) {
      toast.warning(err);
      setIsCreatingWorkspace(false);
      return;
    }

    try {
      const res = await fetch(`${API_ROOT}/workspaces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      const result = await res.json();
      if (!result.success || !result.data) {
        toast.error("Failed to create workspace");
        return;
      }

      const createdWs = result.data;
      setWorkspaces((prev) => [...prev, createdWs]);
      setCurrentWsId(String(createdWs.id));
      localStorage.setItem("currentWorkspace", String(createdWs.id));

      toast.success("Workspace created successfully");
      setNewWsName("");
      setOpenNewWs(false);

    } catch (err) {
      console.error("Error creating workspace:", err);
      toast.error("Failed to create workspace");
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  const handleEditWorkspace = async () => {
    if (isEditingWorkspace || isValidating) return;

    setIsValidating(true);
    setTimeout(() => setIsValidating(false), 1000);

    const err = validateWsName(editWsName, editWsId);
    if (err) {
      toast.warning(err);
      return;
    }

    const original = workspaces.find((w) => w.id === editWsId);
    if (!original) {
      toast.error("Original workspace not found");
      return;
    }

    // Nếu không có thay đổi → đóng dialog
    if (editWsName.trim() === original.name) {
      setOpenEditWs(false);
      return;
    }

    setIsEditingWorkspace(true);

    try {
      const res = await fetch(`${API_ROOT}/workspaces/${editWsId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editWsName.trim(),
          updated_at: new Date().toISOString(),
        }),
      });

      const result = await res.json();

      if (!result.success || !result.data) {
        toast.error("Failed to update workspace");
        return;
      }

      const updatedWs = result.data;

      // Cập nhật vào workspaces
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === editWsId ? updatedWs : w
        )
      );

      toast.success("Workspace updated successfully");

      // Đóng dialog + reset input
      setOpenEditWs(false);
      setEditWsName("");
      setEditWsId(null);

    } catch (err) {
      console.error("Error updating workspace:", err);
      toast.error("Failed to update workspace");
    } finally {
      setIsEditingWorkspace(false);
    }
  };

  const handleDeleteWorkspace = async (id) => {
    try {
      // 1. Get all projects in this workspace
      const projectsRes = await fetch(`${API_ROOT}/projects`);
      const allProjects = await projectsRes.json();
      const projectsToDelete = allProjects.filter(
        (p) => String(p.workspace_id) === String(id)
      );
      const projectIds = projectsToDelete.map((p) => p.id);

      // 2. Get all folders in these projects
      const foldersRes = await fetch(`${API_ROOT}/folders`);
      const allFolders = await foldersRes.json();
      const foldersToDelete = allFolders.filter((f) =>
        projectIds.some((pid) => String(f.project_id) === String(pid))
      );
      const folderIds = foldersToDelete.map((f) => f.id);

      // 3. Get all endpoints in these projects/folders
      const endpointsRes = await fetch(`${API_ROOT}/endpoints`);
      const allEndpoints = await endpointsRes.json();
      const endpointsToDelete = allEndpoints.filter(
        (e) =>
          projectIds.some((pid) => String(e.project_id) === String(pid)) ||
          folderIds.some((fid) => String(e.folder_id) === String(fid))
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
      // setProjects((prev) =>
      //   prev.filter((p) => String(p.workspace_id) !== String(id))
      // );
      // setFolders((prev) =>
      //   prev.filter(
      //     (f) => !projectIds.some((pid) => String(f.project_id) === String(pid))
      //   )
      // );
      // setEndpoints((prev) =>
      //   prev.filter(
      //     (e) =>
      //       !projectIds.some((pid) => String(e.project_id) === String(pid)) &&
      //       !folderIds.some((fid) => String(e.folder_id) === String(fid))
      //   )
      // );

      if (String(currentWsId) === String(id)) setCurrentWsId(null);

      toast.success(
        `Workspace and all its content (${projectsToDelete.length} projects, ${foldersToDelete.length} folders, ${endpointsToDelete.length} endpoints) deleted successfully`
      );
    } catch (error) {
      console.error("Delete workspace error:", error);
      toast.error("Failed to delete workspace or its content");
    }
  };

  const [pageInput, setPageInput] = useState(page);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isTyping) {
      setPageInput(page);
    }
  }, [page]);

  useEffect(() => {
    if (!selectedFolder?.id || !openSchemaDialog) return;

    // Fetch base_schema từ folder
    fetch(`${API_ROOT}/folders/${selectedFolder.id}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch folder schema");
        return res.json();
      })
      .then((data) => {
        setFolderSchema(data.base_schema || {});
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch folder schema");
      });
  }, [selectedFolder, openSchemaDialog]);

  const handleSaveFolderSchema = async (newSchema) => {
    if (!selectedFolder?.id) return;

    try {
      const res = await fetch(`${API_ROOT}/folders/${selectedFolder.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base_schema: newSchema }),
      });

      if (!res.ok) throw new Error("Failed to update folder schema");
      toast.success("Folder schema updated successfully!");
      setFolderSchema(newSchema);
      setOpenSchemaDialog(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save folder schema");
    }
  };

  const handleEnableWSChannel = async (projectId) => {
    try {
      const res = await fetch(`${API_ROOT}/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websocket_enabled: true }),
      });

      if (!res.ok) throw new Error("Failed to enable WebSocket");

      setProject((prev) =>
        prev ? { ...prev, websocket_enabled: true } : prev
      );

      toast.success("WebSocket Channel created!");
    } catch (err) {
      console.error("Enable WebSocket error:", err);
      toast.error("Failed to create WebSocket Channel");
    }
  };

  const handleDeleteWSChannel = async (projectId) => {
    try {
      const res = await fetch(`${API_ROOT}/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websocket_enabled: false }),
      });

      if (!res.ok) throw new Error("Failed to delete WebSocket Channel");

      setProject((prev) =>
        prev ? { ...prev, websocket_enabled: false } : prev
      );

      toast.success("WebSocket Channel deleted");
      setOpenWSDialog(false);
    } catch (err) {
      console.error("Delete WS error:", err);
      toast.error("Failed to delete WebSocket Channel");
    }
  };

  const handleCopyURL = (url) => {
    navigator.clipboard.writeText(url);
    toast.info("Copied to clipboard!");
  };

  useProjectWs(currentProject?.id, currentProject?.websocket_enabled);

  useEffect(() => {
    const saved = localStorage.getItem("folder_active_tab");
    if (saved && saved !== activeTab) {
      setActiveTab(saved);
    }
  }, []);

  if (!currentProject) return null;

  return (
    <div className="folder-page flex flex-col min-h-screen">
      {isLoading ? (
        // Loading screen
        <div className="flex flex-col justify-center items-center h-screen">
          <span className="loader"></span>
          <p className="text-lg mt-2 font-medium">
            Loading folders...
          </p>
        </div>
      ) : (
        // Main content
        <>
          <div className="mt-8 w-full shadow-sm z-20">
            {/* Top Navbar */}
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
              showNewResponseButton={false}
              username={currentUsername}
            />
          </div>

          {/* Main Content */}
          <main className="folder-page-content flex justify-center min-h-full items-center transition-all duration-300">
            <div className="w-full px-2 pt-2 pb-4 rounded-lg">
              <div className="card flex flex-col h-fit border-2 rounded-lg">
                <div className="tab-header flex rounded-t-lg">
                  <button
                    onClick={() => {
                      setActiveTab("folders");
                      localStorage.setItem("folder_active_tab", "folders");
                    }}
                    className={`tab-button flex rounded-tl-lg px-4 py-2 ${activeTab === "folders"
                        ? "active"
                        : ""
                      }`}
                  >
                    <div className="flex items-center">
                      <img
                        src={folderIcon}
                        alt="folder"
                        className={`w-4 h-4 mr-2 ${activeTab === "folders"
                            ? "brightness-0 dark:invert"
                            : ""
                          }`}
                      />
                      <span className="text-md font-semibold">Folders</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("logs");
                      localStorage.setItem("folder_active_tab", "logs");
                      setPage(1);
                    }}
                    className={`tab-button rounded-none px-4 py-2 ${activeTab === "logs"
                        ? "active"
                        : ""
                      }`}
                  >
                    <div className="flex items-center">
                      <img
                        src={logsIcon}
                        alt="logs"
                        className={`w-4 h-4 mr-2 ${activeTab === "logs"
                            ? "brightness-0 dark:invert"
                            : ""
                          }`}
                      />
                      <span className="text-md font-semibold">Logs</span>
                    </div>
                  </button>
                </div>

                {activeTab === "folders" ? (
                  <>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="w-full max-w-7xl rounded-lg px-8 py-4">
                        <div className="flex items-center justify-between mb-6">
                          {/* Project name */}
                          <h2 className="text-xl font-semibold">
                            {currentProject?.name} —{" "}
                            {
                              folders.filter(
                                (f) =>
                                  String(f.project_id) === String(projectId)
                              ).length
                            }{" "}
                            Folder(s)
                          </h2>

                          <div className="flex items-center gap-2">
                            {!currentProject.websocket_enabled ? (
                              <Button
                                onClick={() => handleEnableWSChannel(currentProject.id)}
                                className="btn-primary rounded-xs"
                              >
                                Create WS Channel
                              </Button>
                            ) : (
                              <Button
                                onClick={() => setOpenWSDialog(true)}
                                className="btn-primary rounded-xs"
                              >
                                View WS Channel
                              </Button>
                            )}

                            {/* New Folder button */}
                            <Button
                              className="btn-primary rounded-xs"
                              onClick={() => {
                                setOpenNewFolder(true);
                                setNewFolderName("");
                                setNewFolderMode(false);
                                setNewFolderDesc("");
                              }}
                            >
                              New Folder
                            </Button>
                          </div>
                        </div>

                        {/* Folder List */}
                        <div className="gap-6">
                          {folders.filter(
                            (f) => String(f.project_id) === String(projectId)
                          ).length === 0 ? (
                            <div className="text-center text-slate-500 py-12">
                              No folders found in this project.
                            </div>
                          ) : (
                            folders
                              .filter(
                                (f) =>
                                  String(f.project_id) === String(projectId)
                              )
                              .map((folder) => (
                                <FolderCard
                                  key={folder.id}
                                  folder={folder}
                                  endpoints={endpoints}
                                  onEditName={(f) => {
                                    setEditFolderName(f.name);
                                    setEditingFolderId(f.id);
                                    setOpenEditFolder(true);
                                  }}
                                  onEditSchema={(f) => {
                                    setSelectedFolder(f);
                                    setOpenSchemaDialog(true);
                                  }}
                                  onDeleteFolder={(f) => {
                                    handleDeleteFolder(f.id);
                                  }}
                                  onToggleMode={async (f, newVal) => {
                                    await fetch(`${API_ROOT}/folders/${f.id}`, {
                                      method: "PUT",
                                      credentials: "include",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        is_public: newVal,
                                      }),
                                    });
                                    setFolders((prev) =>
                                      prev.map((ff) =>
                                        ff.id === f.id
                                          ? { ...ff, is_public: newVal }
                                          : ff
                                      )
                                    );
                                  }}
                                  onAddEndpoint={(f) => {
                                    setNewEType(false);
                                    setNewEFolderId(f.id || "");
                                    setSelectedFolder(f);
                                    setNewEName("");
                                    setNewEPath("");
                                    setNewEMethod("");
                                    setOpenNew(true);
                                  }}
                                  onEditEndpoint={(ep) => openEditEndpoint(ep)}
                                  onDeleteEndpoint={(id) =>
                                    handleDeleteEndpoint(id)
                                  }
                                  onOpenEndpoint={(ep) =>
                                    navigate(
                                      `/dashboard/${projectId}/endpoint/${ep.id}`
                                    )
                                  }
                                />
                              ))
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : activeTab === "logs" ? (
                  <>
                    {/* Logs */}
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="w-full max-w-[1440px] overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/4">
                                Matched Response
                              </TableHead>
                              <TableHead className="w-1/12 text-center">
                                Method
                              </TableHead>
                              <TableHead className="w-1/3">
                                Path
                              </TableHead>
                              <TableHead className="w-1/12">
                                Status
                              </TableHead>
                              <TableHead className="w-1/12">
                                Latency
                              </TableHead>
                              <TableHead className="w-1/6">
                                Time & Date
                              </TableHead>
                            </TableRow>

                            <TableRow>
                              <TableHead colSpan={6} className="border-b custom-border">
                                <div className="flex items-center justify-between gap-4">

                                  {/* Left: Search */}
                                  <div className="flex items-center gap-2 w-1/4">
                                    <div className="relative w-full">
                                      <img
                                        src={searchIcon}
                                        alt="search"
                                        className="absolute top-1/2 -translate-y-1/2 left-1 w-4 h-4 opacity-70 dark:invert"
                                      />
                                      <Input
                                        type="text"
                                        placeholder="Search logs..."
                                        className="pl-6 pr-3 h-9 text-sm border-none shadow-none w-full"
                                        value={searchTerm}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setSearchTerm(value);
                                          setPage(1);
                                          localStorage.setItem("logs_search", value);
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {/* Right: Select */}
                                  <div className="flex justify-between w-1/6">
                                    <div className="">
                                      <Select
                                        value={timeFilter}
                                        onValueChange={(value) => {
                                          setTimeFilter(value);
                                          setPage(1);
                                          localStorage.setItem("logs_timeSpan", value);
                                        }}
                                      >
                                        <SelectTrigger className="w-full ml-2 border-none shadow-none">
                                          <SelectValue placeholder="Recent logs" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Recent logs">Recent logs</SelectItem>
                                          <SelectItem value="24h">Last 24 hours</SelectItem>
                                          <SelectItem value="7d">Last 7 days</SelectItem>
                                          <SelectItem value="30d">Last 30 days</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="flex items-center">
                                      <div className="flex justify-center">
                                        <div className="flex items-center">
                                          <button
                                            onClick={() => {
                                              // Gọi lại API logs
                                              fetchLogs(projectId, page, rowsPerPage);
                                            }}
                                            className="rounded-md"
                                          >
                                            <img
                                              src={refreshIcon}
                                              alt="refresh"
                                              className="w-6 h-6 transition-all duration-300 dark:brightness-0 dark:invert"
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableHead>
                            </TableRow>

                            <TableRow className="border-none">
                              <TableHead colSpan={6}></TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {loadingLogs ? (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="text-center py-4"
                                >
                                  {/* Loading screen */}
                                  <span className="loader"></span>
                                  <p className="mt-2 font-medium">
                                    Loading logs...
                                  </p>
                                </TableCell>
                              </TableRow>
                            ) : logs.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="text-center py-4"
                                >
                                  No logs available.
                                </TableCell>
                              </TableRow>
                            ) : logs.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="text-center py-4"
                                >
                                  No logs found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              logs.map((log, i) => (
                                <LogCard key={i} log={log} />
                              ))
                            )}
                          </TableBody>
                        </Table>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={page <= 1}
                              onClick={() => {
                                const newPage = Math.max(page - 1, 1);
                                setPage(newPage);
                                localStorage.setItem("logs_page", newPage);
                              }}
                            >
                              <ChevronLeftIcon className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                              <Input
                                value={pageInput}
                                onChange={(e) => {
                                  setIsTyping(true);

                                  const raw = e.target.value;

                                  // Cho phép xoá hết
                                  if (raw === "") {
                                    setPageInput("");
                                    return;
                                  }

                                  let value = Number(raw);
                                  if (value < 1) value = 1;

                                  if (!isNaN(value)) {
                                    setPageInput(value);
                                  }
                                }}
                                onBlur={() => {
                                  let value = Number(pageInput);

                                  setIsTyping(false);

                                  if (!pageInput) {
                                    setPageInput(page);
                                    return;
                                  }

                                  if (value < 1) value = 1;
                                  if (value > totalPages) value = totalPages;

                                  setPageInput(value);
                                  setPage(value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "-" || e.key === "e") e.preventDefault();

                                  if (e.key === "Enter") {
                                    setIsTyping(false);

                                    let value = Number(pageInput);

                                    if (!pageInput) {
                                      setPageInput(page);
                                      return;
                                    }

                                    if (value < 1) value = 1;
                                    if (value > totalPages) value = totalPages;

                                    setPageInput(value);
                                    setPage(value);
                                  }
                                }}
                                className="w-10 h-7 text-center text-sm shadow-none"
                              />

                              <span className="text-sm mr-1">/ {totalPages || 0}</span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={page >= totalPages}
                              onClick={() => {
                                const newPage = Math.min(page + 1, totalPages);
                                setPage(newPage);
                                localStorage.setItem("logs_page", newPage);
                              }}
                            >
                              <ChevronRightIcon className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm">Rows per page</span>
                            <Select
                              value={rowsPerPage.toString()}
                              onValueChange={(val) => {
                                const newLimit = Number(val);
                                setRowsPerPage(newLimit);
                                localStorage.setItem("logs_limit", newLimit);
                                setPage(1);
                              }}
                            >
                              <SelectTrigger className="w-[80px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[5, 10, 20, 50].map((size) => (
                                  <SelectItem
                                    key={size}
                                    value={size.toString()}
                                  >
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </main>

          {/* footer */}
          <footer
            className="mt-auto w-full flex justify-between items-center px-8 py-4 text-xs font-semibold">
            <span>© Teknix Corp. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <img src={tiktokIcon} alt="tiktok" className="w-4 h-4 dark:invert" />
              <img src={fbIcon} alt="facebook" className="w-4 h-4 dark:invert" />
              <img src={linkedinIcon} alt="linkedin" className="w-4 h-4 dark:invert" />
              <a className="hover:underline font-semibold" href="">
                About
              </a>
              <span>·</span>
              <a className="hover:underline font-semibold" href="">
                Support
              </a>
            </div>
          </footer>
        </>
      )}

      {/* Dialog New Workspace */}
      <Dialog open={openNewWs} onOpenChange={setOpenNewWs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Workspace</DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <div className="space-y-2">
            <label className="block text-sm font-medium opacity-70">
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
              disabled={isCreatingWorkspace}
              className="bg-[#FBEB6B] hover:bg-[#FDE047] text-black dark:bg-[#5865F2] dark:hover:bg-[#4752C4] dark:text-white"
              onClick={() => {
                handleAddWorkspace(newWsName);
              }}
            >
              {isCreatingWorkspace ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workspace */}
      <Dialog open={openEditWs} onOpenChange={setOpenEditWs}>
        <DialogContent className="sm:max-w-md shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Edit Workspace
            </DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <div className="mt-2 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">
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
              variant="outline"
              onClick={() => setOpenEditWs(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={
                editWsName.trim() ===
                (workspaces.find((w) => w.id === editWsId)?.name || "") ||
                isEditingWorkspace
              }
              className="bg-[#FBEB6B] hover:bg-[#FDE047] text-black dark:bg-[#5865F2] dark:hover:bg-[#4752C4] dark:text-white"
              onClick={handleEditWorkspace}
            >
              {isEditingWorkspace ? "Editing..." : "Edit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Workspace */}
      <Dialog
        open={!!confirmDeleteWs}
        onOpenChange={() => setConfirmDeleteWs(null)}
      >
        <DialogContent className="sm:max-w-md shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
          </DialogHeader>
          {(() => {
            const wsToDelete = workspaces.find(
              (w) => String(w.id) === String(confirmDeleteWs)
            );

            return (
              <DialogDescription>
                Are you sure you want to delete workspace{" "}
                <span className="text-red-500 font-bold">
                      {wsToDelete ? wsToDelete.name : "this workspace"}
                    </span>{" "} and all its projects?
              </DialogDescription>
            );
          })()}
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

      {/* New Folder Dialog */}
      <Dialog open={openNewFolder} onOpenChange={setOpenNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>

          <div className="space-y-3">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateFolder();
                }
              }}
            />

            {/* Folder Mode Selection */}
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Folder Mode</p>
              <div className="flex items-center gap-6">
                {/* Private */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="folderMode"
                    value="private"
                    checked={!newFolderMode}
                    onChange={() => setNewFolderMode(false)}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${!newFolderMode ? "border-black dark:border-[#B9BBBE]" : "border-gray-400"
                      }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border ${!newFolderMode
                          ? "border-white bg-yellow-300 dark:border-[#36393F] dark:bg-[#5865F2]"
                          : "border-gray-200 bg-white dark:border-[#36393F] dark:bg-[#36393F]"
                        }`}
                    />
                  </div>
                  <span className="text-sm">Private</span>
                </label>

                {/* Public */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="folderMode"
                    value="public"
                    checked={newFolderMode}
                    onChange={() => setNewFolderMode(true)}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${newFolderMode ? "border-black dark:border-[#B9BBBE]" : "border-gray-400"
                      }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border ${newFolderMode
                          ? "border-white bg-yellow-300 dark:border-[#36393F] dark:bg-[#5865F2]"
                          : "border-gray-200 bg-white dark:border-[#36393F] dark:bg-[#36393F]"
                        }`}
                    />
                  </div>
                  <span className="text-sm">Public</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNewFolder(false)}>Cancel</Button>
            <Button
              disabled={isCreatingFolder}
              className="bg-[#FBEB6B] hover:bg-[#FDE047] text-black dark:bg-[#5865F2] dark:hover:bg-[#4752C4] dark:text-white"
              onClick={handleCreateFolder}
            >
              {isCreatingFolder ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Edit Folder Dialog === */}
      <Dialog open={openEditFolder} onOpenChange={setOpenEditFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <Input
            placeholder="Folder name"
            value={editFolderName}
            onChange={(e) => setEditFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (hasChanges()) {
                  handleUpdateFolder();
                }
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditFolder(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateFolder}
              disabled={!hasChanges()}
              className={`bg-[#FBEB6B] hover:bg-[#FDE047] text-black dark:bg-[#5865F2] dark:hover:bg-[#4752C4] dark:text-white ${!hasChanges() ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {isEditingFolder ? "Editing..." : "Edit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Folder Schema Dialog === */}
      <Dialog open={openSchemaDialog} onOpenChange={setOpenSchemaDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          {folderSchema ? (
            <BaseSchemaEditor
              folderData={{ schema: folderSchema }}
              folderId={selectedFolder?.id}
              onSave={handleSaveFolderSchema}
              method={"PUT"}
            />
          ) : (
            <div className="text-center py-6">
              Loading schema...
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* === Delete Confirmation Dialog === */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
          </DialogHeader>
          <DialogDescription className="opacity-70">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{selectedFolder?.name}</span>?
            <span className="text-red-500 text-sm">
              This action cannot be undone.
            </span>
          </DialogDescription>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="destructive"
              onClick={async () => {
                try {
                  if (!selectedFolder?.id)
                    throw new Error("No folder selected");

                  const res = await fetch(
                    `${API_ROOT}/folders/${selectedFolder.id}`,
                    {
                      method: "DELETE",
                      credentials: "include",
                    }
                  );

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

      {/* Delete Folder Dialog */}
      <Dialog open={openDeleteFolder} onOpenChange={setOpenDeleteFolder}>
        <DialogContent className="sm:max-w-md shadow-xl rounded-xl border-0">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-semibold">
              Delete Folder
            </DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>

          <div>
            <p className="text-sm opacity-70">
              Are you sure you want to delete this folder and all its endpoints?
              This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="pt-4 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setOpenDeleteFolder(false);
                setDeleteFolderId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteFolder}
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Endpoint Handlers ---*/}
      {/* New Endpoint Button + Dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent
          className="sm:max-w-lg shadow-lg rounded-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreateEndpoint();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>New Endpoint</DialogTitle>
            <DialogDescription className="text-sm">
              Endpoint details
            </DialogDescription>
          </DialogHeader>
          <DialogDescription></DialogDescription>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Name
              </h3>
              <Input
                placeholder="Enter endpoint name"
                value={newEName}
                onChange={(e) => setNewEName(e.target.value)}
              />
            </div>

            {/* Folder select - only folders for current project */}
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Folder
              </h3>
              <Select
                value={String(newEFolderId || "")}
                onValueChange={(v) => setNewEFolderId(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option" />
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
              <h3 className="text-sm font-semibold mb-1">
                Path
              </h3>
              <Input
                placeholder="/examples/example/:id"
                value={newEPath}
                onChange={(e) => setNewEPath(e.target.value)}
              />
            </div>

            {/* Method */}
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Method
              </h3>
              <Select
                value={newEMethod}
                onValueChange={(v) => setNewEMethod(v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a method" />
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
              variant="outline"
              onClick={() => {
                setOpenNew(false);
                setNewEName("");
                setNewEPath("");
                setNewEMethod("");
                setNewEFolderId("");
                setNewEType(false);
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={isCreatingEndpoint}
              className="bg-[#FBEB6B] hover:bg-[#FDE047] text-black dark:bg-[#5865F2] dark:hover:bg-[#4752C4] dark:text-white"
              onClick={handleCreateEndpoint}
            >
              {isCreatingEndpoint ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Endpoint Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          className="sm:max-w-lg shadow-lg rounded-lg"
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
          <DialogDescription className="text-sm">
            Endpoint details
          </DialogDescription>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Name
              </h3>
              <Input
                placeholder="Enter endpoint name"
                value={editEName}
                onChange={(e) => setEditEName(e.target.value)}
              />
            </div>

            {/* Path */}
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Path
              </h3>
              <Input
                placeholder="Enter endpoint path"
                value={editEPath}
                onChange={(e) => {
                  setEditEPath(e.target.value);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenEdit(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEndpoint}
              className="bg-[#FBEB6B] hover:bg-[#FDE047] text-black dark:bg-[#5865F2] dark:hover:bg-[#4752C4] dark:text-white"
              disabled={!hasEdited}
            >
              {isEditingEndpoint ? "Editing..." : "Edit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View WS Channel */}
      <WSChannelSheet
        open={openWSDialog}
        onOpenChange={setOpenWSDialog}
        project={currentProject}
        workspace={currentWorkspace}
        onDeleteWSChannel={handleDeleteWSChannel}
        onCopyURL={handleCopyURL}
      />
    </div>
  );
}
