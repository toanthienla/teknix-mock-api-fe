import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { API_ROOT } from "../utils/constants";
import {
  Plus,
  Star,
  Trash2,
  Upload,
  Code,
  GripVertical,
  FileCode,
  X,
  SaveIcon,
  Hash,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import { useNavigate, useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Topbar from "@/components/Topbar.jsx";
import reset_icon from "@/assets/light/reset_state_button.svg";
import chainIcon from "@/assets/light/Chain.svg";
import no_response from "@/assets/light/no_response.svg";
import Advanced_icon from "@/assets/light/Adavanced_icon.svg";
import Data_default from "@/assets/light/Data_default.svg";
import Proxy_icon from "@/assets/light/Proxy_icon.svg";
import Rules_icon from "@/assets/light/Rules_icon.svg";
import Header_Body from "@/assets/light/Header_Body.svg";
import Request_Response_icon from "@/assets/light/Request_Response_icon.svg";
import ws_config_icon from "@/assets/light/ws-config.svg";
import tiktokIcon from "@/assets/light/tiktok.svg";
import fbIcon from "@/assets/light/facebook.svg";
import linkedinIcon from "@/assets/light/linkedin.svg";
import workspaceIcon from "@/assets/light/workspace-icon.svg";
import projectIcon from "@/assets/light/project-icon.svg";
import folderIcon from "@/assets/light/folder-icon.svg";
import endpointIcon from "@/assets/light/endpoint.svg";
import dot_backgroundLight from "@/assets/light/dot_rows.svg";
import dot_backgroundDark from "@/assets/dark/dot_rows.svg";
import hashtagIcon from "@/assets/light/hashtag.svg";
import searchIcon from "@/assets/light/search.svg";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-okaidia.css";
import "jsoneditor/dist/jsoneditor.css";
import {getCurrentUser, getEndpointToken} from "@/services/api.js";
import { Switch } from "@/components/ui/switch.jsx";

import { ApiCallEditor, Frame } from "@/components/endpoint/AdvancedComponents";
import {
  SchemaBodyEditor,
  BaseSchemaEditor,
} from "@/components/endpoint/SchemaComponents";
import { statusCodes } from "@/components/endpoint/constants";
import { WSConfig } from "@/components/endpoint/WSConfig.jsx";
import "@/styles/pages/response-page.css"
import {useTheme} from "@/services/ThemeContext.jsx";

const DashboardPage = () => {
  const { isDark } = useTheme();
  const dot_background = isDark ? dot_backgroundDark : dot_backgroundLight;
  const navigate = useNavigate();
  // Thêm state để quản lý data default
  const [endpointData, setEndpointData] = useState(null);
  const [endpointDefinition, setEndpointDefinition] = useState(null);
  // Thêm state để quản lý loading
  const [isLoading, setIsLoading] = useState(true);
  // Thêm state để lưu lỗi response name
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("url");
  const popoverRef = useRef(null);
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
  const [isStateful, setIsStateful] = useState(false);
  const [, setIsActive] = useState(true);
  const [tempDataDefault, setTempDataDefault] = useState([]);
  const [tempDataDefaultString, setTempDataDefaultString] = useState("");

  const [openProjectsMap, setOpenProjectsMap] = useState(
    () => JSON.parse(localStorage.getItem("openProjectsMap")) || {}
  );
  const [openEndpointsMap, setOpenEndpointsMap] = useState(
    () => JSON.parse(localStorage.getItem("openEndpointsMap")) || {}
  );
  const [isTargetEndpointSuggestionsOpen, setIsTargetEndpointSuggestionsOpen] =
    useState(false);
  const [showStatefulConfirmDialog, setShowStatefulConfirmDialog] =
    useState(false);
  const [showStatelessConfirmDialog, setShowStatelessConfirmDialog] =
    useState(false);
  const [statusData, setStatusData] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [isResponseDropdownOpen, setIsResponseDropdownOpen] = useState(false);
  const [isTabBarDropdownOpen, setIsTabBarDropdownOpen] = useState(false);
  const responseDropdownRef = useRef(null);
  const tabBarDropdownRef = useRef(null);
  const [endpointResponses, setEndpointResponses] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [folders, setFolders] = useState([]);

  const [openEditWs, setOpenEditWs] = useState(false);
  const [confirmDeleteWs, setConfirmDeleteWs] = useState(null);
  const [editWsId, setEditWsId] = useState(null);
  const [editWsName, setEditWsName] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyMethod, setProxyMethod] = useState("GET");
  const [isInitialValuePopoverOpen, setIsInitialValuePopoverOpen] =
    useState(false);
  const initialValuePopoverRef = useRef(null);
  const [openNewWs, setOpenNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState("");

  const [openSchemaDialog, setOpenSchemaDialog] = useState(false);
  const [folderSchema, setFolderSchema] = useState(null);

  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [isEndpointsLoaded, setIsEndpointsLoaded] = useState(false);
  const [delayError, setDelayError] = useState("");

  const [currentUsername, setCurrentUsername] = useState("Unknown");

  const responseEditorRef = useRef(null);
  const initialValueEditorRef = useRef(null);
  const currentResponseBody = useRef(responseBody);
  const currentTempDataDefaultString = useRef(tempDataDefaultString);
  const [isRequestBodyPopoverOpen, setIsRequestBodyPopoverOpen] =
    useState(false);

  const [isNewApiCallDialogOpen, setIsNewApiCallDialogOpen] = useState(false);
  // Thêm state để lưu display text
  const [newApiCallTargetEndpointDisplay, setNewApiCallTargetEndpointDisplay] =
    useState("");
  const [newApiCallMethod, setNewApiCallMethod] = useState("GET");
  const [newApiCallRequestBody, setNewApiCallRequestBody] = useState("{}");
  const [newApiCallStatusCondition, setNewApiCallStatusCondition] =
    useState("");
  const [
    isNewApiCallRequestBodyPopoverOpen,
    setIsNewApiCallRequestBodyPopoverOpen,
  ] = useState(false);

  const [config, setConfig] = useState(null);
  const [wsEnabled, setWsEnabled] = useState(false);
  const [wsMessage, setWsMessage] = useState("");
  const [wsDelay, setWsDelay] = useState(0);
  const [wsCondition, setWsCondition] = useState(0);

  // Thêm state để control tooltip visibility
  const [saveTooltipVisible, setSaveTooltipVisible] = useState(false);
  const [starTooltipVisible, setStarTooltipVisible] = useState(false);
  const [addTooltipVisible, setAddTooltipVisible] = useState(false);

  // Component Tooltip
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

  // Thêm ref cho editor
  const newApiCallRequestBodyEditorRef = useRef(null);
  const newApiCallRequestBodyPopoverRef = useRef(null);

  const [nextCalls, setNextCalls] = useState([]);

  // Cập nhật useEffect để handle click outside cho cả 2 dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        responseDropdownRef.current &&
        !responseDropdownRef.current.contains(event.target)
      ) {
        setIsResponseDropdownOpen(false);
      }
      if (
        tabBarDropdownRef.current &&
        !tabBarDropdownRef.current.contains(event.target)
      ) {
        setIsTabBarDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sửa lại useEffect để fetch nextCalls khi endpoint hoặc isStateful thay đổi
  useEffect(() => {
    if (!currentEndpointId || !isStateful) {
      setNextCalls([]);
      return;
    }

    fetch(`${API_ROOT}/endpoints/advanced/${currentEndpointId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch advanced data");
        return res.json();
      })
      .then((data) => {
        // Xử lý response mới
        if (data && data.success && data.data && data.data.advanced_config) {
          const advancedConfig = data.data.advanced_config || {};
          setNextCalls(advancedConfig.nextCalls || []);
        } else {
          // Fallback nếu response không đúng định dạng
          setNextCalls([]);
          console.warn("Invalid response format from server:", data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch advanced config:", error);
        setNextCalls([]);
      });
  }, [currentEndpointId, isStateful]);

  // Sửa lại hàm fetchAdvancedConfig để xử lý response mới
  const fetchAdvancedConfig = () => {
    return fetch(`${API_ROOT}/endpoints/advanced/${currentEndpointId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch advanced data");
        return res.json();
      })
      .then((data) => {
        // Xử lý response mới
        if (data && data.success && data.data && data.data.advanced_config) {
          const advancedConfig = data.data.advanced_config || {};
          setNextCalls(advancedConfig.nextCalls || []);
        } else {
          // Fallback nếu response không đúng định dạng
          setNextCalls([]);
          console.warn("Invalid response format from server:", data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch advanced config:", error);
        toast.error("Failed to load advanced configuration");
        setNextCalls([]);
      });
  };

  // Thêm state cho available endpoints trong New API Call dialog
  const [newApiCallAvailableEndpoints, setNewApiCallAvailableEndpoints] =
    useState([]);

  // Thêm state cho available status codes từ endpoint responses
  const [newApiCallAvailableStatusCodes, setNewApiCallAvailableStatusCodes] =
    useState([]);

  // Thêm state cho validation lỗi
  const [newApiCallValidationErrors, setNewApiCallValidationErrors] = useState(
    {}
  );

  // Cập nhật hàm fetch available endpoints
  useEffect(() => {
    if (!currentEndpointId || !isStateful) return;

    fetch(`${API_ROOT}/endpoints/advanced/path`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && Array.isArray(data.data)) {
          // ✅ FIX: Filter out null/undefined trước khi transform
          const validEndpoints = data.data.filter(
            (endpoint) => endpoint && typeof endpoint === "object"
          );

          const transformedEndpoints = validEndpoints.map(
            (endpoint, index) => ({
              id: endpoint.id || `temp-${index}`,
              path: endpoint.path || "", // ✅ Fallback cho empty values
              workspaceName: endpoint.workspaceName || "",
              projectName: endpoint.projectName || "",
              folderName: endpoint.folderName || "",
            })
          );

          setNewApiCallAvailableEndpoints(transformedEndpoints);
        } else {
          setNewApiCallAvailableEndpoints([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch available endpoints:", error);
        setNewApiCallAvailableEndpoints([]); // ✅ Fallback
      });
  }, [currentEndpointId, isStateful]);

  // ✅ SỬA: Luôn fetch endpoint responses để có status codes đúng cho API Call Editor
  useEffect(() => {
    if (!currentEndpointId) return;

    fetch(`${API_ROOT}/endpoint_responses?endpoint_id=${currentEndpointId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // ✅ SỬA: Lấy unique status codes từ endpoint responses thực tế
          const uniqueStatusCodes = [
            ...new Set(data.map((response) => response.status_code.toString())),
          ];

          // ✅ THÊM: Luôn thêm các status code 500 mặc định
          const default500Codes = ["500", "501", "502", "503", "504", "505"];
          const combinedCodes = [
            ...new Set([...uniqueStatusCodes, ...default500Codes]),
          ];

          // Tạo danh sách status codes với description
          const statusCodesWithDesc = combinedCodes.map((code) => {
            // Tìm description từ constants.js nếu có
            const statusCodeInfo = statusCodes.find((sc) => sc.code === code);
            const description = statusCodeInfo
              ? statusCodeInfo.description
              : "Custom status code";

            return {
              code: code,
              description: description,
            };
          });

          // ✅ SỬA: Luôn cập nhật để đảm bảo có status codes đúng từ endpoint responses
          setNewApiCallAvailableStatusCodes(statusCodesWithDesc);

          console.log(
            "Updated available status codes from endpoint responses:",
            statusCodesWithDesc
          );
        } else {
          // Fallback nếu không có endpoint responses
          setNewApiCallAvailableStatusCodes([
            { code: "500", description: "Internal Server Error." },
            { code: "501", description: "Not Implemented." },
            { code: "502", description: "Bad Gateway." },
            { code: "503", description: "Service Unavailable." },
            { code: "504", description: "Gateway Timeout." },
            { code: "505", description: "HTTP Version Not Supported." },
          ]);
        }
      })
      .catch((error) => {
        console.error(
          "Failed to fetch status codes from endpoint responses:",
          error
        );
        // Fallback nếu fetch lỗi
        setNewApiCallAvailableStatusCodes([
          { code: "500", description: "Internal Server Error." },
          { code: "501", description: "Not Implemented." },
          { code: "502", description: "Bad Gateway." },
          { code: "503", description: "Service Unavailable." },
          { code: "504", description: "Gateway Timeout." },
          { code: "505", description: "HTTP Version Not Supported." },
        ]);
      });
  }, [currentEndpointId, isStateful]);
  // ✅ CẬP NHẬT: Chỉ cập nhật logic khi method thay đổi
  useEffect(() => {
    // Kiểm tra có API call nào đã có ID trong nextCalls không
    const hasApiCallsWithIds = nextCalls.some((call) => call.id);

    if (hasApiCallsWithIds) {
      // Có API call đã có ID → chỉ cập nhật nếu newApiCallAvailableStatusCodes đang rỗng
      // (khi chưa có data từ endpoint responses)
      if (newApiCallAvailableStatusCodes.length === 0) {
        setNewApiCallAvailableStatusCodes(
          getStatusCodesByMethod(newApiCallMethod || "GET")
        );
      }
    }
  }, [newApiCallMethod]); // ✅ Chỉ phụ thuộc vào method

  // ✅ CẬP NHẬT: ĐỞN GIẢN HÓA - Cho phép cả external URLs
  const getFilteredEndpoints = () => {
    // Hiển thị tất cả available endpoints
    return newApiCallAvailableEndpoints.filter(
      (ep) => ep && typeof ep === "object" && ep.path
    );
  };

  // ✅ CẬP NHẬT: Thêm state để lưu ID của endpoint được chọn
  const [newApiCallTargetEndpointId, setNewApiCallTargetEndpointId] =
    useState(null);

  // ✅ CẬP NHẬT: Hàm format full path để xử lý cả external URLs
  const formatFullPath = (endpoint) => {
    if (!endpoint) return "";

    // Kiểm tra nếu endpoint đã là external URL
    if (
      endpoint.path &&
      (endpoint.path.startsWith("http://") ||
        endpoint.path.startsWith("https://"))
    ) {
      return endpoint.path;
    }

    // Xử lý internal endpoint
    const cleanWorkspaceName =
      endpoint.workspaceName?.replace(/^\/+|\/+$/g, "") || "";
    const cleanProjectName =
      endpoint.projectName?.replace(/^\/+|\/+$/g, "") || "";
    const cleanPath = endpoint.path?.startsWith("/")
      ? endpoint.path.substring(1)
      : endpoint.path || "";

    return `/${cleanWorkspaceName}/${cleanProjectName}/${cleanPath}`;
  };

  // ✅ CẬP NHẬT: Hàm lấy full target endpoint cho New API Call
  const getNewApiCallFullTargetEndpoint = (targetEndpointId) => {
    if (!targetEndpointId) return "";

    // Tìm endpoint được chọn bằng ID
    const selectedEndpoint = newApiCallAvailableEndpoints.find(
      (ep) => ep.id === targetEndpointId
    );

    if (selectedEndpoint) {
      return formatFullPath(selectedEndpoint);
    }

    return "";
  };

  // ✅ CẬP NHẬT: Validation để chấp nhận external URLs và kiểm tra internal endpoint tồn tại
  const validateNewApiCall = () => {
    const errors = {};

    // ✅ VALIDATION: Kiểm tra có endpoint nào được chọn hoặc nhập external URL không
    const targetEndpointValue = (() => {
      const selectedEndpoint = newApiCallAvailableEndpoints.find(
        (ep) => ep.id === newApiCallTargetEndpointId
      );
      if (selectedEndpoint) {
        return formatFullPath(selectedEndpoint);
      } else if (newApiCallTargetEndpointDisplay) {
        return newApiCallTargetEndpointDisplay;
      } else {
        return "";
      }
    })();

    if (!targetEndpointValue) {
      errors.targetEndpoint = "Please enter a valid endpoint or external URL";
    } else {
      // Kiểm tra format hợp lệ (internal path hoặc external URL)
      const isValidInternalPath =
        targetEndpointValue.match(/^\/[^/]+\/[^/]+\/.+/);
      const isValidExternalUrl = targetEndpointValue.match(/^https?:\/\/.+/);

      if (!isValidInternalPath && !isValidExternalUrl) {
        errors.targetEndpoint =
          "Please enter a valid endpoint (e.g., /workspace/project/path or https://domain.com/path)";
      } else if (isValidInternalPath) {
        // ✅ THÊM MỚI: Kiểm tra internal endpoint có tồn tại trong danh sách không
        const matchingEndpoint = newApiCallAvailableEndpoints.find((ep) => {
          return formatFullPath(ep) === targetEndpointValue;
        });

        if (!matchingEndpoint) {
          errors.targetEndpoint =
            "Invalid internal endpoint. Please select from suggestions.";
        }
      }
      // External URLs không cần kiểm tra trong availableEndpoints
    }

    if (!newApiCallMethod) {
      errors.method = "Method is required";
    }

    // Thêm kiểm tra status code không được trống
    if (!newApiCallStatusCondition || newApiCallStatusCondition.trim() === "") {
      errors.statusCondition = "Status condition is required";
    }

    // Validate JSON request body
    if (newApiCallRequestBody) {
      try {
        JSON.parse(newApiCallRequestBody);
      } catch {
        errors.requestBody = "Invalid JSON format";
      }
    }

    setNewApiCallValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset validation errors khi các giá trị thay đổi
  useEffect(() => {
    if (
      newApiCallTargetEndpointDisplay || // ✅ CẬP NHẬT: kiểm tra input field
      newApiCallMethod ||
      newApiCallRequestBody ||
      newApiCallStatusCondition
    ) {
      setNewApiCallValidationErrors({});
    }
  }, [
    newApiCallTargetEndpointDisplay, // ✅ CẬP NHẬT: kiểm tra input field
    newApiCallMethod,
    newApiCallRequestBody,
    newApiCallStatusCondition,
  ]);

  // ✅ THÊM: Reset status condition khi method thay đổi
  useEffect(() => {
    // Khi method thay đổi, reset status condition về rỗng
    if (newApiCallMethod) {
      setNewApiCallStatusCondition("");
      // Clear validation error cho status condition
      setNewApiCallValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.statusCondition;
        return newErrors;
      });
    }
  }, [newApiCallMethod]);

  // Cập nhật hàm handleCreateNewApiCall để xử lý external URLs
  const handleCreateNewApiCall = async () => {
    try {
      // Validate dữ liệu
      if (!validateNewApiCall()) {
        return;
      }

      // Lấy full target endpoint
      const fullTargetEndpoint =
        getNewApiCallFullTargetEndpoint(newApiCallTargetEndpointId) ||
        newApiCallTargetEndpointDisplay; // Sử dụng input field nếu không có ID

      if (!fullTargetEndpoint) {
        toast.error("Please enter a valid endpoint or external URL");
        return;
      }

      // ✅ KIỂM TRA LẠI ID nhỏ nhất trước khi tạo
      const minimumId = getMinimumId(nextCalls);
      console.log(`Current minimum ID: ${minimumId}`);

      // Chuẩn bị payload (bao gồm id cho các API Call hiện có)
      const payload = {
        advanced_config: {
          nextCalls: [
            // Giữ nguyên các API Call hiện có (bao gồm id)
            ...nextCalls.map((call) => ({
              id: Number(call.id),
              target_endpoint: call.target_endpoint,
              method: call.method,
              body: call.body,
              condition: Number(call.condition),
            })),
            // Thêm API Call mới (không có id)
            {
              target_endpoint: fullTargetEndpoint, // Có thể là external URL
              method: newApiCallMethod,
              body: JSON.parse(newApiCallRequestBody || "{}"),
              condition: Number(newApiCallStatusCondition),
            },
          ],
        },
      };

      // GỬI PUT REQUEST
      const putResponse = await fetch(
        `${API_ROOT}/endpoints/advanced/${currentEndpointId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!putResponse.ok) {
        const errorData = await putResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to save advanced configuration"
        );
      }

      // Hiển thị thông báo thành công và đóng dialog
      toast.success("API Call added successfully!");
      setIsNewApiCallDialogOpen(false);

      // Reset form
      setNewApiCallTargetEndpointDisplay("");
      setNewApiCallTargetEndpointId("");
      setNewApiCallMethod("GET");
      setNewApiCallRequestBody("{}");
      setNewApiCallStatusCondition("");
      setNewApiCallValidationErrors({});
      setIsTargetEndpointSuggestionsOpen(false);

      // Gọi lại GET API để lấy dữ liệu mới nhất
      await fetchAdvancedConfig();
    } catch (error) {
      console.error("Error creating new API call:", error);
      toast.error(error.message || "Failed to create API call");
    }
  };

  // Thêm hàm xử lý chèn template cho New API Call Request Body
  const insertNewApiCallRequestBodyTemplate = async (template) => {
    try {
      await navigator.clipboard.writeText(template);
      toast.success("Template copied to clipboard!");
      setIsNewApiCallRequestBodyPopoverOpen(false);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy template to clipboard");
    }
  };

  const getFullPath = (path) => {
    if (!currentWorkspace || !currentProject) {
      console.warn("Workspace or project not available, using raw path");
      return path;
    }
    // Đảm bảo workspace name không có dấu gạch chéo ở đầu/cuối
    const cleanWorkspaceName = currentWorkspace.name.replace(/^\/+|\/+$/g, "");

    // Đảm bảo project name không có dấu gạch chéo ở đầu/cuối
    const cleanProjectName = currentProject.name.replace(/^\/+|\/+$/g, "");

    // Loại bỏ dấu gạch chéo đầu tiên của path nếu có
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;

    // Xây dựng full path
    return `/${cleanWorkspaceName}/${cleanProjectName}/${cleanPath}`;
  };

  const validateDelay = (value) => {
    // Cho phép giá trị rỗng (sẽ được xử lý khi lưu)
    if (value === "") return "";

    // Kiểm tra có phải số không
    if (isNaN(value)) {
      return "Delay must be a number";
    }

    // Kiểm tra số thập phân
    if (value.includes(".")) {
      return "Delay must be an integer (no decimals)";
    }

    const num = parseInt(value);

    // Kiểm tra số âm
    if (num < 0) {
      return "Delay must be a positive number";
    }

    return "";
  };

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

  useEffect(() => {
    if (
      currentEndpointId &&
      isStateful &&
      isEndpointsLoaded &&
      !isSwitchingMode
    ) {
      // Fetch endpoint definition including schema
      fetch(`${API_ROOT}/endpoints/base_schema/${currentEndpointId}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setEndpointDefinition(data);
        })
        .catch((error) => {
          console.error("Failed to fetch endpoint definition:", error);
          toast.error("Failed to fetch endpoint definition");
        });
    } else {
      setEndpointDefinition(null);
    }
  }, [currentEndpointId, isStateful, isEndpointsLoaded, isSwitchingMode]);

  const handleCopyPath = () => {
    const endpoint = endpoints.find(
      (ep) => String(ep.id) === String(currentEndpointId)
    );

    if (endpoint) {
      const fullPath = getFullPath(endpoint.path);
      navigator.clipboard
        .writeText(`http://localhost:3000${fullPath}`)
        .then(() => {
          toast.success("Path copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          toast.error("Failed to copy path");
        });
    }
  };

  // ✅ THÊM: Hàm tìm ID nhỏ nhất trong nextCalls
  const getMinimumId = (calls) => {
    if (!calls || calls.length === 0) return null;

    const validIds = calls
      .filter((call) => call.id && typeof call.id === "number")
      .map((call) => call.id);

    return validIds.length > 0 ? Math.min(...validIds) : null;
  };

  // ✅ THÊM: Hàm lấy status codes theo method (trừ ID nhỏ nhất)
  const getStatusCodesByMethod = (method) => {
    const default500Codes = [
      { code: "500", description: "Internal Server Error." },
      { code: "501", description: "Not Implemented." },
      { code: "502", description: "Bad Gateway." },
      { code: "503", description: "Service Unavailable." },
      { code: "504", description: "Gateway Timeout." },
      { code: "505", description: "HTTP Version Not Supported." },
    ];

    switch (method) {
      case "GET":
        return [
          { code: "200", description: "OK." },
          { code: "404", description: "Not Found." },
          ...default500Codes,
        ];
      case "POST":
        return [
          { code: "201", description: "Created." },
          { code: "400", description: "Bad Request." },
          { code: "409", description: "Conflict." },
          ...default500Codes,
        ];
      case "PUT":
        return [
          { code: "200", description: "OK." },
          { code: "400", description: "Bad Request." },
          { code: "409", description: "Conflict." },
          { code: "404", description: "Not Found." },
          ...default500Codes,
        ];
      case "DELETE":
        return [
          { code: "200", description: "OK." },
          { code: "404", description: "Not Found." },
          ...default500Codes,
        ];
      default:
        return default500Codes;
    }
  };

  // ✅ THÊM: Hàm lấy status codes cho New API Call dialog
  const getNewApiCallStatusConditionOptions = () => {
    // KIỂM TRA: Có API call nào đã có ID trong nextCalls không
    const hasApiCallsWithIds = nextCalls.some((call) => call.id);

    if (hasApiCallsWithIds) {
      // ✅ TÌM CALL ID LỚN NHẤT
      const maximumId = Math.max(
        ...nextCalls.filter((call) => call.id).map((call) => call.id)
      );
      const maximumIdCall = nextCalls.find((call) => call.id === maximumId);

      console.log(
        `New API Call - Maximum ID: ${maximumId}, Method: ${maximumIdCall.method}`
      );

      // ✅ SỬ DỤNG METHOD CỦA CALL ID LỚN NHẤT
      return getStatusCodesByMethod(maximumIdCall.method);
    }

    // Nếu nextCalls rỗng hoặc không có ID nào → sử dụng endpoint responses + 500 codes
    if (newApiCallAvailableStatusCodes.length > 0) {
      return newApiCallAvailableStatusCodes;
    }

    // Fallback về quy luật method nếu chưa có endpoint responses
    return getStatusCodesByMethod(newApiCallMethod || "GET");
  };
  // Thêm state cho dialog xác nhận reset
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);

  const [currentEndpoint, setCurrentEndpoint] = useState(null);

  useEffect(() => {
    const found = endpoints.find(
      (ep) => String(ep.id) === String(currentEndpointId)
    );

    // Nếu endpoint có trong danh sách nhưng không có send_notification → fetch chi tiết
    if (found) {
      setCurrentEndpoint(found);
      if (found.send_notification === undefined && currentEndpointId) {
        fetchEndpoint(currentEndpointId);
      }
    } else if (currentEndpointId) {
      // Nếu không có trong danh sách → fetch riêng
      fetchEndpoint(currentEndpointId);
    }
  }, [endpoints, currentEndpointId]);

  const currentFolder = currentEndpoint
    ? folders.find((f) => String(f.id) === String(currentEndpoint.folder_id))
    : null;

  // Hàm xử lý reset current values
  const handleResetCurrentValues = () => {
    const path = endpoints.find(
      (ep) => String(ep.id) === String(currentEndpointId)
    )?.path;

    if (!path) {
      toast.error("Endpoint path is not available. Please try again.");
      return;
    }

    const fullPath = getFullPath(path);

    const payload = {
      data_default: endpointData.data_default || [],
      reset_current: true,
    };

    fetch(`${API_ROOT}/endpoint_data?path=${encodeURIComponent(fullPath)}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to reset current values");
        return res.json();
      })
      .then(() => {
        return fetchEndpointDataByPath(path);
      })
      .then((finalData) => {
        if (finalData) {
          setEndpointData(finalData);
          toast.success("Current values reset successfully!");
          setShowResetConfirmDialog(false);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  const handleSaveSchema = (newSchema) => {
    if (!currentEndpointId) {
      toast.error("Endpoint not found. Cannot update schema.");
      return Promise.reject(new Error("Endpoint not found"));
    }

    const payload = method === "GET" ? newSchema : { schema: newSchema };

    return fetch(`${API_ROOT}/endpoints/${currentEndpointId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update schema");
        return res.json();
      })
      .then(() => {
        toast.success("Schema updated successfully!");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
        return Promise.reject(error);
      });
  };

  // Hàm chèn template cho Initial Value
  const insertInitialValueTemplate = async (template) => {
    try {
      await navigator.clipboard.writeText(template);
      toast.success("Template copied to clipboard!");
      setIsInitialValuePopoverOpen(false);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy template to clipboard");
    }
  };
  // Xử lý click outside popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        initialValuePopoverRef.current &&
        !initialValuePopoverRef.current.contains(event.target)
      ) {
        setIsInitialValuePopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    currentResponseBody.current = responseBody;
  }, [responseBody]);

  // Cập nhật ref khi tempDataDefaultString thay đổi
  useEffect(() => {
    currentTempDataDefaultString.current = tempDataDefaultString;
  }, [tempDataDefaultString]);

  // Hàm chèn template cho Request Body
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

  // Hàm chèn template cho Response Body
  const insertTemplate = async (template) => {
    try {
      await navigator.clipboard.writeText(template);
      toast.success("Template copied to clipboard!");
      setIsPopoverOpen(false);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy template to clipboard");
    }
  };

  // Thêm useEffect để cập nhật trạng thái stateful khi endpointId thay đổi
  useEffect(() => {
    if (currentEndpointId) {
      const endpoint = endpoints.find(
        (ep) => String(ep.id) === String(currentEndpointId)
      );
      if (endpoint) {
        setIsStateful(endpoint.is_stateful);
        setIsActive(endpoint.is_active);
      }
    }
  }, [currentEndpointId, endpoints]);

  const handleStateModeChange = () => {
    if (!currentEndpointId) return;

    // Hiển thị dialog khi chuyển từ stateless sang stateful
    if (!isStateful) {
      setShowStatefulConfirmDialog(true);
      return;
    }

    // Hiển thị dialog khi chuyển từ stateful sang stateless
    setShowStatelessConfirmDialog(true);
  };

  // Hàm xử lý xác nhận chuyển sang stateful
  const handleConfirmStateful = () => {
    const path = currentEndpoint?.path || "";

    // Kiểm tra nếu path có chứa param động
    if (/:[a-zA-Z0-9\-_]+/.test(path)) {
      toast.warning("Endpoint path has param, can not convert to stateful!");
      return; // Dừng quá trình chuyển đổi
    }
    setIsSwitchingMode(true);
    setShowStatefulConfirmDialog(false);

    const newIsStateful = true;
    const previousState = isStateful;

    // Update state immediately for UI responsiveness
    setEndpoints((prev) =>
      prev.map((ep) =>
        String(ep.id) === String(currentEndpointId)
          ? {
              ...ep,
              is_stateful: newIsStateful,
              updated_at: new Date().toISOString(),
            }
          : ep
      )
    );
    setIsStateful(newIsStateful);

    fetch(`${API_ROOT}/endpoints/${currentEndpointId}/convert-to-stateful`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) {
          // Lấy nội dung lỗi từ server (text hoặc JSON)
          const text = await res.text();

          // Trường hợp folder chưa có base schema
          if (text.includes("Folder does not have a base schema")) {
            toast.warning(
              "This folder needs a base schema before converting to stateful."
            );

            // Hiển thị dialog edit schema cho folder
            setOpenSchemaDialog(true);

            // Revert lại UI state
            setEndpoints((prev) =>
              prev.map((ep) =>
                String(ep.id) === String(currentEndpointId)
                  ? { ...ep, is_stateful: previousState }
                  : ep
              )
            );
            setIsStateful(previousState);

            // Ngừng xử lý
            throw new Error("Folder does not have a base schema");
          }

          // Các lỗi khác
          throw new Error("Failed to convert endpoint to stateful mode");
        }

        return res.json();
      })
      .then((updatedEndpoint) => {
        setEndpoints((prev) =>
          prev.map((ep) =>
            String(ep.id) === String(currentEndpointId) ? updatedEndpoint : ep
          )
        );
        setIsStateful(updatedEndpoint.is_stateful);

        const currentEndpoint = endpoints.find(
          (ep) => String(ep.id) === String(currentEndpointId)
        );

        if (currentEndpoint && currentEndpoint.path) {
          fetchEndpointDataByPath(currentEndpoint.path);
        }

        fetchEndpointResponses(true);
        toast.success("Endpoint switched to stateful mode!");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error converting to stateful:", error);
        if (!error.message.includes("Folder does not have a base schema")) {
          toast.error(error.message);
        }
      })
      .finally(() => {
        setIsSwitchingMode(false);
      });
  };

  useEffect(() => {
    if (!currentFolder?.id || !openSchemaDialog) return;

    // Fetch base_schema từ folder
    fetch(`${API_ROOT}/folders/${currentFolder.id}`, { credentials: "include" })
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
  }, [currentFolder, openSchemaDialog]);

  const handleSaveFolderSchema = async (newSchema) => {
    if (!currentFolder?.id) return;

    try {
      const res = await fetch(`${API_ROOT}/folders/${currentFolder.id}`, {
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

  // Hàm xử lý xác nhận chuyển sang stateless
  const handleConfirmStateless = () => {
    setIsSwitchingMode(true);
    setShowStatelessConfirmDialog(false);

    const newIsStateful = false;
    const previousState = isStateful;

    // Update state immediately for UI responsiveness
    setEndpoints((prev) =>
      prev.map((ep) =>
        String(ep.id) === String(currentEndpointId)
          ? {
              ...ep,
              is_stateful: newIsStateful,
              updated_at: new Date().toISOString(),
            }
          : ep
      )
    );
    setIsStateful(newIsStateful);

    // Call new API to convert to stateless
    fetch(`${API_ROOT}/endpoints/${currentEndpointId}/convert-to-stateless`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          // If error, revert state
          setEndpoints((prev) =>
            prev.map((ep) =>
              String(ep.id) === String(currentEndpointId)
                ? { ...ep, is_stateful: previousState }
                : ep
            )
          );
          setIsStateful(previousState);
          throw new Error("Failed to convert endpoint to stateless mode");
        }
        return res.json();
      })
      .then((updatedEndpoint) => {
        // Update endpoint with data from API
        setEndpoints((prev) =>
          prev.map((ep) =>
            String(ep.id) === String(currentEndpointId) ? updatedEndpoint : ep
          )
        );
        setIsStateful(updatedEndpoint.is_stateful);

        // After switching to stateless, need to fetch endpoint responses
        fetchEndpointResponses(false);

        toast.success("Endpoint switched to stateless mode!");
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      })
      .finally(() => {
        setIsSwitchingMode(false);
      });
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Thêm state để lưu trữ trạng thái trước khi drag
  const [previousStatusData, setPreviousStatusData] = useState([]);

  // Thêm state để lưu condition
  const [responseCondition, setResponseCondition] = useState({});

  // Thêm state cho search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Filter statusData dựa trên search term
  const filteredStatusData = statusData.filter((status) =>
    status.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const fetchEndpoint = async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`${API_ROOT}/endpoints/${id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch endpoint");
      const data = await response.json();
      setCurrentEndpoint(data);
      console.log("Current endpoint:", data);
    } catch (error) {
      console.error("Error fetching endpoint:", error);
    }
  };

  const fetchFolders = () => {
    return fetch(`${API_ROOT}/folders`)
      .then((res) => res.json())
      .then((data) => {
        setFolders(data);
      })
      .catch((error) => {
        console.error("Error fetching folders:", error);
      });
  };

  const fetchWebsocketConfig = async () => {
    try {
      const res = await fetch(`${API_ROOT}/endpoints/${endpointId}/websocket`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch WebSocket config");

      const data = await res.json();
      setConfig(data);
      setWsEnabled(data?.enabled ?? false);
      setWsMessage(data?.message ?? "");
      setWsDelay(data?.delay_ms ?? 0);
      setWsCondition(data?.condition ?? 0);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Unable to load WebSocket config");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEndpointResponses = (isStatefulMode) => {
    const endpointIdStr = String(currentEndpointId);

    return fetch(
      `${API_ROOT}/endpoint_responses?endpoint_id=${endpointIdStr}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((data) => {
        // Processing for stateful endpoint
        if (isStatefulMode) {
          // Only take necessary fields for stateful
          const statefulResponses = data.map((res) => ({
            id: res.id,
            endpoint_id: res.endpoint_id,
            name: res.name,
            status_code: res.status_code,
            response_body: res.response_body,
            delay_ms: res.delay_ms,
            // Use value from backend instead of self-setting
            is_stateful: res.is_stateful !== undefined ? res.is_stateful : true,
            created_at: res.created_at,
            updated_at: res.updated_at,
          }));

          setEndpointResponses(statefulResponses);

          // Format data for UI
          const statusDataFormatted = statefulResponses.map((res) => ({
            id: res.id,
            code: res.status_code.toString(),
            name: res.name,
            isStateful: res.is_stateful !== undefined ? res.is_stateful : true,
            bgColor: "",
          }));

          setStatusData(statusDataFormatted);

          // Select first response as default
          if (!selectedResponse && statefulResponses.length > 0) {
            const firstResponse = statefulResponses[0];
            setSelectedResponse(firstResponse);
            setResponseName(firstResponse.name);
            setStatusCode(firstResponse.status_code.toString());
            setResponseBody(
              JSON.stringify(firstResponse.response_body, null, 2)
            );
            setDelay(firstResponse.delay_ms?.toString() || "0");
          }
        } else {
          // Processing as current for stateless
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

        // Common processing for both stateful and stateless
        if (selectedResponse) {
          const existingResponse = data.find(
            (res) => res.id === selectedResponse.id
          );
          if (existingResponse) {
            // Processing for stateful
            if (isStatefulMode) {
              setSelectedResponse({
                id: existingResponse.id,
                endpoint_id: existingResponse.endpoint_id,
                name: existingResponse.name,
                status_code: existingResponse.status_code,
                response_body: existingResponse.response_body,
                delay_ms: existingResponse.delay_ms,
                // Use value from backend instead of self-setting
                is_stateful:
                  existingResponse.is_stateful !== undefined
                    ? existingResponse.is_stateful
                    : true,
                created_at: existingResponse.created_at,
                updated_at: existingResponse.updated_at,
              });
              setResponseName(existingResponse.name);
              setStatusCode(existingResponse.status_code.toString());
              setResponseBody(
                JSON.stringify(existingResponse.response_body, null, 2)
              );
              setDelay(existingResponse.delay_ms?.toString() || "0");
            } else {
              setSelectedResponse(existingResponse);
              setResponseName(existingResponse.name);
              setStatusCode(existingResponse.status_code.toString());
              setResponseBody(
                JSON.stringify(existingResponse.response_body, null, 2)
              );
              setDelay(existingResponse.delay_ms?.toString() || "0");
              setProxyUrl(existingResponse.proxy_url || "");
              setProxyMethod(existingResponse.proxy_method || "GET");
            }
          }
        }
      });
  };

  const fetchEndpointDataByPath = (path) => {
    const fullPath = getFullPath(path);

    return fetch(
      `${API_ROOT}/endpoint_data?path=${encodeURIComponent(fullPath)}`,
      { credentials: "include" }
    )
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) return null;
          throw new Error("Failed to fetch endpoint data");
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          // Endpoint data exists, use it
          setEndpointData(data);
          // Cập nhật temp states cho Initial Value editor
          const initialValueString = JSON.stringify(
            data.data_default || [],
            null,
            2
          );
          setTempDataDefaultString(initialValueString);
          setTempDataDefault(data.data_default || []);
        } else {
          // Endpoint doesn't exist yet, create default structure
          const defaultEndpointData = {
            path: path,
            data_default: [],
            data_current: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setEndpointData(defaultEndpointData);
          setTempDataDefaultString("[]");
          setTempDataDefault([]);
        }
        return data;
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
        return null;
      });
  };

  // ✅ THÊM: useEffect để handle click outside cho suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTargetEndpointSuggestionsOpen) {
        const targetEndpointInput = document.getElementById("target-endpoint");
        const suggestionsDropdown = document.querySelector(
          '[data-dropdown="target-endpoint"]'
        );

        // Đóng dropdown nếu click bên ngoài input hoặc dropdown
        if (targetEndpointInput && suggestionsDropdown) {
          if (
            !targetEndpointInput.contains(event.target) &&
            !suggestionsDropdown.contains(event.target)
          ) {
            setIsTargetEndpointSuggestionsOpen(false);
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTargetEndpointSuggestionsOpen]);

  // Fetch endpoint data khi endpointId thay đổi
  useEffect(() => {
    if (
      currentEndpointId &&
      isStateful &&
      isEndpointsLoaded &&
      !isSwitchingMode
    ) {
      const currentEndpoint = endpoints.find(
        (ep) => String(ep.id) === String(currentEndpointId)
      );

      if (currentEndpoint && currentEndpoint.path) {
        fetchEndpointDataByPath(currentEndpoint.path);
      }
    } else if (!isStateful && isEndpointsLoaded && !isSwitchingMode) {
      // Clear endpoint data when in stateless mode
      setEndpointData(null);
    }
  }, [
    currentEndpointId,
    endpoints,
    isStateful,
    isEndpointsLoaded,
    isSwitchingMode,
  ]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchWorkspaces(),
          fetchProjects(),
          fetchEndpoints(),
          fetchFolders(),
          fetchWebsocketConfig(),
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (currentEndpointId && isEndpointsLoaded && !isSwitchingMode) {
      setIsLoading(true);
      fetchEndpointResponses(isStateful).finally(() => setIsLoading(false));
    }
  }, [currentEndpointId, isStateful, isEndpointsLoaded, isSwitchingMode]);

  useEffect(() => {
    if (endpoints.length > 0) {
      setIsEndpointsLoaded(true);
    }
  }, [endpoints]);

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
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete response");
        }
        return res.json();
      })
      .then(() => {
        // Fetch lại danh sách responses sau khi xóa
        return fetchEndpointResponses();
      })
      .then(() => {
        // Sau khi fetch xong, chọn response mới
        if (endpointResponses.length > 0) {
          // Tìm response mặc định trước
          const defaultResponse = endpointResponses.find((r) => r.is_default);

          // Nếu có response mặc định, chọn nó
          if (defaultResponse) {
            handleResponseSelect(defaultResponse);
          }
          // Nếu không có response mặc định, chọn response đầu tiên
          else {
            handleResponseSelect(endpointResponses[0]);
          }
        }
        // Nếu không còn response nào, reset form
        else {
          setSelectedResponse(null);
          setResponseName("");
          setStatusCode("");
          setResponseBody("");
          setDelay("0");
        }

        // Thêm toast thông báo thành công
        toast.success("Response deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting response:", error.message);
        toast.error("Failed to delete response!");
      });
  };

  const updatePriorities = (priorityUpdates) => {
    fetch(`${API_ROOT}/endpoint_responses/priority`, {
      method: "PUT",
      credentials: "include",
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
      credentials: "include",
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
    // Sử dụng endpoint khác nhau cho stateful và stateless
    const url = isStateful
      ? `${API_ROOT}/endpoint_responses_ful/${response.id}`
      : `${API_ROOT}/endpoint_responses/${response.id}`;

    fetch(url, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (isStateful) {
          // Chỉ lấy các trường cần thiết cho stateful
          const statefulResponse = {
            id: data.id,
            endpoint_id: data.endpoint_id,
            name: data.name,
            status_code: data.status_code,
            response_body: data.response_body,
            delay_ms: data.delay_ms,
            // Sử dụng giá trị từ backend thay vì tự set
            is_stateful:
              data.is_stateful !== undefined ? data.is_stateful : true,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };

          setSelectedResponse(statefulResponse);
          setResponseName(statefulResponse.name);
          setStatusCode(statefulResponse.status_code.toString());
          setResponseBody(
            JSON.stringify(statefulResponse.response_body, null, 2)
          );
          setDelay(statefulResponse.delay_ms?.toString() || "0");
        } else {
          setSelectedResponse(data);
          setResponseName(data.name);
          setStatusCode(data.status_code.toString());
          setResponseBody(JSON.stringify(data.response_body, null, 2));
          setDelay(data.delay_ms?.toString() || "0");
          setProxyUrl(data.proxy_url || "");
          setProxyMethod(data.proxy_method || "GET");
        }
      })
      .catch(console.error);
  };

  const handleNewResponse = () => {
    // Reset form khi tạo mới
    setSelectedResponse(null);
    setResponseName("");
    setStatusCode("200");
    setResponseBody("{}");
    setDelay("0");
    setIsDialogOpen(true);
  };

  const handleSaveResponse = () => {
    // Chỉ cho phép cập nhật response đã có sẵn
    if (!selectedResponse) {
      toast.error("Please select a response to save");
      return;
    }

    const delayValidationError = validateDelay(delay);
    if (delayValidationError) {
      setDelayError(delayValidationError);
      toast.error(delayValidationError);
      return;
    }

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

    // Payload khác nhau cho stateful và stateless
    let payload;
    if (isStateful) {
      // Chỉ gửi đúng 3 trường được yêu cầu cho stateful mode
      payload = {
        name: responseName,
        response_body: responseBodyObj,
        delay_ms: parseInt(delay) || 0,
      };
    } else {
      payload = {
        endpoint_id: currentEndpointId,
        name: responseName,
        status_code: parseInt(statusCode),
        response_body: responseBodyObj,
        condition: responseCondition,
        is_default: selectedResponse.is_default, // Giữ nguyên is_default hiện tại
        delay_ms: parseInt(delay) || 0,
        proxy_url: proxyUrl.trim() ? proxyUrl : null,
        proxy_method: proxyUrl.trim() ? proxyMethod : null,
      };
    }

    // Chỉ sử dụng PUT method để cập nhật
    const url = selectedResponse
      ? isStateful
        ? `${API_ROOT}/endpoint_responses_ful/${selectedResponse.id}`
        : `${API_ROOT}/endpoint_responses/${selectedResponse.id}`
      : null; // Không bao giờ null vì đã validate ở đầu

    fetch(url, {
      method: "PUT", // Chỉ PUT, không còn POST nữa
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update response");
        }
        return res.json();
      })
      .then((updatedResponse) => {
        // Xử lý response trả về dựa trên chế độ
        if (isStateful) {
          // Giữ nguyên status_code hiện tại khi cập nhật response stateful
          const currentStatefulResponse = {
            ...updatedResponse,
            status_code: selectedResponse?.status_code || 200,
          };

          const statefulResponse = {
            id: currentStatefulResponse.id,
            endpoint_id: currentStatefulResponse.endpoint_id,
            name: currentStatefulResponse.name,
            status_code: currentStatefulResponse.status_code,
            response_body: currentStatefulResponse.response_body,
            delay_ms: currentStatefulResponse.delay_ms,
            is_stateful: true,
            created_at: currentStatefulResponse.created_at,
            updated_at: currentStatefulResponse.updated_at,
          };

          // Cập nhật state với response stateful
          setEndpointResponses((prev) =>
            prev.map((r) =>
              r.id === statefulResponse.id ? statefulResponse : r
            )
          );

          // Cập nhật statusData
          setStatusData((prev) =>
            prev.map((s) =>
              s.id === statefulResponse.id
                ? {
                    ...s,
                    code: statefulResponse.status_code.toString(),
                    name: statefulResponse.name,
                  }
                : s
            )
          );

          setSelectedResponse(statefulResponse);
        } else {
          // Xử lý như hiện tại cho stateless
          setEndpointResponses((prev) =>
            prev.map((r) => (r.id === updatedResponse.id ? updatedResponse : r))
          );

          setStatusData((prev) =>
            prev.map((s) =>
              s.id === updatedResponse.id
                ? {
                    ...s,
                    code: updatedResponse.status_code.toString(),
                    name: updatedResponse.name,
                    isDefault: updatedResponse.is_default,
                  }
                : s
            )
          );

          setProxyUrl(updatedResponse.proxy_url || "");
          setProxyMethod(updatedResponse.proxy_method || "GET");

          setSelectedResponse(updatedResponse);
        }

        toast.success("Response updated successfully!");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  // Tạo hàm riêng chỉ để tạo response mới
  const handleCreateResponse = () => {
    const delayValidationError = validateDelay(delay);
    if (delayValidationError) {
      setDelayError(delayValidationError);
      toast.error(delayValidationError);
      return;
    }

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

    // Chỉ cho stateless mode
    if (isStateful) {
      toast.error("Cannot create new responses in stateful mode");
      return;
    }

    // Payload cho tạo mới response (stateless only)
    const payload = {
      endpoint_id: currentEndpointId,
      name: responseName,
      status_code: parseInt(statusCode),
      response_body: responseBodyObj,
      condition: {},
      is_default: endpointResponses.length === 0, // Nếu là response đầu tiên thì là default
      delay_ms: parseInt(delay) || 0,
      proxy_url: null,
      proxy_method: null,
    };

    fetch(`${API_ROOT}/endpoint_responses`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create response");
        return res.json();
      })
      .then((newResponse) => {
        // Thêm response mới vào danh sách
        setEndpointResponses((prev) => [...prev, newResponse]);

        // Cập nhật statusData
        setStatusData((prev) => [
          ...prev,
          {
            id: newResponse.id,
            code: newResponse.status_code.toString(),
            name: newResponse.name,
            isDefault: newResponse.is_default,
          },
        ]);

        // Tự động chọn response mới tạo
        setSelectedResponse(newResponse);
        setResponseName(newResponse.name);
        setStatusCode(newResponse.status_code.toString());
        setResponseBody(JSON.stringify(newResponse.response_body, null, 2));
        setDelay(newResponse.delay_ms?.toString() || "0");

        // Đóng dialog và reset form
        setIsDialogOpen(false);
        setSelectedResponse(null);
        setResponseName("");
        setStatusCode("200");
        setResponseBody("");
        setDelay("0");
        setResponseNameError("");
        setDelayError("");

        toast.success("New response created successfully!");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  const availableTabs = [];
  if (!isStateful) availableTabs.push("Rules", "proxy");
  if (isStateful) availableTabs.push("dataDefault");
  if (isStateful && method !== "DELETE") availableTabs.push("schemaBody");
  if (isStateful) availableTabs.push("advanced");

  const defaultTab = availableTabs[0] || "Rules";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const renderTabButton = (value, label, icon) => {
    const isActive = activeTab === value;
    const isDataDefault = label === "Data Default";
    const isRules = label === "Rules";

    return (
      <button
        onClick={() => setActiveTab(value)}
        className={`response-card-header flex px-4 py-2 ${
          isActive
            ? "active"
            : "opacity-50"
        } ${isDataDefault ? "rounded-tl-md" : ""}
        ${isRules ? "rounded-tl-md" : ""}`}
      >
        <div className="flex items-center">
          <img src={icon} alt={label} className="w-4 h-4 mr-2 dark:brightness-0 dark:invert" />
          <span className="text-md font-semibold">{label}</span>
        </div>
      </button>
    );
  };

  // khi isStateful/method/availableTabs thay đổi, đảm bảo activeTab vẫn hợp lệ
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] || "Rules");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStateful, method, availableTabs.join(",")]);

  useEffect(() => {
    if (selectedResponse) {
      setResponseCondition(selectedResponse.condition || {});
      setProxyUrl(selectedResponse.proxy_url || "");
      setProxyMethod(selectedResponse.proxy_method || "GET");
    }
  }, [selectedResponse]);

  // Hàm xử lý khi lưu initial value
  const handleSaveInitialValue = () => {
    const path = endpoints.find(
      (ep) => String(ep.id) === String(currentEndpointId)
    )?.path;

    if (!path) {
      toast.error("Endpoint path is not available. Please try again.");
      return;
    }

    const fullPath = getFullPath(path);

    try {
      const parsedData = JSON.parse(tempDataDefaultString);
      const payload = {
        data_default: parsedData,
        reset_current: true,
      };

      fetch(`${API_ROOT}/endpoint_data?path=${encodeURIComponent(fullPath)}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to update endpoint data");
          return res.json();
        })
        .then(() => {
          return fetchEndpointDataByPath(path);
        })
        .then((finalData) => {
          if (finalData) {
            setEndpointData(finalData);
            toast.success("Initial value updated successfully!");
          }
        })
        .catch((error) => {
          console.error(error);
          toast.error(error.message);
        });
    } catch (error) {
      toast.error(
        `Invalid JSON format: ${error.message}. Please fix the errors before saving.`
      );
    }
  };

  // Cập nhật state string khi tempDataDefault thay đổi
  useEffect(() => {
    setTempDataDefaultString(JSON.stringify(tempDataDefault, null, 2));
  }, [tempDataDefault]);

  // Thêm useEffect để cập nhật tempDataDefaultString từ endpointData.data_default
  useEffect(() => {
    if (endpointData && endpointData.data_default) {
      const initialValueString = JSON.stringify(
        endpointData.data_default,
        null,
        2
      );
      setTempDataDefaultString(initialValueString);
      setTempDataDefault(endpointData.data_default);
    } else if (endpointData && !endpointData.data_default) {
      setTempDataDefaultString("[]");
      setTempDataDefault([]);
    }
  }, [endpointData]);
  // Thêm UI loading
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <span className="loader"></span>
        <p className="text-lg mt-2 font-medium">
          Loading endpoint data...
        </p>
      </div>
    );
  }

  const handleToggleWebSocket = async (checked) => {
    try {
      setWsEnabled(checked);

      const payload = {
        websocket_config: {
          enabled: checked,
          message: wsMessage,
          delay_ms: wsDelay,
          condition: wsCondition,
        },
      };

      const res = await fetch(`${API_ROOT}/endpoints/${endpointId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update WebSocket config");
      toast.success(
        `WebSocket ${checked ? "enabled" : "disabled"} successfully`
      );

      // Nếu bật Notification, gọi API lấy websocket token
      if (checked) {
        try {
          const tokenData = await getEndpointToken(Number(endpointId));
          console.log("WebSocket token:", tokenData);
          toast.success("WebSocket token retrieved successfully!");
          // 👉 tại đây bạn có thể lưu token vào state nếu cần, ví dụ:
          // setWsToken(tokenData.token);
        } catch (tokenErr) {
          console.error("Failed to get endpoint token:", tokenErr);
          toast.error("Failed to get WebSocket token");
        }
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update WebSocket config");
      setWsEnabled((prev) => !prev); // rollback
    }
  };

  return (
    <div className="response-page min-h-screen flex">
      {/* Main Content */}
      <div className="pt-8 flex-1 relative">
        {/* Header */}
        <Topbar
          className="mt-0 mb-4"
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
                ? currentFolder
                  ? currentEndpointId
                    ? [
                        {
                          label: currentWorkspace.name,
                          WORKSPACE_ID: currentWorkspace.id,
                          href: "/dashboard",
                          icon: workspaceIcon,
                        },
                        {
                          label: currentProject.name,
                          href: `/dashboard/${currentProject.id}`,
                          icon: projectIcon,
                        },
                        {
                          label: currentFolder.name,
                          folder_id: currentFolder.id,
                          href: `/dashboard/${currentProject.id}`,
                          icon: folderIcon,
                        },
                        {
                          label:
                            endpoints.find(
                              (ep) =>
                                String(ep.id) === String(currentEndpointId)
                            )?.name || "Endpoint",
                          href: null,
                          icon: endpointIcon,
                        },
                      ]
                    : [
                        {
                          label: currentWorkspace.name,
                          WORKSPACE_ID: currentWorkspace.id,
                          href: "/dashboard",
                          icon: workspaceIcon,
                        },
                        {
                          label: currentProject.name,
                          href: `/dashboard/${currentProject.id}`,
                          icon: projectIcon,
                        },
                        {
                          label: currentFolder.name,
                          folder_id: currentFolder.id,
                          href: `/dashboard/${currentProject.id}`,
                          icon: folderIcon,
                        },
                      ]
                  : [
                      {
                        label: currentWorkspace.name,
                        WORKSPACE_ID: currentWorkspace.id,
                        href: "/dashboard",
                        icon: workspaceIcon,
                      },
                      {
                        label: currentProject.name,
                        href: `/dashboard/${currentProject.id}`,
                        icon: projectIcon,
                      },
                    ]
                : [
                    {
                      label: currentWorkspace.name,
                      WORKSPACE_ID: currentWorkspace.id,
                      href: "/dashboard",
                      icon: workspaceIcon,
                    },
                  ]
              : []
          }
          onSearch={setSearchTerm}
          onNewResponse={isStateful ? undefined : handleNewResponse}
          showNewProjectButton={false}
          showNewResponseButton={!isStateful}
          showStateModeToggle={true}
          isStateful={isStateful}
          onStateModeChange={handleStateModeChange}
          username={currentUsername}
        />

        <div
          className="response-page-content flex flex-col px-16 py-4"
          style={{
            backgroundImage: `url(${dot_background})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          {/* Phần bên trái - Display Endpoint Name and Method */}
          <div className="flex items-center flex-shrink-0 mb-2">
            <h2 className="text-4xl font-bold opacity-80 mr-4">
              {endpoints.find(
                (ep) => String(ep.id) === String(currentEndpointId)
              )?.name || "Endpoint"}
            </h2>
          </div>

          {/* Phần bên phải - Form Status Info */}
          <div className="flex items-center gap-2 ml-1 flex-1 flex-wrap">
            <div className="font-semibold text-lg flex items-center ">
              <img
                src={hashtagIcon}
                alt="Hashtag"
                className="w-5 h-5 mr-1 object-contain dark:brightness-0 dark:invert"
              />
              <span>Path</span>
            </div>

            <div className="path flex items-center gap-2 w-full max-w-2xl rounded-md px-2 py-1">
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

              <div className="flex-1 font-semibold text-base truncate min-w-0">
                {endpoints.find(
                  (ep) => String(ep.id) === String(currentEndpointId)
                )?.path || "-"}
              </div>

              {/* Icon chain */}
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 flex-shrink-0 dark:brightness-0 dark:invert"
                onClick={handleCopyPath}
                title="Copy path"
              >
                <img
                  src={chainIcon}
                  alt="Copy path"
                  className="w-5 h-5 object-contain"
                />
              </Button>
            </div>

            {/* reset state button */}
            {isStateful && (
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 flex-shrink-0 dark:brightness-0 dark:invert"
                onClick={() => setShowResetConfirmDialog(true)}
              >
                <img
                  src={reset_icon}
                  alt="Reset state"
                  className="w-5 h-5 object-contain"
                />
              </Button>
            )}

            {/* State Mode Toggle */}
            <div className="ml-4 flex items-center gap-2">
              <span className="font-inter font-semibold text-base select-none">
                {isStateful ? "Stateful" : "Stateless"}
              </span>

              <Switch
                checked={isStateful}
                onCheckedChange={handleStateModeChange}
                className="switch"
              />
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="ws-enable" className="text-base font-inter font-semibold">
                Notification
              </Label>
              <Switch
                id="ws-enable"
                checked={wsEnabled}
                onCheckedChange={handleToggleWebSocket}
                className="switch"
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`response-page-content transition-all duration-300 px-16 pt-4 pb-4 w-full`}>
          {/* Dialog xác nhận reset current values */}
          <Dialog
            open={showResetConfirmDialog}
            onOpenChange={setShowResetConfirmDialog}
          >
            <DialogContent className="p-8 rounded-2xl shadow-lg">
              <DialogHeader className="flex justify-between items-start mb-4">
                <DialogTitle className="text-xl font-bold text-slate-800">
                  Reset Current Values
                </DialogTitle>
              </DialogHeader>

              <div className="mb-6">
                <p className="text-gray-700">
                  It will reset all Current Values back to Initial Values. Are
                  you sure you want to reset?
                </p>
              </div>

              <DialogFooter className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirmDialog(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 w-[80px] h-[40px] rounded-[8px]"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#FA2F2F] hover:bg-[#E02929] text-white w-[90px] h-[40px] rounded-[8px]"
                  onClick={handleResetCurrentValues}
                >
                  Reset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex gap-6">
            {/* Cột trái - Response Configuration */}
            <div className="w-1/4">
              {/* Header với nút Add và Search */}
              <div className="response-header flex flex-col rounded-t-lg ">
                <div className="flex items-center justify-between p-2.5 rounded-t-lg border border-b-0">
                  <div className="flex items-center gap-3.5">
                    {!isStateful && (
                      <div className="relative">
                        <button
                          className="w-6 h-6 flex items-center justify-center rounded-lg border dark:border-none"
                          onClick={handleNewResponse}
                          disabled={isStateful}
                          title={
                            isStateful
                              ? "Cannot add responses in stateful mode"
                              : "Add new response"
                          }
                          onMouseEnter={() => setAddTooltipVisible(true)}
                          onMouseLeave={() => setAddTooltipVisible(false)}
                        >
                          <Plus className="w-4 h-4 text-black dark:invert" />
                        </button>
                        <Tooltip
                          visible={addTooltipVisible}
                          className="bottom-full left-1/2 transform -translate-x-1/2 mb-2"
                        >
                          Add New Response
                        </Tooltip>
                      </div>
                    )}
                    <div className="flex items-center rounded-lg border px-1.5 py-1 w-[146px] h-[26px]">
                      <div className="flex items-center gap-0.5 px-0.5">
                        <img
                          src={searchIcon}
                          alt="Search"
                          className="w-4 h-4 object-contain opacity-30 dark:brightness-0 dark:invert"
                        />
                        <input
                          type="text"
                          placeholder="Search..."
                          className="placeholder w-[87.88px] h-[19px] text-[12.8152px] bg-transparent border-none focus:outline-none"
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Configuration Table */}
              <div className="square-lg border overflow-hidden rounded-b-lg">
                <div className="overflow-y-auto max-h-[400px]">
                  {filteredStatusData.length > 0 ? (
                    filteredStatusData.map((status, index) => {
                      // Xác định màu sắc dựa trên status code
                      let statusColor = "#1C1C1C";
                      const statusCode = status.code.toString();

                      if (statusCode.startsWith("1")) {
                        statusColor = "#ff6bfa";
                      } else if (statusCode.startsWith("2")) {
                        statusColor = "#328F4F";
                      } else if (statusCode.startsWith("3")) {
                        statusColor = "#3e70dd";
                      } else if (statusCode.startsWith("4")) {
                        statusColor = "#ed4245";
                      } else if (statusCode.startsWith("5")) {
                        statusColor = "#ef8843";
                      }

                      return (
                        <div
                          key={status.id || status.code}
                          className={`group response-card flex items-center justify-between p-3 cursor-pointer ${
                            selectedResponse?.id === status.id
                              ? "active"
                              : ""
                          } ${
                            index === filteredStatusData.length - 1
                              ? "border-b-0"
                              : ""
                          }`}
                          draggable={!isStateful && !searchTerm}
                          onDragStart={
                            !isStateful && !searchTerm
                              ? (e) => handleDragStart(e, index)
                              : undefined
                          }
                          onDragOver={
                            !isStateful && !searchTerm
                              ? handleDragOver
                              : undefined
                          }
                          onDragEnd={
                            !isStateful && !searchTerm
                              ? () => setDraggedItem(null)
                              : undefined
                          }
                          onDrop={
                            !isStateful && !searchTerm
                              ? (e) => handleDrop(e, index)
                              : undefined
                          }
                          onClick={() => {
                            const response = endpointResponses.find(
                              (r) => r.id === status.id
                            );
                            if (response) handleResponseSelect(response);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {/* Icon GripVertical chỉ hiện khi hover */}
                            {!isStateful && !searchTerm && (
                              <GripVertical className="h-4 w-4 text-gray-400 dark:text-white cursor-move opacity-0
                                group-hover:opacity-100 transition-opacity" />
                            )}

                            <div className="flex items-center gap-2">
                              <span
                                className="text-[12px] font-medium"
                                style={{ color: statusColor }}
                              >
                                {status.code}
                              </span>
                              <span className="text-[12px]">
                                {status.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isStateful && status.isDefault && (
                              <span className="text-gray-500 font-mono font-semibold text-xs">
                                DEFAULT
                              </span>
                            )}

                            {/* Nút Trash chỉ hiện khi hover */}
                            {!isStateful && !status.isDefault && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const response = endpointResponses.find(
                                    (r) => r.id === status.id
                                  );
                                  if (response) {
                                    handleResponseSelect(response);
                                    handleDeleteResponse();
                                  }
                                }}
                                title="Delete response"
                              >
                                <Trash2 className="h-4 w-4 dark:brightness-0 dark:invert" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                      <div className="text-sm">
                        {searchTerm
                          ? "No responses found matching your search"
                          : "No responses available"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cột phải - Navigation và Content */}
            <div className="w-3/4 flex flex-col gap-1">
              {/* Phần trên - Header & Body */}
              <div className="flex flex-col w-full">
                {/* Nội dung phần Header & Body */}
                <div className="card flex flex-col h-fit border-2 rounded-lg">
                  {/* Thanh tiêu đề và dropdown nằm cùng hàng */}
                  <div className="response-header flex justify-between items-center rounded-t-lg">
                    <button className="response-card-header active px-4 py-2 -mb-px rounded-tl-lg">
                      <div className="flex items-center">
                        <img
                          src={Header_Body}
                          alt="folder"
                          className="w-4 h-4 mr-2 dark:brightness-0 dark:invert"
                        />
                        <span className="text-md font-semibold">
                          Response Detail
                        </span>
                      </div>
                    </button>

                    {/* Dropdown chọn response - Response Detail */}
                    <div className="relative right-5" ref={responseDropdownRef}>
                      <button
                        onClick={() =>
                          setIsResponseDropdownOpen(!isResponseDropdownOpen)
                        }
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors"
                      >
                        <span className="truncate max-w-[150px]">
                          {selectedResponse
                            ? `${selectedResponse.status_code}-${selectedResponse.name}`
                            : "Select Response"}
                        </span>
                        <ChevronDown className="h-3 w-3 flex-shrink-0" />
                      </button>

                      {isResponseDropdownOpen && (
                        <div className="absolute z-50 right-0 mt-1 w-64 border rounded-md shadow-lg max-h-32 overflow-y-auto">
                          {endpointResponses.map((response) => (
                            <button
                              key={response.id}
                              className={`select-response w-full text-left px-3 py-2 text-sm focus:outline-none ${
                                selectedResponse?.id === response.id
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => {
                                handleResponseSelect(response);
                                setIsResponseDropdownOpen(false);
                              }}
                            >
                              {/* Chỉ hiển thị 1 dòng với định dạng StatusCode-Name */}
                              <div className="font-medium">
                                {response.status_code} - {response.name}
                              </div>
                            </button>
                          ))}

                          {endpointResponses.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No responses available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedResponse ? (
                    <div className="flex items-center justify-center w-full">
                      <Card className="p-4 shadow-none rounded-none border-none w-[85%]">
                        <div className="flex justify-between items-center">
                          <div></div>
                          {/* Tất cả nút nằm bên phải */}
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Button
                                variant="outline"
                                size="icon"
                                style={{ backgroundColor: "#FBEB6B" }} // ✅ CẬP NHẬT: Sử dụng màu #FBEB6B
                                className="border-[#E5E5E1] hover:opacity-80" // ✅ CẬP NHẬT: Thay đổi hover
                                onClick={handleSaveResponse}
                                onMouseEnter={() => setSaveTooltipVisible(true)}
                                onMouseLeave={() =>
                                  setSaveTooltipVisible(false)
                                }
                              >
                                <SaveIcon className="h-5 w-5 text-[#898883]" />
                              </Button>
                              <Tooltip
                                visible={saveTooltipVisible}
                                className="bottom-full left-1/2 transform -translate-x-1/2 mb-2"
                              >
                                Save button
                              </Tooltip>
                            </div>

                            {/* Nút Default - ẩn khi stateful */}
                            {!isStateful && (
                              <div className="relative">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  style={{ backgroundColor: "#FBEB6B" }} // ✅ CẬP NHẬT: Sử dụng màu #FBEB6B
                                  className="border-[#E5E5E1] hover:opacity-80" // ✅ CẬP NHẬT: Thay đổi hover
                                  onClick={() => {
                                    if (selectedResponse) {
                                      setDefaultResponse(selectedResponse.id);
                                    }
                                  }}
                                  onMouseEnter={() =>
                                    setStarTooltipVisible(true)
                                  }
                                  onMouseLeave={() =>
                                    setStarTooltipVisible(false)
                                  }
                                >
                                  <Star
                                    className={`h-4 w-4 ${
                                      selectedResponse?.is_default
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-[#898883]"
                                    }`}
                                  />
                                </Button>
                                <Tooltip
                                  visible={starTooltipVisible}
                                  className="bottom-full left-1/2 transform -translate-x-1/2 mb-2"
                                >
                                  Set Default
                                </Tooltip>
                              </div>
                            )}

                            {/* Nút Popover - di chuyển từ trong editor ra đây */}
                            <div className="relative">
                              <Button
                                variant="outline"
                                size="icon"
                                style={{ backgroundColor: "#FBEB6B" }} // ✅ CẬP NHẬT: Sử dụng màu #FBEB6B
                                className="h-9 w-9 border-[#E5E5E1] hover:opacity-80" // ✅ CẬP NHẬT: Thay đổi hover
                                onClick={() => {
                                  const canEdit =
                                    !isStateful ||
                                    statusCode !== "200" ||
                                    method !== "GET";
                                  if (canEdit) {
                                    setIsPopoverOpen(!isPopoverOpen);
                                  }
                                }}
                                disabled={
                                  isStateful &&
                                  statusCode === "200" &&
                                  method === "GET"
                                }
                                title="Variable Picker"
                              >
                                <FileCode className="h-5 w-5 text-[#898883]" />
                              </Button>

                              {/* Popover */}
                              {isPopoverOpen && (
                                <div
                                  ref={popoverRef}
                                  className="absolute z-50 top-0 right-full mr-2 w-[392px] h-[120px] rounded-lg shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
                                >
                                  <div className="flex flex-col items-center gap-2 p-3.5">
                                    <div className="w-full flex justify-between items-center">
                                      <div className="font-semibold text-sm">
                                        Variable Picker
                                      </div>
                                      <X
                                        className="w-4 h-4 opacity-60 cursor-pointer hover:opacity-80"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsPopoverOpen(false);
                                        }}
                                      />
                                    </div>

                                    <div className="w-full flex justify-between">
                                      {["url", "query", "state"].map(
                                        (section) => (
                                          <div
                                            key={section}
                                            className={`px-1 py-0.5 rounded-md text-xs font-semibold cursor-pointer ${
                                              selectedSection === section
                                                ? "bg-[#EDEDEC] text-[#374151]"
                                                : "text-[#374151] hover:bg-gray-100"
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedSection(section);
                                            }}
                                          >
                                            {section === "url"
                                              ? "URL Parameters"
                                              : section === "query"
                                              ? "Query Parameters"
                                              : "Project State"}
                                          </div>
                                        )
                                      )}
                                    </div>

                                    <div
                                      className="w-full bg-[#EDEDEC] p-1 rounded-md mt-2 cursor-pointer hover:bg-[#D1D5DB] transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const templateText =
                                          getTemplateText().template;
                                        insertTemplate(templateText);
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
                          </div>
                        </div>

                        {/* Form nội dung */}
                        <div className="w-full">
                          {/* Name */}
                          <div className="grid grid-cols-6 items-center gap-4 my-2">
                            <Label
                              htmlFor="response-name"
                              className="text-sm font-medium"
                            >
                              Name
                            </Label>
                            <Input
                              id="response-name"
                              value={responseName}
                              onChange={(e) => setResponseName(e.target.value)}
                              className="col-span-5 rounded-md"
                              placeholder="Enter response name"
                            />
                          </div>

                          {/* Status Code */}
                          <div className="grid grid-cols-6 items-center gap-4 my-2">
                            <Label
                              htmlFor="status-code"
                              className="text-sm font-medium"
                            >
                              Code
                            </Label>
                            <div className="col-span-5">
                              <Select
                                value={statusCode}
                                onValueChange={(value) =>
                                  !isStateful && setStatusCode(value)
                                }
                                disabled={isStateful}
                              >
                                <SelectTrigger
                                  id="status-code"
                                  className={`rounded-md ${
                                    isStateful
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <SelectValue placeholder="Select status code" />
                                </SelectTrigger>
                                <SelectContent className="max-h-80 overflow-y-auto border rounded-md">
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

                          {/* Response Header */}
                          <div className="grid grid-cols-6 items-center gap-4 my-2">
                            <div className="text-sm font-medium py-2">
                              Header
                            </div>
                            <div className="col-span-1 px-2 pl-2 text-sm">
                              Content-Type
                            </div>
                            <div className="col-span-4 border rounded-md p-2">
                              application/json
                            </div>
                          </div>

                          {/* Body */}
                          <div className="grid grid-cols-6 gap-4 my-2">
                            <Label
                              htmlFor="response-body"
                              className="pt-2 text-sm font-medium"
                            >
                              Body
                            </Label>
                          </div>

                          {/* Response */}
                          <div className="grid grid-cols-6 gap-4 my-2">
                            <div className="col-span-6">
                              <div className="relative" ref={responseEditorRef}>
                                <Editor
                                  value={responseBody}
                                  onValueChange={(code) => {
                                    const canEdit =
                                      !isStateful ||
                                      statusCode !== "200" ||
                                      method !== "GET";
                                    if (canEdit) {
                                      setResponseBody(code);
                                    }
                                  }}
                                  highlight={(code) =>
                                    highlight(code, languages.json)
                                  }
                                  padding={10}
                                  className="custom-json-editor"
                                  style={{
                                    fontFamily:
                                      '"Consolas", "Menlo", "Cascadia Code", monospace',
                                    fontSize: 12,
                                    minHeight: "200px",
                                    maxHeight: "400px",
                                    overflow: "auto",
                                    border: "1px solid var(--border)",
                                    borderRadius: "0.375rem",
                                    backgroundColor: "#101728",
                                  }}
                                  textareaClassName="focus:outline-none"
                                  disabled={
                                    isStateful &&
                                    statusCode === "200" &&
                                    method === "GET"
                                  }
                                />

                                {/* Format button */}
                                <div className="absolute top-2 right-2 flex space-x-2 z-10">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-1 rounded-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const canEdit =
                                        !isStateful ||
                                        statusCode !== "200" ||
                                        method !== "GET";
                                      if (canEdit) {
                                        try {
                                          const formatted = JSON.stringify(
                                            JSON.parse(responseBody),
                                            null,
                                            2
                                          );
                                          setResponseBody(formatted);
                                        } catch {
                                          toast.error("Invalid JSON format");
                                        }
                                      }
                                    }}
                                  >
                                    <Code className="h-4 w-4" /> Format
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Delay */}
                          <div className="grid grid-cols-6 items-center gap-4 my-2">
                            <Label
                              htmlFor="delay"
                              className="text-sm font-medium"
                            >
                              Delay (ms)
                            </Label>
                            <div className="col-span-5">
                              <Input
                                id="delay"
                                value={delay}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^\d*$/.test(value) || value === "") {
                                    setDelay(value);
                                    const error = validateDelay(value);
                                    setDelayError(error);
                                  }
                                }}
                                className={`rounded-md ${
                                  delayError ? "border-red-500" : ""
                                }`}
                                placeholder="0"
                              />
                              {delayError && (
                                <div className="text-red-500 text-xs mt-1 pl-2">
                                  {delayError}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px]">
                      <img
                        src={no_response}
                        alt="No response selected"
                        className="mb-4"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Khung bao xám cho tab bar */}
              <div className="card flex flex-col border-2 rounded-lg">
                {/* Tab bar header */}
                <div className="flex rounded-t-lg mb-0">
                  {!isStateful ? (
                    <div className="flex justify-between items-center rounded-t-md w-full">
                      <div className="flex items-center">
                        {renderTabButton("Rules", "Rules", Rules_icon)}
                        {renderTabButton("proxy", "Proxy", Proxy_icon)}
                        {renderTabButton(
                          "wsConfig",
                          "WS Configuration",
                          ws_config_icon
                        )}
                      </div>

                      {/* Dropdown chọn response - Tab bar (chỉ hiển thị khi stateless) */}
                      <div className="relative right-4" ref={tabBarDropdownRef}>
                        <button
                          onClick={() =>
                            setIsTabBarDropdownOpen(!isTabBarDropdownOpen)
                          }
                          className="flex items-center gap-1 px-2 py-1 text-xs opacity-70 hover:opacity-100 rounded transition-colors"
                        >
                          <span className="truncate max-w-[150px]">
                            {selectedResponse
                              ? `${selectedResponse.status_code}-${selectedResponse.name}`
                              : "Select Response"}
                          </span>
                          <ChevronDown className="h-3 w-3 flex-shrink-0" />
                        </button>

                        {isTabBarDropdownOpen && (
                          <div className="absolute z-50 right-0 mt-1 w-64 border rounded-md shadow-lg max-h-32 overflow-y-auto">
                            {endpointResponses.map((response) => (
                              <button
                                key={response.id}
                                className={`select-response w-full text-left px-3 py-2 text-sm focus:outline-none ${
                                  selectedResponse?.id === response.id
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() => {
                                  handleResponseSelect(response);
                                  setIsTabBarDropdownOpen(false);
                                }}
                              >
                                {/* Chỉ hiển thị 1 dòng với định dạng StatusCode-Name */}
                                <div className="font-medium">
                                  {response.status_code} - {response.name}
                                </div>
                              </button>
                            ))}

                            {endpointResponses.length === 0 && (
                              <div className="px-3 py-2 text-sm opacity-50">
                                No responses available
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {renderTabButton(
                        "dataDefault",
                        "Data Default",
                        Data_default
                      )}
                      {method !== "DELETE" &&
                        renderTabButton(
                          "schemaBody",
                          method === "GET" ? "Response Body" : "Request Body",
                          Request_Response_icon
                        )}
                      {renderTabButton("advanced", "Advanced", Advanced_icon)}
                      {renderTabButton(
                        "wsConfig",
                        "WS Configuration",
                        ws_config_icon
                      )}
                    </div>
                  )}
                </div>

                {/* Nội dung tab */}
                <div className="w-full">
                  {/* Rules */}
                  {!isStateful && activeTab === "Rules" && (
                    <div className="flex justify-center items-center w-full ">
                      {selectedResponse ? (
                        <div className="flex flex-col items-center w-[85%] ">
                          <Frame
                            responseName={selectedResponse?.name}
                            selectedResponse={selectedResponse}
                            onUpdateRules={setResponseCondition}
                            onSave={handleSaveResponse}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[400px]">
                          <img
                            src={no_response}
                            alt="No response selected"
                            className="mb-4"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Proxy */}
                  {!isStateful && activeTab === "proxy" && (
                    <div className="flex justify-center items-center w-full">
                      {selectedResponse ? (
                        <Card className="p-6 border-0 rounded-none shadow-none w-[85%]">
                          <div className="flex justify-between items-center mb-2">
                            <h2 className="text-md">
                              Forward Proxy URL
                            </h2>
                            <div className="relative">
                              <Button
                                variant="outline"
                                size="icon"
                                // style={{ backgroundColor: "#FBEB6B" }} // ✅ CẬP NHẬT: Sử dụng màu #FBEB6B
                                className="btn-primary hover:opacity-80" // ✅ CẬP NHẬT: Thay đổi hover
                                onClick={handleSaveResponse}
                                onMouseEnter={() => setSaveTooltipVisible(true)}
                                onMouseLeave={() =>
                                  setSaveTooltipVisible(false)
                                }
                              >
                                <SaveIcon className="h-5 w-5 opacity-70" />
                              </Button>
                              <Tooltip
                                visible={saveTooltipVisible}
                                className="bottom-full left-1/2 transform -translate-x-1/2 mb-2"
                              >
                                Save button
                              </Tooltip>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-col items-start gap-[10px] w-full max-w-[790px]">
                              <div className="flex flex-col gap-[8px] w-full">
                                <Input
                                  id="proxy-url"
                                  name="proxy-url"
                                  placeholder="Enter proxy URL (e.g. https://api.example.com/{{params.id}}))"
                                  value={proxyUrl}
                                  onChange={(e) => setProxyUrl(e.target.value)}
                                  className="flex-1 py-2 rounded-md "
                                />
                              </div>
                              <div className="flex flex-col gap-[8px] w-full">
                                <span className="text-md">
                                  Method
                                </span>
                                <Select
                                  value={proxyMethod}
                                  onValueChange={setProxyMethod}
                                >
                                  <SelectTrigger className="w-[120px] h-[36px] rounded-md">
                                    <SelectValue placeholder="Method" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">
                                      DELETE
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[400px]">
                          <img
                            src={no_response}
                            alt="No response selected"
                            className="mb-4"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Schema Body */}
                  {isStateful &&
                    activeTab === "schemaBody" &&
                    method !== "DELETE" && (
                      <div className="mt-0">
                        <SchemaBodyEditor
                          endpointData={endpointDefinition}
                          endpointId={currentEndpointId}
                          onSave={handleSaveSchema}
                          method={method}
                        />
                      </div>
                    )}

                  {/* Data Default */}
                  {isStateful && activeTab === "dataDefault" && (
                    <div className="flex flex-col items-center justify-center w-full">
                      <Card className="p-6 border-0 rounded-none shadow-none w-[80%]">
                        <div className="space-y-6">
                          {/* Đưa Current Value lên trên */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-xl font-medium self-start pt-1 mb-1">
                              Current Value
                            </div>

                            {/* Nút Save và Popover nằm cạnh nhau */}
                            <div className="flex items-center gap-2">
                              {/* Nút Popover */}
                              <div
                                className="relative"
                                ref={initialValuePopoverRef}
                              >
                                <Button
                                  variant="outline"
                                  size="icon"
                                  // style={{ backgroundColor: "#FBEB6B" }} // ✅ CẬP NHẬT: Sử dụng màu #FBEB6B
                                  className="h-9 w-9 btn-primary hover:opacity-80" // ✅ CẬP NHẬT: Thay đổi hover
                                  onClick={() =>
                                    setIsInitialValuePopoverOpen(
                                      !isInitialValuePopoverOpen
                                    )
                                  }
                                  title="Variable Picker"
                                >
                                  <FileCode className="h-5 w-5 opacity-70" />
                                </Button>

                                {/* Popover cho Initial Value */}
                                {isInitialValuePopoverOpen && (
                                  <div className="absolute z-50 top-0 right-full mr-2 w-[392px] h-[120px] rounded-lg shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
                                    <div className="flex flex-col items-center gap-2 p-3.5">
                                      <div className="w-full flex justify-between items-center">
                                        <div className="font-semibold text-sm">
                                          Variable Picker
                                        </div>
                                        <X
                                          className="w-4 h-4 opacity-40 cursor-pointer hover:opacity-80"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIsInitialValuePopoverOpen(false);
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
                                          // Đảm bảo sử dụng selectedSection hiện tại
                                          const templateText =
                                            getTemplateText().template;
                                          insertInitialValueTemplate(
                                            templateText
                                          );
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

                              {/* Nút Save */}
                              <div className="relative">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  // style={{ backgroundColor: "#FBEB6B" }} // ✅ CẬP NHẬT: Sử dụng màu #FBEB6B
                                  className="btn-primary hover:opacity-80" // ✅ CẬP NHẬT: Thay đổi hover
                                  onClick={handleSaveInitialValue}
                                  onMouseEnter={() =>
                                    setSaveTooltipVisible(true)
                                  }
                                  onMouseLeave={() =>
                                    setSaveTooltipVisible(false)
                                  }
                                >
                                  <SaveIcon className="h-5 w-5" />
                                </Button>
                                <Tooltip
                                  visible={saveTooltipVisible}
                                  className="bottom-full left-1/2 transform -translate-x-1/2 mb-2"
                                >
                                  Save button
                                </Tooltip>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 items-start gap-1">
                            <div className="col-span-3 space-y-2">
                              <div className="relative">
                                {/* JSON Viewer (read-only, có highlight + format) */}
                                <div
                                  className="custom-initial-value font-mono text-sm h-60 border border-[#CBD5E1] rounded-md p-2 bg-[#F2F2F2] overflow-auto text-white"
                                  dangerouslySetInnerHTML={{
                                    __html: (() => {
                                      try {
                                        const formatted =
                                          endpointData?.data_current &&
                                          Object.keys(endpointData.data_current)
                                            .length > 0
                                            ? JSON.stringify(
                                                endpointData.data_current,
                                                null,
                                                2
                                              )
                                            : "[]";

                                        // Prism highlight có format giữ nguyên
                                        const highlighted = highlight(
                                          formatted,
                                          languages.json,
                                          "json"
                                        );
                                        return `<pre style="margin:0; white-space:pre;">${highlighted}</pre>`;
                                      } catch (err) {
                                        console.error(
                                          "JSON format error:",
                                          err
                                        );
                                        return "<pre style='color:red'>Invalid JSON</pre>";
                                      }
                                    })(),
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          {/* Đưa Initial Value xuống dưới */}
                          <div className="flex justify-between items-center mb-1">
                            <h2 className="text-xl font-medium text-[#37352F]">
                              Initial Value
                            </h2>
                          </div>
                          <div className="grid grid-cols-1 items-start gap-1">
                            <div className="col-span-3 space-y-2">
                              <div className="relative">
                                <div
                                  className="relative w-full"
                                  ref={initialValueEditorRef}
                                >
                                  <Editor
                                    className="custom-json-editor"
                                    value={tempDataDefaultString}
                                    onValueChange={(code) => {
                                      setTempDataDefaultString(code);
                                      try {
                                        // Chỉ cập nhật state khi JSON hợp lệ
                                        setTempDataDefault(JSON.parse(code));
                                      } catch {
                                        // Giữ nguyên state cũ nếu JSON không hợp lệ
                                      }
                                    }}
                                    highlight={(code) =>
                                      highlight(code, languages.json)
                                    }
                                    padding={10}
                                    style={{
                                      fontFamily:
                                        '"Fira code", "Fira Mono", monospace',
                                      fontSize: 14,
                                      minHeight: "200px",
                                      maxHeight: "400px",
                                      overflow: "auto",
                                      border: "1px solid #CBD5E1",
                                      borderRadius: "0.375rem",
                                      backgroundColor: "#101728",
                                      color: "white",
                                      width: "100%",
                                      boxSizing: "border-box",
                                      wordBreak: "break-word",
                                      whiteSpace: "pre-wrap",
                                      overflowWrap: "break-word",
                                    }}
                                    textareaClassName="focus:outline-none w-full"
                                  />

                                  {/* JSON Editor controls */}
                                  <div className="absolute top-2 right-2 flex space-x-2 z-10">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-[#E5E5E1] w-[77px] h-[29px] rounded-[6px]"
                                      onClick={() => {
                                        try {
                                          const formatted = JSON.stringify(
                                            JSON.parse(tempDataDefaultString),
                                            null,
                                            2
                                          );
                                          setTempDataDefaultString(formatted);
                                          setTempDataDefault(
                                            JSON.parse(formatted)
                                          );
                                        } catch {
                                          toast.error("Invalid JSON format");
                                        }
                                      }}
                                    >
                                      <Code className="mr-1 h-4 w-4" /> Format
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Advanced */}
                  {isStateful && activeTab === "advanced" && (
                    <div className="mt-0">
                      <ApiCallEditor
                        endpointId={currentEndpointId}
                        currentEndpoint={currentEndpoint}
                        getFullPath={getFullPath}
                        nextCalls={nextCalls}
                        setNextCalls={setNextCalls}
                        isRequestBodyPopoverOpen={isRequestBodyPopoverOpen}
                        setIsRequestBodyPopoverOpen={
                          setIsRequestBodyPopoverOpen
                        }
                        selectedSection={selectedSection}
                        setSelectedSection={setSelectedSection}
                        getTemplateText={getTemplateText}
                        insertRequestBodyTemplate={insertRequestBodyTemplate}
                        setIsNewApiCallDialogOpen={setIsNewApiCallDialogOpen}
                        onSave={() => fetchEndpointResponses(isStateful)}
                        availableEndpoints={newApiCallAvailableEndpoints}
                        availableStatusCodes={newApiCallAvailableStatusCodes} // ✅ Debug: Kiểm tra prop này
                      />
                    </div>
                  )}

                  {activeTab === "wsConfig" && (
                    <div className="mt-0">
                      <WSConfig
                        config={config}
                        endpointId={currentEndpointId}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Dialog New API Call */}
            <Dialog
              open={isNewApiCallDialogOpen}
              onOpenChange={setIsNewApiCallDialogOpen}
            >
              <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-lg rounded-lg max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-slate-800">
                    New API Call
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Target Endpoint - ĐỞN GIẢN HÓA */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="target-endpoint">Target Endpoint</Label>
                    </div>

                    {/* Input field với dropdown gợi ý */}
                    <div className="relative">
                      <Input
                        id="target-endpoint"
                        value={(() => {
                          // ✅ CẬP NHẬT: Hiển thị full path /workspace/project/path hoặc external URL
                          const selectedEndpoint =
                            newApiCallAvailableEndpoints.find(
                              (ep) => ep.id === newApiCallTargetEndpointId
                            );

                          if (selectedEndpoint) {
                            return formatFullPath(selectedEndpoint);
                          } else if (newApiCallTargetEndpointDisplay) {
                            return newApiCallTargetEndpointDisplay;
                          } else {
                            return "";
                          }
                        })()}
                        onChange={(e) => {
                          const newValue = e.target.value;

                          setNewApiCallTargetEndpointDisplay(newValue);

                          // Reset ID khi user tự nhập
                          setNewApiCallTargetEndpointId(null);

                          // Kiểm tra nếu nhập external URL (có protocol)
                          if (
                            newValue &&
                            (newValue.startsWith("http://") ||
                              newValue.startsWith("https://"))
                          ) {
                            // External URL - không cần tìm kiếm trong available endpoints
                            setIsTargetEndpointSuggestionsOpen(false);
                            return;
                          }

                          // ✅ CẬP NHẬT: Tìm endpoint match với full path user nhập
                          if (newValue) {
                            const matchingEndpoint =
                              newApiCallAvailableEndpoints.find((ep) => {
                                return formatFullPath(ep) === newValue;
                              });

                            if (matchingEndpoint) {
                              // Nếu tìm thấy match, lưu ID
                              setNewApiCallTargetEndpointId(
                                matchingEndpoint.id
                              );
                            }
                            // Mở dropdown khi user nhập
                            setIsTargetEndpointSuggestionsOpen(true);
                          }
                        }}
                        onFocus={() => {
                          // Mở dropdown khi focus vào input (nếu có data và không phải external URL)
                          const currentValue = (() => {
                            const selectedEndpoint =
                              newApiCallAvailableEndpoints.find(
                                (ep) => ep.id === newApiCallTargetEndpointId
                              );
                            if (selectedEndpoint) {
                              return formatFullPath(selectedEndpoint);
                            } else if (newApiCallTargetEndpointDisplay) {
                              return newApiCallTargetEndpointDisplay;
                            } else {
                              return "";
                            }
                          })();

                          if (
                            getFilteredEndpoints().length > 0 &&
                            currentValue &&
                            !currentValue.startsWith("http://") &&
                            !currentValue.startsWith("https://")
                          ) {
                            setIsTargetEndpointSuggestionsOpen(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay đóng để có thể click vào suggestion
                          setTimeout(() => {
                            setIsTargetEndpointSuggestionsOpen(false);
                          }, 200);
                        }}
                        placeholder="Enter endpoint path (e.g., /workspace/project/path or https://domain.com/path)"
                        className={`w-full max-w-[400px] ${
                          newApiCallValidationErrors.targetEndpoint
                            ? "border-red-500"
                            : ""
                        }`}
                      />

                      {/* Dropdown gợi ý - CHỈ HIỂN THỊ KHI INPUT ĐANG FOCUS */}
                      {isTargetEndpointSuggestionsOpen &&
                        getFilteredEndpoints().length > 0 && (
                          <div className="absolute z-50 mt-1 w-full max-w-[400px] bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {getFilteredEndpoints()
                              .filter((endpoint) => {
                                // Lọc gợi ý dựa trên input
                                const inputDisplayValue = (() => {
                                  const selectedEndpoint =
                                    newApiCallAvailableEndpoints.find(
                                      (ep) =>
                                        ep.id === newApiCallTargetEndpointId
                                    );

                                  if (selectedEndpoint) {
                                    return formatFullPath(selectedEndpoint);
                                  } else if (newApiCallTargetEndpointDisplay) {
                                    return newApiCallTargetEndpointDisplay;
                                  } else {
                                    return "";
                                  }
                                })();

                                return (
                                  formatFullPath(endpoint)
                                    .toLowerCase()
                                    .includes(
                                      inputDisplayValue.toLowerCase()
                                    ) || inputDisplayValue === ""
                                );
                              })
                              .slice(0, 10) // Giới hạn 10 gợi ý
                              .map((endpoint) => (
                                <button
                                  key={endpoint.id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                                  onClick={() => {
                                    const fullPath = formatFullPath(endpoint);

                                    // ✅ ĐIỀN full path vào input thay vì chỉ path
                                    setNewApiCallTargetEndpointDisplay(
                                      fullPath
                                    );
                                    // Lưu ID để tạo full path
                                    setNewApiCallTargetEndpointId(endpoint.id);
                                    // Đóng dropdown
                                    setIsTargetEndpointSuggestionsOpen(false);
                                  }}
                                  onMouseDown={(e) => {
                                    // Ngăn input mất focus trước khi click
                                    e.preventDefault();
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium text-sm">
                                      {formatFullPath(endpoint)}{" "}
                                      {/* ✅ HIỂN THỊ full path */}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {endpoint.workspaceName} /{" "}
                                      {endpoint.projectName}
                                    </span>
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}

                      {newApiCallValidationErrors.targetEndpoint && (
                        <div className="text-red-400 text-xs mt-1 pl-2">
                          {newApiCallValidationErrors.targetEndpoint}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Method */}
                  <div>
                    <Label htmlFor="method">Method</Label>
                    <div className="relative mt-1">
                      <Select
                        value={newApiCallMethod}
                        onValueChange={setNewApiCallMethod}
                      >
                        <SelectTrigger
                          className={`h-[36px] border-[#CBD5E1] rounded-md pl-3 pr-1 w-full max-w-[450px] ${
                            newApiCallValidationErrors.method
                              ? "border-red-500"
                              : ""
                          }`}
                        >
                          <SelectValue
                            placeholder="Select method"
                            className="truncate"
                          />
                        </SelectTrigger>
                        <SelectContent className="w-[450px]">
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Hiển thị lỗi validation */}
                      {newApiCallValidationErrors.method && (
                        <div className="text-red-400 text-xs mt-1 pl-2">
                          {newApiCallValidationErrors.method}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Request Body */}
                  <div>
                    <Label htmlFor="request-body">Request Body</Label>
                    <div
                      className="relative mt-1"
                      ref={newApiCallRequestBodyEditorRef}
                    >
                      <Editor
                        value={newApiCallRequestBody}
                        onValueChange={(code) => setNewApiCallRequestBody(code)}
                        highlight={(code) => highlight(code, languages.json)}
                        padding={10}
                        className="custom-json-editor"
                        style={{
                          fontFamily: '"Fira code", "Fira Mono", monospace',
                          fontSize: 12,
                          minHeight: "124px",
                          maxHeight: "200px",
                          overflowX: "auto",
                          overflowY: "auto",
                          border: newApiCallValidationErrors.requestBody
                            ? "1px solid #ef4444"
                            : "1px solid #CBD5E1",
                          borderRadius: "0.375rem",
                          backgroundColor: "#101728",
                          width: "100%",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                          whiteSpace: "pre", // Giữ nguyên format, không wrap
                          wordBreak: "normal", // Không break word
                        }}
                        textareaClassName="focus:outline-none w-full"
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
                                JSON.parse(newApiCallRequestBody),
                                null,
                                2
                              );
                              setNewApiCallRequestBody(formatted);
                            } catch {
                              toast.error("Invalid JSON format");
                            }
                          }}
                        >
                          <Code className="mr-1 h-4 w-4" /> Format
                        </Button>
                      </div>

                      {/* Bottom right icon */}
                      <div className="absolute bottom-2 right-2 flex space-x-2">
                        <FileCode
                          className="text-gray-400 cursor-pointer hover:text-gray-600"
                          size={20}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsNewApiCallRequestBodyPopoverOpen(
                              !isNewApiCallRequestBodyPopoverOpen
                            );
                          }}
                        />
                      </div>

                      {/* Hiển thị lỗi validation cho JSON */}
                      {newApiCallValidationErrors.requestBody && (
                        <div className="text-red-400 text-xs mt-1 pl-2">
                          {newApiCallValidationErrors.requestBody}
                        </div>
                      )}

                      {/* Popover cho Request Body */}
                      {isNewApiCallRequestBodyPopoverOpen && (
                        <div
                          ref={newApiCallRequestBodyPopoverRef}
                          className="absolute z-50 bottom-2 right-0 w-[392px] h-[120px] bg-white rounded-lg shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
                        >
                          <div className="flex flex-col items-center gap-2 p-3.5">
                            <div className="w-full flex justify-between items-center">
                              <div className="font-semibold text-sm text-gray-800">
                                Variable Picker
                              </div>
                              <X
                                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsNewApiCallRequestBodyPopoverOpen(false);
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
                                insertNewApiCallRequestBodyTemplate(
                                  templateText
                                );
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
                  </div>

                  {/* Status condition */}
                  <div>
                    <Label htmlFor="status-condition">Status condition</Label>
                    <div className="relative mt-1">
                      <Select
                        value={newApiCallStatusCondition}
                        onValueChange={setNewApiCallStatusCondition}
                      >
                        <SelectTrigger
                          className={`h-[36px] border-[#CBD5E1] rounded-md pl-3 pr-1 w-full max-w-[450px] ${
                            newApiCallValidationErrors.statusCondition
                              ? "border-red-500"
                              : ""
                          }`}
                        >
                          <SelectValue
                            placeholder="Select condition"
                            className="truncate"
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto w-[450px]">
                          {/* ✅ CẬP NHẬT: Sử dụng logic mới */}
                          {getNewApiCallStatusConditionOptions()
                            .sort((a, b) => parseInt(a.code) - parseInt(b.code))
                            .map((status) => (
                              <SelectItem key={status.code} value={status.code}>
                                {status.code} -{" "}
                                {status.description.split("–")[0]}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {/* Hiển thị lỗi validation cho status condition */}
                      {newApiCallValidationErrors.statusCondition && (
                        <div className="text-red-400 text-xs mt-1 pl-2">
                          {newApiCallValidationErrors.statusCondition}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsNewApiCallDialogOpen(false);
                      // Reset form khi đóng dialog
                      setNewApiCallTargetEndpointDisplay("");
                      setNewApiCallTargetEndpointId("");
                      setNewApiCallMethod("GET");
                      setNewApiCallRequestBody("{}");
                      setNewApiCallStatusCondition("");
                      setNewApiCallValidationErrors({});
                      setIsTargetEndpointSuggestionsOpen(false); // ✅ Reset dropdown state
                    }}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 w-[80px] h-[40px] rounded-[8px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950 w-[90px] h-[40px] rounded-[8px]"
                    onClick={handleCreateNewApiCall}
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* footer */}
        <footer className="mt-auto w-full flex justify-between items-center px-8 py-4 text-xs font-semibold">
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
      </div>

      {/* Dialog xác nhận chuyển sang stateful */}
      <Dialog
        open={showStatefulConfirmDialog}
        onOpenChange={setShowStatefulConfirmDialog}
      >
        <DialogContent className="bg-white text-slate-800 max-w-[512px] p-8 rounded-2xl shadow-lg">
          <DialogHeader className="flex justify-between items-start mb-4">
            <DialogTitle className="text-xl font-bold text-slate-800">
              Switch to Stateful Mode
            </DialogTitle>
          </DialogHeader>

          <div className="mb-6">
            <p className="text-gray-700">
              This endpoint will start storing and modifying data instead of
              returning static responses. Are you sure you want to switch to
              stateful mode?
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowStatefulConfirmDialog(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#FA2F2F] hover:bg-[#E02929] text-white"
              onClick={handleConfirmStateful}
            >
              Switch
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
              folderId={currentFolder?.id}
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

      {/* Dialog xác nhận chuyển sang stateless */}
      <Dialog
        open={showStatelessConfirmDialog}
        onOpenChange={setShowStatelessConfirmDialog}
      >
        <DialogContent className="bg-white text-slate-800 max-w-[512px] p-8 rounded-2xl shadow-lg">
          <DialogHeader className="flex justify-between items-start mb-4">
            <DialogTitle className="text-xl font-bold text-slate-800">
              Switch to Stateless Mode
            </DialogTitle>
          </DialogHeader>

          <div className="mb-6">
            <p className="text-gray-700">
              Switching to stateless mode will remove persisted state. All
              requests will respond with predefined static data only. Continue?
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowStatelessConfirmDialog(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#FA2F2F] hover:bg-[#E02929] text-white"
              onClick={handleConfirmStateless}
            >
              Switch
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Create New Response</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="new-response-name">Response Name</Label>
              <Input
                id="new-response-name"
                placeholder="Enter response name"
                value={responseName}
                onChange={(e) => {
                  setResponseName(e.target.value);
                  if (responseNameError) setResponseNameError("");
                }}
                className={`w-full ${
                  responseNameError ? "border-red-500" : ""
                }`}
              />
              {responseNameError && (
                <p className="text-red-500 text-sm mt-1">{responseNameError}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="new-status-code"
                className="text-right text-sm font-medium text-[#000000]"
              >
                Status Code
              </Label>
              <div className="col-span-5">
                <Select value={statusCode} onValueChange={setStatusCode}>
                  <SelectTrigger
                    id="new-status-code"
                    className="border-[#CBD5E1] rounded-md"
                  >
                    <SelectValue placeholder="Select status code" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-y-auto border border-[#CBD5E1] rounded-md">
                    {statusCodes.map((status) => (
                      <SelectItem key={status.code} value={status.code}>
                        {status.code} - {status.description.split("–")[0]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="font-medium text-sm text-[#000000]">Header</div>
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
              <div className="relative">
                <Textarea
                  id="new-response-body"
                  placeholder="Enter response body"
                  value={responseBody}
                  onChange={(e) => setResponseBody(e.target.value)}
                  className="h-32 font-mono pb-16"
                />
                {/* Nhóm nút trên cùng bên phải */}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E5E5E1] w-[77px] h-[29px] rounded-[6px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        const formatted = JSON.stringify(
                          JSON.parse(responseBody || "{}"),
                          null,
                          2
                        );
                        setResponseBody(formatted);
                      } catch {
                        toast.error("Invalid JSON format");
                      }
                    }}
                  >
                    <Code className="mr-1 h-4 w-4" /> Format
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="new-delay">Delay (ms)</Label>
              <div className="relative">
                <Input
                  id="new-delay"
                  placeholder="0"
                  value={delay}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Chỉ cho phép nhập số
                    if (/^\d*$/.test(value) || value === "") {
                      setDelay(value);
                      const error = validateDelay(value);
                      setDelayError(error);
                    }
                  }}
                  className={delayError ? "border-red-500" : ""}
                />
                {delayError && (
                  <div className="text-red-500 text-xs mt-1">{delayError}</div>
                )}
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  // Reset form khi hủy
                  setSelectedResponse(null);
                  setResponseName("");
                  setStatusCode("200");
                  setResponseBody("");
                  setDelay("0");
                  setResponseNameError("");
                  setDelayError("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateResponse}
                className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
              >
                Create
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default DashboardPage;
