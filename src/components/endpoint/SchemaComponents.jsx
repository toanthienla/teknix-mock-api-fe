import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { API_ROOT } from "@/utils/constants";
import { Plus, Trash2 } from "lucide-react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Thêm state mới để lưu schema từ endpoints/{id}
  const [endpointSchema, setEndpointSchema] = useState(null);
  // Thêm state để trigger refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // Hàm lấy tất cả các trường từ schema của endpoint (dùng cho tag name)
  const getEndpointSchemaFields = () => {
    if (!endpointSchema?.schema) return [];

    // Xử lý riêng cho GET method
    if (method === "GET" && endpointSchema.schema.fields) {
      // Với GET, schema.fields là mảng tên field
      return endpointSchema.schema.fields;
    } else if (
      (method === "POST" || method === "PUT") &&
      endpointSchema.schema
    ) {
      // Với POST/PUT, schema là object với key là tên field
      return Object.keys(endpointSchema.schema);
    }

    return [];
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
            Schema Fields
          </span>
        </div>
        {/* Hiển thị các trường trong schema từ endpoints/{id} dưới dạng tag */}
        {getEndpointSchemaFields().length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {getEndpointSchemaFields().map((fieldName) => (
              <div
                key={fieldName}
                className="flex items-center bg-[rgba(37,99,235,0.2)] rounded-[21.4359px] px-[7.1453px] py-[3.57265px]"
              >
                <span className="text-[#2563EB] text-[10.0034px] leading-[17px]">
                  {fieldName}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Nút lưu */}
        <div className="flex justify-end mt-4">
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
