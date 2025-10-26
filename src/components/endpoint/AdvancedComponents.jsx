import React, { useState, useEffect } from "react";
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
  isRequestBodyPopoverOpen,
  setIsRequestBodyPopoverOpen,
  setIsNewApiCallDialogOpen,
  onSave,
}) => {
  // Thêm state để lưu trữ JSON string và trạng thái lỗi
  const [jsonStrings, setJsonStrings] = useState({});
  const [jsonErrors, setJsonErrors] = useState({});

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

  const handleJsonChange = (index, value) => {
    setJsonStrings((prev) => ({
      ...prev,
      [index]: value,
    }));

    // Validate JSON
    try {
      JSON.parse(value);
      setJsonErrors((prev) => ({
        ...prev,
        [index]: null,
      }));

      // Cập nhật body chỉ khi JSON hợp lệ
      handleNextCallChange(index, "body", JSON.parse(value));
    } catch (e) {
      setJsonErrors((prev) => ({
        ...prev,
        [index]: e.message,
      }));
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
  };

  const handleSave = () => {
    // Chuẩn bị payload đúng định dạng
    const payload = {
      advanced_config: {
        nextCalls: nextCalls.map((call) => ({
          id: call.id,
          target_endpoint: call.target_endpoint,
          method: call.method,
          body: call.body,
          condition: call.condition,
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
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  return (
    <Card className="p-6 border border-[#CBD5E1] rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#37352F]">API CALL</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-[#E5E5E1] hover:bg-yellow-50"
            onClick={handleSave}
          >
            <SaveIcon className="h-5 w-5 text-[#898883]" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsNewApiCallDialogOpen(true)}
            className="w-9 h-9 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
          >
            <Plus className="h-7 w-7" />
          </Button>
        </div>
      </div>

      <div className="border-b border-[#EDEFF1] mb-6"></div>

      {nextCalls.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No API calls configured. Click "New API Call" to add one.
        </div>
      ) : (
        nextCalls.map((call, index) => (
          <div
            key={call.id || index}
            className="mb-6 p-4 border border-[#CBD5E1] rounded-lg relative"
          >
            {/* Thêm title "Next API Call" và số thứ tự */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="font-bold text-[#37352F] mr-2">
                  Next API Call
                </span>
                <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
              </div>
              {nextCalls.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveNextCall(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="border-b border-[#EDEFF1] mb-4"></div>

            <div className="space-y-4">
              {/* Target Endpoint - Sửa lại để sử dụng target_endpoint làm giá trị */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="w-[130px] text-right text-sm font-medium text-[#000000]">
                    Target Endpoint
                  </label>
                  <div className="relative flex-1 max-w-[801px]">
                    <Select
                      value={call.target_endpoint} // Sử dụng target_endpoint làm giá trị
                      onValueChange={(value) => {
                        // Cập nhật trực tiếp target_endpoint cho API call hiện tại
                        handleNextCallChange(index, "target_endpoint", value);
                      }}
                    >
                      <SelectTrigger className="h-[36px] border-[#CBD5E1] rounded-md pl-3 pr-1">
                        <SelectValue placeholder="Select endpoint" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {/* Hiển thị danh sách các target_endpoint duy nhất */}
                        {Array.from(
                          new Set(nextCalls.map((c) => c.target_endpoint))
                        ).map((endpoint) => (
                          <SelectItem key={endpoint} value={endpoint}>
                            {endpoint}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Method */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="w-[130px] text-right text-sm font-medium text-[#000000]">
                    Method
                  </label>
                  <div className="relative flex-1 max-w-[801px]">
                    <Select
                      value={call.method}
                      onValueChange={(value) =>
                        handleNextCallChange(index, "method", value)
                      }
                    >
                      <SelectTrigger className="h-[36px] border-[#CBD5E1] rounded-md pl-3 pr-1">
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
                  <label className="w-[130px] text-right text-sm font-medium text-[#000000] pt-2">
                    Request Body
                  </label>
                  <div className="flex-1 max-w-[801px] relative">
                    <div className="relative">
                      <Editor
                        value={
                          jsonStrings[index] ||
                          '{\n  "orderId": "{{response.body.orderId}}"\n}'
                        }
                        onValueChange={(code) => handleJsonChange(index, code)}
                        highlight={(code) => highlight(code, languages.json)}
                        padding={10}
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
                          backgroundColor: "#233554",
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

                      {/* Bottom right icon */}
                      <div className="absolute bottom-2 right-2 flex space-x-2">
                        <FileCode
                          className="text-gray-400 cursor-pointer hover:text-gray-600"
                          size={20}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsRequestBodyPopoverOpen(
                              !isRequestBodyPopoverOpen
                            );
                          }}
                        />
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
              </div>

              {/* Status condition */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="w-[130px] text-right text-sm font-medium text-[#000000]">
                    Status condition
                  </label>
                  <div className="relative flex-1 max-w-[801px]">
                    <Select
                      value={call.condition}
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

export const Frame = ({
  responseName,
  selectedResponse,
  onUpdateRules,
  onSave,
}) => {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#37352F]">
            {responseName || "No Response Selected"}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleAddRule}
              className="w-9 h-9 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
            >
              <Plus className="h-7 w-7" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#E5E5E1] hover:bg-yellow-50"
              onClick={handleSave}
            >
              <SaveIcon className="h-5 w-5 text-[#898883]" />
            </Button>
          </div>
        </div>

        {/* Header frame for parameters */}
        <div className="relative w-[650.17px] h-[37.53px] mb-2">
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
          <div className="absolute w-[270.47px] h-[27.46px] right-[5.49px] top-[5.49px] flex items-center pl-2">
            <div className="font-inter font-bold text-[12px] text-black">
              Equal
            </div>
          </div>
          {/* Expected Value */}
          <div className="absolute w-[150.47px] h-[27.46px] right-[80.49px] top-[5.49px] border border-[#CBD5E1] rounded-[5.49px] flex items-center pl-1">
            <div className="font-inter font-bold text-[14px] text-black">
              Expected Value
            </div>
          </div>
          <div className="absolute w-[42.47px] h-[27.46px] right-[5.49px] top-[5.49px] flex items-center pl-2">
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
