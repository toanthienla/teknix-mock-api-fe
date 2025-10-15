import React, { useState, useEffect, useRef } from "react";
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
  FileCode,
  X,
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
import reset_icon from "../assets/reset_state_button.svg";
import chain_icon from "../assets/Chain.svg";
import webBg from "@/assets/dot_web.svg";
import tiktokIcon from "@/assets/tiktok.svg";
import fbIcon from "@/assets/facebook.svg";
import linkedinIcon from "@/assets/linkedin.svg";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-json";
import "prismjs/themes/prism.css";
import "jsoneditor/dist/jsoneditor.css";
import { getCurrentUser } from "@/services/api.js";

const statusCodes = [
  {
    code: "100",
    description: "Continue.",
  },
  {
    code: "101",
    description: "Switching Protocols.",
  },
  {
    code: "102",
    description: "Processing.",
  },
  { code: "200", description: "OK." },
  { code: "201", description: "Created." },
  {
    code: "202",
    description: "Accepted.",
  },
  {
    code: "204",
    description: "No Content.",
  },
  {
    code: "206",
    description: "Partial Content.",
  },
  {
    code: "301",
    description: "Moved Permanently.",
  },
  { code: "302", description: "Found." },
  { code: "303", description: "See Other." },
  {
    code: "304",
    description: "Not Modified.",
  },
  {
    code: "307",
    description: "Temporary Redirect.",
  },
  {
    code: "308",
    description: "Permanent Redirect.",
  },
  { code: "400", description: "Bad Request." },
  { code: "401", description: "Unauthorized." },
  {
    code: "403",
    description: "Forbidden.",
  },
  { code: "404", description: "Not Found." },
  {
    code: "405",
    description: "Method Not Allowed.",
  },
  {
    code: "408",
    description: "Request Timeout.",
  },
  {
    code: "409",
    description: "Conflict.",
  },
  { code: "410", description: "Gone." },
  {
    code: "415",
    description: "Unsupported Media Type.",
  },
  { code: "429", description: "Too Many Requests." },
  { code: "500", description: "Internal Server Error." },
  {
    code: "501",
    description: "Not Implemented.",
  },
  {
    code: "502",
    description: "Bad Gateway.",
  },
  {
    code: "503",
    description: "Service Unavailable.",
  },
  {
    code: "504",
    description: "Gateway Timeout.",
  },
  {
    code: "505",
    description: "HTTP Version Not Supported.",
  },
];

const SchemaBodyEditor = ({ endpointData, endpointId, onSave, method }) => {
  const [schemaFields, setSchemaFields] = useState([]);
  // Thêm state cho dropdown của GET method
  const [availableFields, setAvailableFields] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Khởi tạo schema fields từ endpointData với field "id" mặc định
  useEffect(() => {
    if (endpointData?.schema) {
      let fieldsConfig = [];

      // Xác định danh sách field đã chọn dựa trên method
      let selectedFieldNames = [];

      if (method === "GET" && endpointData.schema.fields) {
        // Với GET, schema.fields là mảng tên field
        selectedFieldNames = [...endpointData.schema.fields];
      } else if (
        (method === "POST" || method === "PUT") &&
        endpointData.schema.schema
      ) {
        // Với POST/PUT, schema.schema là object với key là tên field
        selectedFieldNames = Object.keys(endpointData.schema.schema);
      }

      // Đảm bảo "id" luôn được bao gồm
      if (!selectedFieldNames.includes("id")) {
        selectedFieldNames = ["id", ...selectedFieldNames];
      }

      // Map các field đã chọn thành cấu trúc internal
      fieldsConfig = selectedFieldNames.map((name, index) => {
        // Tìm config từ availableFields (base schema)
        const fieldConfig = availableFields.find((f) => f.name === name);

        return {
          id: `field-${index}`,
          name,
          type: fieldConfig ? fieldConfig.type : "string",
          required: fieldConfig ? fieldConfig.required : false,
          isDefault: name === "id",
        };
      });

      setSchemaFields(fieldsConfig);
    } else {
      // Initialize with default schema
      const defaultSchema = { fields: ["id"] };
      const fieldsConfig = defaultSchema.fields.map((name, index) => ({
        id: `field-${index}`,
        name,
        type: "string",
        required: false,
        isDefault: name === "id",
      }));
      setSchemaFields(fieldsConfig);
    }
  }, [endpointData, method, availableFields]);

  // Fetch available fields for GET method
  useEffect(() => {
    if (endpointId) {
      fetch(`${API_ROOT}/base_schema/${endpointId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch base schema");
          return res.json();
        })
        .then((data) => {
          // Đảm bảo data.fields tồn tại và là mảng
          let fields = [];

          if (Array.isArray(data.fields)) {
            // Handle new format where fields is an array of objects
            fields = data.fields.map((field) => ({
              name: field.name,
              type: field.type,
              required: field.required !== undefined ? field.required : false,
            }));
          } else if (Array.isArray(data)) {
            // Handle old format where data is an array of strings
            fields = data.map((name) => ({
              name,
              type: "string",
              required: false,
            }));
          }

          setAvailableFields(fields);
        })
        .catch((error) => {
          console.error("Failed to fetch base schema:", error);
          toast.error("Failed to fetch available fields");
          // Đặt availableFields thành mảng rỗng khi có lỗi
          setAvailableFields([]);
        });
    }
  }, [endpointId]);

  // Hàm xử lý toggle field cho tất cả các method - ĐÃ SỬA LỖI CRASH
  const handleFieldToggle = (fieldName) => {
    setSchemaFields((prev) => {
      // Đảm bảo prev luôn là mảng
      const safePrev = Array.isArray(prev) ? prev : [];

      // Đảm bảo idField luôn tồn tại
      const idField = safePrev.find((f) => f.name === "id") || {
        id: `field-${Date.now()}-id`,
        name: "id",
        type: "number",
        required: false,
        isDefault: true,
      };

      const otherFields = safePrev.filter(
        (f) => f.name !== "id" && !f.isDefault
      );

      if (fieldName === "id") return safePrev;

      const isFieldSelected = otherFields.some((f) => f.name === fieldName);

      // Xác định type và required dựa trên cấu trúc availableFields
      let fieldType = "string";
      let fieldRequired = false;

      // Đảm bảo availableFields luôn là mảng
      const safeAvailableFields = Array.isArray(availableFields)
        ? availableFields
        : [];

      const fieldObj = safeAvailableFields.find((f) => f.name === fieldName);
      if (fieldObj) {
        fieldType = fieldObj.type || "string";
        fieldRequired =
          fieldObj.required !== undefined ? fieldObj.required : false;
      }

      if (isFieldSelected) {
        return [idField, ...otherFields.filter((f) => f.name !== fieldName)];
      } else {
        return [
          idField,
          ...otherFields,
          {
            id: `field-${Date.now()}`,
            name: fieldName,
            type: fieldType,
            required: fieldRequired,
            isDefault: false,
          },
        ];
      }
    });
  };

  const prepareSchema = () => {
    // Format schema the same for all methods (without required for GET)
    const schema = {};

    schemaFields.forEach((field) => {
      if (!field.isDefault) {
        // For all methods, include type
        const fieldSchema = { type: field.type };

        // Only include required for POST/PUT methods
        if (method !== "GET") {
          fieldSchema.required = field.required;
        }

        schema[field.name] = fieldSchema;
      }
    });

    // Always include "id" for all methods
    schema["id"] = {
      type: "number",
      // Only include required for POST/PUT methods
      ...(method !== "GET" && { required: false }),
    };

    return schema;
  };

  const handleSave = () => {
    // Chuẩn bị schema và gọi callback onSave từ parent
    const newSchema = prepareSchema();
    onSave(newSchema);
  };

  return (
    <div>
      <Card className="p-6 border border-[#CBD5E1] rounded-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#37352F]">
            Schema Definition
          </h1>
        </div>

        {/* Thêm tiêu đề Fields Input */}
        <div className="mb-2">
          <span className="font-inter font-bold text-[17px] leading-[16px] text-black">
            Fields Input
          </span>
        </div>

        {/* Thêm nút dropdown cho tất cả các method */}
        <div className="relative w-full h-[65px]">
          <div
            className="w-full h-[35px] border border-[#CBD5E1] rounded-[6px] cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="absolute left-2 top-1.5 text-sm text-[#000000] font-inter">
              {
                schemaFields.filter((f) => f.name === "id" || !f.isDefault)
                  .length
              }{" "}
              fields selected
            </span>
            <div className="absolute right-4 top-1/4 transform -translate-y-1/2 w-3 h-2.5 border-t border-r border-[black] rotate-135"></div>
          </div>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[#CBD5E1] rounded-md shadow-lg max-h-60 overflow-y-auto">
              {availableFields.map((field) => {
                const fieldName = field.name;
                const fieldType = field.type;
                const fieldRequired =
                  field.required !== undefined ? field.required : false;

                // Sửa logic checked: chỉ kiểm tra tên field, không kiểm tra isDefault
                const isChecked =
                  schemaFields.some(
                    (f) => f.name === fieldName && !f.isDefault
                  ) ||
                  (fieldName === "id" &&
                    schemaFields.some((f) => f.name === "id"));

                return (
                  <div
                    key={fieldName}
                    className="flex items-center px-3 py-2 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={fieldName === "id"} // Vô hiệu hóa checkbox cho field id
                      className={`mr-2 cursor-pointer ${
                        fieldName === "id" ? "opacity-50" : ""
                      }`}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (fieldName !== "id") {
                          handleFieldToggle(fieldName);
                        }
                      }}
                    />
                    <span
                      className={`cursor-pointer flex-1 ${
                        fieldName === "id" ? "text-gray-500" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (fieldName !== "id") {
                          handleFieldToggle(fieldName);
                        }
                      }}
                    >
                      {fieldName}{" "}
                      <span className="text-gray-500 text-xs">
                        ({fieldType}){" "}
                        {fieldRequired && (
                          <span className="text-red-500">*</span>
                        )}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-2">
          <span className="font-inter font-bold text-[17px] leading-[16px] text-black">
            Selected Fields
          </span>
        </div>
        {/* Hiển thị các trường đã chọn dưới dạng tag */}
        {schemaFields.filter((f) => !f.isDefault).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {schemaFields
              .filter((f) => !f.isDefault)
              .map((field) => (
                <div
                  key={field.id}
                  className="flex items-center bg-[rgba(37,99,235,0.2)] rounded-[21.4359px] px-[7.1453px] py-[3.57265px]"
                >
                  <span className="text-[#2563EB] text-[10.0034px] leading-[17px] mr-2">
                    {field.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFieldToggle(field.name);
                    }}
                    className="w-5 h-5 ml-1 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Nút lưu */}
        <div className="flex justify-end mt-4">
          <Button
            className="bg-[#2563EB] hover:bg-[#1E40AF] text-white"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
};

const BaseSchemaEditor = ({ folderData, folderId, onSave }) => {
  const [schemaFields, setSchemaFields] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (folderData?.schema) {
      const fields = Object.entries(folderData.schema).map(
        ([name, config], index) => ({
          id: `field-${index}`,
          name,
          type: config.type || "string",
          required: config.required || false,
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

  const handleSave = () => {
    if (!validateAllFields()) {
      toast.error("Please fix all errors before saving");
      return;
    }

    const newSchema = {};
    schemaFields.forEach((field) => {
      if (field.name.trim()) {
        newSchema[field.name] = {
          type: field.type,
          required: field.required,
        };
      }
    });

    onSave(newSchema);
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
              />

              <Select
                value={field.type}
                onValueChange={(value) => handleChange(field.id, "type", value)}
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
                >
                  <SelectTrigger>
                    <SelectValue />
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
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
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
            className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
};

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

          {/* Nút Add full width, căn phải, style giống hàng input */}
          <div className="flex flex-col gap-3 mt-4">
            <Button
              variant="outline"
              onClick={handleAddRule}
              className="w-full h-[42px] border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 flex justify-end pr-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>

            {selectedResponse && (
              <div className="flex justify-end">
                <Button
                  className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  // Ref cho JSON Editor
  // const jsonEditorContainerRef = useRef(null);
  // const jsonEditorRef = useRef(null);
  // Thêm state để quản lý data default
  const [dataDefault, setDataDefault] = useState([]);
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
  const [isActive, setIsActive] = useState(true);
  const [isInitialValueDialogOpen, setIsInitialValueDialogOpen] =
    useState(false);
  const [tempDataDefault, setTempDataDefault] = useState([]);
  const [tempDataDefaultString, setTempDataDefaultString] = useState("");

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
  const [showStatefulConfirmDialog, setShowStatefulConfirmDialog] =
    useState(false);
  const [showStatelessConfirmDialog, setShowStatelessConfirmDialog] =
    useState(false);
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
  const [isInitialValuePopoverOpen, setIsInitialValuePopoverOpen] =
    useState(false);
  const initialValuePopoverRef = useRef(null);
  const [openNewWs, setOpenNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [targetProjectId, setTargetProjectId] = useState(null);

  const [openNewFolder, setOpenNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [newFolderMode, setNewFolderMode] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [deleteFolderId, setDeleteFolderId] = useState(null);
  const [openDeleteFolder, setOpenDeleteFolder] = useState(false);
  const [openSchemaDialog, setOpenSchemaDialog] = useState(false);
  const [folderSchema, setFolderSchema] = useState(null);

  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [isEndpointsLoaded, setIsEndpointsLoaded] = useState(false);
  const [delayError, setDelayError] = useState("");

  const [currentUsername, setCurrentUsername] = useState("Unknown");

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
      fetch(`${API_ROOT}/base_schema/${currentEndpointId}`)
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
    const path = endpoints.find(
      (ep) => String(ep.id) === String(currentEndpointId)
    )?.path;
    if (path) {
      navigator.clipboard
        .writeText(`http://localhost:3000${path}`)
        .then(() => {
          toast.success("Path copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          toast.error("Failed to copy path");
        });
    }
  };

  // Thêm state cho dialog xác nhận reset
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);

  const currentEndpoint = endpoints.find(
    (ep) => String(ep.id) === String(currentEndpointId)
  );

  const currentFolder = currentEndpoint
    ? folders.find((f) => String(f.id) === String(currentEndpoint.folder_id))
    : null;

  // Hàm xử lý reset current values
  const handleResetCurrentValues = () => {
    // Lấy path từ currentEndpoint thay vì endpointData
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to reset current values");
        return res.json();
      })
      .then(() => {
        // Fetch lại endpoint data sau khi cập nhật
        return fetchEndpointDataByPath(path);
      })
      .then((finalData) => {
        if (finalData) {
          setEndpointData(finalData);
          setDataDefault(finalData.data_default || []);
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
    if (!currentFolder) {
      toast.error("Folder not found. Cannot update schema.");
      return;
    }

    const payload = {
      base_schema: newSchema,
    };

    fetch(`${API_ROOT}/folders/${currentFolder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update folder schema");
        return res.json();
      })
      .then((updatedFolder) => {
        // Update the folder in state
        setFolders((prev) =>
          prev.map((f) => (f.id === currentFolder.id ? updatedFolder : f))
        );
        toast.success("Folder schema updated successfully!");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  const insertInitialValueTemplate = (template) => {
    const textarea = document.getElementById("initial-value");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Chèn template tại vị trí con trỏ
    const newValue =
      tempDataDefaultString.substring(0, start) +
      template +
      tempDataDefaultString.substring(end);

    setTempDataDefaultString(newValue);

    // Di chuyển con trỏ sau template đã chèn
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + template.length,
        start + template.length
      );
    }, 0);

    // Tự động đóng popover sau khi chèn
    setIsInitialValuePopoverOpen(false);
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

  const insertTemplate = (template) => {
    const textarea = document.getElementById("response-body");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Chèn template tại vị trí con trỏ
    const newValue =
      responseBody.substring(0, start) + template + responseBody.substring(end);

    setResponseBody(newValue);

    // Di chuyển con trỏ sau template đã chèn
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + template.length,
        start + template.length
      );
    }, 0);

    // Tự động đóng popover sau khi chèn
    setIsPopoverOpen(false);
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
    fetch(`${API_ROOT}/folders/${currentFolder.id}`)
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
        console.error("Error fetching folders:", error);
      });
  };

  const fetchEndpointResponses = (isStatefulMode) => {
    const endpointIdStr = String(currentEndpointId);

    return fetch(`${API_ROOT}/endpoint_responses?endpoint_id=${endpointIdStr}`)
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
      `${API_ROOT}/endpoint_data?path=${encodeURIComponent(fullPath)}`
    )
      .then((res) => {
        if (!res.ok) {
          // Nếu không tìm thấy endpoint data, trả về null thay vì lỗi
          if (res.status === 404) return null;
          throw new Error("Failed to fetch endpoint data");
        }
        return res.json();
      })
      .then((data) => {
        setEndpointData(data);
        if (data) {
          setDataDefault(data.data_default || []);
        } else {
          // Nếu không có data, khởi tạo với mảng rỗng
          setDataDefault([]);
          setEndpointData({
            path: path,
            data_default: [],
            data_current: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        return data;
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
        return null;
      });
  };

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
      setDataDefault([]);
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

  const validateFolderName = (name) => {
    const trimmed = name.trim();

    if (!trimmed) {
      return "Folder name cannot be empty";
    }

    if (!/^[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9]*( [A-Za-zÀ-ỹ0-9]+)*$/.test(trimmed)) {
      return "Must start with a letter, no special chars, single spaces allowed";
    }

    if (trimmed.length > 20) {
      return "Folder name max 20 chars";
    }

    const projectFolders = folders.filter(
      (f) =>
        String(f.project_id) === String(projectId) && f.id !== editingFolderId
    );
    if (
      projectFolders.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      return "Folder name already exists in this project";
    }

    return "";
  };

  const handleCreateFolder = async () => {
    // Clear any existing toasts first
    toast.dismiss();

    // Check if no changes when editing
    if (editingFolderId) {
      const originalFolder = folders.find((f) => f.id === editingFolderId);
      if (
        originalFolder &&
        newFolderName.trim() === originalFolder.name &&
        newFolderDesc.trim() === (originalFolder.description || "")
      ) {
        // No changes, just close dialog
        setOpenNewFolder(false);
        setNewFolderName("");
        setNewFolderDesc("");
        setEditingFolderId(null);
        return;
      }
    }

    const validationError = validateFolderName(newFolderName);
    if (validationError) {
      toast.warning(validationError);
      return;
    }

    if (isCreatingFolder) {
      return; // Prevent double submission
    }

    setIsCreatingFolder(true);

    try {
      const folderData = {
        name: newFolderName.trim(),
        description: newFolderDesc.trim(),
        project_id: targetProjectId || projectId,
        is_public: newFolderMode === "public",
        created_at: editingFolderId ? undefined : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let response;
      if (editingFolderId) {
        // Update existing folder
        response = await fetch(`${API_ROOT}/folders/${editingFolderId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingFolderId, ...folderData }),
        });
      } else {
        // Create new folder
        response = await fetch(`${API_ROOT}/folders`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(folderData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save folder");
      }

      const savedFolder = await response.json();

      if (editingFolderId) {
        setFolders((prev) =>
          prev.map((f) => (f.id === editingFolderId ? savedFolder : f))
        );
        toast.success(`Folder "${savedFolder.name}" updated successfully!`);
      } else {
        setFolders((prev) => [...prev, savedFolder]);
        toast.success(`Folder "${savedFolder.name}" created successfully!`);
        // Không auto navigate, để user ở project page
      }

      setNewFolderName("");
      setNewFolderDesc("");
      setEditingFolderId(null);
      setTargetProjectId(null);
      setOpenNewFolder(false);
    } catch (error) {
      console.error("Error saving folder:", error);
      toast.error("Failed to save folder. Please try again.");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleAddFolder = (targetProjectId = null) => {
    setTargetProjectId(targetProjectId || projectId);
    setOpenNewFolder(true);
  };

  const handleEditFolder = (folder) => {
    setNewFolderName(folder.name);
    setNewFolderDesc(folder.description || "");
    setEditingFolderId(folder.id);
    setOpenNewFolder(true);
  };

  const handleDeleteFolder = async (folderIdParam) => {
    setDeleteFolderId(folderIdParam);
    setOpenDeleteFolder(true);
  };

  const hasChanges = () => {
    if (!editingFolderId) return true;
    const originalFolder = folders.find((f) => f.id === editingFolderId);
    if (!originalFolder) return true;
    return (
      newFolderName.trim() !== originalFolder.name ||
      newFolderDesc.trim() !== (originalFolder.description || "")
    );
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolderId) return;

    try {
      const endpointsRes = await fetch(`${API_ROOT}/endpoints`);
      const allEndpoints = await endpointsRes.json();
      const endpointsToDelete = allEndpoints.filter(
        (e) => String(e.folder_id) === String(deleteFolderId)
      );

      await Promise.all(
        endpointsToDelete.map((e) =>
          fetch(`${API_ROOT}/endpoints/${e.id}`, { method: "DELETE" })
        )
      );

      await fetch(`${API_ROOT}/folders/${deleteFolderId}`, {
        method: "DELETE",
      });

      setFolders((prev) => prev.filter((f) => f.id !== deleteFolderId));

      toast.dismiss();
      toast.success(
        `Folder and its ${endpointsToDelete.length} endpoints deleted successfully`
      );

      if (currentFolder.id === deleteFolderId) {
        navigate(`/projects/${projectId}`);
      }

      setOpenDeleteFolder(false);
      setDeleteFolderId(null);
    } catch (error) {
      console.error("Delete folder error:", error);
      toast.error("Failed to delete folder");
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
    // Sử dụng endpoint khác nhau cho stateful và stateless
    const url = isStateful
      ? `${API_ROOT}/endpoint_responses_ful/${response.id}`
      : `${API_ROOT}/endpoint_responses/${response.id}`;

    fetch(url)
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
    setResponseBody("");
    setDelay("0");
    setIsDialogOpen(true);
  };

  const handleSaveResponse = () => {
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

    const isFirstResponse = endpointResponses.length === 0 && !selectedResponse;

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
        is_default: selectedResponse
          ? selectedResponse.is_default
          : isFirstResponse,
        delay_ms: parseInt(delay) || 0,
        proxy_url: proxyUrl.trim() ? proxyUrl : null,
        proxy_method: proxyUrl.trim() ? proxyMethod : null,
      };
    }

    const method = selectedResponse ? "PUT" : "POST";
    // Sửa URL API cho chế độ stateful
    const url = selectedResponse
      ? isStateful
        ? `${API_ROOT}/endpoint_responses_ful/${selectedResponse.id}`
        : `${API_ROOT}/endpoint_responses/${selectedResponse.id}`
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
            selectedResponse
              ? prev.map((r) =>
                  r.id === statefulResponse.id ? statefulResponse : r
                )
              : [...prev, statefulResponse]
          );

          // Cập nhật statusData
          setStatusData((prev) =>
            selectedResponse
              ? prev.map((s) =>
                  s.id === statefulResponse.id
                    ? {
                        ...s,
                        code: statefulResponse.status_code.toString(),
                        name: statefulResponse.name,
                      }
                    : s
                )
              : [
                  ...prev,
                  {
                    id: statefulResponse.id,
                    code: statefulResponse.status_code.toString(),
                    name: statefulResponse.name,
                  },
                ]
          );

          if (selectedResponse) {
            setSelectedResponse(statefulResponse);
          }
        } else {
          // Xử lý như hiện tại cho stateless
          setEndpointResponses((prev) =>
            selectedResponse
              ? prev.map((r) =>
                  r.id === updatedResponse.id ? updatedResponse : r
                )
              : [...prev, updatedResponse]
          );

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

  const handleOpenInitialValueDialog = () => {
    // Sao chép dataDefault hiện tại để chỉnh sửa tạm thời
    setTempDataDefault(JSON.parse(JSON.stringify(dataDefault)));
    setIsInitialValueDialogOpen(true);
  };

  // Hàm xử lý khi lưu initial value
  const handleSaveInitialValue = () => {
    // Lấy path từ currentEndpoint thay vì endpointData
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to update endpoint data");
          return res.json();
        })
        .then(() => {
          // Fetch lại endpoint data sau khi cập nhật
          return fetchEndpointDataByPath(path);
        })
        .then((finalData) => {
          if (finalData) {
            setEndpointData(finalData);
            setDataDefault(finalData.data_default || []);
            setIsInitialValueDialogOpen(false);
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
          onAddFolder={handleAddFolder}
          setOpenNewWs={setOpenNewWs}
          onEditFolder={handleEditFolder}
          onDeleteFolder={handleDeleteFolder}
          username={currentUsername}
        />
      </aside>

      {/* Main Content */}
      <div
        className="pt-8 flex-1 transition-all duration-300 relative"
        style={{
          backgroundImage: `url(${webBg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        {/* Header */}
        <Topbar
          className="mt-0 mb-4"
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
                        },
                        {
                          label: currentProject.name,
                          href: `/dashboard/${currentProject.id}`,
                        },
                        {
                          label: currentFolder.name,
                          href: `/dashboard/${currentProject.id}/folder/${currentFolder.id}`,
                        },
                        {
                          label:
                            endpoints.find(
                              (ep) =>
                                String(ep.id) === String(currentEndpointId)
                            )?.name || "Endpoint",
                          href: null,
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
                        {
                          label: currentFolder.name,
                          href: `/dashboard/${currentProject.id}?folderId=${currentFolder.id}`,
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
          onNewResponse={isStateful ? undefined : handleNewResponse}
          showNewProjectButton={false}
          showNewResponseButton={!isStateful}
          showStateModeToggle={true}
          isStateful={isStateful}
          onStateModeChange={handleStateModeChange}
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
            <div className="flex items-center flex-shrink-0">
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
            <div className="flex items-center gap-2 ml-4 flex-1 min-w-0">
              {/*  reset state button */}
              {isStateful && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 flex-shrink-0"
                  onClick={() => setShowResetConfirmDialog(true)}
                >
                  <img
                    src={reset_icon}
                    alt="Create Icon"
                    className="w-4 h-4 object-contain"
                  />
                </Button>
              )}
              <div className="flex flex-row items-center p-0 gap-2.5 w-full h-[20px] bg-white border border-[#D1D5DB] rounded-md flex-1 min-w-0">
                <div className="h-[19px] font-inter font-semibold text-[16px] leading-[19px] text-[#777671] flex-1 ml-1.5 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                  {endpoints.find(
                    (ep) => String(ep.id) === String(currentEndpointId)
                  )?.path || "-"}
                </div>
                {/* Icon chain */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 flex-shrink-0"
                  onClick={handleCopyPath}
                  title="Copy path"
                >
                  <img
                    src={chain_icon}
                    alt="Copy path"
                    className="w-6 h-6 object-contain"
                  />
                </Button>

                {/* Hiển thị trạng thái Active/Inactive (chỉ đọc) */}
                <div className="flex flex-row items-center w-[20px] h-[10px] flex-shrink-0">
                  {isActive ? (
                    <svg width="15" height="16" viewBox="0 0 15 16" fill="none">
                      <polygon
                        points="15,8 0,0 0,16"
                        fill="#96FFC1"
                        stroke="#777671"
                        strokeWidth="1"
                      />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect
                        x="0.5"
                        y="0.5"
                        width="13"
                        height="13"
                        fill="#FF0000"
                        stroke="#777671"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dialog xác nhận reset current values */}
          <Dialog
            open={showResetConfirmDialog}
            onOpenChange={setShowResetConfirmDialog}
          >
            <DialogContent className="max-w-[512px] p-8 rounded-2xl shadow-lg">
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
                        className={`
                          border-b [border-bottom-style:solid] border-neutral-200 ${
                            index === statusData.length - 1 ? "border-b-0" : ""
                          } ${draggedItem === index ? "opacity-50" : ""} ${
                          selectedResponse?.id === status.id
                            ? "bg-gray-100"
                            : ""
                        }`}
                        draggable={!isStateful} // Chỉ cho phép drag khi không phải stateful
                        onDragStart={
                          !isStateful
                            ? (e) => handleDragStart(e, index)
                            : undefined
                        }
                        onDragOver={!isStateful ? handleDragOver : undefined}
                        onDragEnd={
                          !isStateful ? () => setDraggedItem(null) : undefined
                        }
                        onDrop={
                          !isStateful ? (e) => handleDrop(e, index) : undefined
                        }
                        onClick={() => {
                          const response = endpointResponses.find(
                            (r) => r.id === status.id
                          );
                          if (response) handleResponseSelect(response);
                        }}
                      >
                        <TableCell className="w-[119.2px] h-[49px] p-2">
                          <div className="flex self-stretch w-full items-center gap-2.5 relative flex-[0_0_auto]">
                            {/* Hiển thị GripVertical chỉ khi không phải stateful */}
                            {!isStateful && (
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            )}
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
                        {/* Hiển thị cột Default chỉ khi không phải stateful */}
                        {!isStateful && (
                          <TableCell className="w-[80px] h-[49px] p-2">
                            {status.isDefault && (
                              <div className="flex items-center justify-center px-2.5 py-0.5 border border-[#7A787C] rounded-md">
                                <span className="text-xs font-medium text-[#0A0A0A]">
                                  Default
                                </span>
                              </div>
                            )}
                          </TableCell>
                        )}
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
                {/* TabsList — chỉnh lại UI để các tab nằm sát bên trái */}
                <TabsList className="flex w-full justify-start bg-transparent mb-4 space-x-6">
                  <TabsTrigger
                    value="Header&Body"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                  >
                    Header & Body
                  </TabsTrigger>

                  {/* Ẩn hoàn toàn tab Request Validate khi stateful */}
                  {!isStateful && (
                    <TabsTrigger
                      value="Rules"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                    >
                      Rules
                    </TabsTrigger>
                  )}

                  {/* Ẩn hoàn toàn tab Proxy khi stateful */}
                  {!isStateful && (
                    <TabsTrigger
                      value="proxy"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                    >
                      Proxy
                    </TabsTrigger>
                  )}

                  {/* Thêm tab Data Default chỉ khi ở chế độ stateful */}
                  {isStateful && (
                    <TabsTrigger
                      value="dataDefault"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                    >
                      Data Default
                    </TabsTrigger>
                  )}
                  {/* Thêm tab Schema Body chỉ khi ở chế độ stateful */}
                  {isStateful && method !== "DELETE" && (
                    <TabsTrigger
                      value="schemaBody"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-[#37352F] data-[state=active]:shadow-none rounded-none"
                    >
                      {method === "GET" ? "Response Body" : "Request Body"}
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* TabsContent */}
                <TabsContent value="Header&Body" className="mt-0">
                  <div></div>
                  <div className="mt-2">
                    <Card className="p-6 border border-[#CBD5E1] rounded-lg">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-[#37352F] mr-4">
                          {selectedResponse?.name || "No Response Selected"}
                        </h2>
                        <div className="flex items-center space-x-2">
                          {/* Nút Default - ẩn khi stateful */}
                          {!isStateful && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="border-[#E5E5E1]"
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
                          )}

                          {!isStateful && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="border-[#E5E5E1]"
                              onClick={handleDeleteResponse}
                              disabled={selectedResponse?.is_default}
                            >
                              <Trash2
                                className={`h-4 w-4 ${
                                  selectedResponse?.is_default
                                    ? "text-gray-400"
                                    : "text-[#898883]"
                                }`}
                              />
                            </Button>
                          )}
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
                            placeholder="Enter response name"
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
                              onValueChange={(value) =>
                                !isStateful && setStatusCode(value)
                              }
                              disabled={isStateful}
                            >
                              <SelectTrigger
                                id="status-code"
                                className={`border-[#CBD5E1] rounded-md ${
                                  isStateful
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : ""
                                }`}
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
                            <div className="relative">
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
                                style={{
                                  fontFamily:
                                    '"Fira code", "Fira Mono", monospace',
                                  fontSize: 12,
                                  minHeight: "200px",
                                  maxHeight: "400px",
                                  overflow: "auto",
                                  border: "1px solid #CBD5E1",
                                  borderRadius: "0.375rem",
                                  backgroundColor: "#233554",
                                  color: "white",
                                }}
                                textareaClassName="focus:outline-none"
                                disabled={
                                  isStateful &&
                                  statusCode === "200" &&
                                  method === "GET"
                                }
                              />

                              {/* JSON Editor controls */}
                              <div className="absolute top-2 right-2 flex space-x-2 z-10">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#E5E5E1] w-[77px] h-[29px] rounded-[6px]"
                                >
                                  <Upload className="mr-1 h-4 w-4" /> Upload
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#E5E5E1] w-[77px] h-[29px] rounded-[6px]"
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
                                  <Code className="mr-1 h-4 w-4" /> Format
                                </Button>
                              </div>

                              {/* Nhóm nút dưới cùng bên phải */}
                              <div className="absolute bottom-2 right-2 flex space-x-2">
                                <FileCode
                                  className="text-gray-400 cursor-pointer hover:text-gray-600"
                                  size={26}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const canEdit =
                                      !isStateful ||
                                      statusCode !== "200" ||
                                      method !== "GET";
                                    if (canEdit) {
                                      setIsPopoverOpen(!isPopoverOpen);
                                    }
                                  }}
                                />
                              </div>

                              {/* Nhóm nút dưới cùng bên phải */}
                              <div className="absolute bottom-2 right-2 flex space-x-2">
                                <FileCode
                                  className="text-gray-400 cursor-pointer hover:text-gray-600"
                                  size={26}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const canEdit =
                                      !isStateful ||
                                      (statusCode !== "200" &&
                                        method !== "GET");
                                    if (canEdit) {
                                      setIsPopoverOpen(!isPopoverOpen);
                                    }
                                  }}
                                />
                              </div>

                              {/* Popover */}
                              {isPopoverOpen && (
                                <div
                                  ref={popoverRef}
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
                                          setIsPopoverOpen(false);
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
                                        insertTemplate(
                                          getTemplateText().template
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
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="delay"
                            className="text-right text-sm font-medium text-[#000000]"
                          >
                            Delay (ms)
                          </Label>
                          <div className="col-span-3">
                            <Input
                              id="delay"
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
                              className={`border-[#CBD5E1] rounded-md ${
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

                        <div className="flex justify-end">
                          <Button
                            className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
                            onClick={handleSaveResponse}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                {/* Chỉ render tab Rules khi không phải stateful */}
                {!isStateful && (
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
                )}

                {/* Chỉ render tab Proxy khi không phải stateful */}
                {!isStateful && (
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
                            className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950"
                            onClick={handleSaveResponse}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                )}

                {isStateful && method !== "DELETE" && (
                  <TabsContent value="schemaBody" className="mt-0">
                    <div className="mt-2">
                      <SchemaBodyEditor
                        endpointData={endpointDefinition}
                        endpointId={currentEndpointId}
                        onSave={handleSaveSchema}
                        method={method}
                      />
                    </div>
                  </TabsContent>
                )}

                {/* Thêm tab Data Default chỉ khi ở chế độ stateful */}

                {isStateful && (
                  <TabsContent value="dataDefault" className="mt-0">
                    <div className="mt-2">
                      <Card className="p-6 border border-[#CBD5E1] rounded-lg">
                        <div className="space-y-6">
                          <div className="flex justify-between items-center mb-1">
                            <h2 className="text-2xl font-medium text-[#37352F]">
                              Initial Value
                            </h2>
                          </div>

                          <div className="grid grid-cols-1 items-start gap-1">
                            <div className="col-span-3 space-y-2">
                              <div className="relative">
                                <div className="font-mono h-60 border-[#CBD5E1] rounded-md p-2 bg-[#F2F2F2] overflow-auto">
                                  <pre className="whitespace-pre-wrap break-words m-0">
                                    {dataDefault && dataDefault.length > 0
                                      ? JSON.stringify(dataDefault, null, 2)
                                      : "[]"}
                                  </pre>
                                </div>
                                <div
                                  className="w-full h-[20px] text-right text-[14px] leading-[20px] text-[#2563EB] underline cursor-pointer mt-1"
                                  onClick={handleOpenInitialValueDialog}
                                >
                                  Update initial value
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Sửa phần Current Value - chỉ hiển thị, không cho phép chỉnh sửa */}
                          <div className="text-left text-2xl font-medium text-[#000000] self-start pt-1 mb-1">
                            Current Value
                          </div>
                          <div className="grid grid-cols-1 items-start gap-1">
                            <div className="col-span-3 space-y-2">
                              <div className="relative">
                                {/* Thay Textarea bằng div chỉ đọc */}
                                <div className="font-mono h-60 border-[#CBD5E1] rounded-md p-2 bg-[#F2F2F2] overflow-auto">
                                  <pre className="whitespace-pre-wrap break-words m-0">
                                    {endpointData?.data_current
                                      ? JSON.stringify(
                                          endpointData.data_current,
                                          null,
                                          2
                                        )
                                      : "[]"}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Dialog Update Initial Value */}
                    <Dialog
                      open={isInitialValueDialogOpen}
                      onOpenChange={setIsInitialValueDialogOpen}
                    >
                      <DialogContent className="max-w-[512px] p-8 rounded-2xl shadow-lg">
                        <DialogHeader className="flex justify-between items-start mb-4">
                          <DialogTitle className="text-xl font-bold text-slate-800">
                            Update Initial Value
                          </DialogTitle>
                        </DialogHeader>

                        <div className="mb-6">
                          <div className="relative">
                            <Editor
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
                                fontSize: 12,
                                minHeight: "200px",
                                maxHeight: "400px",
                                overflow: "auto",
                                border: "1px solid #CBD5E1",
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
                                className="border-[#E5E5E1] w-[77px] h-[29px] rounded-[6px]"
                              >
                                <Upload className="mr-1 h-4 w-4" /> Upload
                              </Button>
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
                                    setTempDataDefault(JSON.parse(formatted));
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
                                size={26}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsInitialValuePopoverOpen(
                                    !isInitialValuePopoverOpen
                                  );
                                }}
                              />
                            </div>

                            {/* Popover cho Initial Value */}
                            {isInitialValuePopoverOpen && (
                              <div
                                ref={initialValuePopoverRef}
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
                                      insertInitialValueTemplate(
                                        getTemplateText().template
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

                        <DialogFooter className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setIsInitialValueDialogOpen(false)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 w-[80px] h-[40px] rounded-[8px]"
                          >
                            Cancel
                          </Button>
                          <Button
                            className="bg-yellow-300 hover:bg-yellow-400 text-indigo-950 w-[90px] h-[40px] rounded-[8px]"
                            onClick={handleSaveInitialValue}
                          >
                            Update
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
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
                requests will respond with predefined static data only.
                Continue?
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

              <div className="grid grid-cols-5 items-center gap-1">
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
                    >
                      <Upload className="mr-1 h-4 w-4" /> Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#E5E5E1] w-[77px] h-[29px] rounded-[6px]"
                      onClick={(e) => {
                        e.stopPropagation();
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
                    <div className="text-red-500 text-xs mt-1">
                      {delayError}
                    </div>
                  )}
                </div>
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

        {/* New Folder Dialog */}
        <Dialog open={openNewFolder} onOpenChange={setOpenNewFolder}>
          <DialogContent className="bg-white text-slate-800 sm:max-w-md shadow-xl rounded-xl border-0">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {editingFolderId ? "Edit Folder" : "New Folder"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label
                  htmlFor="folder-name"
                  className="text-sm font-medium text-gray-700"
                >
                  Name
                </Label>
                <Input
                  id="folder-name"
                  placeholder="Enter folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      newFolderName.trim() &&
                      !isCreatingFolder
                    ) {
                      e.preventDefault();
                      if (hasChanges()) {
                        handleCreateFolder();
                      } else {
                        setOpenNewFolder(false);
                        setNewFolderName("");
                        setNewFolderDesc("");
                        setEditingFolderId(null);
                      }
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setOpenNewFolder(false);
                      setNewFolderName("");
                      setNewFolderDesc("");
                      setEditingFolderId(null);
                    }
                  }}
                />
              </div>

              {/* Folder Mode */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Folder Mode
                </Label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="folderMode"
                      value="public"
                      checked={newFolderMode === "public"}
                      onChange={() => setNewFolderMode("public")}
                      className="accent-blue-600"
                    />
                    <span>Public</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="folderMode"
                      value="private"
                      checked={newFolderMode === "private"}
                      onChange={() => setNewFolderMode("private")}
                      className="accent-blue-600"
                    />
                    <span>Private</span>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setOpenNewFolder(false);
                  setNewFolderName("");
                  setNewFolderDesc("");
                  setEditingFolderId(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={
                  !newFolderName.trim() || !hasChanges() || isCreatingFolder
                }
                className="px-4 py-2  bg-yellow-300 hover:bg-yellow-400 text-indigo-950 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
              >
                {isCreatingFolder
                  ? editingFolderId
                    ? "Updating..."
                    : "Creating..."
                  : editingFolderId
                  ? "Update"
                  : "Create"}
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
                Are you sure you want to delete this folder and all its
                endpoints? This action cannot be undone.
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

        {/* footer */}
        <div className="absolute left-8 bottom-1 text-xs font-semibold text-gray-700">
          © Teknik Corp. All rights reserved.
        </div>

        <div className="absolute right-6 bottom-1 flex items-center gap-3 text-xs text-gray-700">
          <img src={tiktokIcon} alt="tiktok" className="w-4 h-4" />
          <img src={fbIcon} alt="facebook" className="w-4 h-4" />
          <img src={linkedinIcon} alt="linkedin" className="w-4 h-4" />
          <a className="hover:underline font-semibold" href="">
            About
          </a>
          <span>·</span>
          <a className="hover:underline font-semibold" href="">
            Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
