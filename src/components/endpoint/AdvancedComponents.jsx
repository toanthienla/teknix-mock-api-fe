import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { API_ROOT } from "@/utils/constants";
import {
  Plus,
  Trash2,
  Upload,
  Code,
  Loader2,
  FileCode,
  X,
  SaveIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-json";
import "prismjs/themes/prism.css";
import "jsoneditor/dist/jsoneditor.css";
import { statusCodes } from "@/components/endpoint/constants.js";

export const ApiCallEditor = ({
  endpointId,
  nextCalls,
  setNextCalls,
  setIsNewApiCallDialogOpen,
  onSave,
  currentEndpoint,
  getFullPath,
  // Thêm props cho filter
  availableEndpoints = [],
  filterMode = "external",
  setFilterMode = () => {},
  currentWorkspace,
  currentProject,
}) => {
  // Thêm state để lưu trữ JSON string và trạng thái lỗi
  const [jsonStrings, setJsonStrings] = useState({});
  const [jsonErrors, setJsonErrors] = useState({});

  const [filteredEndpoints, setFilteredEndpoints] = useState([]);

  // Thêm state cho popover
  const [isRequestBodyPopoverOpen, setIsRequestBodyPopoverOpen] =
    useState(false);
  const [selectedSection, setSelectedSection] = useState("url");
  const requestBodyPopoverRef = useRef(null);

  // Thêm state để control tooltip visibility trong ApiCallEditor
  const [saveTooltipVisible, setSaveTooltipVisible] = useState(false);
  const [addTooltipVisible, setAddTooltipVisible] = useState(false);
  const [templateTooltipVisible, setTemplateTooltipVisible] = useState(false);

  // Component Tooltip (thêm vào đầu file)
  const Tooltip = ({ visible, children, className = "" }) => {
    if (!visible) return null;

    return (
      <div
        className={`absolute z-50 px-2 py-1 text-xs text-white bg-black rounded shadow-lg whitespace-nowrap ${className}`}
      >
        {children}
        {/* Mũi tên tooltip */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
      </div>
    );
  };

  // Cập nhật useEffect để handle click outside popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        requestBodyPopoverRef.current &&
        !requestBodyPopoverRef.current.contains(event.target)
      ) {
        setIsRequestBodyPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hàm lấy text mẫu dựa trên section được chọn
  const getTemplateText = () => {
    switch (selectedSection) {
      case "url":
        return {
          template: "{{params.<param>}}",
          description: "Get values from URL path parameters",
        };
      case "query":
        return {
          template: "{{query.<param>}}",
          description: "Get values from query string parameters",
        };
      case "state":
        return {
          template: "{{state.<param>}}",
          description: "Get values from project state",
        };
      default:
        return {
          template: "{{params.<param>}}",
          description: "Get values from URL path parameters",
        };
    }
  };

  // Thêm hàm chèn template cho Request Body (copy to clipboard)
  const insertRequestBodyTemplate = async (template) => {
    try {
      await navigator.clipboard.writeText(template);
      toast.success("Template copied to clipboard!");
      setIsRequestBodyPopoverOpen(false);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy template to clipboard");
    }
  };

  // Cập nhật filtered endpoints khi availableEndpoints hoặc filterMode thay đổi
  useEffect(() => {
    let filtered = [...availableEndpoints];

    if (filterMode === "internal" && currentWorkspace && currentProject) {
      // Filter theo workspace và project hiện tại
      filtered = availableEndpoints.filter(
        (endpoint) =>
          endpoint.workspaceName === currentWorkspace.name &&
          endpoint.projectName === currentProject.name
      );
    }

    setFilteredEndpoints(filtered);
  }, [availableEndpoints, filterMode, currentWorkspace, currentProject]);

  // Cập nhật filtered endpoints khi availableEndpoints hoặc filterMode thay đổi
  useEffect(() => {
    let filtered = [...availableEndpoints];

    if (filterMode === "external") {
      // External: hiện tất cả, nhưng deduplicate theo path
      const uniqueByPath = new Map();
      filtered.forEach((endpoint) => {
        if (!uniqueByPath.has(endpoint.path)) {
          uniqueByPath.set(endpoint.path, endpoint);
        }
      });
      filtered = Array.from(uniqueByPath.values());
    } else {
      // Internal: chỉ lấy endpoints có cùng workspace và project
      filtered = availableEndpoints.filter(
        (endpoint) =>
          endpoint.workspaceName === currentWorkspace?.name &&
          endpoint.projectName === currentProject?.name
      );

      // Deduplicate theo path trong filtered results
      const uniqueByPath = new Map();
      filtered.forEach((endpoint) => {
        if (!uniqueByPath.has(endpoint.path)) {
          uniqueByPath.set(endpoint.path, endpoint);
        }
      });

      filtered = Array.from(uniqueByPath.values());
    }

    setFilteredEndpoints(filtered);
  }, [availableEndpoints, filterMode, currentWorkspace, currentProject]);

  // Cập nhật hàm để lấy full target endpoint
  const getFullTargetEndpoint = (targetEndpoint) => {
    if (!targetEndpoint || !currentEndpoint) return targetEndpoint;

    // Tìm endpoint được chọn từ availableEndpoints
    const selectedEndpoint = availableEndpoints.find(
      (ep) => ep.path === targetEndpoint
    );

    if (selectedEndpoint) {
      // Sử dụng getFullPath để tạo full path
      return getFullPath(selectedEndpoint.path);
    }

    return targetEndpoint;
  };

  // Khởi tạo JSON strings từ nextCalls
  useEffect(() => {
    const initialJsonStrings = {};
    nextCalls.forEach((call, index) => {
      try {
        initialJsonStrings[index] = JSON.stringify(call.body, null, 2);
      } catch {
        initialJsonStrings[index] =
          '{\n  "orderId": "{{response.body.orderId}}"\n}';
      }
    });
    setJsonStrings(initialJsonStrings);
  }, [nextCalls]);

  // Cập nhật hàm handleJsonChange
  const handleJsonChange = (index, value) => {
    // Validate JSON
    try {
      const parsedJson = JSON.parse(value);
      setJsonStrings((prev) => ({
        ...prev,
        [index]: value,
      }));

      setJsonErrors((prev) => ({
        ...prev,
        [index]: null,
      }));

      // Chỉ cập nhật body nếu JSON hợp lệ
      handleNextCallChange(index, "body", parsedJson);
    } catch (e) {
      setJsonStrings((prev) => ({
        ...prev,
        [index]: value,
      }));

      setJsonErrors((prev) => ({
        ...prev,
        [index]: e.message,
      }));

      // KHÔNG cập nhật body nếu JSON không hợp lệ
    }
  };

  const handleRemoveNextCall = (index) => {
    const updatedCalls = [...nextCalls];
    updatedCalls.splice(index, 1);
    setNextCalls(updatedCalls);

    // Xóa JSON string tương ứng
    setJsonStrings((prev) => {
      const newStrings = { ...prev };
      delete newStrings[index];
      return newStrings;
    });

    setJsonErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const handleNextCallChange = (index, field, value) => {
    const updatedCalls = [...nextCalls];
    updatedCalls[index] = {
      ...updatedCalls[index],
      [field]: value,
    };
    setNextCalls(updatedCalls);

    // Validate ngay khi thay đổi target_endpoint hoặc method
    if (field === "target_endpoint" || field === "method") {
      setTimeout(() => {
        validateTargetEndpointsForDisplay(updatedCalls);
      }, 0);
    }
  };

  // Thêm state để lưu trữ lỗi validation
  const [endpointValidationErrors, setEndpointValidationErrors] = useState({});

  // Thêm state để theo dõi các calls đã được save (original calls)
  const [savedCalls, setSavedCalls] = useState([]);

  // Cập nhật savedCalls khi component mount hoặc khi API calls được save thành công
  useEffect(() => {
    if (nextCalls.length > 0) {
      // Kiểm tra xem có calls nào đã được save chưa (có id)
      const callsWithIds = nextCalls.filter(
        (call) => call.id && call.id <= 999999
      ); // id từ DB thường là số
      if (callsWithIds.length > 0) {
        setSavedCalls(callsWithIds);
      }
    }
  }, [nextCalls]);

  // Trong AdvancedComponents.jsx - sửa hàm validateTargetEndpointsForDisplay
  const validateTargetEndpointsForDisplay = (currentCalls = nextCalls) => {
    const newErrors = {};
    const endpointGroups = {};

    // Chỉ nhóm các calls đã được save (có id và id <= 999999 để phân biệt với temporary id)
    currentCalls.forEach((call, index) => {
      const isSavedCall =
        call.id && (typeof call.id === "number" || call.id <= 999999); // id từ DB thường là số

      if (!call.target_endpoint || !call.method || !isSavedCall) return;

      if (!endpointGroups[call.target_endpoint]) {
        endpointGroups[call.target_endpoint] = [];
      }
      endpointGroups[call.target_endpoint].push({
        index,
        method: call.method,
        id: call.id,
      });
    });

    // BỎ KIỂM TRA TRÙNG METHOD - không cần check duplicate methods nữa
    // Mỗi endpoint có thể có nhiều calls với cùng method

    setEndpointValidationErrors(newErrors);
  };

  // Cập nhật hàm validateAllJson
  const validateAllJson = () => {
    // Kiểm tra tất cả JSON trong nextCalls
    for (let i = 0; i < nextCalls.length; i++) {
      const body = nextCalls[i].body;
      try {
        // Thử chuyển body thành chuỗi JSON để kiểm tra
        JSON.stringify(body);
      } catch {
        // Nếu không thể stringify thì JSON không hợp lệ
        toast.error(`Invalid JSON in API Call ${i + 1} - Request Body`);
        return false;
      }

      // Kiểm tra JSON string từ jsonStrings
      if (jsonStrings[i]) {
        try {
          JSON.parse(jsonStrings[i]);
        } catch {
          // Nếu không thể parse JSON string thì JSON không hợp lệ
          toast.error(`Invalid JSON in API Call ${i + 1} - Request Body`);
          return false;
        }
      }
    }
    return true;
  };

  // Trong AdvancedComponents.jsx - sửa hàm validateTargetEndpoints
  const validateTargetEndpoints = () => {
    const endpointGroups = {};

    // Chỉ nhóm các calls đã được save (có id và id không phải temporary)
    nextCalls.forEach((call, index) => {
      const isSavedCall =
        call.id &&
        typeof call.id !== "string" &&
        !call.id.toString().startsWith("temp_");

      if (!call.target_endpoint || !call.method || !isSavedCall) return;

      if (!endpointGroups[call.target_endpoint]) {
        endpointGroups[call.target_endpoint] = [];
      }
      endpointGroups[call.target_endpoint].push({
        index,
        method: call.method,
        id: call.id,
      });
    });

    // BỎ KIỂM TRA TRÙNG METHOD - không cần check duplicate methods nữa
    // Mỗi endpoint có thể có nhiều calls với cùng method

    return true;
  };

  // Cập nhật hàm handleSave
  const handleSave = () => {
    // Kiểm tra tất cả JSON trước khi lưu
    if (!validateAllJson()) {
      return; // Không tiếp tức nếu có lỗi JSON
    }

    // Kiểm tra target endpoints và methods
    if (!validateTargetEndpoints()) {
      return; // Không tiếp tục nếu có lỗi validate endpoint
    }

    // Chuẩn bị payload đúng định dạng
    const payload = {
      advanced_config: {
        nextCalls: nextCalls.map((call) => ({
          id: Number(call.id),
          target_endpoint: call.target_endpoint,
          method: call.method,
          body: call.body,
          condition: Number(call.condition),
        })),
      },
    };

    fetch(`${API_ROOT}/endpoints/advanced/${endpointId}`, {
      credentials: "include",
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save advanced configuration");
        toast.success("Advanced configuration saved successfully!");
        if (onSave) onSave();

        // Cập nhật savedCalls sau khi save thành công
        const successfullySavedCalls = nextCalls.filter((call) => call.id);
        setSavedCalls(successfullySavedCalls);
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  // Cập nhật hàm validateTargetEndpoints khi nextCalls thay đổi
  useEffect(() => {
    validateTargetEndpointsForDisplay();
  }, [nextCalls, savedCalls]);

  return (
    <Card className="p-6 border-0 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#37352F]">API CALL</h2>
        <div className="flex items-center gap-2">
          {/* Thêm nút popover bên cạnh nút save */}
          <div className="relative" ref={requestBodyPopoverRef}>
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-[#E5E5E1] hover:bg-yellow-50"
                onClick={() =>
                  setIsRequestBodyPopoverOpen(!isRequestBodyPopoverOpen)
                }
                onMouseEnter={() => setTemplateTooltipVisible(true)}
                onMouseLeave={() => setTemplateTooltipVisible(false)}
              >
                <FileCode className="h-5 w-5 text-[#898883]" />
              </Button>
              <Tooltip
                visible={templateTooltipVisible}
                className="bottom-full left-1/2 transform -translate-x-1/2 mb-2"
              >
                Variable Picker
              </Tooltip>
            </div>

            {/* Popover */}
            {isRequestBodyPopoverOpen && (
              <div className="absolute z-50 top-0 right-full mr-2 w-[392px] h-[120px] bg-white rounded-lg shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
                <div className="flex flex-col items-center gap-2 p-3.5">
                  <div className="w-full flex justify-between items-center">
                    <div className="font-semibold text-sm text-gray-800">
                      Variable Picker
                    </div>
                    <X
                      className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRequestBodyPopoverOpen(false);
                      }}
                    />
                  </div>

                  <div className="w-full flex justify-between">
                    <div
                      className={`px-1 py-0.5 rounded-md text-xs font-semibold cursor-pointer ${
                        selectedSection === "url"
                          ? "bg-[#EDEDEC] text-[#374151]"
                          : "text-[#374151] hover:bg-gray-100"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSection("url");
                      }}
                    >
                      URL Parameters
                    </div>
                    <div
                      className={`px-1 py-0.5 rounded-md text-xs font-semibold cursor-pointer ${
                        selectedSection === "query"
                          ? "bg-[#EDEDEC] text-[#374151]"
                          : "text-[#374151] hover:bg-gray-100"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSection("query");
                      }}
                    >
                      Query Parameters
                    </div>
                    <div
                      className={`px-1 py-0.5 rounded-md text-xs font-semibold cursor-pointer ${
                        selectedSection === "state"
                          ? "bg-[#EDEDEC] text-[#374151]"
                          : "text-[#374151] hover:bg-gray-100"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSection("state");
                      }}
                    >
                      Project State
                    </div>
                  </div>

                  <div
                    className="w-full bg-[#EDEDEC] p-1 rounded-md mt-2 cursor-pointer hover:bg-[#D1D5DB] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      const templateText = getTemplateText().template;
                      insertRequestBodyTemplate(templateText);
                    }}
                  >
                    <div className="font-mono text-[12px] text-black mb-[-5px]">
                      {getTemplateText().template}
                    </div>
                    <div className="text-[12px] text-gray-500">
                      {getTemplateText().description}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#E5E5E1] hover:bg-yellow-50"
              onClick={handleSave}
              onMouseEnter={() => setSaveTooltipVisible(true)}
              onMouseLeave={() => setSaveTooltipVisible(false)}
            >
              <SaveIcon className="h-5 w-5 text-[#898883]" />
            </Button>
            <Tooltip
              visible={saveTooltipVisible}
              className="bottom-full left-1/2 transform -translate-x-1/2 mb-2"
            >
              Save API Calls
            </Tooltip>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsNewApiCallDialogOpen(true)}
              className="w-9 h-9 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
              onMouseEnter={() => setAddTooltipVisible(true)}
              onMouseLeave={() => setAddTooltipVisible(false)}
            >
              <Plus className="h-7 w-7" />
            </Button>
            <Tooltip
              visible={addTooltipVisible}
              className="bottom-full left-1/2 transform -translate-x-1/2 mb-2"
            >
              Add New API Call
            </Tooltip>
          </div>
        </div>
      </div>

      {nextCalls.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No API calls configured. Click "New API Call" to add one.
        </div>
      ) : (
        nextCalls.map((call, index) => (
          <div key={call.id || index} className="mb-6 p-4 relative">
            {/* Thêm title "Next API Call" và số thứ tự */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="mr-2 flex items-center justify-center text-lg font-medium">
                  #{index + 1}
                </span>
                <span className="font-bold text-[#37352F]">Next API Call</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleRemoveNextCall(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 pb-8 border-b border-[#CBD5E1]">
              {/* Thêm phần toggle và thông báo riêng biệt */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-[130px]"></div> {/* Spacer để căn chỉnh */}
                <div className="flex items-center gap-4">
                  {/* Thông báo bên cạnh toggle */}
                  <span className="text-xs text-gray-600">
                    {filterMode === "external"
                      ? "Showing all available paths"
                      : "Showing only paths from current workspace/project"}
                  </span>
                  {/* Toggle External/Internal */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        filterMode === "external"
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      External
                    </span>
                    <button
                      onClick={() =>
                        setFilterMode(
                          filterMode === "external" ? "internal" : "external"
                        )
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 ${
                        filterMode === "internal"
                          ? "bg-yellow-300"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          filterMode === "internal"
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm ${
                        filterMode === "internal"
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      Internal
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Endpoint */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="w-[130px] text-sm font-medium text-[#000000]">
                    Target Endpoint
                  </label>

                  <div className="relative flex-1 max-w-[801px]">
                    <Select
                      value={call.target_endpoint}
                      onValueChange={(value) => {
                        // Khi chọn từ dropdown, concat với full path hiện tại
                        const fullTargetPath = getFullTargetEndpoint(value);
                        handleNextCallChange(
                          index,
                          "target_endpoint",
                          fullTargetPath
                        );
                      }}
                    >
                      <SelectTrigger
                        className={`h-[36px] border-[#CBD5E1] rounded-md pl-3 pr-1 ${
                          endpointValidationErrors[index]
                            ? "border-red-500"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select endpoint">
                          {call.target_endpoint ? (
                            <span className="font-medium text-sm">
                              {filteredEndpoints.find(
                                (ep) => ep.path === call.target_endpoint
                              )?.path || call.target_endpoint}
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              Select endpoint
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {/* Hiển thị danh sách endpoints đã được filter */}
                        {filteredEndpoints.map((endpoint) => (
                          <SelectItem key={endpoint.id} value={endpoint.path}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {endpoint.path}
                              </span>
                              {/* Bỏ hiển thị method và name */}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Hiển thị lỗi validation */}
                    {endpointValidationErrors[index] && (
                      <div className="text-red-400 text-xs mt-1">
                        {endpointValidationErrors[index]}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Method */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="w-[130px] text-sm font-medium text-[#000000]">
                    Method
                  </label>
                  <div className="relative flex-1 max-w-[801px]">
                    <Select
                      value={call.method}
                      onValueChange={(value) =>
                        handleNextCallChange(index, "method", value)
                      }
                    >
                      <SelectTrigger
                        className={`h-[36px] border-[#CBD5E1] rounded-md pl-3 pr-1 ${
                          endpointValidationErrors[index]
                            ? "border-red-500"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Request Body */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <label className="w-[130px] text-sm font-medium text-[#000000]">
                    Request Body
                  </label>
                </div>
                <div className="flex-1 w-full relative">
                  <div className="relative">
                    <Editor
                      value={
                        jsonStrings[index] ||
                        '{\n  "orderId": "{{response.body.orderId}}"\n}'
                      }
                      onValueChange={(code) => handleJsonChange(index, code)}
                      highlight={(code) => highlight(code, languages.json)}
                      padding={10}
                      className="custom-json-editor"
                      style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        minHeight: "124px",
                        maxHeight: "200px",
                        overflow: "auto",
                        border: jsonErrors[index]
                          ? "1px solid #ef4444"
                          : "1px solid #CBD5E1",
                        borderRadius: "0.375rem",
                        backgroundColor: "#101728",
                        color: "white",
                      }}
                      textareaClassName="focus:outline-none"
                    />

                    {/* JSON Editor controls */}
                    <div className="absolute top-2 right-2 flex space-x-2 z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#E5E5E1] w-[77px] h-[29px] rounded-[6px] bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            const formatted = JSON.stringify(
                              JSON.parse(jsonStrings[index]),
                              null,
                              2
                            );
                            handleJsonChange(index, formatted);
                          } catch {
                            toast.error("Invalid JSON format");
                          }
                        }}
                      >
                        <Code className="mr-1 h-4 w-4" /> Format
                      </Button>
                    </div>
                  </div>

                  {/* Hiển thị lỗi JSON */}
                  {jsonErrors[index] && (
                    <div className="text-red-400 text-xs mt-1 pl-2">
                      Invalid JSON: {jsonErrors[index]}
                    </div>
                  )}
                </div>
              </div>

              {/* Status condition */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="w-[130px] text-sm font-medium text-[#000000]">
                    Status condition
                  </label>
                  <div className="relative flex-1 max-w-[801px]">
                    <Select
                      value={String(call.condition)}
                      onValueChange={(value) =>
                        handleNextCallChange(index, "condition", value)
                      }
                    >
                      <SelectTrigger className="h-[36px] border-[#CBD5E1] rounded-md pl-3 pr-1">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {statusCodes.map((status) => (
                          <SelectItem key={status.code} value={status.code}>
                            {status.code} - {status.description.split("–")[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </Card>
  );
};

export const Frame = ({ selectedResponse, onUpdateRules, onSave }) => {
  const [parameterRows, setParameterRows] = useState([]);

  const [errors, setErrors] = useState({});
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  // Thêm state để control tooltip visibility trong Frame
  const [frameSaveTooltipVisible, setFrameSaveTooltipVisible] = useState(false);
  const [frameAddTooltipVisible, setFrameAddTooltipVisible] = useState(false);

  // Component Tooltip (thêm vào đầu file)
  const Tooltip = ({ visible, children, className = "" }) => {
    if (!visible) return null;

    return (
      <div
        className={`absolute z-50 px-2 py-1 text-xs text-white bg-black rounded shadow-lg whitespace-nowrap ${className}`}
      >
        {children}
        {/* Mũi tên tooltip */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
      </div>
    );
  };

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
    <div className="relative w-full">
      {/* Hai nút Add & Save ở góc trên bên phải của toàn vùng Frame */}
      <div className="justify-end pt-2 flex items-center gap-2">
        <div className="relative">
          <Button
            variant="outline"
            onClick={handleAddRule}
            className="w-9 h-9 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
            onMouseEnter={() => setFrameAddTooltipVisible(true)}
            onMouseLeave={() => setFrameAddTooltipVisible(false)}
          >
            <Plus className="h-7 w-7" />
          </Button>
          <Tooltip
            visible={frameAddTooltipVisible}
            className="bottom-full left-1/2 transform -translate-x-1/2 mb-2"
          >
            Add New Rule
          </Tooltip>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-[#E5E5E1] hover:bg-yellow-50"
            onClick={handleSave}
            onMouseEnter={() => setFrameSaveTooltipVisible(true)}
            onMouseLeave={() => setFrameSaveTooltipVisible(false)}
          >
            <SaveIcon className="h-5 w-5 text-[#898883]" />
          </Button>
          <Tooltip
            visible={frameSaveTooltipVisible}
            className="bottom-full left-1/2 transform -translate-x-1/2 mb-2"
          >
            Save Rules
          </Tooltip>
        </div>
      </div>

      {/* Phần nội dung chính */}
      <Card className="p-6 border-0 rounded-lg shadow-none overflow-visible">
        {/* Header frame for parameters */}
        <div className="relative w-full h-[37.53px] mb-2">
          <div className="absolute w-full h-full bg-[#F2F2F2] rounded-[5.49px]"></div>

          {/* Parameter Type và Parameter Name */}
          <div className="absolute w-[361.15px] h-[27.46px] left-[9.49px] top-[5.49px] border border-[#CBD5E1] rounded-[5.49px] flex items-center">
            <div className="w-[153.78px] pl-2 font-inter font-bold text-[14px] text-black">
              Parameter Type
            </div>
            <div className="w-[200.04px] pl-10 border-[#CBD5E1] font-inter font-bold text-[14px] text-black">
              Parameter Name
            </div>
          </div>
          {/* Expected Value */}
          <div className="absolute w-[440.47px] h-[27.46px] right-[5.49px] top-[5.49px] flex items-center pl-2">
            <div className="font-inter font-bold text-[12px] text-black">
              Equal
            </div>
          </div>
          {/* Expected Value */}
          <div className="absolute w-[150.47px] h-[27.46px] right-[250.49px] top-[5.49px] border border-[#CBD5E1] rounded-[5.49px] flex items-center pl-1">
            <div className="font-inter font-bold text-[14px] text-black">
              Expected Value
            </div>
          </div>
          <div className="absolute w-[212.47px] h-[27.46px] right-[5.49px] top-[5.49px] flex items-center pl-2">
            <div className="flex items-center justify-center w-5 h-5 border-2 border-black rounded-full text-black font-inter font-bold text-[15px]">
              ?
            </div>
          </div>
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

                <Input
                  id={`rule-name-${row.id}`}
                  name={`rule-name-${row.id}`}
                  value={row.name}
                  onChange={(e) => handleNameChange(row.id, e.target.value)}
                  className={`w-[184px] ${
                    errors[row.id]?.name ? "border-red-500" : ""
                  }`}
                  placeholder={getPlaceholderText(row.type)}
                />
                <div className="box-border relative w-[31px] h-[29px] bg-blue-500/10 border border-blue-600 rounded-[6px] flex items-center justify-center">
                  <span
                    className="text-[32px] text-black"
                    style={{
                      fontFamily: "Inter",
                      position: "absolute",
                      left: "4px",
                      top: "1px",
                      lineHeight: "23px",
                    }}
                  >
                    =
                  </span>
                </div>
                <Input
                  id={`rule-value-${row.id}`}
                  name={`rule-value-${row.id}`}
                  value={row.value}
                  onChange={(e) => handleValueChange(row.id, e.target.value)}
                  className={`w-[151px] ${
                    errors[row.id]?.value ? "border-red-500" : ""
                  }`}
                  placeholder="value"
                />

                {/* Gạch dọc trước thùng rác */}
                <div className="w-[1px] bg-[#CBD5E1] mx-2 self-stretch" />

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
        </div>
      </Card>
    </div>
  );
};
