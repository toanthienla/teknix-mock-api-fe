import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { API_ROOT } from "../utils/constants";
import Sidebar from "../components/Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Star,
  Trash2,
  Upload,
  Code,
  GripVertical,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import { useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Topbar from "@/components/Topbar.jsx";

const statusCodes = [
  {
    code: "100",
    description: "Continue – Request received, continue with request.",
  },
  {
    code: "101",
    description:
      "Switching Protocols – Protocol switching requested by client.",
  },
  {
    code: "102",
    description: "Processing – Request is being processed (WebDAV).",
  },
  { code: "200", description: "OK – Request succeeded." },
  { code: "201", description: "Created – Resource created successfully." },
  {
    code: "202",
    description:
      "Accepted – Request accepted for processing (not completed yet).",
  },
  {
    code: "204",
    description: "No Content – Request succeeded, but no content returned.",
  },
  {
    code: "206",
    description:
      "Partial Content – Partial response (used for range requests).",
  },
  {
    code: "301",
    description: "Moved Permanently – Resource has a new permanent URL.",
  },
  { code: "302", description: "Found – Temporary redirect." },
  { code: "303", description: "See Other – Redirect with GET method." },
  {
    code: "304",
    description: "Not Modified – Cached resource is still valid.",
  },
  {
    code: "307",
    description: "Temporary Redirect – Same as 302 but method is preserved.",
  },
  {
    code: "308",
    description: "Permanent Redirect – Same as 301 but method is preserved.",
  },
  { code: "400", description: "Bad Request – Invalid request syntax." },
  { code: "401", description: "Unauthorized – Authentication required." },
  {
    code: "403",
    description: "Forbidden – Client not allowed to access resource.",
  },
  { code: "404", description: "Not Found – Resource not found." },
  {
    code: "405",
    description: "Method Not Allowed – HTTP method not supported.",
  },
  {
    code: "408",
    description: "Request Timeout – Client took too long to send request.",
  },
  {
    code: "409",
    description: "Conflict – Request conflicts with resource state.",
  },
  { code: "410", description: "Gone – Resource is permanently unavailable." },
  {
    code: "415",
    description:
      "Unsupported Media Type – Server does not support request format.",
  },
  { code: "429", description: "Too Many Requests – Rate limiting exceeded." },
  { code: "500", description: "Internal Server Error – Generic server error." },
  {
    code: "501",
    description: "Not Implemented – Server does not support functionality.",
  },
  {
    code: "502",
    description: "Bad Gateway – Invalid response from upstream server.",
  },
  {
    code: "503",
    description:
      "Service Unavailable – Server temporarily overloaded/unavailable.",
  },
  {
    code: "504",
    description: "Gateway Timeout – Upstream server took too long.",
  },
  {
    code: "505",
    description:
      "HTTP Version Not Supported – Server doesn’t support HTTP version.",
  },
];

const Frame = ({ responseName, selectedResponse, onUpdateRules, onSave }) => {
  const [parameterRows, setParameterRows] = useState([]);

  const [errors, setErrors] = useState({});
  const [selectedRuleId, setSelectedRuleId] = useState(null);

  const validateRule = (row) => {
    const newErrors = {};

    if (!row.name.trim()) {
      newErrors.name = "Name cannot be empty";
    } else if (row.type === "Route Parameter" && /\s/.test(row.name)) {
      newErrors.name = "Route parameter name cannot contain spaces";
    }

    if (!row.value.trim()) {
      newErrors.value = "Value cannot be empty";
    } else if (row.type === "Body") {
      try {
        JSON.parse(row.value);
      } catch {
        newErrors.value = "Value must be valid JSON";
      }
    }

    const existingRules = parameterRows.filter((r) => r.id !== row.id);
    const duplicateRule = existingRules.find(
      (r) =>
        r.type === row.type &&
        r.name.trim().toLowerCase() === row.name.trim().toLowerCase()
    );

    if (duplicateRule) {
      newErrors.name = `Duplicate ${row.type.toLowerCase()} name. "${
        row.name
      }" already exists.`;
    }

    return newErrors;
  };

  const validateAllRules = () => {
    const allErrors = {};
    let isValid = true;

    parameterRows.forEach((row) => {
      const rowErrors = validateRule(row);
      if (Object.keys(rowErrors).length > 0) {
        allErrors[row.id] = rowErrors;
        isValid = false;
      }
    });

    setErrors(allErrors);
    return isValid;
  };

  // Initialize rows from selectedResponse if available
  useEffect(() => {
    if (selectedResponse?.condition) {
      const condition = selectedResponse.condition;
      const newRows = [];

      // Process params
      if (condition.params) {
        Object.entries(condition.params).forEach(([key, value], index) => {
          newRows.push({
            id: `param-${index}`,
            type: "Route Parameter",
            name: key,
            value: String(value),
          });
        });
      }

      // Process query
      if (condition.query) {
        Object.entries(condition.query).forEach(([key, value], index) => {
          newRows.push({
            id: `query-${index}`,
            type: "Query parameter",
            name: key,
            value: String(value),
          });
        });
      }

      // Process headers
      if (condition.headers) {
        Object.entries(condition.headers).forEach(([key, value], index) => {
          newRows.push({
            id: `header-${index}`,
            type: "Header",
            name: key,
            value: String(value),
          });
        });
      }

      // Process body
      if (condition.body) {
        Object.entries(condition.body).forEach(([key, value], index) => {
          newRows.push({
            id: `body-${index}`,
            type: "Body",
            name: key,
            value:
              typeof value === "string"
                ? value
                : JSON.stringify(value, null, 2),
          });
        });
      }

      setParameterRows(newRows);

      // Validate all rules after initialization
      setTimeout(() => {
        validateAllRules();
      }, 0);
    } else {
      setParameterRows([]);
    }
  }, [selectedResponse]);

  const getPlaceholderText = (type) => {
    switch (type) {
      case "Route Parameter":
        return "route parameter name";
      case "Query parameter":
        return "parameter name or object path";
      case "Body":
        return "object path (empty for full body)";
      case "Header":
        return "header name";
      default:
        return "route parameter name";
    }
  };

  const handleTypeChange = (id, newType) => {
    setParameterRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id
          ? {
              ...row,
              type: newType,
              name:
                row.name === "" || row.name === getPlaceholderText(row.type)
                  ? ""
                  : row.name,
            }
          : row
      )
    );

    // Validate rule after type change
    setTimeout(() => {
      const row = parameterRows.find((r) => r.id === id);
      if (row) {
        const rowErrors = validateRule(row);
        setErrors((prev) => ({
          ...prev,
          [id]: rowErrors,
        }));
      }
    }, 0);
  };

  const handleAddRule = () => {
    // Validate tất cả rules trước khi thêm mới
    if (!validateAllRules()) {
      toast.error("Please fix errors before adding new rule");
      return;
    }

    const newRow = {
      id: `rule-${Date.now()}`,
      type: "Route Parameter",
      name: "",
      value: "",
    };

    setParameterRows((prevRows) => [...prevRows, newRow]);
    setSelectedRuleId(newRow.id);
  };

  const handleRuleClick = (id, event) => {
    if (event.target.closest("button")) {
      return;
    }
    setSelectedRuleId(id);
  };

  const handleDeleteRule = (idToDelete) => {
    setParameterRows((prevRows) => {
      const filteredRows = prevRows.filter((row) => row.id !== idToDelete);

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[idToDelete];
        return newErrors;
      });

      if (filteredRows.length < prevRows.length) {
        toast.info("Rule removed locally. Click 'Save Changes' to apply.");
      }

      return filteredRows;
    });

    if (selectedRuleId === idToDelete) {
      setSelectedRuleId(null);
    }
  };

  const handleNameChange = (id, value) => {
    setParameterRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: value } : r))
    );

    // Validate rule sau khi thay đổi tên
    setTimeout(() => {
      const row = parameterRows.find((r) => r.id === id);
      if (row) {
        const rowErrors = validateRule({ ...row, name: value });
        setErrors((prev) => ({
          ...prev,
          [id]: rowErrors,
        }));
      }
    }, 0);
  };

  const handleValueChange = (id, value) => {
    setParameterRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, value } : r))
    );

    // Validate rule after value change
    setTimeout(() => {
      const row = parameterRows.find((r) => r.id === id);
      if (row) {
        const rowErrors = validateRule({ ...row, value });
        setErrors((prev) => ({
          ...prev,
          [id]: rowErrors,
        }));
      }
    }, 0);
  };

  // Prepare condition object for API
  const prepareCondition = () => {
    const condition = {};

    parameterRows.forEach((row) => {
      if (!row.name.trim() && !row.value.trim()) return;

      let key = row.name.trim();
      let value = row.value.trim();

      // Try to parse value as JSON, fallback to string
      try {
        value = JSON.parse(value);
      } catch {
        // Keep as string if not valid JSON
      }

      switch (row.type) {
        case "Route Parameter":
          if (!condition.params) condition.params = {};
          condition.params[key] = value;
          break;
        case "Query parameter":
          if (!condition.query) condition.query = {};
          condition.query[key] = value;
          break;
        case "Header":
          if (!condition.headers) condition.headers = {};
          condition.headers[key] = value;
          break;
        case "Body":
          if (!condition.body) condition.body = {};
          condition.body[key] = value;
          break;
      }
    });

    return condition;
  };

  // Notify parent when rules change
  useEffect(() => {
    if (onUpdateRules) {
      onUpdateRules(prepareCondition());
    }
  }, [parameterRows]);

  const handleSave = () => {
    if (!validateAllRules()) {
      toast.error("Please fix all errors before saving");
      return;
    }

    onSave();
  };

  return (
    <div>
      <Card className="p-6 border border-[#CBD5E1] rounded-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#37352F]">
            {responseName || "No Response Selected"}
          </h1>
        </div>

        <div className="space-y-4">
          {parameterRows.map((row) => (
            <div
              key={row.id}
              onClick={(e) => handleRuleClick(row.id, e)}
              className={`flex flex-col p-3 rounded-md border cursor-pointer ${
                row.id === selectedRuleId
                  ? "border-blue-600"
                  : "border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-[168px]">
                  <Select
                    value={row.type}
                    onValueChange={(value) => handleTypeChange(row.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Route Parameter">
                        Route Parameter
                      </SelectItem>
                      <SelectItem value="Query parameter">
                        Query Parameter
                      </SelectItem>
                      <SelectItem value="Header">Header</SelectItem>
                      <SelectItem value="Body">Body</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-blue-600 w-6 flex justify-center">=</div>

                <Input
                  id={`rule-name-${row.id}`} // Thêm id duy nhất
                  name={`rule-name-${row.id}`} // Thêm name duy nhất
                  value={row.name}
                  onChange={(e) => handleNameChange(row.id, e.target.value)}
                  className={`w-[184px] ${
                    errors[row.id]?.name ? "border-red-500" : ""
                  }`}
                  placeholder={getPlaceholderText(row.type)}
                />

                <Input
                  id={`rule-value-${row.id}`} // Thêm id duy nhất
                  name={`rule-value-${row.id}`} // Thêm name duy nhất
                  value={row.value}
                  onChange={(e) => handleValueChange(row.id, e.target.value)}
                  className={`w-[151px] ${
                    errors[row.id]?.value ? "border-red-500" : ""
                  }`}
                  placeholder="value"
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRule(row.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Hiển thị lỗi */}
              {(errors[row.id]?.name || errors[row.id]?.value) && (
                <div className="text-red-500 text-xs mt-1 pl-2">
                  {errors[row.id]?.name || errors[row.id]?.value}
                </div>
              )}
            </div>
          ))}

          {/* Thêm thông báo khi không có rule nào */}
          {parameterRows.length === 0 && (
            <div className="text-gray-500 text-sm mt-2 pl-2">
              No rules are available.
            </div>
          )}

          {/* Sửa lại container cho 2 nút để chúng nằm cùng hàng */}
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={handleAddRule}>
              <Plus className="mr-2 h-4 w-4" />
              Add rule
            </Button>

            {selectedResponse && (
              <Button
                className="bg-[#2563EB] hover:bg-[#1E40AF] text-white"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const DashboardPage = () => {
  // Thêm state để quản lý loading
  const [isLoading, setIsLoading] = useState(true);
  // Thêm state để lưu lỗi response name
  const [responseNameError, setResponseNameError] = useState("");
  const { projectId, endpointId } = useParams();
  const [currentEndpointId, setCurrentEndpointId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [responseName, setResponseName] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [responseBody, setResponseBody] = useState("");
  const [delay, setDelay] = useState("0");
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentWsId, setCurrentWsId] = useState(null);

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

  const [statusData, setStatusData] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [endpointResponses, setEndpointResponses] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [folders, setFolders] = useState([]);

  const [openEditWs, setOpenEditWs] = useState(false);
  const [confirmDeleteWs, setConfirmDeleteWs] = useState(null);
  const [editWsId, setEditWsId] = useState(null);
  const [editWsName, setEditWsName] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyMethod, setProxyMethod] = useState("GET");
  const [openNewProject, setOpenNewProject] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [targetWsId, setTargetWsId] = useState(null);

  // Thêm state để lưu trữ trạng thái trước khi drag
  const [previousStatusData, setPreviousStatusData] = useState([]);

  // Thêm state để lưu condition
  const [responseCondition, setResponseCondition] = useState({});

  const [setSearchTerm] = useState("");

  const currentProject = projectId
    ? projects.find((p) => String(p.id) === String(projectId))
    : null;

  const currentWorkspace = currentProject
    ? workspaces.find(
        (w) => String(w.id) === String(currentProject.workspace_id)
      )
    : null;

  const method =
    endpoints.find((ep) => String(ep.id) === String(currentEndpointId))
      ?.method || "GET";

  // Sửa các hàm fetch để trả về promise
  const fetchWorkspaces = () => {
    return fetch(`${API_ROOT}/workspaces`)
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
    return fetch(`${API_ROOT}/projects`)
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
    return fetch(`${API_ROOT}/endpoints`)
      .then((res) => res.json())
      .then((data) => {
        setEndpoints(data);
      });
  };

  const fetchFolders = () => {
    return fetch(`${API_ROOT}/folders`)
      .then((res) => res.json())
      .then((data) => {
        setFolders(data);
      })
      .catch((error) => {
        console.error('Error fetching folders:', error);
      });
  };

  const fetchEndpointResponses = () => {
    const endpointIdStr = String(currentEndpointId);

    return fetch(`${API_ROOT}/endpoint_responses?endpoint_id=${endpointIdStr}`)
      .then((res) => res.json())
      .then((data) => {
        const sortedData = [...data].sort((a, b) => a.priority - b.priority);
        setEndpointResponses(sortedData);

        const statusDataFormatted = sortedData.map((res) => ({
          id: res.id,
          code: res.status_code.toString(),
          name: res.name,
          isDefault: res.is_default,
          bgColor: res.is_default ? "bg-slate-100" : "",
          priority: res.priority,
        }));
        setStatusData(statusDataFormatted);

        if (!selectedResponse && data.length > 0) {
          const defaultResponse = data.find((res) => res.is_default) || data[0];
          setSelectedResponse(defaultResponse);
          setResponseName(defaultResponse.name);
          setStatusCode(defaultResponse.status_code.toString());
          setResponseBody(
            JSON.stringify(defaultResponse.response_body, null, 2)
          );
          setDelay(defaultResponse.delay_ms?.toString() || "0");

          setProxyUrl(defaultResponse.proxy_url || "");
          setProxyMethod(defaultResponse.proxy_method || "GET");
        } else if (selectedResponse) {
          const existingResponse = data.find(
            (res) => res.id === selectedResponse.id
          );
          if (existingResponse) {
            setSelectedResponse(existingResponse);
            setResponseName(existingResponse.name);
            setStatusCode(existingResponse.status_code.toString());
            setResponseBody(
              JSON.stringify(existingResponse.response_body, null, 2)
            );
            setDelay(existingResponse.delay_ms?.toString() || "0");

            setProxyUrl(existingResponse.proxy_url || "");
            setProxyMethod(existingResponse.proxy_method || "GET");
          } else if (data.length > 0) {
            const defaultResponse =
              data.find((res) => res.is_default) || data[0];
            setSelectedResponse(defaultResponse);
            setResponseName(defaultResponse.name);
            setStatusCode(defaultResponse.status_code.toString());
            setResponseBody(
              JSON.stringify(defaultResponse.response_body, null, 2)
            );
            setDelay(defaultResponse.delay_ms?.toString() || "0");

            setProxyUrl(defaultResponse.proxy_url || "");
            setProxyMethod(defaultResponse.proxy_method || "GET");
          }
        }
      });
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchWorkspaces(),
          fetchProjects(),
          fetchEndpoints(),
          fetchFolders(),
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (currentEndpointId) {
      setIsLoading(true);
      fetchEndpointResponses().finally(() => setIsLoading(false));
    }
  }, [currentEndpointId]);

  useEffect(() => {
    if (endpointResponses.length > 0 && !selectedResponse) {
      const defaultResponse =
        endpointResponses.find((r) => r.is_default) || endpointResponses[0];
      setProxyUrl(defaultResponse.proxy_url || "");
      setProxyMethod(defaultResponse.proxy_method || "GET");
    }
  }, [endpointResponses, selectedResponse]);

  useEffect(() => {
    if (endpointId) {
      setCurrentEndpointId(String(endpointId));
    } else if (endpoints.length > 0 && currentEndpointId === null) {
      setCurrentEndpointId(endpoints[0].id);
    }
  }, [endpointId, endpoints]);

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
    localStorage.setItem(
      "isSidebarCollapsed",
      JSON.stringify(isSidebarCollapsed)
    );
  }, [isSidebarCollapsed]);

  // Keep sidebar expanded when on endpoint detail
  useEffect(() => {
    if (!projectId) return;
    const p = projects.find((proj) => String(proj.id) === String(projectId));
    if (!p) return;

    if (String(currentWsId) !== String(p.workspace_id)) {
      setCurrentWsId(p.workspace_id);
    }
    setOpenProjectsMap((prev) => ({ ...prev, [p.workspace_id]: true }));
    setOpenEndpointsMap((prev) => ({ ...prev, [p.id]: true }));
  }, [projectId, projects, currentWsId]);

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
        setOpenProjectsMap((prev) => ({ ...prev, [createdWs.id]: true }));
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
          fetch(`${API_ROOT}/projects/${p.id}`, { method: "DELETE" })
        )
      );

      await fetch(`${API_ROOT}/workspaces/${id}`, { method: "DELETE" });

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

  const handleDeleteResponse = () => {
    if (!selectedResponse) return;

    // Thêm kiểm tra response mặc định
    if (selectedResponse.is_default) {
      toast.warning("Cannot delete default response");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this response?"
    );
    if (!confirmed) return;

    fetch(`${API_ROOT}/endpoint_responses/${selectedResponse.id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete response");
        }
        return res.json();
      })
      .then(() => {
        // Fetch lại danh sách responses sau khi xóa
        fetchEndpointResponses();

        // Thêm toast thông báo thành công
        toast.success("Response deleted successfully!");

        // Nếu không còn response nào, reset form
        if (endpointResponses.length === 1) {
          setResponseName("");
          setStatusCode("");
          setResponseBody("");
          setDelay("0");
        }
      })
      .catch((error) => {
        console.error("Error deleting response:", error.message);
        toast.error("Failed to delete response!");
      });
  };

  const updatePriorities = (priorityUpdates) => {
    fetch(`${API_ROOT}/endpoint_responses/priority`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(priorityUpdates),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update priorities");
        }
        return res.json();
      })
      .then((updatedResponses) => {
        console.log("Priorities updated:", updatedResponses);

        // Cập nhật endpointResponses với priority mới từ server
        setEndpointResponses((prevResponses) =>
          prevResponses.map((response) => {
            const updated = updatedResponses.find(
              (r) => String(r.id) === String(response.id)
            );
            return updated
              ? { ...response, priority: updated.priority }
              : response;
          })
        );

        // Cập nhật statusData dựa trên updatedResponses (sửa lỗi ở đây)
        setStatusData((prevStatusData) =>
          prevStatusData.map((status) => {
            const updated = updatedResponses.find(
              (r) => String(r.id) === String(status.id)
            );
            return updated ? { ...status, priority: updated.priority } : status;
          })
        );

        // Thêm toast thông báo thành công
        toast.success("Response priorities updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating priorities:", error);

        // Khôi phục state nếu cập nhật thất bại
        setStatusData(previousStatusData);

        // Thêm toast thông báo lỗi
        toast.error("Failed to update response priorities!");
      });
  };

  const setDefaultResponse = (responseId) => {
    // Gọi API đúng endpoint theo yêu cầu
    fetch(`${API_ROOT}/endpoint_responses/${responseId}/set_default`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to set default response");
        }
        return res.json();
      })
      .then((updatedResponses) => {
        console.log("Default response updated:", updatedResponses);

        // Cập nhật endpointResponses với dữ liệu từ server
        setEndpointResponses((prevResponses) =>
          prevResponses.map((response) => {
            const updated = updatedResponses.find(
              (r) => String(r.id) === String(response.id)
            );
            return updated
              ? { ...response, is_default: updated.is_default }
              : response;
          })
        );

        // Cập nhật statusData
        setStatusData((prevStatusData) =>
          prevStatusData.map((status) => {
            const updated = updatedResponses.find(
              (r) => String(r.id) === String(status.id)
            );
            return updated
              ? { ...status, isDefault: updated.is_default }
              : status;
          })
        );

        // Cập nhật selectedResponse nếu cần
        if (
          selectedResponse &&
          updatedResponses.some((r) => r.id === responseId)
        ) {
          const updatedSelected = updatedResponses.find(
            (r) => r.id === responseId
          );
          setSelectedResponse({
            ...selectedResponse,
            is_default: updatedSelected.is_default,
          });
        }

        // Thêm toast thông báo thành công
        toast.success("Default response updated successfully!");
      })
      .catch((error) => {
        console.error("Error setting default response:", error);
        toast.error("Failed to set default response!");

        fetchEndpointResponses();
      });
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    setPreviousStatusData([...statusData]);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedItem !== null && draggedItem !== dropIndex) {
      const newStatusData = [...statusData];
      const draggedItemContent = { ...newStatusData[draggedItem] };

      newStatusData.splice(draggedItem, 1);

      newStatusData.splice(dropIndex, 0, draggedItemContent);

      setStatusData(newStatusData);

      const priorityUpdates = newStatusData.map((item, index) => ({
        id: item.id,
        endpoint_id: String(currentEndpointId),
        priority: index + 1,
      }));

      updatePriorities(priorityUpdates, newStatusData);
    }

    setDraggedItem(null);
  };

  const handleResponseSelect = (response) => {
    fetch(`${API_ROOT}/endpoint_responses/${response.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedResponse(data);
        setResponseName(data.name);
        setStatusCode(data.status_code.toString());
        setResponseBody(JSON.stringify(data.response_body, null, 2));
        setDelay(data.delay_ms?.toString() || "0");
        setProxyUrl(data.proxy_url || "");
        setProxyMethod(data.proxy_method || "GET");
      })
      .catch(console.error);
  };

  const handleNewResponse = () => {
    // Reset form khi tạo mới
    setSelectedResponse(null);
    setResponseName("");
    setStatusCode("200");
    setResponseBody("");
    setDelay("0");
    setIsDialogOpen(true);
  };

  const handleSaveResponse = () => {
    // Parse response body
    let responseBodyObj = {};
    try {
      responseBodyObj = JSON.parse(responseBody);
    } catch {
      toast.error("Invalid JSON in response body");
      return;
    }

    // Validate response name
    const trimmedName = responseName.trim();
    if (!trimmedName) {
      setResponseNameError("Name cannot be empty");
      toast.error("Response name cannot be empty");
      return;
    }

    // Reset lỗi nếu có
    setResponseNameError("");

    const isFirstResponse = endpointResponses.length === 0 && !selectedResponse;

    const payload = {
      endpoint_id: currentEndpointId,
      name: responseName,
      status_code: parseInt(statusCode),
      response_body: responseBodyObj,
      condition: responseCondition,
      is_default: selectedResponse
        ? selectedResponse.is_default
        : isFirstResponse,
      delay_ms: parseInt(delay) || 0,
      proxy_url: proxyUrl.trim() ? proxyUrl : null,
      proxy_method: proxyUrl.trim() ? proxyMethod : null,
    };

    const method = selectedResponse ? "PUT" : "POST";
    const url = selectedResponse
      ? `${API_ROOT}/endpoint_responses/${selectedResponse.id}`
      : `${API_ROOT}/endpoint_responses`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok)
          throw new Error(
            `Failed to ${selectedResponse ? "update" : "create"} response`
          );
        return res.json();
      })
      .then((updatedResponse) => {
        // Chỉ cập nhật state từ response trả về, không cần fetch lại toàn bộ
        setEndpointResponses((prev) =>
          selectedResponse
            ? prev.map((r) =>
                r.id === updatedResponse.id ? updatedResponse : r
              )
            : [...prev, updatedResponse]
        );

        // Cập nhật statusData
        setStatusData((prev) =>
          selectedResponse
            ? prev.map((s) =>
                s.id === updatedResponse.id
                  ? {
                      ...s,
                      code: updatedResponse.status_code.toString(),
                      name: updatedResponse.name,
                      isDefault: updatedResponse.is_default,
                    }
                  : s
              )
            : [
                ...prev,
                {
                  id: updatedResponse.id,
                  code: updatedResponse.status_code.toString(),
                  name: updatedResponse.name,
                  isDefault: updatedResponse.is_default,
                },
              ]
        );

        setProxyUrl(updatedResponse.proxy_url || "");
        setProxyMethod(updatedResponse.proxy_method || "GET");

        if (selectedResponse) {
          setSelectedResponse(updatedResponse);
        }

        if (selectedResponse) {
          toast.success("Response updated successfully!");
        } else {
          toast.success("New response created successfully!");
          setIsDialogOpen(false);
          setSelectedResponse(null);
          setResponseName("");
          setStatusCode("200");
          setResponseBody("");
          setDelay("0");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  useEffect(() => {
    if (selectedResponse) {
      setResponseCondition(selectedResponse.condition || {});
      setProxyUrl(selectedResponse.proxy_url || "");
      setProxyMethod(selectedResponse.proxy_method || "GET");
    }
  }, [selectedResponse]);

  // Thêm UI loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Loading endpoint data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 flex">
      {/* Sidebar */}
      <aside
        className={`border-r border-slate-100 bg-white transition-all duration-300
                ${!isSidebarCollapsed ? "border-r" : "border-none"}`}
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
          isCollapsed={isSidebarCollapsed} // Truyền trạng thái xuống
          setIsCollapsed={setIsSidebarCollapsed} // Truyền hàm set trạng thái
          onAddProject={(workspaceId) => {
            setTargetWsId(workspaceId); // lưu workspace đang chọn
            setOpenNewProject(true); // mở modal tạo project
          }}
          onAddFolder={(projectId) => {
            console.log('Add folder for project:', projectId);
          }}
        />
      </aside>

      {/* Main Content */}
      <div className={`pt-8 flex-1 transition-all duration-300`}>
        {/* Header */}
        <Topbar
          className="mt-0 mb-4"
          breadcrumb={
            currentWorkspace
              ? currentProject
                ? currentEndpointId
                  ? [
                      {
                        label: currentWorkspace.name,
                        WORKSPACE_ID: currentWorkspace.id,
                        href: "/dashboard", // workspace chỉ cần /dashboard
                      },
                      {
                        label: currentProject.name,
                        href: `/dashboard/${currentProject.id}`,
                      },
                      {
                        label:
                          endpoints.find(
                            (ep) => String(ep.id) === String(currentEndpointId)
                          )?.name || "Endpoint",
                        href: null, // endpoint không có link
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
          onNewResponse={handleNewResponse}
          showNewProjectButton={false}
          showNewResponseButton={true}
        />

        {/* Navigation Tabs */}
        <div
          className={`transition-all duration-300 px-8 pt-4 pb-8
            ${
              isSidebarCollapsed
                ? "w-[calc(100%+16rem)] -translate-x-64"
                : "w-full"
            }`}
        >
          {/* Container chung cho cả hai phần */}
          <div className="flex justify-between items-center mb-6">
            {/* Phần bên trái - Display Endpoint Name and Method */}
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-[#37352F] mr-4">
                {endpoints.find(
                  (ep) => String(ep.id) === String(currentEndpointId)
                )?.name || "Endpoint"}
              </h2>
              <Badge
                variant="outline"
                className={`px-2 py-0.5 text-xs font-semibold rounded-sm ${
                  method === "GET"
                    ? "bg-emerald-100 text-black hover:bg-emerald-200"
                    : method === "POST"
                      ? "bg-indigo-300 text-black hover:bg-indigo-400"
                      : method === "PUT"
                        ? "bg-orange-400 text-black hover:bg-orange-500"
                        : method === "DELETE"
                          ? "bg-red-400 text-black hover:bg-red-500"
                          : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
              >
                {method}
              </Badge>
            </div>

            {/* Phần bên phải - Form Status Info */}
            <div className="flex-1 max-w-[707px] ml-8">
              <div className="flex flex-row items-center p-0 gap-3.5 w-full h-[20px] border border-[#D1D5DB] rounded-md">
                <div className="w-[658px] h-[19px] font-inter font-semibold text-[16px] leading-[19px] text-[#777671] flex-1 ml-1.5">
                  {endpoints.find(
                    (ep) => String(ep.id) === String(currentEndpointId)
                  )?.path || "-"}
                </div>
                <div className="flex flex-row items-center gap-3 w-[21px] h-[20px]">
                  <div className="w-[21px] h-[20px] relative">
                    <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
                      <path
                        d="M7.5 10H13.5M10.5 7V13"
                        stroke="#777671"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Cột trái - Response Configuration */}
            <div className="w-1/3">
              {/* Response Configuration Table */}
              <div className="rounded-md border border-solid border-slate-300">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-transparent rounded-[6px_6px_0px_0px] [border-top-style:none] [border-right-style:none] border-b [border-bottom-style:solid] [border-left-style:none] border-neutral-200">
                      <TableHead className="w-[119.2px] h-10 px-1 py-0">
                        <div className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]">
                          <div className="relative w-fit mt-[-1.00px] font-text-sm-medium font-[number:var(--text-sm-medium-font-weight)] text-neutral-950 text-[length:var(--text-sm-medium-font-size)] tracking-[var(--text-sm-medium-letter-spacing)] leading-[var(--text-sm-medium-line-height)] whitespace-nowrap [font-style:var(--text-sm-medium-font-style)]">
                            Status Code
                          </div>
                        </div>
                      </TableHead>
                      <TableHead className="w-[270.55px] h-10 mr-[-96.75px]">
                        <div className="flex w-[92.99px] h-10 items-center px-0 py-2 relative rounded-md">
                          <div className="inline-flex justify-center mr-[-33.01px] items-center gap-2.5 relative flex-[0_0_auto]">
                            <div className="relative w-fit mt-[-1.00px] font-text-sm-medium font-[number:var(--text-sm-medium-font-weight)] text-neutral-950 text-[length:var(--text-sm-medium-font-size)] tracking-[var(--text-sm-medium-letter-spacing)] leading-[var(--text-sm-medium-line-height)] whitespace-nowrap [font-style:var(--text-sm-medium-font-style]">
                              Name Response
                            </div>
                          </div>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statusData.map((status, index) => (
                      <TableRow
                        key={status.id || status.code}
                        className={`${
                          status.isDefault ? "bg-slate-100" : ""
                        } border-b [border-bottom-style:solid] border-neutral-200 ${
                          index === statusData.length - 1 ? "border-b-0" : ""
                        } ${draggedItem === index ? "opacity-50" : ""} ${
                          selectedResponse?.id === status.id
                            ? "ring-2 ring-blue-500"
                            : ""
                        }`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDragEnd={() => setDraggedItem(null)}
                        onDrop={(e) => handleDrop(e, index)}
                        onClick={() => {
                          const response = endpointResponses.find(
                            (r) => r.id === status.id
                          );
                          if (response) handleResponseSelect(response);
                        }}
                      >
                        <TableCell className="w-[119.2px] h-[49px] p-2">
                          <div className="flex self-stretch w-full items-center gap-2.5 relative flex-[0_0_auto]">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            <div className="relative w-fit mt-[-1.00px] font-text-sm-regular font-[number:var(--text-sm-regular-font-weight)] text-neutral-950 text-[length:var(--text-sm-regular-font-size)] tracking-[var(--text-sm-regular-letter-spacing)] leading-[var(--text-sm-regular-line-height)] whitespace-nowrap [font-style:var(--text-sm-regular-font-style)]">
                              {status.code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[270.55px] h-[49px] p-2 mr-[-96.75px] relative">
                          <div className="flex self-stretch w-full items-center gap-2.5 relative flex-[0_0_auto]">
                            <div className="relative w-fit mt-[-1.00px] font-text-sm-regular font-[number:var(--text-sm-regular-font-weight)] text-neutral-950 text-[length:var(--text-sm-regular-font-size)] tracking-[var(--text-sm-regular-letter-spacing)] leading-[var(--text-sm-regular-line-height)] whitespace-nowrap [font-style:var(--text-sm-regular-font-style)]">
                              {status.name}
                            </div>
                          </div>
                        </TableCell>
                        {/* Thêm cột Default badge */}
                        <TableCell className="w-[80px] h-[49px] p-2">
                          {status.isDefault && (
                            <div className="flex items-center justify-center px-2.5 py-0.5 border border-[#7A787C] rounded-md">
                              <span className="text-xs font-medium text-[#0A0A0A]">
                                Default
                              </span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Cột phải - Navigation và Content */}
            <div className="w-2/3">
              {/* Navigation Tabs */}
              <Tabs defaultValue="Header&Body" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent mb-4">
                  <TabsTrigger
                    value="Header&Body"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                  >
                    Header&Body
                  </TabsTrigger>
                  <TabsTrigger
                    value="Rules"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                  >
                    Request Matching
                  </TabsTrigger>
                  <TabsTrigger
                    value="proxy"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                  >
                    Proxy
                  </TabsTrigger>
                </TabsList>

                {/* TabsContent */}
                <TabsContent value="Header&Body" className="mt-0">
                  <div></div>
                  <div className="mt-2">
                    <Card className="p-6 border border-[#CBD5E1] rounded-lg">
                      <div className="flex justify-between items-center mb-6">
                        {/* Display Response Name instead of Endpoint Name */}
                        <h2 className="text-2xl font-bold text-[#37352F] mr-4">
                          {selectedResponse?.name || "No Response Selected"}
                        </h2>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-[#E5E5E5]"
                            onClick={() => {
                              if (selectedResponse) {
                                setDefaultResponse(selectedResponse.id);
                              }
                            }}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                selectedResponse?.is_default
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-[#898883]"
                              }`}
                            />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-[#E5E5E5]"
                            onClick={handleDeleteResponse}
                            disabled={selectedResponse?.is_default} // Thêm disabled prop
                          >
                            <Trash2
                              className={`h-4 w-4 ${
                                selectedResponse?.is_default
                                  ? "text-gray-400"
                                  : "text-[#898883]"
                              }`}
                            />
                          </Button>
                        </div>
                      </div>

                      {/* Form */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="response-name"
                            className="text-right text-sm font-medium text-[#000000]"
                          >
                            Response Name
                          </Label>
                          <Input
                            id="response-name"
                            value={responseName}
                            onChange={(e) => setResponseName(e.target.value)}
                            className="col-span-3 border-[#CBD5E1] rounded-md"
                          />
                        </div>

                        {/* Sửa phần Status Code */}
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="status-code"
                            className="text-right text-sm font-medium text-[#000000]"
                          >
                            Status Code
                          </Label>
                          <div className="col-span-3">
                            <Select
                              value={statusCode}
                              onValueChange={(value) => setStatusCode(value)}
                            >
                              <SelectTrigger
                                id="status-code" // Thêm id để khớp với htmlFor của Label
                                className="border-[#CBD5E1] rounded-md"
                              >
                                <SelectValue placeholder="Select status code" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80 overflow-y-auto border border-[#CBD5E1] rounded-md">
                                {statusCodes.map((status) => (
                                  <SelectItem
                                    key={status.code}
                                    value={status.code}
                                  >
                                    {status.code} -{" "}
                                    {status.description.split("–")[0]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Sửa phần Response Header - chuyển từ Label thành div vì đây là tiêu đề nhóm */}
                        <div className="grid grid-cols-4 items-start gap-4">
                          <div className="text-right text-sm font-medium text-[#000000] self-start pt-1">
                            Response Header
                          </div>
                          <div className="col-span-3"></div>
                        </div>

                        <div className="grid grid-cols-2 items-start gap-4">
                          <div className="text-right text-sm font-medium text-[#000000] self-start pt-1">
                            Content-Type:
                          </div>
                          <div className="col-span-1 border-[#CBD5E1] rounded-md p-2 bg-gray-50">
                            application/json
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <Label
                            htmlFor="response-body"
                            className="text-right pt-2 text-sm font-medium text-[#000000]"
                          >
                            Response Body
                          </Label>
                          <div className="col-span-3 space-y-2">
                            <Textarea
                              id="response-body"
                              value={responseBody}
                              onChange={(e) => setResponseBody(e.target.value)}
                              className="font-mono h-60 border-[#CBD5E1] rounded-md"
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#E5E5E5]"
                              >
                                <Upload className="mr-2 h-4 w-4" /> Upload
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#E5E5E5]"
                              >
                                <Code className="mr-2 h-4 w-4" /> Format
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="delay"
                            className="text-right text-sm font-medium text-[#000000]"
                          >
                            Delay (ms)
                          </Label>
                          <Input
                            id="delay"
                            value={delay}
                            onChange={(e) => setDelay(e.target.value)}
                            className="col-span-3 border-[#CBD5E1] rounded-md"
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            className="bg-[#2563EB] hover:bg-[#1E40AF] text-white"
                            onClick={handleSaveResponse}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="Rules" className="mt-0">
                  <div></div>
                  <div className="mt-2">
                    <Frame
                      responseName={selectedResponse?.name}
                      selectedResponse={selectedResponse}
                      onUpdateRules={setResponseCondition}
                      onSave={handleSaveResponse}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="proxy" className="mt-0">
                  <Card className="p-6 border border-[#CBD5E1] rounded-lg">
                    <div className="space-y-6">
                      <div className="flex flex-col items-start gap-2.5">
                        <Label className="text-sm font-medium text-[#000000] font-inter">
                          Forward proxy URL
                        </Label>
                        <div className="flex flex-col items-start gap-[10px] w-full max-w-[790px]">
                          <div className="flex flex-row items-center gap-[16px] w-full">
                            <Select
                              value={proxyMethod}
                              onValueChange={setProxyMethod}
                            >
                              <SelectTrigger className="w-[120px] h-[36px] border-[#CBD5E1] rounded-md">
                                <SelectValue placeholder="Method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              id="proxy-url"
                              name="proxy-url"
                              placeholder="Enter proxy URL (e.g. https://api.example.com/{{params.id}})"
                              value={proxyUrl}
                              onChange={(e) => setProxyUrl(e.target.value)}
                              className="flex-1 h-[36px] border-[#CBD5E1] rounded-md bg-white placeholder:text-[#9CA3AF]"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Use {"{{params.id}}"} for route parameters (e.g.
                            /users/:id)
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          className="bg-[#2563EB] hover:bg-[#1E40AF] text-white"
                          onClick={handleSaveResponse}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

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

        {/* New Project */}
        <Dialog open={openNewProject} onOpenChange={setOpenNewProject}>
          <DialogContent className="max-w-lg rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                New Project
              </DialogTitle>
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
              <Button
                variant="outline"
                onClick={() => setOpenNewProject(false)}
              >
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
              Are you sure you want to delete this workspace and all its
              projects?
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

        {/* New Response Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-lg rounded-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedResponse ? "Edit Response" : "Create New Response"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <Label htmlFor="new-response-name">Response Name</Label>
                <Input
                  id="new-response-name"
                  placeholder="Enter response name"
                  value={responseName}
                  onChange={(e) => setResponseName(e.target.value)}
                  className={`w-full ${
                    responseNameError ? "border-red-500" : ""
                  }`}
                />
                {responseNameError && (
                  <p className="text-red-500 text-sm mt-1">
                    {responseNameError}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="new-status-code">Status Code</Label>
                <select
                  id="new-status-code"
                  value={statusCode}
                  onChange={(e) => setStatusCode(e.target.value)}
                  className="w-full p-2 border border-[#CBD5E1] rounded-md"
                >
                  {statusCodes.map((status) => (
                    <option key={status.code} value={status.code}>
                      {status.code} - {status.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="font-medium text-sm text-[#000000]">
                    Header
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-2">
                  <div className="text-right text-sm font-medium text-[#000000]">
                    Content-Type:
                  </div>
                  <div className="col-span-3 border-[#CBD5E1] rounded-md p-2 bg-gray-50">
                    application/json
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="new-response-body">Body</Label>
                <Textarea
                  id="new-response-body"
                  placeholder="Enter response body"
                  value={responseBody}
                  onChange={(e) => setResponseBody(e.target.value)}
                  className="h-32 font-mono"
                />
              </div>

              <div>
                <Label htmlFor="new-delay">Delay (ms)</Label>
                <Input
                  id="new-delay"
                  placeholder="0"
                  value={delay}
                  onChange={(e) => setDelay(e.target.value)}
                />
              </div>

              <DialogFooter className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedResponse(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveResponse}>
                  {selectedResponse ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </div>
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
              Are you sure you want to delete this workspace and all its
              projects?
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
    </div>
  );
};

export default DashboardPage;
