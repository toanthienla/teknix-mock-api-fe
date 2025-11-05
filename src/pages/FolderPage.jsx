import React, {useEffect, useMemo, useState} from "react";
import {getCurrentUser} from "@/services/api.js";
import {Button} from "@/components/ui/button";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";

import 'spoilerjs/spoiler-span';
import Topbar from "@/components/Topbar.jsx";
import {toast} from "react-toastify";
import LogCard from "@/components/LogCard.jsx";
import {Card} from "@/components/ui/card";
import {Plus, Trash2} from "lucide-react";

import tiktokIcon from "@/assets/light/tiktok.svg";
import fbIcon from "@/assets/light/facebook.svg";
import linkedinIcon from "@/assets/light/linkedin.svg";
import folderIcon from "@/assets/light/folder-icon.svg";
import logsIcon from "@/assets/light/logs.svg";
import FolderCard from "@/components/FolderCard.jsx";
import searchIcon from "@/assets/light/search.svg";
import deleteIcon from "@/assets/light/delete.svg";

const BaseSchemaEditor = ({folderData, folderId, onSave}) => {
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
        id: {type: "number", required: false},
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
      const newErrors = {...prev};
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleChange = (id, key, value) => {
    setSchemaFields((prev) =>
      prev.map((f) => (f.id === id ? {...f, [key]: value} : f))
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
      <Card className="p-4 border border-slate-300 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Folder Base Schema
        </h2>

        {/* Header */}
        <div className="grid grid-cols-3 gap-4 font-semibold text-gray-700 border-b pb-2 mb-2">
          <div>Field Name</div>
          <div>Type</div>
          <div>Required</div>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {schemaFields.map((field) => (
            <div key={field.id} className="grid grid-cols-3 gap-4 items-center">
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
                  <SelectValue/>
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
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">true</SelectItem>
                    <SelectItem value="false">false</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteField(field.id)}
                  disabled={field.name === "id"}
                >
                  <Trash2
                    className={`w-4 h-4 ${
                      field.name === "id" ? "text-gray-400" : "text-red-500"
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
            <Plus className="w-4 h-4 mr-2"/> Add Field
          </Button>
          <Button
            className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
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
              <br/> <br/>
              Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
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
  const {projectId} = useParams();
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

  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");

  const [deleteFolderId, setDeleteFolderId] = useState(null);
  const [openDeleteFolder, setOpenDeleteFolder] = useState(false);

  const [timeFilter, setTimeFilter] = useState("Recent logs");

  const [newFolderMode, setNewFolderMode] = useState(false);
  const [openEditFolder, setOpenEditFolder] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  // edit endpoint state
  const [editId, setEditId] = useState(null);
  const [editEName, setEditEName] = useState("");
  const [editEState, setEditEState] = useState(false);

  // dialogs
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [openWSDialog, setOpenWSDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

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
        console.error("Error loading data:", error);
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
      .then((r) => r.json())
      .then((rData) => {
        const projectsArr = Array.isArray(rData) ? rData : rData.data || [];
        setProjects(projectsArr);

        // reset folders + endpoints trước khi fetch mới
        setFolders([]);
        setEndpoints([]);

        projectsArr.forEach((p) => {
          // fetch folders của từng project
          fetch(`${API_ROOT}/folders?project_id=${p.id}`, {
            credentials: "include",
          })
            .then((r) => r.json())
            .then((fData) => {
              const fArr = Array.isArray(fData) ? fData : fData.data || [];
              setFolders((prev) => {
                const merged = [...prev];
                fArr.forEach((f) => {
                  if (!merged.some((ff) => ff.id === f.id)) {
                    merged.push(f);
                  }
                });
                return merged;
              });

              // fetch endpoints cho từng folder
              fArr.forEach((f) => {
                fetch(`${API_ROOT}/endpoints?folder_id=${f.id}`, {
                  credentials: "include",
                })
                  .then((r2) => r2.json())
                  .then((eData) => {
                    const eArr = Array.isArray(eData)
                      ? eData
                      : eData.data || [];

                    const withProjectId = eArr.map((e) => ({
                      ...e,
                      project_id: f.project_id,
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
                    console.error(
                      `Failed to fetch endpoints for folder ${f.id}`
                    )
                  );
              });
            })
            .catch(() =>
              console.error(`Failed to fetch folders for project ${p.id}`)
            );
        });
      })
      .catch(() =>
        console.error(`Failed to fetch projects for workspace ${wsId}`)
      );
  };

  // useEffect(() => {
  //   if (projectId && endpoints.length) fetchLogs(projectId);
  // }, [projectId, endpoints]);

  const fetchLogs = async (pid) => {
    if (!pid) return;
    try {
      const res = await fetch(
        `${API_ROOT}/project_request_logs?project_id=${pid}`,
        {credentials: "include"}
      );

      if (res.status === 401) {
        console.warn("Unauthorized (401) - rechecking user login...");
        await checkUserLogin();
        return;
      }

      if (!res.ok) throw new Error(`logs not ok: ${res.status}`);
      const raw = await res.json();

      const logsArray = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.items)
          ? raw.items
          : Array.isArray(raw.data)
            ? raw.data
            : [];

      const endpointMap = new Map(endpoints.map((e) => [String(e.id), e]));

      const enrichedLogs = await Promise.all(
        logsArray.map(async (log) => {
          if (!log || !log.endpoint_id)
            return {...log, project_id: log?.project_id ?? pid};

          const endpoint = endpointMap.get(String(log.endpoint_id));
          const endpointName = endpoint ? endpoint.name : "Unknown endpoint";

          try {
            const r2 = await fetch(
              `${API_ROOT}/endpoint_responses?endpoint_id=${log.endpoint_id}`,
              {
                credentials: "include",
              }
            );
            if (!r2.ok) throw new Error("responses not ok");
            const payload = await r2.json();
            const responses = Array.isArray(payload)
              ? payload
              : Array.isArray(payload.items)
                ? payload.items
                : Array.isArray(payload.data)
                  ? payload.data
                  : [];

            const matched =
              responses.find((r) => String(r.id) === String(log.response_id)) ||
              responses[0];

            return {
              ...log,
              project_id: endpoint
                ? endpoint.project_id
                : log.project_id ?? pid,
              endpointResponseName: matched
                ? `${endpointName} - ${matched.name}`
                : endpointName,
            };
          } catch (err) {
            console.error("Error fetching endpoint_responses:", err);
            return {
              ...log,
              project_id: endpoint
                ? endpoint.project_id
                : log.project_id ?? pid,
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
    const validationError = validateFolderName(newFolderName);
    if (validationError) return toast.warning(validationError);

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
        headers: {"Content-Type": "application/json"},
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
    }
  };

  const handleUpdateFolder = async () => {
    const validationError = validateFolderName(editFolderName);
    if (validationError) return toast.warning(validationError);

    try {
      const res = await fetch(`${API_ROOT}/folders/${editingFolderId}`, {
        method: "PUT",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
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

  const validateEditEndpoint = async (id, name, state) => {
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
            ep.origin_id !== id &&
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
    if (!validateCreateEndpoint(newEName, newEPath, newEMethod)) return;

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
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newEndpoint),
      });

      // Nếu response không thành công, đọc lỗi chi tiết
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (errorData && errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err) => {
            if (err.message)
              toast.error(
                `Error ${err.field ? `${err.field}: ` : ""}${err.message}`
              );
          });
        } else {
          toast.error("Failed to create endpoint");
        }
        return;
      }

      // Nếu thành công
      const created = await res.json();
      setEndpoints((prev) => [...prev, created]);
      setOpenNew(false);
      toast.success("Endpoint created!");
    } catch (error) {
      console.error("Error creating endpoint:", error);
      toast.error("Failed to create endpoint");
    }
  };

  // edit endpoint
  const [currentEndpoint, setCurrentEndpoint] = useState(null);
  const openEditEndpoint = (e) => {
    setEditId(e.id);
    setEditEName(e.name);
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
    return editEName !== currentEndpoint.name;
  }, [editEName, currentEndpoint]);

  const handleUpdateEndpoint = async () => {
    const isValid = await validateEditEndpoint(editId, editEName, editEState);
    if (!isValid) return;

    const updated = {name: editEName};

    try {
      const res = await fetch(`${API_ROOT}/endpoints/${editId}`, {
        method: "PUT",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Failed to update endpoint");

      setEndpoints((prev) =>
        prev.map((ep) => (ep.id === editId ? {...ep, ...updated} : ep))
      );

      setOpenEdit(false);
      toast.success("Update endpoint successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update endpoint!");
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
        toast.success("Create workspace successfully!");
        setNewWsName("");
        setOpenNewWs(false);
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
      setProjects((prev) =>
        prev.filter((p) => String(p.workspace_id) !== String(id))
      );
      setFolders((prev) =>
        prev.filter(
          (f) => !projectIds.some((pid) => String(f.project_id) === String(pid))
        )
      );
      setEndpoints((prev) =>
        prev.filter(
          (e) =>
            !projectIds.some((pid) => String(e.project_id) === String(pid)) &&
            !folderIds.some((fid) => String(e.folder_id) === String(fid))
        )
      );

      if (String(currentWsId) === String(id)) setCurrentWsId(null);

      toast.success(
        `Workspace and all its content (${projectsToDelete.length} projects, ${foldersToDelete.length} folders, ${endpointsToDelete.length} endpoints) deleted successfully`
      );
    } catch (error) {
      console.error("Delete workspace error:", error);
      toast.error("Failed to delete workspace or its content");
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const projectOk = String(log.project_id) === String(projectId);

    let timeOk = true;
    if (timeFilter && timeFilter !== "Recent logs") {
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
    return projectOk && timeOk;
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
  // if (folderId) {
  //   filteredEndpoints = filteredEndpoints.filter(
  //     (e) => String(e.folder_id) === String(folderId)
  //   );
  // }

  // sort endpoints based on sortOption
  let sortedEndpoints = [...filteredEndpoints];

  if (sortOption === "Recently created") {
    sortedEndpoints.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  } else if (sortOption === "Oldest first") {
    sortedEndpoints.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  } else if (sortOption === "Alphabetical (A-Z)") {
    sortedEndpoints.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === "Alphabetical (Z-A)") {
    sortedEndpoints.sort((a, b) => b.name.localeCompare(a.name));
  }

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
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({base_schema: newSchema}),
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

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, websocket_enabled: true } : p
        )
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

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, websocket_enabled: false } : p
        )
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

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800">
      {isLoading ? (
        // Loading screen
        <div className="flex flex-col justify-center items-center h-screen bg-white">
          <span className="loader"></span>
          <p className="text-lg mt-2 font-medium text-gray-700">
            Loading folders...
          </p>
        </div>
      ) : (
        // Main content
        <>
          <div className="mt-8 w-full bg-white shadow-sm z-20">
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
          <main className="flex justify-center min-h-full items-center bg-white transition-all duration-300">
            <div className="w-full px-2 pt-2 pb-4">
              <div className="flex flex-col h-fit border-2 border-gray-200 rounded-lg bg-white">
                <div className="flex rounded-t-lg bg-gray-200 mb-4 text-stone-500">
                  <button
                    onClick={() => setActiveTab("folders")}
                    className={`flex rounded-tl-lg px-4 py-2 -mb-px ${
                      activeTab === "folders"
                        ? "bg-white text-stone-900"
                        : "bg-gray-200 text-stone-500"
                    }`}
                  >
                    <div className="flex items-center">
                      <img
                        src={folderIcon}
                        alt="folder"
                        className={`w-4 h-4 mr-2 ${
                          activeTab === "folders"
                            ? "brightness-0"
                            : ""
                        }`}
                      />
                      <span className="text-md font-semibold">Folders</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("logs");
                      fetchLogs(projectId);
                    }}
                    className={`rounded-none px-4 py-2 -mb-px ${
                      activeTab === "logs"
                        ? "bg-white text-stone-900"
                        : "bg-gray-200 text-stone-500"
                    }`}
                  >
                    <div className="flex items-center">
                      <img
                        src={logsIcon}
                        alt="logs"
                        className={`w-4 h-4 mr-2 ${
                          activeTab === "logs"
                            ? "brightness-0"
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
                      <div className="w-full max-w-7xl bg-white rounded-lg px-8 py-4">
                        <div className="flex items-center justify-between mb-6">
                          {/* Project name */}
                          <h2 className="text-xl font-semibold text-gray-800">
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
                                className="bg-yellow-200 hover:bg-yellow-300 rounded-xs text-black"
                              >
                                Create WS Channel
                              </Button>
                            ) : (
                              <Button
                                onClick={() => setOpenWSDialog(true)}
                                className="bg-yellow-200 hover:bg-yellow-300 rounded-xs text-black"
                              >
                                View WS Channel
                              </Button>
                            )}

                            {/* New Folder button */}
                            <Button
                              className="bg-yellow-200 hover:bg-yellow-300 rounded-xs text-black"
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
                                          ? {...ff, is_public: newVal}
                                          : ff
                                      )
                                    );
                                  }}
                                  onAddEndpoint={(f) => {
                                    setNewEType(false);
                                    setNewEFolderId(f.id || "");
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
                      <div className="w-full max-w-7xl overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/4 text-black">
                                Matched Response
                              </TableHead>
                              <TableHead className="w-1/12 text-black">
                                Method
                              </TableHead>
                              <TableHead className="w-1/3 text-black">
                                Path
                              </TableHead>
                              <TableHead className="w-1/12 text-black">
                                Status
                              </TableHead>
                              <TableHead className="w-1/12 text-black">
                                Latency
                              </TableHead>
                              <TableHead className="w-1/6 text-black">
                                Time & Date
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
                                      placeholder="Search..."
                                      className="pl-5 pr-3 h-9 text-sm border-none shadow-none w-full"
                                      value={searchTerm}
                                      onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              </TableHead>

                              <TableHead colSpan={1} className="text-right">
                                <Select value={timeFilter} onValueChange={setTimeFilter}>
                                  <SelectTrigger className="w-full bg-white border-none shadow-none">
                                    <SelectValue placeholder="Recent logs"/>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Recent logs">Recent logs</SelectItem>
                                    <SelectItem value="Last 24 hours">Last 24 hours</SelectItem>
                                    <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                                    <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableHead>
                            </TableRow>
                            <TableRow className="border-none">
                              <TableHead
                                colSpan={6}
                                className="py-1"
                              ></TableHead>
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
                              paginatedLogs.map((log, i) => (
                                <LogCard key={i} log={log}/>
                              ))
                            )}
                          </TableBody>
                        </Table>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={page === 1}
                              onClick={() => setPage((p) => p - 1)}
                            >
                              <ChevronLeftIcon className="w-4 h-4"/>
                            </Button>
                            <span className="text-sm font-semibold">
                              {page} / {totalPages || 1}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={page === totalPages || totalPages === 0}
                              onClick={() => setPage((p) => p + 1)}
                            >
                              <ChevronRightIcon className="w-4 h-4"/>
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
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
            className="mt-auto w-full flex justify-between items-center px-8 py-4 text-xs font-semibold text-gray-700">
            <span>© Teknix Corp. All rights reserved.</span>
            <div className="flex items-center gap-3 text-gray-700">
              <img src={tiktokIcon} alt="tiktok" className="w-4 h-4"/>
              <img src={fbIcon} alt="facebook" className="w-4 h-4"/>
              <img src={linkedinIcon} alt="linkedin" className="w-4 h-4"/>
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

      {/* Dialog components luôn hiển thị bên ngoài loading */}
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
              className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
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
              <p className="text-sm font-medium text-slate-700 mb-1">Folder Mode</p>
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
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      !newFolderMode ? "border-black" : "border-gray-400"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border ${
                        !newFolderMode ? "border-white bg-yellow-300" : "border-gray-200 bg-white"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-slate-700">Private</span>
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
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      newFolderMode ? "border-black" : "border-gray-400"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border ${
                        newFolderMode ? "border-white bg-yellow-300" : "border-gray-200 bg-white"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-slate-700">Public</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpenNewFolder(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === Edit Folder Dialog === */}
      <Dialog open={openEditFolder} onOpenChange={setOpenEditFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
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
            <Button onClick={() => setOpenEditFolder(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateFolder}
              disabled={!hasChanges()}
              className={`bg-yellow-300 hover:bg-yellow-400 text-indigo-950 ${
                !hasChanges() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Update
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
              folderData={{schema: folderSchema}}
              folderId={selectedFolder?.id}
              onSave={handleSaveFolderSchema}
              method={"PUT"}
            />
          ) : (
            <div className="text-gray-500 text-center py-6">
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
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-xl rounded-xl border-0">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Delete Folder
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm text-gray-600">
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

      {/* --- Endpoint Handlers ---*/}
      {/* New Endpoint Button + Dialog */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
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
            <DialogDescription className="text-sm text-slate-500">
              Endpoint details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
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
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
                Folder
              </h3>
              <Select
                value={String(newEFolderId || "")}
                onValueChange={(v) => setNewEFolderId(v)}
              >
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
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
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
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
                Method
              </h3>
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
                setNewEFolderId("");
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

      {/* Edit Endpoint Dialog */}
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
          <DialogDescription className="text-sm text-slate-800">
            Endpoint details
          </DialogDescription>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
                Name
              </h3>
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

      {/* View WS Channel Dialog */}
      <Dialog open={openWSDialog} onOpenChange={setOpenWSDialog}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Real-time Updates via WebSocket
            </DialogTitle>
          </DialogHeader>

          {currentProject && currentWorkspace && (
            <div className="mt-4 space-y-4 text-sm">
              {/* Unsecured URL */}
              <div className="relative">
                <div className="text-xs font-mono bg-gray-100 px-4 py-1.5 rounded-t border flex justify-between items-center">
                  bash
                  <button
                    className="bg-yellow-200 hover:bg-yellow-300 text-xs px-2 py-1 rounded-xs"
                    onClick={() =>
                      handleCopyURL(
                        `ws://${API_ROOT}/ws/${currentWorkspace.name}/${currentProject.name}`
                      )
                    }
                  >
                    Copy
                  </button>
                </div>
                <div className="relative bg-white border border-t-0 rounded-b p-4 font-mono text-sm break-all">
                  <span className="border-b-2 border-gray-300 px-2 py-1">
                    Your Unsecured URL:{" "}
                    <spoiler-span>
                      “ws://{API_ROOT}/ws/{currentWorkspace.name}/{currentProject.name}”
                    </spoiler-span>
                  </span>
                </div>
              </div>

              {/* Secured URL */}
              <div className="relative">
                <div className="text-xs font-mono bg-gray-100 px-4 py-1.5 rounded-t border flex justify-between items-center">
                  bash
                  <button
                    className="bg-yellow-200 hover:bg-yellow-300 text-xs px-2 py-1 rounded-xs"
                    onClick={() =>
                      handleCopyURL(
                        `ws://${API_ROOT}/ws/${currentWorkspace.name}/${currentProject.name}`
                      )
                    }
                  >
                    Copy
                  </button>
                </div>
                <div className="relative bg-white border border-t-0 rounded-b p-4 font-mono text-sm break-all">
                  <span className="border-b-2 border-gray-300 px-2 py-1">
                    Your Secured URL:{" "}
                    <spoiler-span>
                      “wss://{API_ROOT}/ws/{currentWorkspace.name}/{currentProject.name}”
                    </spoiler-span>
                  </span>
                </div>
              </div>

              {/* Delete Button */}
              <div className="pt-2">
                <Button
                  variant="destructive"
                  className="group w-full flex items-center gap-2 justify-center text-black hover:text-white bg-white
                    border border-red-500 hover:bg-red-500 transition-colors duration-200"
                  onClick={() => setOpenDeleteConfirm(true)}
                >
                  <img
                    src={deleteIcon}
                    alt="Delete"
                    className="w-4 h-4 transition duration-200 group-hover:brightness-0 group-hover:invert"
                  />
                  <span>Delete WS Channel</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              Delete Confirm
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex flex-col space-y-2">
            {/* Delete button */}
            <Button
              className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md py-2"
              onClick={() => {
                handleDeleteWSChannel(currentProject.id);
                setOpenDeleteConfirm(false);
              }}
            >
              Delete
            </Button>

            {/* Cancel button */}
            <Button
              variant="outline"
              className="bg-gray-50 hover:bg-gray-100 font-semibold text-black rounded-md py-2"
              onClick={() => setOpenDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
