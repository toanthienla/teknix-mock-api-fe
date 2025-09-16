import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"

export default function EndpointRow({ endpoint, onEdit, onDelete }) {
    return (
        <div className="grid grid-cols-[2fr_0.7fr_1fr] items-center py-3 text-sm border-b border-gray-200">
            {/* Tên + Path */}
            <div className="flex flex-col">
                <span className="font-medium text-gray-800">{endpoint.name}</span>
                <span className="text-xs text-gray-500">{endpoint.endpoint_path}</span>
            </div>

            {/* Method */}
            <div>
                <Badge
                    className={`px-2 py-0.5 text-xs font-semibold ${
                        endpoint.method === "GET"
                            ? "bg-green-100 text-green-800"
                            : endpoint.method === "POST"
                                ? "bg-blue-100 text-blue-800"
                                : endpoint.method === "PUT"
                                    ? "bg-orange-100 text-orange-800"
                                    : endpoint.method === "DELETE"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                    }`}
                >
                    {endpoint.method}
                </Badge>
            </div>

            {/* Actions + Time */}
            <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
          {new Date(endpoint.created_at).toLocaleString()}
        </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => onEdit(endpoint)}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-500 hover:text-red-600"
                        onClick={() => onDelete(endpoint.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

