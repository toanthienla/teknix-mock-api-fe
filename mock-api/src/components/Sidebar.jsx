import React, {useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {ChevronDown, Plus, ChevronLeft} from "lucide-react";
import {Input} from "@/components/ui/input";
import editIcon from "@/assets/Edit Icon.svg";
import deleteIcon from "@/assets/Trash Icon.svg";
import folderIcon from "@/assets/folder-icon.svg";
import WPIcon from "@/assets/WP.svg";
import settingIcon from "@/assets/Settings Icon.svg";
import newicon from "@/assets/Add.svg";

export default function Sidebar({
  workspaces = [],
  current,
  setCurrent,
  onWorkspaceChange,
  endpoints = [],
  onAddWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  onAddProject, // expect (workspaceId) => ...
  projects = [],
  openProjectsMap,
  setOpenProjectsMap,
  openEndpointsMap,
  setOpenEndpointsMap,
  isCollapsed,
  setIsCollapsed, // Nhận props để đồng bộ trạng thái
}) {
  const navigate = useNavigate();

  // Local UI state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [rightClickActionId, setRightClickActionId] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [emptyWsId, setEmptyWsId] = useState(null); // workspace chưa có project
  const [emptyProjectId, setEmptyProjectId] = useState(null); // project chưa có endpoint

  const actionMenuRef = useRef(null);
  const inputRef = useRef(null);

  // Provide local fallback maps if parent didn't pass handlers
  const [localOpenProjectsMap, setLocalOpenProjectsMap] = useState({});
  const [localOpenEndpointsMap, setLocalOpenEndpointsMap] = useState({});

  // Helper to read/write project map (use parent setter if provided)
  const readOpenProjects = (wsId) =>
    (openProjectsMap ? openProjectsMap[wsId] : localOpenProjectsMap[wsId]) || false;
  const readOpenEndpoints = (pId) =>
    (openEndpointsMap ? openEndpointsMap[pId] : localOpenEndpointsMap[pId]) || false;

  const toggleProjects = (wsId) => {
    if (setOpenProjectsMap) {
      setOpenProjectsMap((prev) => ({ ...prev, [wsId]: !prev[wsId] }));
    } else {
      setLocalOpenProjectsMap((prev) => ({ ...prev, [wsId]: !prev[wsId] }));
    }
  };

  const toggleEndpoints = (projectId) => {
    if (setOpenEndpointsMap) {
      setOpenEndpointsMap((prev) => ({ ...prev, [projectId]: !prev[projectId] }));
    } else {
      setLocalOpenEndpointsMap((prev) => ({ ...prev, [projectId]: !prev[projectId] }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setRightClickActionId(null);
      }
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setIsAdding(false);
        setNewName("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = () => {
    if (!newName.trim()) {
      return;
    }
    if (onAddWorkspace) onAddWorkspace(newName.trim());
    setNewName("");
    setIsAdding(false);
  };

  const handleSelectWorkspace = (wsId) => {
    if (setCurrent) setCurrent(wsId);
    if (onWorkspaceChange) onWorkspaceChange(wsId);
    localStorage.setItem("currentWorkspace", wsId);
    navigate("/dashboard");
  };

  const handleRightClick = (e, wsId) => {
    e.preventDefault();

    const menuWidth = 200;
    const menuHeight = 140;
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
    setRightClickActionId((prev) => (prev === wsId ? null : wsId));
  };

  return (
    <div
      className={`flex flex-col h-screen bg-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header with Logo and Collapse Button */}
      <div className="flex items-center justify-between px-4 bg-white relative border-b border-slate-200 h-16">
        <div className="absolute top-0 right-0 h-full w-px bg-slate-200" />

        <div
          className="cursor-pointer flex items-center flex-shrink-0"
          onClick={() => navigate("/dashboard")}
        >
          <span className="text-2xl font-bold text-slate-900 whitespace-nowrap leading-[56px]">
            MockAPI
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <ChevronLeft
            className={`w-5 h-5 text-slate-900 transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-auto p-2 ${isCollapsed ? "hidden" : ""}`}>
        <div className="text-sm text-slate-700 mb-2 font-medium">WORKSPACES</div>
        <ul className="space-y-1">
          {workspaces.map((ws) => {
            const active = String(current) === String(ws.id);
            const isOpen = readOpenProjects(ws.id);
            const wsProjects = projects.filter(
              (p) => String(p.workspace_id) === String(ws.id)
            );
            const isActionOpen = rightClickActionId === ws.id;

            return (
              <li key={ws.id} className="group relative">
                <div
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md cursor-pointer ${
                    active
                      ? "bg-slate-100 font-semibold text-slate-900"
                      : "hover:bg-slate-50 text-slate-800 font-medium"
                  }`}
                  onClick={() => {
                    // chỉ chọn workspace (highlight) - không navigate away here
                    if (setCurrent) setCurrent(ws.id);
                  }}
                  onContextMenu={(e) => handleRightClick(e, ws.id)}
                >
                  <span className="flex items-center gap-2">
                    <img
                      src={WPIcon}
                      alt="WP icon"
                      className="w-5 h-5 object-contain"
                    />
                    <span
                      key={ws.id}
                      onClick={() => handleSelectWorkspace(ws.id)}
                    >
                      {ws.name}</span>
                  </span>

                  <ChevronDown
                    onClick={(e) => {
                      e.stopPropagation();

                      if (wsProjects.length === 0) {
                        setEmptyWsId(ws.id); // hiện thông báo workspace rỗng
                        return;
                      }

                      setEmptyWsId(null); // reset nếu có project
                      toggleProjects(ws.id); // expand/collapse
                    }}
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </div>

                {/* Workspace empty warning */}
                {emptyWsId === ws.id && (
                  <div className="ml-8 mt-1 text-xs text-red-500">
                    This workspace has no projects yet.
                  </div>
                )}

                {/* Action menu on right click */}
                {isActionOpen && (
                  <div
                    ref={actionMenuRef}
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-44 overflow-hidden"
                    style={{top: menuPos.y, left: menuPos.x}}
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-gray-50">
                      Actions
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditWorkspace && onEditWorkspace(ws);
                        setRightClickActionId(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      <img src={editIcon} alt="edit" className="w-4 h-4"/>
                      Rename
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // truyền workspace id ra ngoài để tạo project trong workspace đó
                        onAddProject && onAddProject(ws.id);
                        setRightClickActionId(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      <img src={newicon} alt="new" className="w-4 h-4"/>
                      New Project
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWorkspace && onDeleteWorkspace(ws.id);
                        setRightClickActionId(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      <img src={deleteIcon} alt="delete" className="w-4 h-4"/>
                      Delete
                    </button>
                  </div>
                )}

                {/* Project list */}
                {isOpen && wsProjects.length > 0 && (
                  <div className="ml-8 mt-1 space-y-1 text-sm text-slate-600">
                    {wsProjects.map((p) => {
                      const isEpOpen = readOpenEndpoints(p.id);
                      return (
                        <div key={p.id}>
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
                                const projectEndpoints = endpoints.filter(
                                  (ep) => String(ep.project_id) === String(p.id)
                                );
                                if (projectEndpoints.length === 0) {
                                  setEmptyProjectId(p.id); // hiện thông báo project rỗng
                                  return;
                                }
                                setEmptyProjectId(null); // reset nếu có endpoint
                                toggleEndpoints(p.id);
                              }}
                              className={`w-4 h-4 text-slate-400 transition-transform ${
                                isEpOpen ? "rotate-0" : "-rotate-90"
                              }`}
                            />
                          </div>

                          {/* Project empty warning */}
                          {emptyProjectId === p.id && (
                            <div className="ml-8 mt-1 text-xs text-red-500">
                              This project has no endpoints yet.
                            </div>
                          )}

                          {/* Endpoint list */}
                          {isEpOpen && (
                            <div className="ml-6 mt-1 space-y-1 text-xs text-slate-600">
                              {endpoints
                                .filter((ep) => String(ep.project_id) === String(p.id))
                                .map((ep) => (
                                  <div
                                    key={ep.id}
                                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                                    onClick={() => navigate(`/dashboard/${p.id}/endpoint/${ep.id}`)}
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

          {/* New workspace input / button */}
          <li className="mt-2">
            {isAdding ? (
              <div className="relative w-full">
                <Plus className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600"/>
                <Input
                  ref={inputRef}
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
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-slate-50 hover:text-slate-900 text-slate-900 font-medium"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="w-4 h-4"/>
                <span>New Workspace</span>
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}