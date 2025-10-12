import React, {useState, useRef, useEffect} from "react";
import {API_ROOT} from "@/utils/constants";

import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import addIcon from "@/assets/Add.svg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import userCogIcon from "@/assets/fa-solid_user-cog.svg";
import folderPublic from "@/assets/folder-public.svg";
import folderPrivate from "@/assets/folder-private.svg";
import frameIcon from "@/assets/Frame.svg";
import birdIcon from "@/assets/Bird.svg";
import {toast} from "react-toastify";

// const StateModeToggle = ({isStateful, onToggle}) => {
//   return (
//     <div
//       className="flex flex-row items-center gap-2 w-[122px] h-[30px] cursor-pointer"
//       onClick={onToggle}
//     >
//       <div className="flex flex-row items-center w-[60px] h-[30px]">
//         <span className="w-[60px] h-[30px] font-inter font-semibold text-[16px] leading-[19px] text-black">
//           {isStateful ? "Stateful" : "Stateless"}
//         </span>
//       </div>
//       <div className="relative w-[60px] h-[30px]">
//         <div
//           className={`flex flex-row items-center px-[4px] gap-[10px] w-[60px] h-[30px] rounded-[16px] transition-colors ${
//             isStateful ? "bg-[#2563EB]" : "bg-[#D1D5DB]"
//           }`}
//         >
//           <div
//             className={`absolute w-[24px] h-[24px] top-[3px] rounded-full bg-white transition-all ${
//               isStateful ? "left-[32px]" : "left-[3px]"
//             }`}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

const StateModeDropdown = ({isStateful, onStateModeChange}) => {
  return (
    <Select
      value={isStateful ? "stateful" : "stateless"}
      onValueChange={(value) => {
        if (
          (value === "stateful" && !isStateful) ||
          (value === "stateless" && isStateful)
        ) {
          onStateModeChange();
        }
      }}
    >
      <SelectTrigger className="w-[140px] h-10 border-[#CBD5E1]">
        <SelectValue placeholder="Mode"/>
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          value="stateful"
          disabled={isStateful}
          className={isStateful ? "text-gray-400" : ""}
        >
          Stateful
        </SelectItem>
        <SelectItem
          value="stateless"
          disabled={!isStateful}
          className={!isStateful ? "text-gray-400" : ""}
        >
          Stateless
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default function Topbar({
                                 breadcrumb = [],
                                 onSearch,
                                 onNewProject,
                                 onNewFolder,
                                 onNewResponse,
                                 showNewProjectButton,
                                 showNewFolderButton,
                                 showNewResponseButton,
                                 showStateModeToggle,
                                 showSettingsButton,
                                 onOpenSettings,
                                 isStateful,
                                 onStateModeChange,
                                 currentFolder,
                               }) {
  const [query, setQuery] = useState("");
  const [showPermission, setShowPermission] = useState(false);
  const settingsRef = useRef(null);
  const popupRef = useRef(null);

  const [folderMode, setFolderMode] = useState("public");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderOwner, setFolderOwner] = useState(""); // username của owner
  const [isOwner, setIsOwner] = useState(false); // xem user hiện tại có phải owner không

  useEffect(() => {
    if (currentFolder?.id) {
      setSelectedFolder(currentFolder);
    }
  }, [currentFolder]);

  // 🔹 Khi có selectedFolder → fetch thông tin owner và quyền
  useEffect(() => {
    if (!selectedFolder?.id || !showPermission) return;

    const fetchFolderDetail = async () => {
      try {
        const res = await fetch(`${API_ROOT}/folders/${selectedFolder.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setFolderMode(data.is_public ? "public" : "private");
      } catch (err) {
        console.error("Failed to fetch folder detail:", err);
      }
    };

    const fetchOwner = async () => {
      try {
        const res = await fetch(`${API_ROOT}/folders/getOwner/${selectedFolder.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setFolderOwner(data.username || "Unknown");
      } catch (err) {
        console.error("Error fetching folder owner:", err);
        setFolderOwner("Unknown");
      }
    };

    const checkOwner = async () => {
      try {
        const res = await fetch(`${API_ROOT}/folders/checkOwner/${selectedFolder.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setIsOwner(data.success);
      } catch (err) {
        console.error("Error checking folder owner:", err);
        setIsOwner(false);
      }
    };

    fetchFolderDetail();
    fetchOwner();
    checkOwner();
  }, [selectedFolder, showPermission]);

  // 🔹 Đóng popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !settingsRef.current.contains(e.target)
      ) {
        setShowPermission(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangeFolderMode = async (mode) => {
    if (!selectedFolder?.id) return;
    try {
      const res = await fetch(`${API_ROOT}/folders/${selectedFolder.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({is_public: mode === "public"}),
      });

      if (!res.ok) throw new Error("Failed to update folder mode");
      setFolderMode(mode);
      toast.success(`Folder is now ${mode.toUpperCase()}!`);
    } catch (err) {
      toast.error("Failed to update folder mode!");
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className="relative flex items-center justify-between bg-white px-8 py-2 -mt-8 border-b border-slate-200 h-16">
      {/* Breadcrumb bên trái */}
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
                        <BreadcrumbPage className="font-medium text-slate-900">
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
                          className="font-medium text-slate-900"
                        >
                          {item.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator className="font-medium text-slate-900"/>
                    )}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Search + Buttons */}
      <div className="flex items-center gap-4 ml-auto relative">
        {/* Search box */}
        <div className="relative w-[250px]">
          <Input
            placeholder="Search..."
            value={query}
            onChange={handleChange}
            className="pl-9 pr-3 py-2 h-10 bg-slate-100 rounded-lg text-[15px] font-medium placeholder:font-medium"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <Search size={16}/>
          </div>
        </div>

        {/* State Mode Toggle */}
        {showStateModeToggle && (
          <div className="flex-1 flex justify-end mr-4">
            <StateModeDropdown
              isStateful={isStateful}
              onStateModeChange={onStateModeChange}
            />
          </div>
        )}

        {/* New Response - chỉ hiển thị khi không phải stateful */}
        {showNewResponseButton && (
          <Button
            onClick={onNewResponse}
            className="bg-blue-600 hover:bg-blue-700 px-4 h-10 rounded-md"
          >
            <img
              src={addIcon}
              alt="Add icon"
              className="w-5 h-5 object-contain invert brightness-0"
            />
            New Response
          </Button>
        )}

        {/* Project button */}
        {showNewProjectButton && (
          <Button
            onClick={onNewProject}
            className="bg-blue-600 hover:bg-blue-700 px-4 h-10 rounded-md"
          >
            <img
              src={addIcon}
              alt="Add icon"
              className="w-5 h-5 object-contain invert brightness-0"
            />
            New Project
          </Button>
        )}

        {/* Folder button */}
        {showNewFolderButton && (
          <Button
            onClick={onNewFolder}
            className="bg-blue-600 hover:bg-blue-700 px-4 h-10 rounded-md"
          >
            <img
              src={addIcon}
              alt="Add icon"
              className="w-5 h-5 object-contain invert brightness-0"
            />
            New Folder
          </Button>
        )}

        {/* ⚙️ Settings + Permission Popup */}
        {showSettingsButton && (
          <div className="relative">
            <Button
              ref={settingsRef}
              variant="ghost"
              size="lg"
              onClick={() => setShowPermission((v) => !v)}
              className="p-0 hover:bg-transparent focus-visible:ring-0"
            >
              <img src={frameIcon} alt="Settings" className="w-7 h-7 object-contain"/>
            </Button>


            {/* === Folder Permission Popup === */}
            {showPermission && (
              <div
                ref={popupRef}
                className="absolute right-[0px] top-12 w-[540px] bg-neutral-100 rounded-2xl shadow-2xl border border-gray-300 p-6 z-50"
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={userCogIcon}
                    alt="User cog icon"
                    className="w-6 h-6 text-gray-700"
                  />
                  <h3 className="text-xl font-bold text-gray-900">
                    Users Permission
                  </h3>
                </div>

                {/* User Info */}
                <div
                  className="border border-gray-300 bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={birdIcon}
                      alt="User avatar"
                      className="w-7 h-7 object-contain"
                    />
                    <div>
                      <div className="font-semibold text-[16px]">
                        {folderOwner || "Unknown"}
                      </div>

                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 underline">
                    Owner
                  </div>
                </div>

                {/* Folder Protection */}
                <div className="flex justify-between items-center bg-gray-100 rounded-xl px-4 py-3 mt-4">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                          <span>
                            Data in folder{" "}
                            <span className="font-semibold text-black-700">
                              {selectedFolder?.name || "this folder"}
                            </span>{" "}
                            is protected
                          </span>
                  </div>

                  <div className="flex items-center">
                    <button
                      className={`flex flex-col items-center justify-center gap-1 text-sm border-2 border-stone-400 rounded-l-lg px-4 py-2 w-[60px] h-[45px] ${
                        folderMode === "public"
                          ? "bg-white text-black"
                          : "bg-gray-300 text-gray-500"
                      }`}
                      onClick={() => handleChangeFolderMode("public")}
                    >
                      <img src={folderPublic} alt="Public folder" className="w-4 h-4"/>
                      <span className="text-xs font-semibold">Public</span>
                    </button>
                    <button
                      className={`flex flex-col items-center justify-center gap-1 text-sm border-2 border-stone-400 rounded-r-lg px-4 py-2 w-[60px] h-[45px] ${
                        folderMode === "private"
                          ? "bg-white text-black"
                          : "bg-gray-300 text-gray-500"
                      }`}
                      onClick={() => handleChangeFolderMode("private")}
                    >
                      <img src={folderPrivate} alt="Private folder" className="w-4 h-4"/>
                      <span className="text-xs font-semibold">Private</span>
                    </button>
                  </div>
                </div>

                {/* Permissions Table */}
                <div className="border-t border-gray-300 pt-4 mt-4">
                  <div className="font-semibold text-gray-900 text-[16px] mb-3">
                    Your Permissions
                  </div>
                  <div className="border bg-white border-gray-300 rounded-xl">
                    <div
                      className="grid grid-cols-3 bg-gray-50 text-[15px] font-semibold mx-2 my-1 px-2 py-1 rounded-t-xl">
                      <span>Permissions</span>
                      <span className="text-center">Allowed</span>
                      <span className="text-center">Not Allowed</span>
                    </div>

                    <div className="grid grid-cols-3 items-center px-4 py-2 text-sm text-gray-700">
                      <span>Set folder mode</span>
                      <div className="flex justify-center">
                        <input
                          type="radio"
                          name="setMode"
                          className="accent-black"
                          checked={isOwner === true}
                          readOnly
                        />
                      </div>
                      <div className="flex justify-center">
                        <input
                          type="radio"
                          name="setMode"
                          className="accent-black"
                          checked={isOwner === false}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 items-center px-4 py-2 text-sm text-gray-700">
                      <span>Sharing Data</span>
                      <div className="flex justify-center">
                        <input
                          type="radio"
                          name="sharing"
                          className="accent-black"
                          checked={folderMode === "public"}
                          readOnly
                        />
                      </div>
                      <div className="flex justify-center">
                        <input
                          type="radio"
                          name="sharing"
                          className="accent-black"
                          checked={folderMode === "private"}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
