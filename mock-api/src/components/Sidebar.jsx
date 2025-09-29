import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Plus, ChevronLeft, MoreHorizontal } from "lucide-react";
import editIcon from "@/assets/Edit Icon.svg";
import deleteIcon from "@/assets/Trash Icon.svg";
import randomColor from "randomcolor";

export default function Sidebar({
                                  workspaces = [],
                                  current,
                                  setCurrent,
                                  onWorkspaceChange,
                                  endpoints = [],
                                  folders = [],
                                  onEditWorkspace,
                                  onDeleteWorkspace,
                                  onAddProject,
                                  onAddFolder,
                                  onEditFolder,
                                  onDeleteFolder,
                                  projects = [],
                                  openProjectsMap,
                                  setOpenProjectsMap,
                                  openEndpointsMap,
                                  setOpenEndpointsMap,
                                  openFoldersMap,
                                  setOpenFoldersMap,
                                  isCollapsed,
                                  setIsCollapsed,
                                  setOpenNewWs,
                                }) {
  const navigate = useNavigate();
  const { projectId, endpointId } = useParams();

  const [rightClickActionId, setRightClickActionId] = useState(null);
  const [rightClickFolderId, setRightClickFolderId] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);

  const actionMenuRef = useRef(null);
  const folderMenuRef = useRef(null);

  const [localOpenEndpointsMap, setLocalOpenEndpointsMap] = useState({});
  const [localOpenFoldersMap, setLocalOpenFoldersMap] = useState({});
  const [localOpenProjectsMap, setLocalOpenProjectsMap] = useState({});
  const [projectColorMap, setProjectColorMap] = useState({});

  useEffect(() => {
    const newMap = {};
    projects.forEach((p) => {
      newMap[p.id] =
        projectColorMap[p.id] ||
        randomColor({
          luminosity: "bright",
          seed: p.id,
        });
    });
    setProjectColorMap(newMap);
  }, [projects]);

  const readOpenProjects = (wsId) =>
    (openProjectsMap ? openProjectsMap[wsId] : localOpenProjectsMap[wsId]) || false;

  const readOpenEndpoints = (pId) =>
    (openEndpointsMap ? openEndpointsMap[pId] : localOpenEndpointsMap[pId]) ||
    false;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setRightClickActionId(null);
      }
      if (folderMenuRef.current && !folderMenuRef.current.contains(e.target)) {
        setRightClickFolderId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectWorkspace = (wsId) => {
    if (setCurrent) setCurrent(wsId);
    if (onWorkspaceChange) onWorkspaceChange(wsId);
    localStorage.setItem("currentWorkspace", wsId);
    navigate("/dashboard");
  };

  const handleFolderRightClick = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 100;
    let x = rect.right;
    let y = rect.bottom;
    if (x + menuWidth > window.innerWidth) x = rect.left - menuWidth;
    if (y + menuHeight > window.innerHeight) y = rect.top - menuHeight;
    setMenuPos({ x, y });
    setRightClickFolderId((prev) => (prev === folderId ? null : folderId));
  };

  const currentWorkspace = workspaces.find((ws) => String(ws.id) === String(current));

  useEffect(() => {
    if (!currentWorkspace && current) {
      setCurrent(null);
    }
  }, [currentWorkspace, current, setCurrent]);

  useEffect(() => {
    if (currentWorkspace) setWsDropdownOpen(false);
  }, [currentWorkspace]);

  useEffect(() => {
    if (projectId) {
      const project = projects.find((p) => String(p.id) === String(projectId));
      if (project) {
        const wsId = project.workspace_id;
        if (setCurrent) setCurrent(wsId);
        if (onWorkspaceChange) onWorkspaceChange(wsId);
      }
    }
  }, [projectId, projects]);

  return (
    <div className="flex flex-col bg-white transition-all duration-300 w-64">
      {/* Header */}
      <div className="flex items-center justify-between px-4 border-b border-slate-200 h-16">
        <span
          className="cursor-pointer text-2xl font-bold text-slate-900"
          onClick={() => {
            localStorage.clear();
            setCurrent?.(null);
            Promise.resolve().then(() => navigate("/dashboard"));
          }}
        >
          MockAPI
        </span>

        <button
          onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft
            className={`w-5 h-5 text-slate-900 transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Main */}
      <div className={`${isCollapsed ? "hidden" : "flex-1 overflow-hidden"}`}>
        <div className="h-full overflow-y-auto max-h-[calc(100vh-64px)] p-2">
          {/* Dropdown chọn workspace */}
          <div className="px-1 mb-3">
            <button
              onClick={() => setWsDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50 font-medium"
            >
              <span>{currentWorkspace?.name || "Select Workspace"}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  wsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {wsDropdownOpen && (
              <div className="mt-1 border border-slate-200 rounded-md bg-white shadow-sm overflow-y-auto">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-slate-100 flex justify-between items-center ${
                      String(current) === String(ws.id) ? "bg-slate-50 font-semibold" : ""
                    }`}
                  >
                    <span
                      onClick={() => {
                        handleSelectWorkspace(ws.id);
                        setWsDropdownOpen(false);
                      }}
                    >
                      {ws.name}
                    </span>

                    <MoreHorizontal
                      className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRightClickActionId((prev) => (prev === ws.id ? null : ws.id));
                        const rect = e.currentTarget.getBoundingClientRect();
                        const menuWidth = 180;
                        const menuHeight = 100;
                        let x = rect.right;
                        let y = rect.bottom;
                        if (x + menuWidth > window.innerWidth) x = rect.left - menuWidth;
                        if (y + menuHeight > window.innerHeight) y = rect.top - menuHeight;
                        setMenuPos({ x, y });
                      }}
                    />
                  </div>
                ))}

                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50 font-medium border rounded-md mt-2"
                  onClick={() => setOpenNewWs?.(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Workspace</span>
                </div>

              </div>
            )}

            {rightClickActionId && wsDropdownOpen && (
              <div
                ref={actionMenuRef}
                className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-44 overflow-hidden"
                style={{ top: menuPos.y, left: menuPos.x }}
              >
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-gray-50">Actions</div>

                <button
                  onClick={() => {
                    const ws = workspaces.find((w) => w.id === rightClickActionId);
                    onEditWorkspace?.(ws);
                    setRightClickActionId(null);
                    setWsDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
                >
                  <img src={editIcon} className="w-4 h-4" alt="edit" /> Edit
                </button>

                <button
                  onClick={() => {
                    onDeleteWorkspace?.(rightClickActionId);
                    setRightClickActionId(null);
                    setWsDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
                >
                  <img src={deleteIcon} className="w-4 h-4" alt="delete" /> Delete
                </button>
              </div>
            )}

          </div>

          {currentWorkspace && (
            <ul className="space-y-1">
              {projects
                .filter((p) => String(p.workspace_id) === String(currentWorkspace.id))
                .map((p) => {
                  const isEpOpen = readOpenEndpoints(p.id);
                  const activePj = String(projectId) === String(p.id);

                  return (
                    <li key={p.id}>
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer ${
                          activePj ? "bg-slate-100 font-semibold text-slate-900" : "hover:bg-slate-50"
                        }`}
                        onClick={() => navigate(`/dashboard/${p.id}`)}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: projectColorMap[p.id] || "#999" }}
                        />
                        {p.name}
                        <ChevronDown
                          onClick={(e) => {
                            e.stopPropagation();
                            if (setOpenEndpointsMap) {
                              setOpenEndpointsMap((prev) => ({ ...prev, [p.id]: !prev[p.id] }));
                            } else {
                              setLocalOpenEndpointsMap((prev) => ({ ...prev, [p.id]: !prev[p.id] }));
                            }
                          }}
                          className={`w-4 h-4 text-slate-400 transition-transform ${isEpOpen ? "rotate-0" : "-rotate-90"}`}
                        />
                      </div>

                      {isEpOpen && (
                        <div className="ml-6 mt-1 space-y-1 text-xs">
                          {folders
                            .filter((f) => String(f.project_id) === String(p.id))
                            .map((folder) => {
                              const folderEndpoints = endpoints.filter((ep) => String(ep.folder_id) === String(folder.id));
                              const isFolderOpen = (openFoldersMap ? openFoldersMap[folder.id] : localOpenFoldersMap[folder.id]) || false;

                              return (
                                <div key={folder.id}>
                                  <div
                                    className="flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-slate-200 bg-slate-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // toggle open/close
                                      if (setOpenFoldersMap) {
                                        setOpenFoldersMap((prev) => ({ ...prev, [folder.id]: !prev[folder.id] }));
                                      } else {
                                        setLocalOpenFoldersMap((prev) => ({ ...prev, [folder.id]: !prev[folder.id] }));
                                      }

                                      // điều hướng sang project kèm folderId
                                      navigate(`/projects/${p.id}?folderId=${folder.id}`);
                                    }}
                                    onContextMenu={(e) => handleFolderRightClick(e, folder.id)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${isFolderOpen ? "rotate-0" : "-rotate-90"}`} />
                                      <span className="text-sm font-medium text-slate-700">{folder.name}</span>
                                    </div>
                                    <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded-full border">{folderEndpoints.length}</span>
                                  </div>

                                  {isFolderOpen && (
                                    <div className="ml-3 mt-1 space-y-1 border-l-2 border-slate-300 pl-4">
                                      {folderEndpoints.length === 0 ? (
                                        <div className="text-gray-400 px-2 py-1 text-xs">No endpoints in this folder</div>
                                      ) : (
                                        folderEndpoints.map((ep) => {
                                          const activeEp = String(endpointId) === String(ep.id);
                                          return (
                                            <div
                                              key={ep.id}
                                              className={`px-3 py-2 rounded cursor-pointer text-sm ${activeEp ? "bg-slate-100 font-medium text-slate-900" : "hover:bg-slate-50 text-slate-600"}`}
                                              onClick={() => navigate(`/dashboard/${p.id}/endpoint/${ep.id}`)}
                                            >
                                              <span>{ep.name}</span>
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                          {/* New Folder Button */}
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50 font-medium border rounded-md mt-2 ml-3"
                            onClick={() => onAddFolder?.(p)}
                          >
                            <Plus className="w-4 h-4" />
                            <span>New Folder</span>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
          )}

          {rightClickFolderId && (
            <div
              ref={folderMenuRef}
              className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-36 overflow-hidden"
              style={{ top: menuPos.y, left: menuPos.x }}
            >
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-gray-50">Actions</div>

              <button
                onClick={() => {
                  const folder = folders.find((f) => f.id === rightClickFolderId);
                  onEditFolder?.(folder);
                  setRightClickFolderId(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
              >
                <img src={editIcon} className="w-4 h-4" alt="edit" /> Edit
              </button>

              <button
                onClick={() => {
                  onDeleteFolder?.(rightClickFolderId);
                  setRightClickFolderId(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
              >
                <img src={deleteIcon} className="w-4 h-4" alt="delete" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
