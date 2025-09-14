import React, { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import randomColor from "randomcolor";

export default function ProjectCard({ project, onEdit, onDelete }) {
  const { id, title, description } = project;

  const bgColor = useMemo(
    () =>
      randomColor({
        luminosity: "light",
        seed: id,
      }),
    [id]
  );

  const shortName = useMemo(
    () =>
      title
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase(),
    [title]
  );

  return (
    <Card className="shadow-sm hover:shadow-md transition cursor-pointer">
      <CardContent className="p-0">

        <div
          className="h-40 rounded-t-md flex items-center justify-center text-4xl font-bold text-slate-700"
          style={{ backgroundColor: bgColor }}
        >
          {shortName}
        </div>

        <div className="p-4 flex items-start justify-between">
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-xs text-slate-400">
              {description || "No description"}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-3">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            {/* Delete */}
            <Button
              variant="outline"
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
      </CardContent>
    </Card>
  );
}
