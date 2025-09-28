import React, {useState, useEffect, useRef} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ChevronDown, Plus, ChevronLeft, MoreHorizontal} from "lucide-react";
import editIcon from "@/assets/Edit Icon.svg";
import deleteIcon from "@/assets/Trash Icon.svg";
import folderIcon from "@/assets/folder-icon.svg";
import settingIcon from "@/assets/Settings Icon.svg";
import newicon from "@/assets/Add.svg";
import randomColor from "randomcolor";

export default function Sidebar({
  workspaces = [],
  current,
  setCurrent,
  onWorkspaceChange,
  endpoints = [],
  onEditWorkspace,
  onDeleteWorkspace,
  onAddProject,
  projects = [],
  openProjectsMap,
  setOpenProjectsMap,
  openEndpointsMap,
  setOpenEndpointsMap,
  isCollapsed,
  setIsCollapsed,
  setOpenNewWs
}) {
  const navigate = useNavigate();
  const {projectId, endpointId} = useParams();

  const [rightClickActionId, setRightClickActionId] = useState(null);
  const [menuPos, setMenuPos] = useState({x: 0, y: 0});
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [lockedMode, setLockedMode] = useState(false); // ✅ chỉ hiển thị workspace active

  const actionMenuRef = useRef(null);

  const [localOpenProjectsMap, setLocalOpenProjectsMap] = useState({});
  const [localOpenEndpointsMap, setLocalOpenEndpointsMap] = useState({});

  // map projectId -> randomColor
  const [projectColorMap, setProjectColorMap] = useState({});

  useEffect(() => {
    const newMap = {};
    projects.forEach((p) => {
      newMap[p.id] =
        projectColorMap[p.id] ||
        randomColor({
          luminosity: "bright",
          seed: p.id // đảm bảo cùng id thì màu giữ nguyên
        });
    });
    setProjectColorMap(newMap);
  }, [projects]);

  const readOpenProjects = (wsId) =>
    (openProjectsMap ? openProjectsMap[wsId] : localOpenProjectsMap[wsId]) || false;
  const readOpenEndpoints = (pId) =>
    (openEndpointsMap ? openEndpointsMap[pId] : localOpenEndpointsMap[pId]) || false;

  const toggleProjects = (wsId) => {
    if (setOpenProjectsMap) {
      setOpenProjectsMap((prev) => ({...prev, [wsId]: !prev[wsId]}));
    } else {
      setLocalOpenProjectsMap((prev) => ({...prev, [wsId]: !prev[wsId]}));
    }
  };

  const toggleEndpoints = (pId) => {
    if (setOpenEndpointsMap) {
      setOpenEndpointsMap((prev) => ({...prev, [pId]: !prev[pId]}));
    } else {
      setLocalOpenEndpointsMap((prev) => ({...prev, [pId]: !prev[pId]}));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setRightClickActionId(null);
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
    setLockedMode(true); // ✅ khi chọn → chỉ show workspace active
  };

  const handleRightClick = (e, wsId) => {
    e.preventDefault();
    const menuWidth = 200;
    const menuHeight = 140;
    const padding = 10;
    let x = e.clientX + 10;
    let y = e.clientY + 5;
    if (x + menuWidth > window.innerWidth) x = e.clientX - menuWidth - padding;
    if (y + menuHeight > window.innerHeight) y = e.clientY - menuHeight - padding;
    setMenuPos({x, y});
    setRightClickActionId((prev) => (prev === wsId ? null : wsId));
  };

  const currentWorkspace = workspaces.find((ws) => String(ws.id) === String(current));

  return (
    <div className="flex flex-col bg-white transition-all duration-300 w-64">
      {/* Header */}
      <div className="flex items-center justify-between px-4 border-b border-slate-200 h-16">
        <span
          className="cursor-pointer text-2xl font-bold text-slate-900"
          onClick={() => {
            setLockedMode(false); // ✅ quay lại hiển thị tất cả workspace
            navigate("/dashboard");
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
              <div className="mt-1 border border-slate-200 rounded-md bg-white shadow-sm max-h-60 overflow-y-auto">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-slate-100 ${
                      String(current) === String(ws.id) ? "bg-slate-50 font-semibold" : ""
                    }`}
                    onClick={() => {
                      handleSelectWorkspace(ws.id);
                      setWsDropdownOpen(false);
                    }}
                  >
                    {ws.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar khi lockedMode = true → show projects */}
          {lockedMode && currentWorkspace && (
            <ul className="space-y-1">
              {projects
                .filter((p) => String(p.workspace_id) === String(currentWorkspace.id))
                .map((p) => {
                  const isEpOpen = readOpenEndpoints(p.id);
                  const projectEndpoints = endpoints.filter(
                    (ep) => String(ep.project_id) === String(p.id)
                  );
                  const activePj = String(projectId) === String(p.id);

                  return (
                    <li key={p.id}>
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer ${
                          activePj
                            ? "bg-slate-100 font-semibold text-slate-900"
                            : "hover:bg-slate-50"
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
                            toggleEndpoints(p.id);
                          }}
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            isEpOpen ? "rotate-0" : "-rotate-90"
                          }`}
                        />
                      </div>

                      {/* Endpoints */}
                      {isEpOpen && (
                        <div className="ml-6 mt-1 space-y-1 text-xs">
                          {projectEndpoints.length === 0 ? (
                            <div className="text-gray-500">
                              This project has no endpoints yet.
                            </div>
                          ) : (
                            projectEndpoints.map((ep) => {
                              const activeEp = String(endpointId) === String(ep.id);
                              return (
                                <div
                                  key={ep.id}
                                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                                    activeEp
                                      ? "bg-slate-100 font-semibold text-slate-900"
                                      : "hover:bg-slate-100"
                                  }`}
                                  onClick={() =>
                                    navigate(`/dashboard/${p.id}/endpoint/${ep.id}`)
                                  }
                                >
                                  <img src={settingIcon} className="w-5 h-5" alt="ep" />
                                  {ep.name}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
          )}

          {/* Sidebar workspace list khi chưa locked */}
{!lockedMode && (
  <div className="border border-slate-200 rounded-md bg-white shadow-sm overflow-hidden">
    {/* Header */}
    <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-gray-50 border-b">
      WORKSPACES
    </div>

    <ul className="space-y-1">
      {workspaces.map((ws) => {
        const activeWs = String(current) === String(ws.id);
        const isOpen = readOpenProjects(ws.id);
        const wsProjects = projects.filter(
          (p) => String(p.workspace_id) === String(ws.id)
        );
        const isActionOpen = rightClickActionId === ws.id;

        return (
          <li key={ws.id} className="group relative">
            <div
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 cursor-pointer ${
                activeWs
                  ? "bg-slate-100 font-semibold text-slate-900"
                  : "hover:bg-slate-50"
              }`}
              onClick={() => handleSelectWorkspace(ws.id)}
              onContextMenu={(e) => handleRightClick(e, ws.id)}
            >
              <span>{ws.name}</span>
              {activeWs && (
  <MoreHorizontal
    onClick={(e) => {
      e.stopPropagation();
      toggleProjects(ws.id);
    }}
    className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer"
  />
)}

            </div>

            {/* Projects giữ nguyên như cũ */}
            {activeWs && isOpen && (
              <div className="ml-8 mt-1 space-y-1 text-sm text-slate-600">
                {wsProjects.length === 0 ? (
                  <div className="text-xs text-gray-500">
                    This workspace has no projects yet.
                  </div>
                ) : (
                  wsProjects.map((p) => {
                    const isEpOpen = readOpenEndpoints(p.id);
                    const projectEndpoints = endpoints.filter(
                      (ep) => String(ep.project_id) === String(p.id)
                    );
                    const activePj = String(projectId) === String(p.id);

                    return (
                      <div key={p.id}>
                        <div
                          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                            activePj
                              ? "bg-slate-100 font-semibold text-slate-900"
                              : "hover:bg-slate-50"
                          }`}
                          onClick={() => navigate(`/dashboard/${p.id}`)}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: projectColorMap[p.id] || "#999",
                            }}
                          />
                          {p.name}
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
                          <div className="ml-6 mt-1 space-y-1 text-xs">
                            {projectEndpoints.length === 0 ? (
                              <div className="text-gray-500">
                                This project has no endpoints yet.
                              </div>
                            ) : (
                              projectEndpoints.map((ep) => {
                                const activeEp = String(endpointId) === String(ep.id);
                                return (
                                  <div
                                    key={ep.id}
                                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                                      activeEp
                                        ? "bg-slate-100 font-semibold text-slate-900"
                                        : "hover:bg-slate-100"
                                    }`}
                                    onClick={() =>
                                      navigate(`/dashboard/${p.id}/endpoint/${ep.id}`)
                                    }
                                  >
                                    <img
                                      src={settingIcon}
                                      className="w-5 h-5"
                                      alt="ep"
                                    />
                                    {ep.name}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Context menu giữ nguyên */}
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
                  onClick={() => onEditWorkspace && onEditWorkspace(ws)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
                >
                  <img src={editIcon} className="w-4 h-4" alt="edit" /> Edit
                </button>
                
                <button
                  onClick={() => onDeleteWorkspace && onDeleteWorkspace(ws.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
                >
                  <img src={deleteIcon} className="w-4 h-4" alt="delete" /> Delete
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>

    {/* New workspace btn */}
    <div
      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50 font-medium border-t"
      onClick={() => setOpenNewWs(true)}
    >
      <Plus className="w-4 h-4" />
      <span>New Workspace</span>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
}
