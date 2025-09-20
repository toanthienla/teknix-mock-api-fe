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
  Search,
  Plus,
  Star,
  Trash2,
  Upload,
  Code,
  X,
  GripVertical,
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

// Define the status codes
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

const Frame = ({ responseName }) => {
  const [parameterRows, setParameterRows] = useState([
    {
      id: "rule-1",
      type: "Route Parameter",
      name: "",
      value: "",
    },
  ]);

  const [selectedRuleId, setSelectedRuleId] = useState(null);

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
  };

  const handleAddRule = () => {
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

      if (filteredRows.length === 0) {
        return [
          {
            id: `rule-${Date.now()}`,
            type: "Route Parameter",
            name: "",
            value: "",
          },
        ];
      }

      return filteredRows;
    });

    if (selectedRuleId === idToDelete) {
      setSelectedRuleId(null);
    }
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
              className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer ${
                row.id === selectedRuleId
                  ? "border-blue-600"
                  : "border-slate-300"
              }`}
            >
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
                value={row.name}
                onChange={(e) => {
                  setParameterRows((prev) =>
                    prev.map((r) =>
                      r.id === row.id ? { ...r, name: e.target.value } : r
                    )
                  );
                }}
                className="w-[184px]"
                placeholder={getPlaceholderText(row.type)}
              />

              <Input
                value={row.value}
                onChange={(e) => {
                  setParameterRows((prev) =>
                    prev.map((r) =>
                      r.id === row.id ? { ...r, value: e.target.value } : r
                    )
                  );
                }}
                className="w-[151px]"
                placeholder="value"
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRule(row.id);
                }}
                disabled={parameterRows.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" className="mt-2" onClick={handleAddRule}>
            <Plus className="mr-2 h-4 w-4" />
            Add rule
          </Button>
        </div>
      </Card>
    </div>
  );
};

const DashboardPage = () => {
  const { endpointId } = useParams();
  const [currentEndpointId, setCurrentEndpointId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [responseName, setResponseName] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");
  const [responseBody, setResponseBody] = useState("");
  const [delay, setDelay] = useState("0");
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentWsId, setCurrentWsId] = useState(null);
  const [openProjectsMap, setOpenProjectsMap] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [endpointResponses, setEndpointResponses] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [openEndpointsMap, setOpenEndpointsMap] = useState({});
  const [openEditWs, setOpenEditWs] = useState(false);
  const [confirmDeleteWs, setConfirmDeleteWs] = useState(null);
  const [editWsId, setEditWsId] = useState(null);
  const [editWsName, setEditWsName] = useState("");

  // Thêm state để lưu trữ trạng thái trước khi drag
  const [previousStatusData, setPreviousStatusData] = useState([]);

  const fetchWorkspaces = () => {
    fetch(`${API_ROOT}/workspaces`)
      .then((res) => res.json())
      .then((data) => {
        setWorkspaces(data);
        if (data.length > 0 && !currentWsId) setCurrentWsId(data[0].id);
      });
  };

  const fetchProjects = () => {
    fetch(`${API_ROOT}/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data));
  };

  const fetchEndpoints = () => {
    fetch(`${API_ROOT}/endpoints`)
      .then((res) => res.json())
      .then((data) => {
        setEndpoints(data);
      });
  };

  const fetchEndpointResponses = () => {
    // Đảm bảo endpoint_id luôn là string khi gọi API
    const endpointIdStr = String(currentEndpointId);

    // Fetch responses for specific endpoint using query parameter
    fetch(`${API_ROOT}/endpoint_responses?endpoint_id=${endpointIdStr}`)
      .then((res) => res.json())
      .then((data) => {
        setEndpointResponses(data);

        // Format data for Response Configurations
        const statusDataFormatted = data.map((res) => ({
          id: res.id,
          code: res.status_code.toString(),
          name: res.name,
          isDefault: res.is_default,
          bgColor: res.is_default ? "bg-slate-100" : "",
        }));

        setStatusData(statusDataFormatted);

        // Set default selected response
        if (data.length > 0) {
          const defaultResponse = data.find((res) => res.is_default) || data[0];
          setSelectedResponse(defaultResponse);
          setResponseName(defaultResponse.name);
          setStatusCode(defaultResponse.status_code.toString());
          setResponseBody(
            JSON.stringify(defaultResponse.response_body, null, 2)
          );
          setDelay(defaultResponse.delay_ms?.toString() || "0");
        }
      });
  };

  useEffect(() => {
    fetchWorkspaces();
    fetchProjects();
    fetchEndpoints();
  }, []);

  useEffect(() => {
    if (endpointId) {
      setCurrentEndpointId(String(endpointId));
    } else if (endpoints.length > 0 && currentEndpointId === null) {
      setCurrentEndpointId(endpoints[0].id);
    }
  }, [endpointId, endpoints]);

  useEffect(() => {
    if (currentEndpointId) {
      fetchEndpointResponses();
    }
  }, [currentEndpointId]);

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

  const handleDeleteResponse = () => {
    if (!selectedResponse) return;

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
          setHeaderKey("");
          setHeaderValue("");
          setResponseBody("");
          setDelay("0");
        }
      })
      .catch((error) => {
        console.error("Error deleting response:", error);
        toast.error("Failed to delete response: " + error.message);
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
            const updated = updatedResponses.find((r) => r.id === response.id);
            return updated
              ? { ...response, priority: updated.priority }
              : response;
          })
        );

        // Cập nhật statusData dựa trên updatedResponses (sửa lỗi ở đây)
        setStatusData((prevStatusData) =>
          prevStatusData.map((status) => {
            const updated = updatedResponses.find((r) => r.id === status.id);
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
        toast.error("Failed to update response priorities: " + error.message);
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
            const updated = updatedResponses.find((r) => r.id === response.id);
            return updated
              ? { ...response, is_default: updated.is_default }
              : response;
          })
        );

        // Cập nhật statusData
        setStatusData((prevStatusData) =>
          prevStatusData.map((status) => {
            const updated = updatedResponses.find((r) => r.id === status.id);
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
        toast.error("Failed to set default response: " + error.message);

        // Khôi phục state nếu cập nhật thất bại
        fetchEndpointResponses();
      });
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    setPreviousStatusData([...statusData]); // Lưu trạng thái để khôi phục nếu lỗi
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

      // Xóa item khỏi vị trí cũ
      newStatusData.splice(draggedItem, 1);
      // Chèn item vào vị trí mới
      newStatusData.splice(dropIndex, 0, draggedItemContent);

      // Cập nhật state local ngay lập tức để UI phản hồi nhanh
      setStatusData(newStatusData);

      // Tạo payload cho cập nhật priority (đúng định dạng API)
      const priorityUpdates = newStatusData.map((item, index) => ({
        id: item.id,
        endpoint_id: String(currentEndpointId),
        priority: index + 1, // Priority theo thứ tự mới (bắt đầu từ 1)
      }));

      // Cập nhật priority trên server
      updatePriorities(priorityUpdates, newStatusData);
    }

    setDraggedItem(null);
  };

  const handleResponseSelect = (response) => {
    // Gọi API riêng cho response được chọn
    fetch(`${API_ROOT}/endpoint_responses/${response.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedResponse(data);
        setResponseName(data.name);
        setStatusCode(data.status_code.toString());
        setResponseBody(JSON.stringify(data.response_body, null, 2));
        setDelay(data.delay_ms?.toString() || "0");
      })
      .catch(console.error);
  };

  const handleNewResponse = () => {
    // Reset form khi tạo mới
    setSelectedResponse(null);
    setResponseName("");
    setStatusCode("200");
    setHeaderKey("Content-Type");
    setHeaderValue("application/json");
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

    const isFirstResponse = endpointResponses.length === 0 && !selectedResponse;

    const payload = {
      endpoint_id: currentEndpointId,
      name: responseName,
      status_code: parseInt(statusCode),
      response_body: responseBodyObj,
      condition: {},
      is_default: selectedResponse
        ? selectedResponse.is_default
        : isFirstResponse,
      delay_ms: parseInt(delay) || 0,
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
      .then(() => {
        // Refresh responses
        fetchEndpointResponses();

        // Close dialog
        setIsDialogOpen(false);

        // Thêm toast thông báo thành công
        if (selectedResponse) {
          toast.success("Response updated successfully!");
        } else {
          toast.success("New response created successfully!");
        }

        // Nếu là tạo mới, reset form hoàn toàn
        if (!selectedResponse) {
          setResponseName("");
          setStatusCode("200");
          setHeaderKey("Content-Type");
          setHeaderValue("application/json");
          setResponseBody("");
          setDelay("0");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-100 bg-white">
        <Sidebar
          workspaces={workspaces}
          projects={projects}
          endpoints={endpoints}
          current={currentWsId}
          setCurrent={setCurrentWsId}
          onAddWorkspace={handleAddWorkspace}
          onEditWorkspace={(id) => {
            const ws = workspaces.find((w) => w.id === id);
            if (!ws) return;
            const name = prompt("Edit workspace name", ws.name);
            if (name) handleEditWorkspace(id, name);
          }}
          onDeleteWorkspace={handleDeleteWorkspace}
          openProjectsMap={openProjectsMap}
          setOpenProjectsMap={setOpenProjectsMap}
          openEndpointsMap={openEndpointsMap}
          setOpenEndpointsMap={setOpenEndpointsMap}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search all portals"
              className="pl-10 bg-[#F1F5F9] border-0"
            />
          </div>

          {/* Breadcrumb Navigation - Đặt ở giữa */}
          <div className="flex-1 mx-4 overflow-hidden">
            <div className="mb-0">
              <Breadcrumb>
                <BreadcrumbList className="overflow-hidden whitespace-nowrap text-ellipsis">
                  {(() => {
                    const currentEndpoint = endpoints.find(
                      (ep) => ep.id === currentEndpointId
                    );
                    const currentProject = currentEndpoint
                      ? projects.find(
                          (p) =>
                            String(p.id) === String(currentEndpoint.project_id)
                        )
                      : null;
                    const currentWorkspace = currentProject
                      ? workspaces.find(
                          (w) =>
                            String(w.id) === String(currentProject.workspace_id)
                        )
                      : null;

                    return (
                      <>
                        {currentWorkspace && (
                          <>
                            <BreadcrumbItem>
                              <BreadcrumbLink
                                href="/dashboard"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                              >
                                {currentWorkspace.name}
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </BreadcrumbSeparator>
                          </>
                        )}
                        {currentProject && (
                          <>
                            <BreadcrumbItem>
                              <BreadcrumbLink
                                href={`/dashboard/${currentProject.id}`}
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                              >
                                {currentProject.name}
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </BreadcrumbSeparator>
                          </>
                        )}
                        {currentEndpoint && (
                          <BreadcrumbItem>
                            <BreadcrumbLink
                              href="#"
                              className="text-sm font-medium text-slate-900"
                            >
                              {currentEndpoint.name}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                        )}
                      </>
                    );
                  })()}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Nút New Response */}
            <Button
              className="bg-[#2563EB] hover:bg-[#1E40AF] text-white"
              onClick={handleNewResponse}
            >
              <Plus className="mr-2 h-4 w-4" /> New response
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          {/* Container chung cho cả hai phần */}
          <div className="flex justify-between items-center mb-6">
            {/* Phần bên trái - Display Endpoint Name and Method */}
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-[#37352F] mr-4">
                {endpoints.find((ep) => ep.id === currentEndpointId)?.name ||
                  "Endpoint"}
              </h2>
              <Badge
                variant="outline"
                className="bg-[#D5FBD3] text-[#000000] border-0"
              >
                {endpoints.find((ep) => ep.id === currentEndpointId)?.method ||
                  "GET"}
              </Badge>
            </div>

            {/* Phần bên phải - Form Status Info */}
            <div className="flex-1 max-w-[707px] ml-8">
              <div className="flex flex-row items-center p-0 gap-3.5 w-full h-[20px] border border-[#D1D5DB] rounded-md">
                <div className="w-[658px] h-[19px] font-inter font-semibold text-[16px] leading-[19px] text-[#777671] flex-1">
                  api/user
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
                      <circle
                        cx="10.5"
                        cy="10"
                        r="8"
                        stroke="#777671"
                        strokeWidth="1.5"
                      />
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
                      <TableHead className="w-[119.2px] h-10 px-2 py-0">
                        <div className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]">
                          <div className="relative w-fit mt-[-1.00px] font-text-sm-medium font-[number:var(--text-sm-medium-font-weight)] text-neutral-950 text-[length:var(--text-sm-medium-font-size)] tracking-[var(--text-sm-medium-letter-spacing)] leading-[var(--text-sm-medium-line-height)] whitespace-nowrap [font-style:var(--text-sm-medium-font-style)]">
                            Status Code
                          </div>
                        </div>
                      </TableHead>
                      <TableHead className="w-[270.55px] h-10 mr-[-96.75px]">
                        <div className="flex w-[92.99px] h-10 items-center px-3 py-2 relative rounded-md">
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
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-transparent mb-4">
                  <TabsTrigger
                    value="summary"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                  >
                    Header&Body
                  </TabsTrigger>
                  <TabsTrigger
                    value="submissions"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                  >
                    Rules
                  </TabsTrigger>
                </TabsList>

                {/* TabsContent */}
                <TabsContent value="summary" className="mt-0">
                  <div className="border-b-2 border-[#37352F] w-20"></div>
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
                          >
                            <Trash2 className="h-4 w-4 text-[#898883]" />
                          </Button>
                        </div>
                      </div>

                      {/* Status Info */}
                      <div className="border border-[#D1D5DB] rounded-md px-4 py-3 mb-6">
                        <p className="text-[#777671] font-medium">
                          Status: This endpoint is active and receiving requests
                        </p>
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

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="status-code"
                            className="text-right text-sm font-medium text-[#000000]"
                          >
                            Status Code
                          </Label>
                          <Input
                            id="status-code"
                            value={statusCode}
                            onChange={(e) => setStatusCode(e.target.value)}
                            className="col-span-3 border-[#CBD5E1] rounded-md"
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="response-header"
                            className="text-right text-sm font-medium text-[#000000]"
                          >
                            Response Header
                          </Label>
                          <div className="col-span-3 flex space-x-2">
                            <Input
                              id="header-key"
                              placeholder="Key"
                              value={headerKey}
                              onChange={(e) => setHeaderKey(e.target.value)}
                              className="border-[#CBD5E1] rounded-md"
                            />
                            <Input
                              id="header-value"
                              placeholder="Value"
                              value={headerValue}
                              onChange={(e) => setHeaderValue(e.target.value)}
                              className="border-[#CBD5E1] rounded-md"
                            />
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

                <TabsContent value="submissions" className="mt-0">
                  <div className="border-b-2 border-[#37352F] w-20"></div>
                  <div className="mt-2">
                    <Frame responseName={selectedResponse?.name} />
                  </div>
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
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedResponse ? "Edit Response" : "Create New Response"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="new-response-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Response Name
                  </Label>
                  <Input
                    id="new-response-name"
                    placeholder="Enter response name"
                    value={responseName}
                    onChange={(e) => setResponseName(e.target.value)}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="new-status-code"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Status Code
                  </Label>
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

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Header
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Key"
                      value={headerKey}
                      onChange={(e) => setHeaderKey(e.target.value)}
                    />
                    <Input
                      placeholder="Value"
                      value={headerValue}
                      onChange={(e) => setHeaderValue(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="new-response-body"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Body
                  </Label>
                  <Textarea
                    id="new-response-body"
                    placeholder="Enter response body"
                    value={responseBody}
                    onChange={(e) => setResponseBody(e.target.value)}
                    className="h-32 font-mono"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="new-delay"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Delay (ms)
                  </Label>
                  <Input
                    id="new-delay"
                    placeholder="0"
                    value={delay}
                    onChange={(e) => setDelay(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setSelectedResponse(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveResponse}>Create</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
