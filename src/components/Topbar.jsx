import avatar from "@/assets/light/user-avatar.svg";
import logoIconLight from "@/assets/light/logo.svg";
import logoIconDark from "@/assets/dark/logo.svg";
import editIcon from "@/assets/light/Edit Icon.svg";
import deleteIcon from "@/assets/light/Trash Icon.svg";
import logoutIconLight from "@/assets/light/logout.svg";
import logoutIconDark from "@/assets/dark/logout.svg";
import arrowIcon from "@/assets/light/arrow.svg";
import breadcrumbIcon from "@/assets/light/breadcrumb-arrow.svg";
import switchIconLight from "@/assets/light/switchTheme.svg";
import switchIconDark from "@/assets/dark/switchTheme.svg";
import openWorkspaceIconLight from "@/assets/light/triangle.svg";
import openWorkspaceIconDark from "@/assets/dark/triangle.svg";

import React, {useEffect, useState} from "react";
import {MoreHorizontal, Plus} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button.jsx";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import {getCurrentUser, logout} from "@/services/api.js";
import {useTheme} from "@/services/ThemeContext.jsx";
import "@/styles/components/topbar.css";
// import {API_ROOT} from "@/utils/constants.js";
// import Notifications from "../components/Notifications.jsx";
// import RealtimeClient from "@/services/centrifugoClient.js";

export default function Topbar({
                                 workspaces = [],
                                 current,
                                 setCurrent,
                                 onWorkspaceChange,
                                 onEditWorkspace,
                                 onDeleteWorkspace,
                                 setOpenNewWs,
                                 breadcrumb = [],
                               }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const { isDark, toggleTheme } = useTheme();
  const [openWorkspace, setOpenWorkspace] = useState(false);

  useEffect(() => {
    if (workspaces.length > 0 && !current) {
      const firstWsId = workspaces[0].id;
      setCurrent?.(firstWsId);
      onWorkspaceChange?.(firstWsId);
      localStorage.setItem("currentWorkspace", firstWsId);
    }
  }, [workspaces, current]);

  const handleSelectWorkspace = (wsId) => {
    if (setCurrent) setCurrent(wsId);
    if (onWorkspaceChange) onWorkspaceChange(wsId);
    localStorage.setItem("currentWorkspace", wsId);
    navigate("/dashboard");
  };

  const currentWorkspace = workspaces.find(
    (ws) => String(ws.id) === String(current)
  );

  const checkUserLogin = async () => {
    try {
      const res = await getCurrentUser();

      if (res?.data?.username) {
        setUsername(res.data.username); // lưu toàn bộ thông tin user
        // setUserId(res.data.user_id);
        console.log("Logged in user:", res.data.username);
        return true;
      } else {
        toast.error("Please log in to continue.");
        navigate("/login");
        return false;
      }
    } catch (err) {
      console.error("User not logged in:", err);
      toast.error("Session expired. Please log in again.");
      navigate("/login");
      return false;
    }
  };

  useEffect(() => {
    checkUserLogin();
  }, []);
  const switchIcon = isDark ? switchIconDark : switchIconLight;
  const logoIcon = isDark ? logoIconDark : logoIconLight;
  const openWorkspaceIcon = isDark ? openWorkspaceIconDark : openWorkspaceIconLight
  const logoutIcon = isDark ? logoutIconDark : logoutIconLight;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");

      localStorage.clear();
      sessionStorage.clear();

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="topbar shadow-none relative flex items-center justify-between px-8 py-2 -mt-8 h-16">
    {/* Logo + Workspace Selector */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center cursor-pointer select-none"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <img src={logoIcon} className="w-10 h-10" alt="Logo"/>
        </div>

        {/* Workspace Dropdown */}
        <DropdownMenu onOpenChange={setOpenWorkspace}>
          <DropdownMenuTrigger asChild>
            <button
              className="workspace-btn flex items-center justify-between px-3 py-2 rounded-md font-medium min-w-[180px]"
            >
              <span>{currentWorkspace?.name || "Select Workspace"}</span>
              <img
                src={openWorkspaceIcon}
                className={`w-4 h-4 transition-transform duration-200 ${openWorkspace ? "rotate-180" : "rotate-0"}`}
                alt="edit"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dropdown-menu-content w-56 max-h-120 overflow-y-auto">
            {workspaces?.map((ws) => (
              <div
                key={ws.id}
                className={`flex justify-between items-center px-2 py-1 ${
                  String(currentWorkspace?.id) === String(ws.id)
                    ? "active-workspace"
                    : ""
                }`}
              >
                <DropdownMenuItem
                  className="dropdown-menu-item flex-1 cursor-pointer"
                  onSelect={() => handleSelectWorkspace(ws.id)}
                >
                  {ws.name}
                </DropdownMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="action-btn p-1 rounded">
                      <MoreHorizontal className="w-4 h-4"/>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="dropdown-menu-content w-44">
                    <DropdownMenuItem onSelect={() => onEditWorkspace?.(ws)}>
                      <img src={editIcon} className="dropdown-menu-item w-4 h-4 mr-2 dark:brightness-0 dark:invert" alt="edit"/>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => onDeleteWorkspace?.(ws.id)}
                    >
                      <img
                        src={deleteIcon}
                        className="w-4 h-4 mr-2 dark:brightness-0 dark:invert"
                        alt="delete"
                      />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            <button
              className="workspace-btn flex items-center w-full gap-2 px-2 py-2 cursor-pointer"
              onClick={() => setOpenNewWs?.(true)}
            >
              <Plus className="w-4 h-4"/>
              <span>New workspace</span>
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="px-4 py-2 rounded-md inline-flex overflow-hidden">
          {/* Nút điều hướng trái/phải */}
          <div className="flex items-center gap-2 border-r-2 border-slate-500 pr-3">
            <button
              className="p-1 rounded hover:bg-slate-100 transition"
              onClick={() => window.history.back()}
            >
              <img src={arrowIcon} alt="Back" className="w-4 h-4 dark:invert"/>
            </button>
            <button
              className="p-1 rounded hover:bg-slate-100 transition"
              onClick={() => window.history.forward()}
            >
              <img src={arrowIcon} alt="Forward" className="w-4 h-4 rotate-180 dark:invert"/>
            </button>
          </div>

          {/* Icon breadcrumb */}
          <img
            src={breadcrumbIcon}
            alt="Breadcrumb icon"
            className="w-6 h-6 mx-3"
          />

          <Breadcrumb>
            <BreadcrumbList className="flex flex-nowrap items-center space-x-2 overflow-hidden">
              {breadcrumb.map((item, idx) => {
                const isLast = idx === breadcrumb.length - 1;

                // Gán tooltip theo cấp
                const tooltipLabels = ["Workspace", "Project", "Folder", "Endpoint"];
                const tooltipText = tooltipLabels[idx] || "Item";

                return (
                  <React.Fragment key={idx}>
                    <BreadcrumbItem
                      className={`whitespace-nowrap overflow-hidden min-w-0 ${
                        isLast ? "" : "truncate"
                      }`}
                      title={item.label}
                    >
                      <TooltipProvider delayDuration={100} >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {isLast || !item.href ? (
                              <BreadcrumbPage className="flex items-center gap-1 text-slate-900">
                                {item.label}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink
                                href={item.href}
                                onClick={() => {
                                  if (item.WORKSPACE_ID) {
                                    localStorage.setItem("currentWorkspace", item.WORKSPACE_ID);
                                  }
                                  if (item.folder_id) {
                                    let savedFolders;
                                    savedFolders = [];
                                    savedFolders.push(String(item.folder_id));
                                    localStorage.setItem("openFolders", JSON.stringify(savedFolders));
                                  }
                                }}
                                className="flex items-center gap-1 text-[#72767D]"
                              >
                                {item.label}
                              </BreadcrumbLink>
                            )}
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-white bg-black text-xs px-2 py-1 rounded">
                            {tooltipText}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </BreadcrumbItem>

                    {!isLast && (
                      <BreadcrumbSeparator>
                        <span>/</span>
                      </BreadcrumbSeparator>
                    )}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Search + Buttons */}
      <div className="flex items-center gap-4 ml-auto relative"></div>

      {/* User + Notification + Logout */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        {/*<Notifications*/}
        {/*  notifications={notifications}*/}
        {/*  onMarkRead={markAsRead}*/}
        {/*  onMarkAllRead={markAllRead}*/}
        {/*  onDeleteRead={deleteReadNotifications}*/}
        {/*/>*/}

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={toggleTheme}
        >
          <img src={switchIcon} alt="Switch Themes" className="w-5 h-5"/>
        </Button>

        {/* Avatar + Name */}
        <div className="flex items-center gap-2 pl-4 border-l-2 border-slate-500">
          <img
            src={avatar}
            alt="User avatar"
            className="w-8 h-8 rounded-full border"
          />
          <span className="font-medium text-sm text-slate-900">{username}</span>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="relative">
          <img src={logoutIcon} alt="Logout" className="w-4 h-4"/>
        </button>
      </div>

      {/*{userId > 0 && (*/}
      {/*  <RealtimeClient*/}
      {/*    userId={userId}*/}
      {/*    onNewNotification={async () => {*/}
      {/*      // console.log("🔔 New notification received via WebSocket.");*/}

      {/*      const valid = await checkUserLogin();*/}
      {/*      if (valid) {*/}
      {/*        await fetchNotifications();*/}
      {/*      } else {*/}
      {/*        console.warn("⚠️ Session expired.");*/}
      {/*      }*/}
      {/*    }}*/}
      {/*  />*/}
      {/*)}*/}
    </div>
  );
}
