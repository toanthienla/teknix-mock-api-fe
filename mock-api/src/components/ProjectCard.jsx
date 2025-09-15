import React, { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import randomColor from "randomcolor";

export default function ProjectCard({ project, onEdit, onDelete, onClick }) {
  const { id, name, description } = project; // <-- dùng name thay vì title

  const bgColor = useMemo(
    () =>
      randomColor({
        luminosity: "light",
        seed: id,
      }),
    [id]
  );

  return (
    <div
      className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md cursor-pointer transition"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-md"
          style={{ backgroundColor: bgColor }}
        />
        <div>
          <div className="font-medium text-sm text-slate-800">{name}</div>
          <div className="text-xs text-slate-500 truncate max-w-[180px]">
            {description || "No description"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(project);
          }}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
