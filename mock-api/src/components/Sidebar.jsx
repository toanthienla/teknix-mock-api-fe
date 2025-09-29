import React, {useState, useEffect, useRef} from "react";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import {ChevronDown, Plus, ChevronLeft, MoreHorizontal} from "lucide-react";
import editIcon from "@/assets/Edit Icon.svg";
import deleteIcon from "@/assets/Trash Icon.svg";
import settingIcon from "@/assets/Settings Icon.svg";
// import newicon from "@/assets/Add.svg";
import randomColor from "randomcolor";
import OpenIcon from "@/assets/opensidebar.svg"

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
                                  setOpenNewWs
                                }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {projectId, endpointId} = useParams();

  // Get folderId from URL query parameters
  const urlParams = new URLSearchParams(location.search);
  const selectedFolderId = urlParams.get('folderId');

  const [rightClickActionId, setRightClickActionId] = useState(null);
  const [rightClickFolderId, setRightClickFolderId] = useState(null);
  const [menuPos, setMenuPos] = useState({x: 0, y: 0});
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [lockedMode, setLockedMode] = useState(false); // ✅ chỉ hiển thị workspace active

  const actionMenuRef = useRef(null);
  const folderMenuRef = useRef(null);

  const [localOpenProjectsMap, setLocalOpenProjectsMap] = useState({});
  const [localOpenEndpointsMap, setLocalOpenEndpointsMap] = useState({});
  const [localOpenFoldersMap, setLocalOpenFoldersMap] = useState({});

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

  const handleFolderRightClick = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 140;
    const menuHeight = 80;
    const padding = 10;
    let x = e.clientX + 10;
    let y = e.clientY + 5;
    if (x + menuWidth > window.innerWidth) x = e.clientX - menuWidth - padding;
    if (y + menuHeight > window.innerHeight) y = e.clientY - menuHeight - padding;
    setMenuPos({x, y});
    setRightClickFolderId((prev) => (prev === folderId ? null : folderId));
  };

  const currentWorkspace = workspaces.find((ws) => String(ws.id) === String(current));

  // ✅ Nếu chưa chọn thì không gán workspace đầu tiên
  // => để null thì dropdown sẽ hiện "Select Workspace"
  if (!currentWorkspace && current) {
    setCurrent(null);
  }
  // ✅ Auto detect workspace từ URL (projectId / endpointId)
  useEffect(() => {
    if (projectId) {
      const project = projects.find((p) => String(p.id) === String(projectId));
      if (project) {
        const wsId = project.workspace_id;
        if (setCurrent) setCurrent(wsId);
        if (onWorkspaceChange) onWorkspaceChange(wsId);
        setLockedMode(true); // 👉 đảm bảo chỉ hiển thị workspace + project đang chọn
      }
    }
  }, [projectId, projects]);


  return (
    <div className="flex flex-col bg-white transition-all duration-300 w-64">
      {/* Header */}
      <div className="flex items-center justify-between px-4 border-b border-slate-200 h-16">
  {/* Logo MockAPI → click để reset */}
  <span
    className="cursor-pointer text-2xl font-bold text-slate-900"
    onClick={() => {
      localStorage.clear();
      setLockedMode(false);
      setCurrent?.(null);
      Promise.resolve().then(() => {
        navigate("/dashboard");
      });
    }}
  >
    MockAPI
  </span>

  {/* Đổi nút toggle từ ChevronLeft → hình opensidebar.svg */}
  <button
    onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
    className="p-1 rounded-full hover:bg-slate-100 transition-colors"
  >
    <img
      src={OpenIcon}
      alt="toggle sidebar"
      className={`w-6 h-6 transition-transform ${
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
    className={`px-3 py-2 cursor-pointer hover:bg-slate-100 flex justify-between items-center ${
      String(current) === String(ws.id) ? "bg-slate-50 font-semibold" : ""
    }`}
  >
    {/* Tên workspace */}
    <span
      onClick={() => {
        handleSelectWorkspace(ws.id);
        setWsDropdownOpen(false);
      }}
    >
      {ws.name}
    </span>

    {/* 3 chấm menu */}
    <MoreHorizontal
      className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation(); // tránh chọn workspace khi click 3 chấm
        setRightClickActionId((prev) => (prev === ws.id ? null : ws.id));

        // Vị trí menu
        const rect = e.target.getBoundingClientRect();
        setMenuPos({ x: rect.right, y: rect.bottom });
      }}
    />
  </div>
))}

              </div>
            )}
          </div>
{/* ✅ Context menu cho Workspace trong dropdown (locked mode) */}
{rightClickActionId && wsDropdownOpen && (
  <div
    ref={actionMenuRef}
    className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-44 overflow-hidden"
    style={{ top: menuPos.y, left: menuPos.x }}
  >
    <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-gray-50">
      Actions
    </div>
    <button
      onClick={() => {
        const ws = workspaces.find(w => w.id === rightClickActionId);
        onEditWorkspace?.(ws);
        setRightClickActionId(null);
      }}
      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
    >
      <img src={editIcon} className="w-4 h-4" alt="edit" /> Edit
    </button>

    <button
      onClick={() => {
        onDeleteWorkspace?.(rightClickActionId);
        setRightClickActionId(null);
      }}
      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
    >
      <img src={deleteIcon} className="w-4 h-4" alt="delete" /> Delete
    </button>
  </div>
)}

          {/* Sidebar khi lockedMode = true → show projects */}
          {lockedMode && currentWorkspace && (
            <ul className="space-y-1">
              {projects
                 .filter((p) => {
                  // Nếu có projectId, chỉ hiển thị project đang được chọn
                  if (projectId) {
                    return String(p.id) === String(projectId);
                  }
                  // Nếu không có projectId, hiển thị tất cả projects của workspace
                  return String(p.workspace_id) === String(currentWorkspace.id);
                })
                .map((p) => {
                  const isEpOpen = readOpenEndpoints(p.id);
                  const projectEndpoints = endpoints.filter(
                    (ep) => String(ep.project_id) === String(p.id)
                  );
                  const activePj = String(projectId) === String(p.id);
                  // Chỉ đậm project khi không có folder được chọn
                  const shouldBoldProject = activePj && !selectedFolderId;

                  return (
                    <li key={p.id}>
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer ${
                          shouldBoldProject
                            ? "bg-slate-100 font-semibold text-slate-900"
                            : "hover:bg-slate-50 text-slate-600"
                        }`}
                        onClick={() => navigate(`/dashboard/${p.id}`)}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{backgroundColor: projectColorMap[p.id] || "#999"}}
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

                      {/* Folders and Endpoints */}
                      {isEpOpen && (
                        <div className="ml-6 mt-1 space-y-1 text-xs">
                          {(() => {
                            // Get folders for this project
                            const projectFolders = folders.filter(f => String(f.project_id) === String(p.id));
                            console.log('Debug - Project:', p.id, 'Folders:', projectFolders, 'All folders:', folders);
                            // Lấy toàn bộ endpoints thuộc project này (qua folder)
                            const projectEndpoints = endpoints.filter(ep =>
                              projectFolders.some(f => String(f.id) === String(ep.folder_id))
                            );
                            // Get endpoints without folder_id (ungrouped endpoints)
                            const ungroupedEndpoints = projectEndpoints.filter(ep => !ep.folder_id);
                            // Get endpoints with folder_id
                            const groupedEndpoints = projectEndpoints.filter(ep => ep.folder_id);

                            const hasContent = projectFolders.length > 0 || ungroupedEndpoints.length > 0;

                            if (!hasContent) {
                              return (
                                <div className="text-gray-500">
                                  This project has no folders yet.
                                </div>
                              );
                            }

                            return (
                              <>
                                {/* Render folders with their endpoints */}
                                {projectFolders.map((folder) => {
                                  const folderEndpoints = groupedEndpoints.filter(ep => String(ep.folder_id) === String(folder.id));
                                  const isFolderOpen = (openFoldersMap ? openFoldersMap[folder.id] : localOpenFoldersMap[folder.id]) || false;

                                  return (
                                    <div key={folder.id}>
                                      {/* Folder header */}
                                      <div
                                        className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer ${
                                          String(selectedFolderId) === String(folder.id) 
                                            ? "bg-slate-200 hover:bg-slate-300  font-semibold" 
                                            : "bg-white hover:bg-gray-50  border-gray-200"
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Navigate to folder page when clicking folder
                                          navigate(`/dashboard/${p.id}?folderId=${folder.id}`);
                                        }}
                                        onContextMenu={(e) => handleFolderRightClick(e, folder.id)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <ChevronDown
                                            className={`h-3 w-3 text-slate-500 transition-transform ${
                                              isFolderOpen ? "rotate-0" : "-rotate-90"
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Toggle folder open/close
                                              if (setOpenFoldersMap) {
                                                setOpenFoldersMap((prev) => ({...prev, [folder.id]: !prev[folder.id]}));
                                              } else {
                                                setLocalOpenFoldersMap((prev) => ({
                                                  ...prev,
                                                  [folder.id]: !prev[folder.id]
                                                }));
                                              }
                                            }}
                                          />
                                          <span className={`text-sm ${
                                            String(selectedFolderId) === String(folder.id) 
                                              ? "font-semibold text-slate-900" 
                                              : "font-medium text-slate-700"
                                          }`}>{folder.name}</span>
                                        </div>
                                        <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded-full border">
                                          {folderEndpoints.length}
                                        </span>
                                      </div>

                                      {/* Folder endpoints */}
                                      {isFolderOpen && (
                                        <div className="ml-3 mt-1 space-y-1 border-l-2 border-slate-300 pl-4">
                                          {folderEndpoints.length === 0 ? (
                                            <div className="text-gray-400 px-2 py-1 text-xs">
                                              No endpoints in this folder
                                            </div>
                                          ) : (
                                            folderEndpoints.map((ep) => {
                                              const activeEp = String(endpointId) === String(ep.id);
                                              return (
                                                <div
                                                  key={ep.id}
                                                  className={`px-3 py-2 rounded cursor-pointer text-sm ${
                                                    activeEp
                                                      ? "bg-slate-100 font-medium text-slate-900"
                                                      : "hover:bg-slate-50 text-slate-600"
                                                  }`}
                                                  onClick={() =>
                                                    navigate(`/dashboard/${p.id}/endpoint/${ep.id}`)
                                                  }
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

                                {/* Render ungrouped endpoints directly */}
                                {ungroupedEndpoints.map((ep) => {
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
                                      <img src={settingIcon} className="w-5 h-5" alt="ep"/>
                                      {ep.name}
                                    </div>
                                  );
                                })}
                              </>
                            );
                          })()}

                          {/* New folder button cho mọi project khi expand */}
                          <div
                            className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 text-slate-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onAddFolder) {
                                // Set projectId context cho folder creation
                                onAddFolder(p.id);
                              }
                            }}
                          >
                            <Plus className="w-4 h-4"/>
                            <span>New folder...</span>
                          </div>
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
                              // Chỉ đậm project khi không có folder được chọn
                              const shouldBoldProject = activePj && !selectedFolderId;

                              return (
                                <div key={p.id}>
                                  <div
                                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                                      shouldBoldProject
                                        ? "bg-slate-100 font-semibold text-slate-900"
                                        : "hover:bg-slate-50 text-slate-600"
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

                                  {/* Folders and Endpoints */}
                                  {isEpOpen && (
                                    <div className="ml-6 mt-1 space-y-1 text-xs">
                                      {(() => {
                                        // Get folders for this project
                                        const projectFolders = folders.filter(f => String(f.project_id) === String(p.id));
                                        console.log('Debug - Workspace Project:', p.id, 'Folders:', projectFolders);
                                        // Get endpoints without folder_id (ungrouped endpoints)
                                        const ungroupedEndpoints = projectEndpoints.filter(ep => !ep.folder_id);
                                        // Get endpoints with folder_id
                                        const groupedEndpoints = projectEndpoints.filter(ep => ep.folder_id);

                                        const hasContent = projectFolders.length > 0 || ungroupedEndpoints.length > 0;

                                        if (!hasContent) {
                                          return (
                                            <div className="text-gray-500">
                                              This project has no endpoints yet.
                                            </div>
                                          );
                                        }

                                        return (
                                          <>
                                            {/* Render folders with their endpoints */}
                                            {projectFolders.map((folder) => {
                                              const folderEndpoints = groupedEndpoints.filter(ep => String(ep.folder_id) === String(folder.id));
                                              const isFolderOpen = (openFoldersMap ? openFoldersMap[folder.id] : localOpenFoldersMap[folder.id]) || false;

                                              return (
                                                <div key={folder.id}>
                                                  {/* Folder header */}
                                                  <div
                                                   className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer ${
                                                      String(selectedFolderId) === String(folder.id) 
                                                        ? "bg-slate-200 hover:bg-slate-300 font-semibold" 
                                                        : "bg-white hover:bg-gray-50"
                                                    }`}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      // Navigate to folder page when clicking folder
                                                      navigate(`/dashboard/${p.id}?folderId=${folder.id}`);
                                                    }}
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <ChevronDown
                                                        className={`h-3 w-3 text-slate-500 transition-transform ${
                                                          isFolderOpen ? "rotate-0" : "-rotate-90"
                                                        }`}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          // Toggle folder open/close
                                                          if (setOpenFoldersMap) {
                                                            setOpenFoldersMap((prev) => ({
                                                              ...prev,
                                                              [folder.id]: !prev[folder.id]
                                                            }));
                                                          } else {
                                                            setLocalOpenFoldersMap((prev) => ({
                                                              ...prev,
                                                              [folder.id]: !prev[folder.id]
                                                            }));
                                                          }
                                                        }}
                                                      />
                                                      <span className={`text-sm ${
                                                        String(selectedFolderId) === String(folder.id) 
                                                          ? "font-semibold text-slate-900" 
                                                          : "font-medium text-slate-700"
                                                      }`}>{folder.name}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded-full border">
                                                      {folderEndpoints.length}
                                                    </span>
                                                  </div>

                                                  {/* Folder endpoints */}
                                                  {isFolderOpen && (
                                                    <div className="ml-3 mt-1 space-y-1 border-l-2 border-slate-300 pl-4">
                                                      {folderEndpoints.length === 0 ? (
                                                        <div className="text-gray-400 px-2 py-1 text-xs">
                                                          No endpoints in this folder
                                                        </div>
                                                      ) : (
                                                        folderEndpoints.map((ep) => {
                                                          const activeEp = String(endpointId) === String(ep.id);
                                                          return (
                                                            <div
                                                              key={ep.id}
                                                              className={`px-3 py-2 rounded cursor-pointer text-sm ${
                                                                activeEp
                                                                  ? "bg-slate-100 font-medium text-slate-900"
                                                                  : "hover:bg-slate-50 text-slate-600"
                                                              }`}
                                                              onClick={() =>
                                                                navigate(`/dashboard/${p.id}/endpoint/${ep.id}`)
                                                              }
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

                                            {/* Render ungrouped endpoints directly */}
                                            {ungroupedEndpoints.map((ep) => {
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
                                                  <img src={settingIcon} className="w-5 h-5" alt="ep"/>
                                                  {ep.name}
                                                </div>
                                              );
                                            })}

                                            {/* New folder button cho mọi project khi expand */}
                                            <div
                                              className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 text-slate-600"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (onAddFolder) {
                                                  // Set projectId context cho folder creation
                                                  onAddFolder(p.id);
                                                }
                                              }}
                                            >
                                              <Plus className="w-4 h-4"/>
                                              <span>New folder...</span>
                                            </div>
                                          </>
                                        );
                                      })()}
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
                          style={{top: menuPos.y, left: menuPos.x}}
                        >
                          <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-gray-50">
                            Actions
                          </div>
                          <button
                            onClick={() => onEditWorkspace && onEditWorkspace(ws)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
                          >
                            <img src={editIcon} className="w-4 h-4" alt="edit"/> Edit
                          </button>

                          <button
                            onClick={() => onDeleteWorkspace && onDeleteWorkspace(ws.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
                          >
                            <img src={deleteIcon} className="w-4 h-4" alt="delete"/> Delete
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
                <Plus className="w-4 h-4"/>
                <span>New Workspace</span>
              </div>
            </div>
          )}

        </div>

        {/* Folder Context Menu */}
        {rightClickFolderId && (
          <div
            ref={folderMenuRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-36 overflow-hidden"
            style={{top: menuPos.y, left: menuPos.x}}
          >
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-gray-50">
              Actions
            </div>
            <button
              onClick={() => {
                if (onEditFolder) {
                  const folder = folders.find(f => f.id === rightClickFolderId);
                  onEditFolder(folder);
                }
                setRightClickFolderId(null);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
            >
              <img src={editIcon} className="w-4 h-4" alt="edit"/> Edit
            </button>

            <button
              onClick={() => {
                if (onDeleteFolder) {
                  onDeleteFolder(rightClickFolderId);
                }
                setRightClickFolderId(null);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100"
            >
              <img src={deleteIcon} className="w-4 h-4" alt="delete"/> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
