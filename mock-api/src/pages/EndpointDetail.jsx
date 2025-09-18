import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

const DashboardPage = () => {
  const { endpointId } = useParams();
  const [currentEndpointId, setCurrentEndpointId] = useState(null);
  const [isActive, setIsActive] = useState(true);
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
    }
    // THÊM: Nếu không có endpointId từ URL, set default endpoint
    else if (endpoints.length > 0 && currentEndpointId === null) {
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
        alert("Failed to delete response: " + error.message);
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
      .then((updatedPriorities) => {
        console.log("Priorities updated:", updatedPriorities);
        // Có thể cập nhật state thêm nếu cần
      })
      .catch((error) => {
        console.error("Error updating priorities:", error);
        // Khôi phục state nếu cập nhật thất bại
        fetchEndpointResponses();
      });
  };

  const setDefaultResponse = (responseId) => {
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

        // Cập nhật state local với phản hồi từ server
        setEndpointResponses((prevResponses) =>
          prevResponses.map((response) => {
            const updated = updatedResponses.find((r) => r.id === response.id);
            return updated
              ? { ...response, is_default: updated.is_default }
              : response;
          })
        );

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
          updatedResponses.some((r) => r.id === selectedResponse.id)
        ) {
          const updatedSelected = updatedResponses.find(
            (r) => r.id === selectedResponse.id
          );
          setSelectedResponse({
            ...selectedResponse,
            is_default: updatedSelected.is_default,
          });
        }
      })
      .catch((error) => {
        console.error("Error setting default response:", error);
        // Khôi phục state nếu cập nhật thất bại
        fetchEndpointResponses();
      });
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
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

      // Tạo payload cho cập nhật priority - đảm bảo endpoint_id là string
      const priorityUpdates = newStatusData.map((item, index) => ({
        id: item.id,
        endpoint_id: String(currentEndpointId), // Chuyển thành string
        priority: index + 1,
      }));

      // Cập nhật priority trên server
      updatePriorities(priorityUpdates);

      // Nếu item được kéo lên vị trí đầu tiên, set làm default response
      if (dropIndex === 0) {
        setDefaultResponse(draggedItemContent.id);
      }
    }

    setDraggedItem(null);
  };

  const handleResponseSelect = (response) => {
    // Chỉ cần set selectedResponse, không cần fetch lại detail
    setSelectedResponse(response);
    setResponseName(response.name);
    setStatusCode(response.status_code.toString());
    setResponseBody(JSON.stringify(response.response_body, null, 2));
    setDelay(response.delay_ms?.toString() || "0");
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
      alert("Invalid JSON in response body");
      return;
    }

    // Xác định is_default - chỉ set true nếu đây là response đầu tiên
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
        alert(error.message);
      });
  };

  // ... phần còn lại ...

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
          <div className="flex items-center space-x-4">
            {/* Nút New Response */}
            <Button
              className="bg-[#2563EB] hover:bg-[#1E40AF] text-white"
              onClick={handleNewResponse} // SỬA TẠI ĐÂY
            >
              <Plus className="mr-2 h-4 w-4" /> New response
            </Button>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-[#2563EB]"
              />
              <Label className="text-sm font-medium text-[#0A0A0A]">
                Is Active
              </Label>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent">
              <TabsTrigger
                value="summary"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
              >
                Submissions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4">
              <div className="border-b-2 border-[#37352F] w-20"></div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex gap-6">
          {/* Response Configurations Card */}
          <div className="w-1/3">
            <Card className="border border-[#CBD5E1] rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-[#CBD5E1]">
                <h3 className="text-lg font-semibold text-[#37352F]">
                  Response Configurations
                </h3>
              </div>

              <div className="p-4">
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          </div>

          {/* Endpoint Detail Card */}
          <div className="w-2/3">
            <Card className="p-6 border border-[#CBD5E1] rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-[#37352F] mr-4">
                    {endpoints.find((ep) => ep.id === currentEndpointId)
                      ?.name || "Endpoint"}
                  </h2>
                  <Badge
                    variant="outline"
                    className="bg-[#D5FBD3] text-[#000000] border-0"
                  >
                    {endpoints.find((ep) => ep.id === currentEndpointId)
                      ?.method || "GET"}
                  </Badge>
                </div>
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

                {/* Nút Save duy nhất */}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
