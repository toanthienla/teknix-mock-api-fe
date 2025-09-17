import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Folder, Pencil, Trash2, Plus, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Sidebar({
  workspaces = [],
  current,
  setCurrent,
  onAddWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  projects = [],
  openProjectsMap,
  setOpenProjectsMap,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [isWsOpen, setIsWsOpen] = useState(true); 

  const navigate = useNavigate();

  const handleAdd = () => {
    if (newName.trim() !== "") {
      onAddWorkspace(newName.trim());
      setNewName("");
      setIsAdding(false);
    }
  };

  const toggleProjects = (wsId) => {
    setOpenProjectsMap((prev) => ({
      ...prev,
      [wsId]: !prev[wsId],
    }));
  };

  return (
    <div className="p-6 flex flex-col h-screen">
    
      <div
        className="flex items-center justify-between text-2xl font-bold mb-6 cursor-pointer select-none"
        onClick={() => setIsWsOpen(!isWsOpen)}
      >
        <span>MockAPI</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${
            isWsOpen ? "rotate-0" : "-rotate-90"
          }`}
        />
      </div>

     
      {isWsOpen && (
        <>
          <div className="text-sm text-slate-600 mb-2 font-medium">WORKSPACES</div>
          <nav className="flex-1 overflow-auto">
            <ul className="space-y-1">
              {workspaces.map((ws) => {
                const active = current === ws.id;
                const isOpen = openProjectsMap[ws.id] || false;

                const wsProjects = projects.filter(
                  (p) => String(p.workspace_id) === String(ws.id)
                );

                return (
                  <li key={ws.id} className="group">
                    <div
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md cursor-pointer ${
                        active ? "bg-slate-100 font-medium" : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                   
                      <span
                        className="flex items-center gap-3"
                        onClick={() => setCurrent(ws.id)}
                      >
                        <Grid className="w-4 h-4" />
                        <span>{ws.name}</span>
                      </span>

                      <div className="flex items-center gap-2">
                      
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditWorkspace(ws);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteWorkspace(ws.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-black hover:text-slate-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProjects(ws.id);
                          }}
                          className="w-4 h-4 text-slate-400"
                        >
                          <ChevronDown
                            className={`transition-transform duration-200 ${
                              isOpen ? "rotate-0" : "-rotate-90"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {isOpen && wsProjects.length > 0 && (
                      <div className="ml-8 mt-1 space-y-1 text-sm text-slate-600">
                        {wsProjects.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer"
                            onClick={() => navigate(`/dashboard/${p.id}`)}
                          >
                            <Folder className="w-4 h-4 text-slate-400" />
                            {p.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}

              <li className="mt-2">
                {isAdding ? (
                  <div className="relative w-full">
                    <Plus className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      autoFocus
                      placeholder="Type workspace name..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAdd();
                        if (e.key === "Escape") {
                          setIsAdding(false);
                          setNewName("");
                        }
                      }}
                      onBlur={() => {
                        setIsAdding(false);
                        setNewName("");
                      }}
                      className="pl-8"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-slate-50 text-black"
                    onClick={() => setIsAdding(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Workspace</span>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
