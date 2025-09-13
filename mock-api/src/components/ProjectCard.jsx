import React from "react";
import { Pencil, Trash2, Link } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProjectCard({ project }) {
  const { title, description, img } = project;

  return (
    <Card className="shadow-sm hover:shadow-md transition">
      <CardContent className="p-0">
        <div className="h-40 rounded-t-md bg-slate-50 overflow-hidden flex items-center justify-center">
          {img ? (
            <img src={img} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <Link className="w-8 h-8 mb-2" />
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>

        <div className="p-4 flex items-start justify-between">
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-xs text-slate-400">{description}</div>
          </div>

          <div className="flex items-center gap-2 ml-3">
            <Button variant="outline" size="icon">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
