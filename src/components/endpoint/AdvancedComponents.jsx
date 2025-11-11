import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { API_ROOT } from "@/utils/constants";
import { Plus, Trash2, Code, FileCode, X, SaveIcon } from "lucide-react";
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
import equalIcon from "@/assets/light/equal.svg";

export const ApiCallEditor = ({
  endpointId,
  nextCalls,
  setNextCalls,
  setIsNewApiCallDialogOpen,
  onSave,
  // Thêm props cho filter
  availableEndpoints = [],
  availableStatusCodes = [],
}) => {
  // Thêm state để lưu trữ JSON string và trạng thái lỗi
  const [jsonStrings, setJsonStrings] = useState({});
  const [jsonErrors, setJsonErrors] = useState({});

  // Thêm state cho popover
  const [isRequestBodyPopoverOpen, setIsRequestBodyPopoverOpen] =
    useState(false);
  const [selectedSection, setSelectedSection] = useState("url");
  const requestBodyPopoverRef = useRef(null);

  // Thêm state để control tooltip visibility trong ApiCallEditor
  const [saveTooltipVisible, setSaveTooltipVisible] = useState(false);
  const [addTooltipVisible, setAddTooltipVisible] = useState(false);
  const [templateTooltipVisible, setTemplateTooltipVisible] = useState(false);

  // ✅ THÊM: State để lưu selected endpoint ID cho mỗi call
  const [selectedEndpointIds, setSelectedEndpointIds] = useState({});

  // ✅ THÊM: State để control dropdown suggestions
  const [isTargetEndpointSuggestionsOpen, setIsTargetEndpointSuggestionsOpen] =
    useState({});

  // ✅ THÊM: State riêng cho Status Condition validation
  const [endpointValidationErrors, setEndpointValidationErrors] = useState({});
  const [statusConditionErrors, setStatusConditionErrors] = useState({});

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

  // ✅ THÊM: Hàm để cập nhật selected endpoint ID cho một call
  const updateSelectedEndpointId = (callIndex, endpointId) => {
    setSelectedEndpointIds((prev) => ({
      ...prev,
      [callIndex]: endpointId,
    }));
  };

  // ✅ THÊM: Hàm để lấy selected endpoint ID của một call
  const getSelectedEndpointId = (callIndex) => {
    return selectedEndpointIds[callIndex] || null;
  };

  // ✅ THÊM: Hàm để lấy selected endpoint object của một call
  const getSelectedEndpoint = (callIndex) => {
    const endpointId = getSelectedEndpointId(callIndex);
    if (!endpointId) return null;

    return availableEndpoints.find((ep) => ep.id === endpointId) || null;
  };

  // ✅ THÊM: Hàm để cập nhật suggestions dropdown state cho một call
  const updateSuggestionsOpen = (callIndex, isOpen) => {
    setIsTargetEndpointSuggestionsOpen((prev) => ({
      ...prev,
      [callIndex]: isOpen,
    }));
  };

  // ✅ THÊM: Hàm để lấy suggestions dropdown state của một call
  const getSuggestionsOpen = (callIndex) => {
    return isTargetEndpointSuggestionsOpen[callIndex] || false;
  };

  // ✅ CẬP NHẬT: Đơn giản hóa getFilteredEndpoints - không cần filter logic
  const getFilteredEndpoints = () => {
    // Hiển thị tất cả available endpoints, không cần filter
    return availableEndpoints.filter(
      (ep) => ep && typeof ep === "object" && ep.path
    );
  };

  // ✅ CẬP NHẬT: Hàm lấy status condition options dựa trên ID
  const getStatusConditionOptions = (callIndex) => {
    const minimumId = getMinimumId(nextCalls);
    const currentCall = nextCalls[callIndex];
    const currentIndex = callIndex;

    // ✅ KIỂM TRA: Có API call nào đã có ID trong nextCalls không
    const hasApiCallsWithIds = nextCalls.some((call) => call.id);

    if (hasApiCallsWithIds) {
      // Nếu đã có API call với ID
      if (currentCall.id === minimumId) {
        // ✅ ID nhỏ nhất → dùng endpoint response
        console.log(
          "API Call Editor - Minimum ID using endpoint response:",
          availableStatusCodes
        );

        if (availableStatusCodes && availableStatusCodes.length > 0) {
          return [...availableStatusCodes].sort(
            (a, b) => parseInt(a.code) - parseInt(b.code)
          );
        }

        // Fallback về quy luật method nếu không có endpoint response
        return getStatusCodesByMethod(currentCall.method);
      } else {
        // ✅ CÁC ID KHÔNG PHẢI NHỎ NHẤT: Dùng method của call liền trước
        const previousCall = nextCalls[currentIndex - 1];

        if (previousCall) {
          console.log(
            "API Call Editor - Non-minimum ID using previous call method:",
            `Call ${currentIndex + 1} uses method ${
              previousCall.method
            } from call ${currentIndex}`
          );
          return getStatusCodesByMethod(previousCall.method);
        } else {
          // Fallback về method của chính nó nếu không có previous call
          console.log(
            "API Call Editor - No previous call, using own method:",
            currentCall.method
          );
          return getStatusCodesByMethod(currentCall.method);
        }
      }
    } else {
      // ✅ Chưa có API call nào có ID → tất cả dùng endpoint response
      console.log(
        "API Call Editor - No IDs yet, using endpoint response:",
        availableStatusCodes
      );

      if (availableStatusCodes && availableStatusCodes.length > 0) {
        return [...availableStatusCodes].sort(
          (a, b) => parseInt(a.code) - parseInt(b.code)
        );
      }

      // Fallback về quy luật method nếu không có endpoint response
      return getStatusCodesByMethod(currentCall.method);
    }
  };

  // ✅ CẬP NHẬT: Hàm lấy full target endpoint để xử lý external URLs
  const getFullTargetEndpoint = (callIndex) => {
    const selectedEndpoint = getSelectedEndpoint(callIndex);

    if (selectedEndpoint) {
      return formatFullPath(selectedEndpoint);
    }

    // ✅ FALLBACK: Nếu không có endpoint được chọn, dùng target_endpoint hiện tại
    const call = nextCalls[callIndex];
    if (call?.target_endpoint) {
      return call.target_endpoint;
    }

    return "";
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
    // ✅ KIỂM TRA: API call có ID nhỏ nhất trước khi xóa không
    const callToRemove = nextCalls[index];
    const minimumId = getMinimumId(nextCalls);
    const isRemovingMinimumId =
      callToRemove.id && callToRemove.id === minimumId;

    // Lưu thông tin để xử lý sau khi xóa
    let newMinimumId = null;
    let newMinimumIdCallIndex = null;

    if (isRemovingMinimumId) {
      // Tạo danh sách IDs còn lại sau khi xóa
      const remainingCalls = nextCalls.filter((_, i) => i !== index);
      const remainingIds = remainingCalls
        .filter((call) => call.id && typeof call.id === "number")
        .map((call) => call.id);

      if (remainingIds.length > 0) {
        newMinimumId = Math.min(...remainingIds);
        // Tìm index của call có ID nhỏ nhất mới
        newMinimumIdCallIndex = remainingCalls.findIndex(
          (call) => call.id === newMinimumId
        );
        if (newMinimumIdCallIndex !== -1) {
          newMinimumIdCallIndex =
            newMinimumIdCallIndex < index
              ? newMinimumIdCallIndex
              : newMinimumIdCallIndex;
        }
      }
    }

    // ✅ THÊM MỚI: Reset status condition của call tiếp theo nếu xóa call giữa chừng
    const hasCallAfter = index + 1 < nextCalls.length;
    let callAfterMethodChanged = null;

    if (hasCallAfter) {
      // Lưu thông tin method cũ của call sau để so sánh
      const callAfter = nextCalls[index + 1];
      const previousCall = index > 0 ? nextCalls[index - 1] : null;

      if (previousCall) {
        // Nếu có previous call, call sau sẽ dùng method của previous call thay vì method của call bị xóa
        if (callAfter.method !== previousCall.method) {
          callAfterMethodChanged = {
            newIndex: index, // Index mới sau khi xóa
            oldMethod: callAfter.method,
            newMethod: previousCall.method,
          };
        }
      }
    }

    // Thực hiện xóa call
    const updatedCalls = [...nextCalls];
    updatedCalls.splice(index, 1);
    setNextCalls(updatedCalls);

    // Xóa JSON string tương ứng
    setJsonStrings((prev) => {
      const newStrings = { ...prev };
      delete newStrings[index];

      // Re-index các keys sau index bị xóa
      const reindexedStrings = {};
      Object.keys(newStrings).forEach((key) => {
        const keyIndex = parseInt(key);
        if (keyIndex > index) {
          reindexedStrings[keyIndex - 1] = newStrings[key];
        } else {
          reindexedStrings[keyIndex] = newStrings[key];
        }
      });
      return reindexedStrings;
    });

    setJsonErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];

      // Re-index các errors sau index bị xóa
      const reindexedErrors = {};
      Object.keys(newErrors).forEach((key) => {
        const keyIndex = parseInt(key);
        if (keyIndex > index) {
          reindexedErrors[keyIndex - 1] = newErrors[key];
        } else {
          reindexedErrors[keyIndex] = newErrors[key];
        }
      });
      return reindexedErrors;
    });

    // ✅ XỬ LÝ: Reset status condition nếu xóa ID nhỏ nhất
    if (
      isRemovingMinimumId &&
      newMinimumId !== null &&
      newMinimumIdCallIndex !== null
    ) {
      // Set status condition về rỗng cho call mới có ID nhỏ nhất
      const finalUpdatedCalls = [...updatedCalls];
      finalUpdatedCalls[newMinimumIdCallIndex] = {
        ...finalUpdatedCalls[newMinimumIdCallIndex],
        condition: "", // Reset về rỗng
      };
      setNextCalls(finalUpdatedCalls);

      // ✅ THÊM: Cập nhật validation errors để hiển thị lỗi cho call mới
      setEndpointValidationErrors((prev) => {
        const newErrors = { ...prev };
        // Xóa lỗi cũ và thêm lỗi mới cho call có ID nhỏ nhất mới
        Object.keys(newErrors).forEach((key) => {
          const keyIndex = parseInt(key);
          if (keyIndex >= index) {
            delete newErrors[keyIndex];
          }
        });
        // Thêm lỗi cho call mới có ID nhỏ nhất
        newErrors[newMinimumIdCallIndex] = "Status condition is required";
        return newErrors;
      });

      // Hiển thị thông báo cho user
      toast.info(
        `API call with ID ${newMinimumId} is now the minimum ID. Please select a new status condition.`,
        { autoClose: 5000 }
      );
    }

    // ✅ XỬ LÝ MỚI: Reset status condition của call sau nếu method chain thay đổi
    if (callAfterMethodChanged) {
      const finalUpdatedCalls = [...updatedCalls];
      finalUpdatedCalls[callAfterMethodChanged.newIndex] = {
        ...finalUpdatedCalls[callAfterMethodChanged.newIndex],
        condition: "", // Reset về rỗng
      };
      setNextCalls(finalUpdatedCalls);

      // Clear validation error cũ và thêm lỗi mới
      setStatusConditionErrors((prev) => {
        const newErrors = { ...prev };
        // Xóa lỗi cũ ở vị trí sau index bị xóa
        Object.keys(newErrors).forEach((key) => {
          const keyIndex = parseInt(key);
          if (keyIndex > index) {
            delete newErrors[keyIndex];
          }
        });
        // Thêm lỗi mới cho call sau
        newErrors[callAfterMethodChanged.newIndex] =
          "Status condition is required";
        return newErrors;
      });

      // Hiển thị thông báo cho user
      toast.info(
        `API Call #${callAfterMethodChanged.newIndex + 1} will now use method ${
          callAfterMethodChanged.newMethod
        } (was ${
          callAfterMethodChanged.oldMethod
        }). Please select a new status condition.`,
        { autoClose: 6000 }
      );
    }
  };

  // ✅ CẬP NHẬT: Reset status condition của call tiếp theo khi method thay đổi
  const handleNextCallChange = (index, field, value) => {
    const updatedCalls = [...nextCalls];
    updatedCalls[index] = {
      ...updatedCalls[index],
      [field]: value,
    };
    setNextCalls(updatedCalls);

    // ✅ Bỏ RESET của chính call đó, CHỈ RESET call tiếp theo
    if (field === "method") {
      // ✅ THÊM MỚI: Reset status condition của call tiếp theo
      if (index + 1 < nextCalls.length) {
        const finalUpdatedCalls = [...updatedCalls];
        finalUpdatedCalls[index + 1] = {
          ...finalUpdatedCalls[index + 1],
          condition: "", // Reset condition về rỗng
        };
        setNextCalls(finalUpdatedCalls);

        // Clear validation error cho call tiếp theo (không clear cho call hiện tại)
        setStatusConditionErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[index + 1]; // Chỉ xóa lỗi của call tiếp theo
          return newErrors;
        });

        // ✅ THÊM: Hiển thị thông báo cho user
        toast.info(
          `Method changed for API Call #${
            index + 1
          }. Status condition of API Call #${
            index + 2
          } has been reset. Please select a new status condition.`,
          { autoClose: 5000 }
        );
      }
    }

    // Validate ngay khi thay đổi target_endpoint hoặc method
    if (field === "target_endpoint" || field === "method") {
      setTimeout(() => {
        validateTargetEndpointsForDisplay(updatedCalls);
      }, 0);
    }

    // ✅ THÊM: Clear validation error khi user chọn status condition
    if (field === "condition" && value && value !== "") {
      setEndpointValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });

      setStatusConditionErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

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

  // ✅ THÊM: Hàm để format full path (xử lý cả external URLs)
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

  // ✅ CẬP NHẬT: Validation để chấp nhận external URLs
  const validateTargetEndpoints = () => {
    const endpointErrors = {};
    const statusConditionErr = {};

    nextCalls.forEach((call, index) => {
      // ✅ THÊM: Kiểm tra status condition không được rỗng
      if (!call.condition || call.condition === "") {
        statusConditionErr[index] = "Status condition is required";
      }

      // Kiểm tra format /workspace/project/path hoặc external URL
      const targetEndpoint = (() => {
        const selectedEp = getSelectedEndpoint(index);
        if (selectedEp) {
          return formatFullPath(selectedEp);
        } else if (call.target_endpoint) {
          return call.target_endpoint;
        } else {
          return "";
        }
      })();

      if (!targetEndpoint) {
        endpointErrors[index] = "Please enter a valid endpoint or external URL";
        return;
      }

      // Kiểm tra format hợp lệ (internal path hoặc external URL)
      const isValidInternalPath = targetEndpoint.match(/^\/[^/]+\/[^/]+\/.+/);
      const isValidExternalUrl = targetEndpoint.match(/^https?:\/\/.+/);

      if (!isValidInternalPath && !isValidExternalUrl) {
        endpointErrors[index] =
          "Please enter a valid endpoint (e.g., /workspace/project/path or https://domain.com/path)";
        return;
      }

      // ✅ VALIDATION: Chỉ kiểm tra internal endpoint có tồn tại trong danh sách không
      if (isValidInternalPath) {
        const matchingEndpoint = availableEndpoints.find((ep) => {
          return formatFullPath(ep) === targetEndpoint;
        });

        if (!matchingEndpoint) {
          endpointErrors[index] =
            "Invalid internal endpoint. Please select from suggestions.";
        }
      }
      // External URLs không cần kiểm tra trong availableEndpoints
    });

    setEndpointValidationErrors(endpointErrors);
    setStatusConditionErrors(statusConditionErr);
    return (
      Object.keys(endpointErrors).length === 0 &&
      Object.keys(statusConditionErr).length === 0
    );
  };

  // ✅ THÊM: useEffect để handle click outside cho suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra tất cả các dropdown đang mở
      Object.keys(isTargetEndpointSuggestionsOpen).forEach((callIndex) => {
        if (isTargetEndpointSuggestionsOpen[callIndex]) {
          const targetEndpointInput = document.getElementById(
            `target-endpoint-${callIndex}`
          );
          const suggestionsDropdown = document.querySelector(
            `[data-dropdown="target-endpoint-${callIndex}"]`
          );

          // Đóng dropdown nếu click bên ngoài input hoặc dropdown
          if (targetEndpointInput && suggestionsDropdown) {
            if (
              !targetEndpointInput.contains(event.target) &&
              !suggestionsDropdown.contains(event.target)
            ) {
              updateSuggestionsOpen(parseInt(callIndex), false);
            }
          }
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTargetEndpointSuggestionsOpen]);

  // ✅ CẬP NHẬT: Logic save với full target endpoints
  const handleSave = () => {
    // Kiểm tra tất cả JSON trước khi lưu
    if (!validateAllJson()) {
      return; // Không tiếp tục nếu có lỗi JSON
    }

    // Kiểm tra target endpoints và methods
    if (!validateTargetEndpoints()) {
      toast.error("Please select valid endpoints for all API calls");
      return; // Không tiếp tục nếu có lỗi validate endpoint
    }

    // ✅ KIỂM TRA LẠI ID nhỏ nhất sau khi validate
    const minimumId = getMinimumId(nextCalls);
    console.log(`Minimum ID in nextCalls: ${minimumId}`);

    // Chuẩn bị payload với full target endpoints
    const payload = {
      advanced_config: {
        nextCalls: nextCalls.map((call, index) => {
          const fullTargetEndpoint = getFullTargetEndpoint(index);

          return {
            id: call.id || undefined, // Chỉ có ID cho calls đã được save
            target_endpoint: fullTargetEndpoint, // Sử dụng full path
            method: call.method,
            body: call.body,
            condition: Number(call.condition),
          };
        }),
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

  // ✅ THÊM: Khởi tạo selectedEndpointIds khi nextCalls thay đổi (chỉ 1 lần duy nhất)
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Chỉ khởi tạo 1 lần duy nhất khi có dữ liệu
    if (
      !isInitialized &&
      nextCalls.length > 0 &&
      availableEndpoints.length > 0
    ) {
      const newSelectedEndpointIds = {};

      nextCalls.forEach((call, index) => {
        // Nếu call có target_endpoint (full path từ backend)
        if (call.target_endpoint) {
          // Tìm endpoint trong availableEndpoints có workspace/project/path match với target_endpoint
          const matchingEndpoint = availableEndpoints.find((ep) => {
            // Tạo full path từ endpoint data
            const cleanWorkspaceName = ep.workspaceName.replace(
              /^\/+|\/+$/g,
              ""
            );
            const cleanProjectName = ep.projectName.replace(/^\/+|\/+$/g, "");
            const cleanPath = ep.path.startsWith("/")
              ? ep.path.substring(1)
              : ep.path;
            const fullPath = `/${cleanWorkspaceName}/${cleanProjectName}/${cleanPath}`;

            return fullPath === call.target_endpoint;
          });

          if (matchingEndpoint) {
            newSelectedEndpointIds[index] = matchingEndpoint.id;
          }
        }
      });

      if (Object.keys(newSelectedEndpointIds).length > 0) {
        setSelectedEndpointIds(newSelectedEndpointIds);
      }
      setIsInitialized(true);
    }
  }, [nextCalls, availableEndpoints, isInitialized]);

  return (
    <Card className="px-16 py-6 border-0 rounded-lg">
      <div className="flex justify-end items-center mb-2">
        {/*<h2 className="text-2xl font-bold text-[#37352F]">API CALL</h2>*/}
        <div className="flex items-center gap-2">
          {/* New API Call */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsNewApiCallDialogOpen(true)}
              style={{ backgroundColor: "#FBEB6B" }} // ✅ CẬP NHẬT: Sử dụng màu #FBEB6B
              className="w-9 h-9 border border-slate-300 text-slate-700 rounded-md hover:opacity-80" // ✅ CẬP NHẬT: Thay đổi hover
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

          {/* Thêm nút popover bên cạnh nút save */}
          <div className="relative" ref={requestBodyPopoverRef}>
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                style={{ backgroundColor: "#FBEB6B" }} // ✅ CẬP NHẬT: Sử dụng màu #FBEB6B
                className="h-9 w-9 border-[#E5E5E1] hover:opacity-80" // ✅ CẬP NHẬT: Thay đổi hover
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

          {/* Save button */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              style={{ backgroundColor: "#FBEB6B" }} // ✅ CẬP NHẬT: Sử dụng màu #FBEB6B
              className="h-9 w-9 border-[#E5E5E1] hover:opacity-80" // ✅ CẬP NHẬT: Thay đổi hover
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

              {/* Text "External call" và nút toggle, delete */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveNextCall(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Target Endpoint */}
            <div className="flex flex-col mb-2">
              <div className="flex justify-between items-center">
                <label className="w-[130px] text-sm font-medium text-[#000000]">
                  Target Endpoint
                </label>

                <div className="relative flex-1 max-w-[801px]">
                  {/* ✅ THAY ĐỔI: Input field thay vì Select dropdown */}
                  {/* ✅ Input field thay vì Select dropdown */}
                  <Input
                    id={`target-endpoint-${index}`}
                    value={(() => {
                      // Hiển thị full path /workspace/project/path hoặc external URL
                      const selectedEp = getSelectedEndpoint(index);
                      if (selectedEp) {
                        return formatFullPath(selectedEp);
                      } else if (call.target_endpoint) {
                        return call.target_endpoint;
                      } else {
                        return "";
                      }
                    })()}
                    onChange={(e) => {
                      const newValue = e.target.value;

                      // ✅ CẬP NHẬT: Tìm endpoint match với full path user nhập (chỉ cho internal endpoints)
                      if (
                        newValue &&
                        !newValue.startsWith("http://") &&
                        !newValue.startsWith("https://")
                      ) {
                        const matchingEndpoint = availableEndpoints.find(
                          (ep) => {
                            return formatFullPath(ep) === newValue;
                          }
                        );

                        if (matchingEndpoint) {
                          // Nếu tìm thấy match, lưu ID
                          updateSelectedEndpointId(index, matchingEndpoint.id);
                          handleNextCallChange(
                            index,
                            "target_endpoint",
                            newValue
                          );
                        } else {
                          // Nếu không match, reset ID và lưu giá trị user nhập
                          updateSelectedEndpointId(index, null);
                          handleNextCallChange(
                            index,
                            "target_endpoint",
                            newValue
                          );
                        }

                        // Mở dropdown khi user nhập
                        if (newValue) {
                          updateSuggestionsOpen(index, true);
                        }
                      } else if (
                        newValue &&
                        (newValue.startsWith("http://") ||
                          newValue.startsWith("https://"))
                      ) {
                        // External URL - không cần tìm kiếm trong available endpoints
                        updateSelectedEndpointId(index, null);
                        handleNextCallChange(
                          index,
                          "target_endpoint",
                          newValue
                        );
                        updateSuggestionsOpen(index, false); // Đóng dropdown
                      } else {
                        // Empty value
                        updateSelectedEndpointId(index, null);
                        handleNextCallChange(
                          index,
                          "target_endpoint",
                          newValue
                        );
                        updateSuggestionsOpen(index, false);
                      }
                    }}
                    onFocus={() => {
                      // Mở dropdown khi focus vào input (nếu có data và không phải external URL)
                      const currentValue = (() => {
                        const selectedEp = getSelectedEndpoint(index);
                        if (selectedEp) {
                          return selectedEp.path;
                        } else if (call.target_endpoint) {
                          return call.target_endpoint;
                        } else {
                          return "";
                        }
                      })();

                      if (
                        getFilteredEndpoints(index).length > 0 &&
                        currentValue &&
                        !currentValue.startsWith("http://") &&
                        !currentValue.startsWith("https://")
                      ) {
                        updateSuggestionsOpen(index, true);
                      }
                    }}
                    onBlur={() => {
                      // Delay đóng để có thể click vào suggestion
                      setTimeout(() => {
                        updateSuggestionsOpen(index, false);
                      }, 200);
                    }}
                    placeholder="Enter endpoint path (e.g., /workspace/project/path or https://domain.com/path)"
                    className={`h-[36px] border-[#CBD5E1] rounded-md pl-3 pr-1 ${
                      endpointValidationErrors[index] ? "border-red-500" : ""
                    }`}
                  />
                  {getSuggestionsOpen(index) &&
                    !call.target_endpoint?.startsWith("http://") &&
                    !call.target_endpoint?.startsWith("https://") &&
                    getFilteredEndpoints(index).length > 0 && (
                      <div
                        data-dropdown={`target-endpoint-${index}`}
                        className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
                      >
                        {getFilteredEndpoints(index)
                          .filter((endpoint) => {
                            const inputValue = (() => {
                              const selectedEp = getSelectedEndpoint(index);
                              if (selectedEp) {
                                return selectedEp.path;
                              } else if (call.target_endpoint) {
                                return call.target_endpoint;
                              } else {
                                return "";
                              }
                            })();

                            // Lọc gợi ý dựa trên input
                            return (
                              endpoint.path
                                .toLowerCase()
                                .includes(inputValue.toLowerCase()) ||
                              inputValue === ""
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
                                handleNextCallChange(
                                  index,
                                  "target_endpoint",
                                  fullPath
                                );
                                // Lưu ID để tạo full path
                                updateSelectedEndpointId(index, endpoint.id);
                                // Đóng dropdown
                                updateSuggestionsOpen(index, false);
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
                                {/* Thông tin workspace/project */}
                                <span className="text-xs text-gray-500">
                                  {endpoint.workspaceName} /{" "}
                                  {endpoint.projectName}
                                </span>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  {/* Hiển thị lỗi validation cho Target Endpoint */}
                  {endpointValidationErrors[index] && (
                    <div className="text-red-400 text-xs mt-1">
                      {endpointValidationErrors[index]}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Method */}
            <div className="flex flex-col mb-2">
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
                        endpointValidationErrors[index] ? "border-red-500" : ""
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
            <div className="flex flex-col mb-2">
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
                    <SelectTrigger
                      className={`h-[36px] border-[#CBD5E1] rounded-md pl-3 pr-1 ${
                        statusConditionErrors[index] ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {/* ✅ CẬP NHẬT: Sử dụng logic mới */}
                      {getStatusConditionOptions(index).map((status) => (
                        <SelectItem key={status.code} value={status.code}>
                          {status.code} - {status.description.split("–")[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* ✅ HIỂN THỊ LỖI VALIDATION CHO STATUS CONDITION */}
                  {statusConditionErrors[index] && (
                    <div className="text-red-400 text-xs mt-1">
                      {statusConditionErrors[index]}
                    </div>
                  )}
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
            style={{ backgroundColor: "#FBEB6B" }} // ✅ CẬP NHẬT: Sử dụng màu #FBEB6B
            className="w-9 h-9 border border-slate-300 text-slate-700 rounded-md hover:opacity-80" // ✅ CẬP NHẬT: Thay đổi hover
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
            style={{ backgroundColor: "#FBEB6B" }} // ✅ CẬP NHẬT: Sử dụng màu #FBEB6B
            className="h-9 w-9 border-[#E5E5E1] hover:opacity-80" // ✅ CẬP NHẬT: Thay đổi hover
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
        <div className="w-full bg-[#F2F2F2] rounded-md p-1.5 mb-3">
          <div className="grid grid-cols-12 items-center">
            {/* Parameter Type */}
            <div className="col-span-3 border border-r-0 border-[#CBD5E1] rounded-l-md px-3 py-[6px] bg-[#F2F2F2]">
              <span className="font-inter font-semibold text-xs">
                Parameter Type
              </span>
            </div>

            {/* Parameter Name */}
            <div className="col-span-3 col-start-4 border border-l-0 border-[#CBD5E1] rounded-r-md px-3 py-[6px] bg-[#F2F2F2]">
              <span className="font-inter font-semibold text-xs">
                Parameter Name
              </span>
            </div>

            {/* Equal */}
            <div className="col-span-1 col-start-7 text-center">
              <span className="font-semibold text-[10px]">
                EQUAL
              </span>
            </div>

            {/* Expected Value */}
            <div className="col-span-4 col-start-8 border border-[#CBD5E1] rounded-md px-3 py-[6px] bg-[#F2F2F2]">
              <span className="font-inter font-semibold text-xs">
                Expected Value
              </span>
            </div>

            {/* Question mark */}
            <div className="col-start-12 flex justify-center">
              <div className="flex items-center justify-center w-[22px] h-[22px] border border-[#111827] rounded-full text-[#111827] font-inter font-bold text-[13px]">
                ?
              </div>
            </div>
          </div>
        </div>

        {/* Parameter rows */}
        <div className="space-y-4">
          {parameterRows.map((row) => (
            <div
              key={row.id}
              onClick={(e) => handleRuleClick(row.id, e)}
              className={`flex flex-col px-1 py-1.5 rounded-md border cursor-pointer ${
                row.id === selectedRuleId ? "border-blue-600" : "border-slate-300"
              }`}
            >
              <div className="grid grid-cols-12 items-center gap-2">
                {/* Parameter Type */}
                <div className="col-span-3">
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

                {/* Parameter Name */}
                <div className="col-span-3 col-start-4">
                  <Input
                    id={`rule-name-${row.id}`}
                    name={`rule-name-${row.id}`}
                    value={row.name}
                    onChange={(e) => handleNameChange(row.id, e.target.value)}
                    className={`${errors[row.id]?.name ? "border-red-500" : ""}`}
                    placeholder={getPlaceholderText(row.type)}
                  />
                </div>

                {/* Equal */}
                <div className="col-span-1 col-start-7 flex justify-center">
                  <img
                    src={equalIcon}
                    alt="Equal"
                    className="w-9 h-9"
                  />
                </div>

                {/* Expected Value */}
                <div className="col-span-4 col-start-8">
                  <Input
                    id={`rule-value-${row.id}`}
                    name={`rule-value-${row.id}`}
                    value={row.value}
                    onChange={(e) => handleValueChange(row.id, e.target.value)}
                    className={`${errors[row.id]?.value ? "border-red-500" : ""}`}
                    placeholder="value"
                  />
                </div>

                {/* Trash button */}
                <div className="col-start-12 flex justify-center border-l border-[#CBD5E1]">
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
              </div>

              {(errors[row.id]?.name || errors[row.id]?.value) && (
                <div className="text-red-500 text-xs mt-1 pl-2">
                  {errors[row.id]?.name || errors[row.id]?.value}
                </div>
              )}
            </div>
          ))}

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
