import React, { useState } from "react";
import { Grid, Folder, Pencil, Trash2, Settings, Plus, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Sidebar({
  workspaces = [],
  current,
  setCurrent,
  onAddWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  onWorkspaceProps,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleAdd = () => {
    if (newName.trim() !== "") {
      onAddWorkspace(newName.trim(), newDesc.trim());
      setNewName("");
      setNewDesc("");
      setIsAdding(false);
    }
  };

  return (
    <div className="p-6 flex flex-col h-screen">
      <div className="mb-6 flex items-center gap-3">
        <div className="text-2xl font-bold">MockAPI</div>
      </div>

      <div className="text-sm text-slate-600 mb-2 font-medium">WORKSPACES</div>

      <nav className="flex-1 overflow-auto">
        <ul className="space-y-1">
          {workspaces.map((ws) => {
            const active = current === ws.id;
            return (
              <li key={ws.id} className="group">
                <Collapsible open={active}>
                  <CollapsibleTrigger
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-left ${
                      active ? "bg-slate-100 font-medium" : "hover:bg-slate-50 text-slate-700"
                    }`}
                    onClick={() => setCurrent(ws.id)}
                  >
                    <span className="flex items-center gap-3">
                      <Grid className="w-4 h-4" />
                      <span>{ws.name}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditWorkspace(ws.id); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteWorkspace(ws.id); }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onWorkspaceProps(ws.id); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-700"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          active ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-8 mt-1 space-y-1 text-sm text-slate-600">
                    {ws.projects &&
                      ws.projects.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50"
                        >
                          <Folder className="w-4 h-4 text-slate-400" />
                          {p.title}
                        </div>
                      ))}
                  </CollapsibleContent>
                </Collapsible>
              </li>
            );
          })}

          <li className="mt-2">
            {isAdding ? (
              <div className="flex flex-col gap-2">
                <Input
                  autoFocus
                  placeholder="Workspace name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                  placeholder="Workspace description"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleAdd}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Add
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                    setIsAdding(false);
                    setNewName("");
                    setNewDesc("");
                   }}
                   >
                   Cancel
                   </Button>

                </div>
              </div>
            ) : (
              <Button
                variant="link"
                className="w-full flex items-center gap-3 text-blue-600"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="w-4 h-4" />
                New Workspace
              </Button>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}
