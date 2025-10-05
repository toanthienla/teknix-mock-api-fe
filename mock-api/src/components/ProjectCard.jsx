import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import randomColor from "randomcolor";

// Import icon ảnh
import editIcon from "@/assets/Edit Icon.svg";
import deleteIcon from "@/assets/Trash Icon.svg";

export default function ProjectCard({ project, onEdit, onDelete, onClick }) {
  const { id, name, description, created_at, endpoints = [] } = project;

  const bgColor = useMemo(
    () =>
      randomColor({
        luminosity: "light",
        seed: id,
      }),
    [id]
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:shadow-md transition cursor-pointer relative"
    >
      {/* Header: Ngày tạo + Menu */}
      <div className="flex justify-between items-start mb-1">
        <div className="text-xs text-slate-500 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded-md font-medium">
          {formatDate(created_at)}
        </div>

        {/* Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-slate-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2">
            <DropdownMenuLabel className="text-sm font-medium text-slate-600 px-2 py-1">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />

            {/* Edit */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
            >
              <img src={editIcon} alt="edit" className="w-4 h-4" />
              Edit
            </DropdownMenuItem>

            {/* Delete */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
            >
              <img src={deleteIcon} alt="delete" className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nội dung chính */}
      <div className="flex items-start gap-2 flex-1">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
          style={{ backgroundColor: bgColor }}
        />
        <div className="flex flex-col">
          <div className="font-semibold text-slate-900 text-base">{name}</div>
          <div className="text-sm text-slate-600 line-clamp-2">
            {description || "No description"}
          </div>
        </div>
      </div>

      {/* Góc dưới bên phải: số lượng endpoint */}
      <div className="flex justify-end mt-3">
        <span className="text-xs text-black font-medium">
          {endpoints.length} {endpoints.length === 1 ? 'Endpoint' : 'Endpoints'}
        </span>
      </div>
    </div>
  );
}