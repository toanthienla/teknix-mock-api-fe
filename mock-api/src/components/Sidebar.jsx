import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Plus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge";
import editIcon from "@/assets/Edit Icon.svg";
import deleteIcon from "@/assets/Trash Icon.svg";
import randomColor from "randomcolor";
import OpenIcon from "@/assets/opensidebar.svg";
import statefulIcon from "@/assets/stateful.svg";

export default function Sidebar({
  workspaces = [],
  current,
  setCurrent,
  onWorkspaceChange,
  endpoints = [],
  folders = [],
  onEditWorkspace,
  onDeleteWorkspace,
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
  const { projectId, endpointId, folderId } = useParams();

  const [projectColorMap, setProjectColorMap] = useState({});

  useEffect(() => {
    if (workspaces.length > 0 && !current) {
      const firstWsId = workspaces[0].id;
      setCurrent?.(firstWsId);
      onWorkspaceChange?.(firstWsId);
      localStorage.setItem("currentWorkspace", firstWsId);
    }
  }, [workspaces, current]);

  useEffect(() => {
    const newMap = {};
    projects.forEach((p) => {
      newMap[p.id] =
        projectColorMap[p.id] ||
        randomColor({ luminosity: "light", seed: p.id }); // Đồng bộ với ProjectCard
    });
    setProjectColorMap(newMap);

    // Reset openProjectsMap khi projects thay đổi, chỉ giữ project đang chọn (nếu có)
    setOpenProjectsMap((prev) => {
      const newOpenProjectsMap = {};
      if (projectId) {
        const project = projects.find((p) => String(p.id) === String(projectId));
        if (project) {
          newOpenProjectsMap[project.workspace_id] = true;
        }
      }
      return newOpenProjectsMap;
    });
  }, [projects, projectId]);

  const readOpenProjects = (wsId) => (openProjectsMap ? openProjectsMap[wsId] : false);

  const readOpenEndpoints = (pId) => (openEndpointsMap ? openEndpointsMap[pId] : false);

  const readOpenFolders = (fId) => (openFoldersMap ? openFoldersMap[fId] : false);

  const toggleProjects = (wsId) => {
    setOpenProjectsMap((prev) => ({ ...prev, [wsId]: !prev[wsId] }));
  };

  // const toggleEndpoints = (pId) => {
  //   setOpenEndpointsMap((prev) => ({ ...prev, [pId]: !prev[pId] }));
  // };

  const toggleFolders = (fId) => {
    setOpenFoldersMap((prev) => {
      const newMap = {};
      Object.keys(prev).forEach((key) => {
        newMap[key] = false;
      });
      newMap[fId] = !prev[fId];
      return newMap;
    });
  };

  const handleSelectWorkspace = (wsId) => {
    if (setCurrent) setCurrent(wsId);
    if (onWorkspaceChange) onWorkspaceChange(wsId);
    localStorage.setItem("currentWorkspace", wsId);
    setOpenProjectsMap({}); // Reset openProjectsMap để đóng tất cả projects
    setOpenEndpointsMap({}); // Reset openEndpointsMap để đóng tất cả endpoints
    setOpenFoldersMap({}); // Reset openFoldersMap để đóng tất cả folders
    navigate("/dashboard");
  };

  const currentWorkspace = workspaces.find(
    (ws) => String(ws.id) === String(current)
  );

  useEffect(() => {
    if (projectId) {
      const project = projects.find((p) => String(p.id) === String(projectId));
      if (project) {
        const wsId = project.workspace_id;
        if (setCurrent) setCurrent(wsId);
        if (onWorkspaceChange) onWorkspaceChange(wsId);
        setOpenProjectsMap((prev) => ({ ...prev, [wsId]: true }));
        if (folderId || endpointId) {
          setOpenEndpointsMap((prev) => ({ ...prev, [projectId]: true }));
          if (folderId) {
            setOpenFoldersMap((prev) => ({ ...prev, [folderId]: true }));
          }
        }
      }
    }
  }, [projectId, folderId, endpointId, projects]);

  const folderEndpointsMap = useMemo(() => {
    const map = {};
    folders.forEach((f) => {
      const eps = endpoints.filter((ep) => String(ep.folder_id) === String(f.id));
      map[f.id] = eps;
    });
    return map;
  }, [folders, endpoints]);

  const projectHasContent = (p) => {
    const projectFolders = folders.filter((f) => String(f.project_id) === String(p.id));
    const hasFolder = projectFolders.length > 0;
    const endpointsInProjectFolders = endpoints.some((ep) =>
      projectFolders.some((f) => String(f.id) === String(ep.folder_id))
    );
    return hasFolder || endpointsInProjectFolders;
  };

  return (
    <div className="flex flex-col bg-white transition-all duration-300 w-64 h-screen justify-between">
      {/* Header */}
      <div className="flex items-center justify-between px-4 border-b border-slate-200 h-16">
        <span
          className="cursor-pointer text-2xl font-bold text-slate-900"
          onClick={() => {
            localStorage.clear();
            if (workspaces.length > 0) {
              const firstWsId = workspaces[0].id;
              setCurrent?.(firstWsId);
              onWorkspaceChange?.(firstWsId);
              localStorage.setItem("currentWorkspace", firstWsId);
            }
            setOpenProjectsMap({}); // Reset openProjectsMap để đóng tất cả projects
            setOpenEndpointsMap({}); // Reset openEndpointsMap để đóng tất cả endpoints
            setOpenFoldersMap({}); // Reset openFoldersMap để đóng tất cả folders
            navigate("/dashboard");
          }}
        >
          MockAPI
        </span>
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

      {/* Content */}
      <div className={`${isCollapsed ? "hidden" : "flex-1 overflow-hidden"}`}>
        <div className="h-full overflow-y-auto max-h-[calc(100vh-64px)] p-2">
          {/* Workspace Selector */}
          <div className="px-1 mb-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50 font-medium">
                  <span>{currentWorkspace?.name || "Select Workspace"}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500 transition-transform" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className={`flex justify-between items-center px-2 py-1 ${
                      String(current) === String(ws.id)
                        ? "bg-slate-50 font-semibold"
                        : ""
                    }`}
                  >
                    <DropdownMenuItem
                      className="flex-1 cursor-pointer"
                      onSelect={() => handleSelectWorkspace(ws.id)}
                    >
                      {ws.name}
                    </DropdownMenuItem>

                    {/* Workspace Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-slate-100 rounded">
                          <MoreHorizontal className="w-4 h-4 text-slate-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-44">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-gray-50">
                          Actions
                        </div>
                        <DropdownMenuItem
                          className="hover:text-black font-semibold"
                          onSelect={() => onEditWorkspace?.(ws)}
                        >
                          <img src={editIcon} className="w-4 h-4 mr-2" alt="edit" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:text-black font-semibold"
                          onSelect={() => onDeleteWorkspace?.(ws.id)}
                        >
                          <img src={deleteIcon} className="w-4 h-4 mr-2" alt="delete" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}

                {/* Add new workspace */}
                <div
                  className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-slate-100 text-slate-600"
                  onClick={() => setOpenNewWs?.(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>New workspace</span>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Projects & Folders */}
          {currentWorkspace && (
            <ul className="space-y-1">
              {projects
                .filter((p) =>
                  projectId ? String(p.id) === String(projectId) : String(p.workspace_id) === String(currentWorkspace.id)
                )
                .map((p) => {
                  const isProjectOpen = readOpenProjects(p.workspace_id);
                  const isEpOpen = readOpenEndpoints(p.id);
                  const activePj = String(projectId) === String(p.id);
                  const shouldBoldProject = activePj && !folderId && !endpointId;

                  return (
                    <li key={p.id}>
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer ${
                          shouldBoldProject
                            ? "bg-slate-100 font-semibold text-slate-900"
                            : "hover:bg-slate-50 text-slate-600"
                        }`}
                        onClick={() => {
                          navigate(`/dashboard/${p.id}`);
                          toggleProjects(p.workspace_id);
                        }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: projectColorMap[p.id] || "#999" }}
                        />
                        {p.name}
                      </div>

                      {/* Folders */}
                      {isProjectOpen && (
                        <div className="ml-6 mt-1 space-y-1 text-xs">
                          {(() => {
                            const projectFolders = folders.filter(
                              (f) => String(f.project_id) === String(p.id)
                            );
                            const hasContent = projectHasContent(p);

                            if (!hasContent) {
                              return (
                                <div className="text-gray-500">
                                  This project has no folders yet.
                                </div>
                              );
                            }

                            return (
                              <>
                                {projectFolders.map((folder) => {
                                  const folderEndpoints = folderEndpointsMap[folder.id] || [];
                                  const isFolderOpen = readOpenFolders(folder.id);
                                  const activeFolder = String(folderId) === String(folder.id);

                                  return (
                                    <div key={folder.id}>
                                      {/* Folder with Context Menu */}
                                      <ContextMenu>
                                        <ContextMenuTrigger asChild>
                                          <div
                                            className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer ${
                                              activeFolder
                                                ? "bg-slate-200 hover:bg-slate-300 font-semibold"
                                                : "bg-white hover:bg-gray-50 border-gray-200"
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigate(`/dashboard/${p.id}/folder/${folder.id}`);
                                              toggleFolders(folder.id);
                                            }}
                                          >
                                            <div className="flex items-center justify-between w-full">
                                              <div className="flex items-center gap-2">
                                                <span
                                                  className={`text-sm ${
                                                    activeFolder
                                                      ? "font-semibold text-slate-900"
                                                      : "font-medium text-slate-700"
                                                  }`}
                                                >
                                                  {folder.name}
                                                </span>
                                              </div>
                                              {folderEndpoints.length > 0 && (
                                                <Badge
                                                  className={
                                                    activeFolder
                                                      ? "text-xs px-2 py-0.75 rounded-full text-black border-black bg-slate-200 hover:bg-slate-200"
                                                      : "text-xs px-2 py-0.75 rounded-full bg-slate-200 text-black hover:bg-slate-200"
                                                  }
                                                >
                                                  {folderEndpoints.length}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </ContextMenuTrigger>

                                        {/* Context Menu Content */}
                                        <ContextMenuContent className="w-44">
                                          <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-gray-50">
                                            Actions
                                          </div>
                                          <ContextMenuItem onSelect={() => onEditFolder?.(folder)}>
                                            <img src={editIcon} className="w-4 h-4 mr-2" alt="edit" /> Edit
                                          </ContextMenuItem>
                                          <ContextMenuItem onSelect={() => onDeleteFolder?.(folder.id)}>
                                            <img src={deleteIcon} className="w-4 h-4 mr-2" alt="delete" /> Delete
                                          </ContextMenuItem>
                                        </ContextMenuContent>
                                      </ContextMenu>

                                      {/* Endpoints */}
                                      {isFolderOpen && (
                                        <div className="ml-3 mt-1 space-y-1 border-l-2 border-slate-800 pl-2">
                                          {folderEndpoints.length === 0 ? (
                                            <div className="text-gray-400 px-2 py-1 text-xs">
                                              No endpoints in this folder.
                                            </div>
                                          ) : (
                                            folderEndpoints.map((ep) => {
                                              const activeEp = String(endpointId) === String(ep.id);
                                              return (
                                                <div
                                                  key={ep.id}
                                                  className={`relative flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm ${
                                                    activeEp
                                                      ? "bg-slate-100 font-medium text-slate-900"
                                                      : "hover:bg-slate-50 text-slate-600"
                                                  }`}
                                                  onClick={() => navigate(`/dashboard/${p.id}/endpoint/${ep.id}`)}
                                                >
                                                  <div
                                                    className={`${
                                                      activeEp
                                                        ? "absolute left-[-12px] w-[6px] h-[6px] rounded-full border bg-slate-800 border-slate-800"
                                                        : ""
                                                    }`}
                                                    style={{ top: "50%", transform: "translateY(-50%)" }}
                                                  ></div>
                                                  {ep.is_stateful && (
                                                    <img src={statefulIcon} className="w-4 h-4" alt="stateful" />
                                                  )}
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
                                <div
                                  className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-slate-100 text-slate-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onAddFolder) onAddFolder(p.id);
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>New folder...</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>

      {/* Phần dưới: User Info luôn cố định */}
      <div className="border border-slate-300 mx-2.5 my-5 rounded-lg px-4 py-3 flex items-center gap-3 bg-white">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-shrink-0">
            <Avatar className="w-9 h-9">
              <AvatarImage src="/src/assets/user-avatar.svg" alt="User Avatar" />
              <AvatarFallback>HC</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 text-sm">hancontam</span>
            <span className="text-xs text-slate-500">hancontam@gmail.com</span>
          </div>
          <div>
            <ChevronDown className="w-4 h-4 text-slate-500"/>
          </div>
        </div>
      </div>
    </div>
  );
}