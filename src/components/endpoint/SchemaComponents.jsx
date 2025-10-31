import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { API_ROOT } from "@/utils/constants";
import { Plus, Trash2, SaveIcon } from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "prismjs/components/prism-json";
import "prismjs/themes/prism.css";
import "jsoneditor/dist/jsoneditor.css";

export const SchemaBodyEditor = ({
  endpointData,
  endpointId,
  onSave,
  method,
}) => {
  const [schemaFields, setSchemaFields] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  // Thêm state mới để lưu schema từ endpoints/{id}
  const [endpointSchema, setEndpointSchema] = useState(null);
  // Thêm state để trigger refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  // Thêm state để control tooltip visibility trong ApiCallEditor
  const [saveTooltipVisible, setSaveTooltipVisible] = useState(false);

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

  // Tạo danh sách fields đã được filter theo search term
  const getFilteredFields = () => {
    if (!searchTerm.trim()) {
      return availableFields;
    }

    const term = searchTerm.toLowerCase();

    // Chia availableFields thành 2 nhóm: matches và non-matches
    const matches = [];
    const nonMatches = [];

    availableFields.forEach((field) => {
      if (field.name.toLowerCase().includes(term)) {
        matches.push(field);
      } else {
        nonMatches.push(field);
      }
    });

    // Trả về matches trước, sau đó là non-matches
    return [...matches, ...nonMatches];
  };

  // Fetch schema từ endpoints/{id} cho phần tag name
  useEffect(() => {
    if (endpointId) {
      fetch(`${API_ROOT}/endpoints/${endpointId}`, {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch endpoint schema");
          return res.json();
        })
        .then((data) => {
          setEndpointSchema(data);
        })
        .catch((error) => {
          console.error("Failed to fetch endpoint schema:", error);
          toast.error("Failed to fetch endpoint schema for tags");
          setEndpointSchema(null);
        });
    }
  }, [endpointId, refreshTrigger]); // Thêm refreshTrigger vào dependency

  // Hàm kiểm tra field có được tick hay không dựa trên schemaFields internal state
  const isFieldChecked = (fieldName) => {
    // "id" luôn được tick
    if (fieldName === "id") return true;

    // Kiểm tra field có tồn tại trong schemaFields và không phải default field
    return schemaFields.some(
      (field) => field.name === fieldName && !field.isDefault
    );
  };

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

  // Sync schemaFields với endpointSchema khi endpointSchema thay đổi
  useEffect(() => {
    if (endpointSchema?.schema) {
      let fieldsConfig = [];

      // Xác định danh sách field từ endpointSchema
      let fieldNames = [];

      if (method === "GET" && endpointSchema.schema.fields) {
        // Với GET, schema.fields là mảng tên field
        fieldNames = [...endpointSchema.schema.fields];
      } else if (
        (method === "POST" || method === "PUT") &&
        endpointSchema.schema
      ) {
        // Với POST/PUT, schema là object với key là tên field
        fieldNames = Object.keys(endpointSchema.schema);
      }

      // Đảm bảo "id" luôn được bao gồm
      if (!fieldNames.includes("id")) {
        fieldNames = ["id", ...fieldNames];
      }

      // Map các field thành cấu trúc internal
      fieldsConfig = fieldNames.map((name, index) => {
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
    }
  }, [endpointSchema, method, availableFields]);

  // Fetch available fields for GET method
  useEffect(() => {
    if (endpointId) {
      fetch(`${API_ROOT}/endpoints/base_schema/${endpointId}`, {
        credentials: "include",
      })
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
    if (method === "GET") {
      // For GET method, return the old format
      const fields = schemaFields
        .filter((field) => !field.isDefault)
        .map((field) => field.name);

      // Always include "id" for all methods
      return { fields: ["id", ...fields.filter((f) => f !== "id")] };
    } else {
      // For POST/PUT methods, return the new format
      const schema = {};

      schemaFields.forEach((field) => {
        if (!field.isDefault) {
          schema[field.name] = {
            type: field.type,
            required: field.required,
          };
        }
      });

      // Always include "id" for all methods
      schema["id"] = {
        type: "number",
        required: false,
      };

      return schema;
    }
  };

  const handleSave = async () => {
    // Chuẩn bị schema và gọi callback onSave từ parent
    const newSchema = prepareSchema();

    try {
      await onSave(newSchema);

      // Tăng refreshTrigger để trigger useEffect fetch lại endpoint schema
      setRefreshTrigger((prev) => prev + 1);

      // Hiển thị thông báo thành công
      toast.success("Schema updated and tags refreshed successfully!");
    } catch (error) {
      console.error("Failed to save schema:", error);
      // Error is already handled in handleSaveSchema
    }
  };

  return (
    <div>
      <Card className="p-6 border-0 rounded-lg">
        <div className="flex justify-end items-center mb-1">
          <div className="flex justify-end">
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
          </div>
        </div>

        {/* Bảng hiển thị các field */}
        <div className="p-2 mt-2">
          {/* Header bảng */}
          <div
            className={`grid ${
              method === "GET" ? "grid-cols-3" : "grid-cols-4"
            } gap-4 font-semibold text-gray-700 border-b pb-2 mb-2`}
          >
            <div>Select</div>
            <div className="flex flex-col">
              <div>Field Name</div>
              {/* Search input */}
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-45 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>Type</div>
            {method !== "GET" && <div>Required</div>}{" "}
            {/* Ẩn cột Required nếu là GET */}
          </div>

          {/* Dữ liệu từng field */}
          {getFilteredFields().map((field) => {
            const fieldName = field.name;
            const fieldType = field.type;
            const fieldRequired =
              field.required !== undefined ? field.required : false;
            const isChecked = isFieldChecked(fieldName);

            return (
              <div
                key={fieldName}
                className={`grid ${
                  method === "GET" ? "grid-cols-3" : "grid-cols-4"
                } gap-4 items-center py-2 hover:bg-gray-100 ${
                  searchTerm &&
                  !fieldName.toLowerCase().includes(searchTerm.toLowerCase())
                    ? "opacity-50"
                    : ""
                }`}
              >
                {/* Checkbox */}
                <div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={fieldName === "id"}
                    className={`w-5 h-5 accent-black cursor-pointer ${
                      fieldName === "id" ? "opacity-50" : ""
                    }`}
                    onChange={() => handleFieldToggle(fieldName)}
                  />
                </div>

                {/* Field Name */}
                <div
                  className={`cursor-pointer ${
                    fieldName === "id" ? "text-gray-500" : ""
                  }`}
                  onClick={() => {
                    if (fieldName !== "id") {
                      handleFieldToggle(fieldName);
                    }
                  }}
                >
                  {fieldName}
                </div>

                {/* Type */}
                <div className="px-2 py-1 rounded-sm bg-[#EDEDEC] w-fit">{fieldType}</div>

                {/* Required (chỉ hiển thị nếu không phải GET) */}
                {method !== "GET" && (
                  <div>{fieldRequired ? "true" : "false"}</div>
                )}
              </div>
            );
          })}

          {/* Hiển thị thông báo khi không có kết quả search */}
          {searchTerm && getFilteredFields().length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No fields found matching "{searchTerm}"
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export const BaseSchemaEditor = ({ folderData, folderId, onSave }) => {
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
      toast.success("Folder schema saved successfully!");
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
