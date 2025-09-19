import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import editIcon from "@/assets/Edit Icon.svg";
import deleteIcon from "@/assets/Trash Icon.svg";
import folderIcon from "@/assets/folder-icon.svg";
import WPIcon from "@/assets/WP.svg";
import settingIcon from "@/assets/Settings Icon.svg";

export default function Sidebar({
  workspaces = [],
  current,
  setCurrent,
  endpoints = [],
  onAddWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  projects = [],
  openProjectsMap,
  setOpenProjectsMap,
  openEndpointsMap,
  setOpenEndpointsMap,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [rightClickActionId, setRightClickActionId] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 }); // ✅ thêm state menuPos

  const navigate = useNavigate();
  const actionMenuRef = useRef(null);
  const inputRef = useRef(null); // ✅ thêm ref cho input

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Đóng context menu nếu click ra ngoài
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setRightClickActionId(null);
      }

      // Đóng input nếu click ra ngoài
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setIsAdding(false);
        setNewName("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const toggleEndpoints = (projectId) => {
    setOpenEndpointsMap((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  // ✅ sửa lại để tính toán vị trí context menu theo chuột
  const handleRightClick = (e, wsId) => {
    e.preventDefault();

    const menuWidth = 176; // ~ w-44 (44 * 4px)
    const menuHeight = 120; // chiều cao ước lượng
    const padding = 10;

    let x = e.clientX + 10;
    let y = e.clientY + 5;

    if (x + menuWidth > window.innerWidth) {
      x = e.clientX - menuWidth - padding;
    }

    if (y + menuHeight > window.innerHeight) {
      y = e.clientY - menuHeight - padding;
    }

    setMenuPos({ x, y });
    setRightClickActionId(rightClickActionId === wsId ? null : wsId);
  };

  return (
    <div className="p-6 flex flex-col h-screen bg-white">
      <div
        className="text-2xl font-bold mb-6 text-slate-900 cursor-pointer hover:text-slate-700"
        onClick={() => navigate("/dashboard")}
      >
        MockAPI
      </div>
      <div className="text-sm text-slate-700 mb-2 font-medium">WORKSPACES</div>
      <nav className="flex-1 overflow-auto">
        <ul className="space-y-1">
          {workspaces.map((ws) => {
            const active = current === ws.id;
            const isOpen = openProjectsMap[ws.id] || false;
            const wsProjects = projects.filter(
              (p) => String(p.workspace_id) === String(ws.id)
            );
            const isActionOpen = rightClickActionId === ws.id;

            return (
              <li key={ws.id} className="group relative">
                <div
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md cursor-pointer ${
                    active
                      ? "bg-slate-100 font-semibold text-slate-900"
                      : "hover:bg-slate-50 text-slate-800 font-medium"
                  }`}
                  onClick={() => {
                    setCurrent(ws.id);
                    toggleProjects(ws.id);
                  }}
                  onContextMenu={(e) => handleRightClick(e, ws.id)}
                >
                  <span className="flex items-center gap-3">
                    <img
                      src={WPIcon}
                      alt="WP icon"
                      className="w-4 h-4 object-contain"
                    />
                    <span>{ws.name}</span>
                  </span>
                </div>

                {/* ✅ context menu dùng fixed + menuPos */}
                {isActionOpen && (
                  <div
                    ref={actionMenuRef}
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-44 overflow-hidden"
                    style={{ top: menuPos.y, left: menuPos.x }}
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-gray-50">
                      Actions
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditWorkspace(ws);
                        setRightClickActionId(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      <img src={editIcon} alt="edit" className="w-4 h-4" />
                      Rename
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWorkspace(ws.id);
                        setRightClickActionId(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}

                {/* Projects + Endpoints */}
                {isOpen && wsProjects.length > 0 && (
                  <div className="ml-8 mt-1 space-y-1 text-sm text-slate-600">
                    {wsProjects.map((p) => {
                      const isEpOpen = openEndpointsMap[p.id] || false;
                      return (
                        <div key={p.id}>
                          {/* Project row */}
                          <div
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer"
                            onClick={() => navigate(`/dashboard/${p.id}`)}
                          >
                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/${p.id}`);
                              }}
                            >
                              <img
                                src={folderIcon}
                                alt="Folder icon"
                                className="w-4 h-4 object-contain"
                              />
                              {p.name}
                            </div>
                            <ChevronDown
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEndpoints(p.id);
                              }}
                              className={`w-4 h-4 text-slate-400 transition-transform ${
                                isEpOpen ? "rotate-0" : "-rotate-90"
                              }`}
                            />
                          </div>

                          {/* Endpoints */}
                          {isEpOpen && (
                            <div className="ml-6 mt-1 space-y-1 text-xs text-slate-600">
                              {endpoints
                                .filter(
                                  (ep) =>
                                    String(ep.project_id) === String(p.id)
                                )
                                .map((ep) => (
                                  <div
                                    key={ep.id}
                                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                                    onClick={() =>
                                      navigate(
                                        `/dashboard/${p.id}/endpoint/${ep.id}`
                                      )
                                    }
                                  >

                                    <img
                                      src={settingIcon}
                                      alt={ep.method}
                                      className="w-5 h-5 object-contain"
                                    />

                                    {ep.name}
                                  </div>
                                ))}
                            </div>
                          )}


                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}

          {/* Add Workspace */}
          <li className="mt-2">
            {isAdding ? (
              <div className="relative w-full">
                <Plus className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <Input
                  ref={inputRef} // ✅ thêm ref vào input
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
                  className="pl-8 text-slate-900 border border-slate-300 focus:border-slate-300 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                />
              </div>
            ) : (
              <div
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-slate-50 hover:text-slate-900 text-slate-900 font-medium"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="w-4 h-4" />
                <span>New Workspace</span>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}
