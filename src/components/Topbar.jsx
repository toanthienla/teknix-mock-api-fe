import avatar from "@/assets/light/user-avatar.svg";
import logoIconLight from "@/assets/light/logo.svg";
import logoIconDark from "@/assets/dark/logo.svg";
import editIcon from "@/assets/light/Edit Icon.svg";
import deleteIcon from "@/assets/light/Trash Icon.svg";
import logoutIcon from "@/assets/light/logout.svg";
import arrowIcon from "@/assets/light/arrow.svg";
import breadcrumbIcon from "@/assets/light/breadcrumb-arrow.svg";
import switchIconLight from "@/assets/light/switchTheme.svg";
import switchIconDark from "@/assets/dark/switchTheme.svg";

import React, {useEffect, useState} from "react";
import {ChevronDown, MoreHorizontal, Plus} from "lucide-react";
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
// import {API_ROOT} from "@/utils/constants.js";
// import Notifications from "../components/Notifications.jsx";
// import RealtimeClient from "@/services/centrifugo.jsx";

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
  const [isDark, setIsDark] = useState(false);
  // const [userId, setUserId] = useState(0);
  // const [notifications, setNotifications] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);

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

  // Toggle dark/light mode
  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", !isDark);
    localStorage.setItem("theme", newTheme);
  };

  const checkUserLogin = async () => {
    try {
      const res = await getCurrentUser();

      if (res?.data?.username) {
        setAuthChecked(true);
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
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);
  const switchIcon = isDark ? switchIconDark : switchIconLight;
  const logoIcon = isDark ? logoIconDark : logoIconLight;

  // // =============================
  // // FETCH notifications từ BE + lấy thêm dữ liệu chi tiết
  // // =============================
  // const fetchNotifications = async () => {
  //   try {
  //     console.log("Fetching notifications...");
  //     const res = await fetch(`${API_ROOT}/notifications`, {
  //       credentials: "include",
  //     });
  //     if (!res.ok) throw new Error("Failed to fetch notifications");
  //     const data = await res.json();
  //
  //     // Lấy thêm dữ liệu chi tiết từ project_request_logs, users, và endpoints
  //     const endpointCache = {};
  //     const detailed = await Promise.all(
  //       data.map(async (n) => {
  //         let status = null;
  //         let request_body = null;
  //         let response_body = null;
  //         let user_name = null;
  //         let endpoint_method = null;
  //         let endpoint_path = null;
  //
  //         // --- Lấy log chi tiết ---
  //         try {
  //           if (n.project_request_log_id) {
  //             const logRes = await fetch(`${API_ROOT}/project_request_logs/${n.project_request_log_id}`, {
  //               credentials: "include",
  //             });
  //             if (logRes.ok) {
  //               const log = await logRes.json();
  //               status = log.response_status_code;
  //               request_body = log.request_body;
  //               response_body = log.response_body.data;
  //             }
  //           }
  //         } catch (e) {
  //           console.warn("Cannot fetch log for notification", n.id, e);
  //         }
  //
  //         // --- Lấy thông tin user ---
  //         try {
  //           if (n.user_id) {
  //             const userRes = await fetch(`${API_ROOT}/auth/me`, {
  //               credentials: "include",
  //             });
  //             if (userRes.ok) {
  //               const user = await userRes.json();
  //               user_name = user.username || `User #${n.user_id}`;
  //             }
  //           }
  //         } catch (e) {
  //           console.warn("Cannot fetch user info", n.user_id, e);
  //         }
  //
  //         // --- Lấy thông tin endpoint ---
  //         try {
  //           if (n.endpoint_id) {
  //             if (!endpointCache[n.endpoint_id]) {
  //               const epRes = await fetch(`${API_ROOT}/endpoints/${n.endpoint_id}`, {
  //                 credentials: "include",
  //               });
  //               if (epRes.ok) {
  //                 const ep = await epRes.json();
  //                 endpointCache[n.endpoint_id] = ep;
  //               }
  //             }
  //             const ep = endpointCache[n.endpoint_id];
  //             endpoint_method = ep?.method;
  //             endpoint_path = ep?.path;
  //           }
  //         } catch (e) {
  //           console.warn("Cannot fetch endpoint info", n.endpoint_id, e);
  //         }
  //
  //         return {
  //           ...n,
  //           status,
  //           request_body,
  //           response_body,
  //           user_name,
  //           endpoint_method,
  //           endpoint_path,
  //         };
  //       })
  //     );
  //
  //     setNotifications(detailed);
  //   } catch (e) {
  //     console.error("Fetch notifications error:", e);
  //     toast.error("Failed to fetch notifications");
  //   }
  // };
  //
  //
  // // =============================
  // // Đánh dấu đã đọc 1 notification
  // // =============================
  // const markAsRead = async (id) => {
  //   try {
  //     const res = await fetch(`${API_ROOT}/notifications/${id}`, {
  //       method: "PUT",
  //       credentials: "include",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({is_read: true}),
  //     });
  //     if (!res.ok) throw new Error("Failed to mark as read");
  //     await fetchNotifications();
  //   } catch (e) {
  //     console.error("Mark as read error:", e);
  //     toast.error("Failed to mark notification as read");
  //   }
  // };
  //
  // // =============================
  // // Đánh dấu tất cả đã đọc
  // // =============================
  // const markAllRead = async () => {
  //   try {
  //     const res = await fetch(`${API_ROOT}/notifications/mark-all-read`, {
  //       method: "PUT",
  //       credentials: "include",
  //     });
  //     if (!res.ok) throw new Error("Failed to mark all read");
  //     await fetchNotifications();
  //     toast.success("All notifications marked as read");
  //   } catch (e) {
  //     console.error("Mark all read error:", e);
  //   }
  // };
  //
  // // =============================
  // // Xóa tất cả thông báo đã đọc
  // // =============================
  // const deleteReadNotifications = async () => {
  //   try {
  //     const res = await fetch(`${API_ROOT}/notifications/read`, {
  //       method: "DELETE",
  //       credentials: "include",
  //     });
  //     if (!res.ok) throw new Error("Failed to delete read notifications");
  //     await fetchNotifications();
  //     toast.success("Deleted read notifications");
  //   } catch (e) {
  //     console.error("Delete read notifications error:", e);
  //   }
  // };
  //
  //
  // useEffect(() => {
  //   if (authChecked && username) {
  //     fetchNotifications();
  //   }
  // }, [authChecked, username]);

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
          <img src={logoIcon} className="w-10 h-10" alt="Logo"/>
        </div>

        {/* Workspace Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center justify-between px-3 py-2 rounded-md bg-stone-200 border border-slate-300 hover:bg-slate-50 font-medium min-w-[180px]">
              <span>{currentWorkspace?.name || "Select Workspace"}</span>
              <ChevronDown className="w-4 h-4 text-slate-500"/>
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
                      <MoreHorizontal className="w-4 h-4 text-slate-500"/>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-44">
                    <DropdownMenuItem onSelect={() => onEditWorkspace?.(ws)}>
                      <img src={editIcon} className="w-4 h-4 mr-2" alt="edit"/>
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
              <Plus className="w-4 h-4"/>
              <span>New workspace</span>
            </div>
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
              <img src={arrowIcon} alt="Back" className="w-4 h-4"/>
            </button>
            <button
              className="p-1 rounded hover:bg-slate-100 transition"
              onClick={() => window.history.forward()}
            >
              <img src={arrowIcon} alt="Forward" className="w-4 h-4 rotate-180"/>
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
                              <BreadcrumbPage className="flex items-center gap-1 font-bold text-slate-900">
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
                                className="flex items-center gap-1 font-bold text-slate-400"
                              >
                                {item.label}
                              </BreadcrumbLink>
                            )}
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-black text-white text-xs px-2 py-1 rounded">
                            {tooltipText}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </BreadcrumbItem>

                    {!isLast && (
                      <BreadcrumbSeparator>
                        <span className="text-lg font-semibold">/</span>
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
          <img src={logoutIcon} alt="Logout" className="w-4 h-4 mr-2"/>
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
