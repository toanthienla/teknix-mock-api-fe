import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProjectCard from "../components/ProjectCard";
import { ChevronDown } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
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
  const [searchTerm, setSearchTerm] = useState("");


  const currentWorkspace = workspaces.find((w) => w.id === currentWsId);
  const currentProject = currentWorkspace?.projects.find((p) => p.id === projectId);

  
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  
  useEffect(() => {
    if (currentProject) {
      setEditTitle(currentProject.title);
      setEditDesc(currentProject.description || "");
    }
  }, [currentProject]);

  
  const filteredProjects = currentWorkspace?.projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const handleDeleteProject = (projectId) => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === currentWsId
          ? { ...ws, projects: ws.projects.filter((p) => p.id !== projectId) }
          : ws
      )
    );
  };

  
  const handleUpdateProject = () => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === currentWsId
          ? {
              ...ws,
              projects: ws.projects.map((p) =>
                p.id === projectId ? { ...p, title: editTitle, description: editDesc } : p
              ),
            }
          : ws
      )
    );
    navigate("/dashboard"); 
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="flex">
        
        <aside className="w-72 border-r border-slate-100 bg-white">
          <Sidebar
            workspaces={workspaces}
            current={currentWsId}
            setCurrent={setCurrentWsId}
          />
        </aside>

        <main className="flex-1 p-8">
          <Topbar onSearch={setSearchTerm} workspace={currentWorkspace} />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">All Projects</h2>
            <button className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
              <span>Recently created</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          
          <div className="grid grid-cols-3 gap-6">
            {filteredProjects?.length > 0 ? (
              filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/dashboard/${p.id}`)} 
                  className="cursor-pointer"
                >
                  <ProjectCard
                    project={p}
                    onEdit={(id) => navigate(`/dashboard/${id}`)}
                    onDelete={(id) => handleDeleteProject(id)}
                  />
                </div>
              ))
            ) : (
              <p className="text-slate-500">No projects found in this workspace.</p>
            )}
          </div>
        </main>
      </div>

      
      {currentProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px] p-6 relative">
           
            <button
              onClick={() => navigate("/dashboard")}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-2">Edit Project</h2>
            <p className="text-sm text-gray-500 mb-4">Project details</p>

           
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Project name"
              className="w-full border rounded-md px-3 py-2 mb-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />

            
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description"
              rows="4"
              maxLength={200}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {editDesc.length}/200
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
