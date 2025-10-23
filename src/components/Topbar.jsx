import React, { useEffect } from "react";

import logoIcon from "@/assets/logo.svg";
import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import editIcon from "@/assets/Edit Icon.svg";
import deleteIcon from "@/assets/Trash Icon.svg";
import logoutIcon from "@/assets/logout.svg";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { logout } from "@/services/api.js";
import avatar from "@/assets/user-avatar.svg";
import { Button } from "@/components/ui/button.jsx";
import NotificationsSheet from "../components/Notifications.jsx";

export default function Topbar({
  workspaces = [],
  current,
  setCurrent,
  onWorkspaceChange,
  onEditWorkspace,
  onDeleteWorkspace,
  setOpenNewWs,
  breadcrumb = [],
  username,
}) {
  const navigate = useNavigate();
  const userName = username;

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

  const mockNotifications = [
    {
      method: "GET",
      path: "/orders",
      status: "200 OK",
      is_stateful: true,
      request: "{'dish_id': 5, 'quantity': 3}",
      response: "{'message': 'order created successfully'}",
      time: "2 min ago",
      user: "hancontam",
      is_read: false,
    },
    {
      method: "POST",
      path: "/orders",
      status: "200 OK",
      is_stateful: true,
      request: "{'dish_id': 5, 'quantity': 3}",
      response: "{'message': 'order created successfully'}",
      time: "5 min ago",
      user: "hancontam",
      is_read: true,
    },
  ];

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
    <div className="relative flex items-center justify-between bg-white px-8 py-2 -mt-8 border-b border-slate-200 h-16">
      {/* Logo + Workspace Selector */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center cursor-pointer select-none"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <img src={logoIcon} className="w-10 h-10" alt="Logo" />
        </div>

        {/* Workspace Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-between px-3 py-2 rounded-md bg-stone-200 border border-slate-300 hover:bg-slate-50 font-medium min-w-[180px]">
              <span>{currentWorkspace?.name || "Select Workspace"}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-120 overflow-y-auto">
            {workspaces?.map((ws) => (
              <div
                key={ws.id}
                className={`flex justify-between items-center px-2 py-1 ${
                  String(currentWorkspace?.id) === String(ws.id)
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-slate-100 rounded">
                      <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-44">
                    <DropdownMenuItem onSelect={() => onEditWorkspace?.(ws)}>
                      <img src={editIcon} className="w-4 h-4 mr-2" alt="edit" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => onDeleteWorkspace?.(ws.id)}
                    >
                      <img
                        src={deleteIcon}
                        className="w-4 h-4 mr-2"
                        alt="delete"
                      />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
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

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="px-4 py-2 rounded-md inline-flex overflow-hidden">
          <Breadcrumb>
            <BreadcrumbList className="flex flex-nowrap items-center space-x-2 overflow-hidden">
              {breadcrumb.map((item, idx) => {
                const isLast = idx === breadcrumb.length - 1;
                return (
                  <React.Fragment key={idx}>
                    <BreadcrumbItem
                      className={`whitespace-nowrap overflow-hidden min-w-0 ${
                        isLast ? "" : "truncate"
                      }`}
                      title={item.label}
                    >
                      {isLast || !item.href ? (
                        <BreadcrumbPage className="font-bold text-slate-900">
                          {item.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={item.href}
                          onClick={() => {
                            if (item.WORKSPACE_ID) {
                              localStorage.setItem(
                                "currentWorkspace",
                                item.WORKSPACE_ID
                              );
                            }
                          }}
                          className="font-bold text-slate-400"
                        >
                          {item.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator className="font-medium text-slate-400" />
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
      <div className="flex items-center gap-4">
        {/* Notification */}
        <NotificationsSheet notifications={mockNotifications} />

        {/* Avatar + Name */}
        <div className="flex items-center gap-2">
          <img
            src={avatar}
            alt="User avatar"
            className="w-8 h-8 rounded-full border"
          />
          <span className="font-medium text-sm text-slate-900">{userName}</span>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="relative">
          <img src={logoutIcon} alt="Logout" className="w-4 h-4 mr-2" />
        </button>
      </div>
    </div>
  );
}
