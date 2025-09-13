import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ProjectCard from "./components/ProjectCard";
import { ChevronDown } from "lucide-react";

export default function App() {
  const [workspaces, setWorkspaces] = useState([
    {
      id: "ws1",
      name: "Workspace 1",
      projects: [
        { id: "p1", title: "Project 1", description: "" },
        { id: "p2", title: "Project 2", description: "" },
        { id: "p3", title: "Project 3", description: "" },
        { id: "p4", title: "Project 4", description: "" },
        { id: "p5", title: "Project 5", description: "" },
        { id: "p6", title: "Project 6", description: "" },
      ],
    },
    {
      id: "ws2",
      name: "Workspace 2",
      projects: [
        { id: "p1", title: "Project 1", description: "" },
        { id: "p2", title: "Project 2", description: "" },
        { id: "p3", title: "Project 3", description: "" },
        { id: "p4", title: "Project 4", description: "" },
        { id: "p5", title: "Project 5", description: "" },
        { id: "p6", title: "Project 6", description: "" },
      ],
    },
    {
      id: "ws3",
      name: "Workspace 3",
      projects: [
        { id: "p1", title: "Project 1", description: "" },
        { id: "p2", title: "Project 2", description: "" },
        { id: "p3", title: "Project 3", description: "" },
        { id: "p4", title: "Project 4", description: "" },
        { id: "p5", title: "Project 5", description: "" },
        { id: "p6", title: "Project 6", description: "" },
      ],
    },
    {
      id: "ws4",
      name: "Workspace 4",
      projects: [
        { id: "p1", title: "Project 1", description: "" },
        { id: "p2", title: "Project 2", description: "" },
        { id: "p3", title: "Project 3", description: "" },
        { id: "p4", title: "Project 4", description: "" },
        { id: "p5", title: "Project 5", description: "" },
        { id: "p6", title: "Project 6", description: "" },
      ],
    },
  ]);

  const [currentWsId, setCurrentWsId] = useState("ws1");

  const handleAddWorkspace = (name, desc) => {
    const newWs = {
      id: `ws${Date.now()}`,
      name,
      description: desc,
      projects: [],
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setCurrentWsId(newWs.id);
  };

  const handleEditWorkspace = (id) => {
    const ws = workspaces.find((w) => w.id === id);
    const newName = prompt("Edit workspace name:", ws.name);
    if (newName) {
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === id ? { ...w, name: newName } : w))
      );
    }
  };

  const handleDeleteWorkspace = (id) => {
    if (confirm("Are you sure you want to delete this workspace?")) {
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      if (currentWsId === id && workspaces.length > 1) {
        setCurrentWsId(workspaces[0].id);
      }
    }
  };

  const handleWorkspaceProps = (id) => {
    const ws = workspaces.find((w) => w.id === id);
    alert(`Workspace: ${ws.name}\nProjects: ${ws.projects.length}`);
  };

  const currentWorkspace = workspaces.find((w) => w.id === currentWsId);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="flex">
        <aside className="w-72 border-r border-slate-100 bg-white">
          <Sidebar
            workspaces={workspaces}
            current={currentWsId}
            setCurrent={setCurrentWsId}
            onAddWorkspace={handleAddWorkspace}
            onEditWorkspace={handleEditWorkspace}
            onDeleteWorkspace={handleDeleteWorkspace}
            onWorkspaceProps={handleWorkspaceProps}
          />
        </aside>

        <main className="flex-1 p-8">
          <Topbar workspace={currentWorkspace} />

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">All Projects</h2>
            <button className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
              <span>Recently created</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {currentWorkspace?.projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
