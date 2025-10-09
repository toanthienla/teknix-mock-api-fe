import React, { useState, useRef, useEffect } from "react";
import { Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import addIcon from "@/assets/Add.svg";
import { Badge } from "@/components/ui/badge.jsx";
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

const StateModeToggle = ({ isStateful, onToggle }) => {
  return (
    <div
      className="flex flex-row items-center gap-2 w-[122px] h-[30px] cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex flex-row items-center w-[60px] h-[30px]">
        <span className="w-[60px] h-[30px] font-inter font-semibold text-[16px] leading-[19px] text-black">
          {isStateful ? "Stateful" : "Stateless"}
        </span>
      </div>
      <div className="relative w-[60px] h-[30px]">
        <div
          className={`flex flex-row items-center px-[4px] gap-[10px] w-[60px] h-[30px] rounded-[16px] transition-colors ${
            isStateful ? "bg-[#2563EB]" : "bg-[#D1D5DB]"
          }`}
        >
          <div
            className={`absolute w-[24px] h-[24px] top-[3px] rounded-full bg-white transition-all ${
              isStateful ? "left-[32px]" : "left-[3px]"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

const StateModeDropdown = ({ isStateful, onStateModeChange }) => {
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
        <SelectValue placeholder="Mode" />
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
  isStateful,
  onStateModeChange,
}) {
  const [query, setQuery] = useState("");
  const [showPermission, setShowPermission] = useState(false);
  const settingsRef = useRef(null);
  const popupRef = useRef(null);

  // đóng popup khi click ra ngoài
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
                      <BreadcrumbSeparator className="font-medium text-slate-900" />
                    )}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Search + Buttons bên phải */}
      <div className="flex items-center gap-4 ml-auto relative">
        {/* Search */}
        <div className="relative w-[250px]">
          <Input
            placeholder="Search..."
            value={query}
            onChange={handleChange}
            className="pl-9 pr-3 py-2 h-10 bg-slate-100 rounded-lg text-[15px] font-medium placeholder:font-medium"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <Search size={16} />
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

        {/* New Buttons */}
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

        {/* ⚙️ Settings + Popover */}
        <div className="relative">
          <Button
            ref={settingsRef}
            variant="outline"
            size="icon"
            onClick={() => setShowPermission((v) => !v)}
            className="rounded-md border-slate-300"
          >
            <Settings size={18} />
          </Button>
{showPermission && (
  <div
    ref={popupRef}
    className="absolute right-[120px] top-12 w-[540px] bg-gray-100 rounded-2xl shadow-2xl border border-gray-200 p-6 z-50"
  >
    {/* Header */}
    <div className="flex items-center gap-2 mb-5">
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
    <div className="border border-gray-300 bg-gray-50 rounded-xl p-4 flex justify-between items-center mb-4">
      <div>
        <div className="font-semibold text-[16px]">adminteknix</div>
        <div className="text-sm text-gray-500">
          teknixcorp@gmail.com
        </div>
      </div>
      <div className="text-sm font-semibold text-gray-700 underline">
        Owner
      </div>
    </div>

    {/* Folder Protection */}
    <div className="flex justify-between items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
      <span className="text-gray-700 font-medium">
        Data in this folder is protected
      </span>
     <div className="flex items-center">
  <button className="flex flex-col items-center justify-center gap-1 text-sm bg-white border border-gray-300 rounded-l-lg px-4 py-2 w-[90px] h-[80px]">
    <img src={folderPublic} alt="Public folder" className="w-7 h-7" />
    <span>Public</span>
  </button>
  <button className="flex flex-col items-center justify-center gap-1 text-sm bg-gray-300 text-gray-600 border border-gray-300 rounded-r-lg px-4 py-2 w-[90px] h-[80px]">
    <img src={folderPrivate} alt="Private folder" className="w-7 h-7" />
    <span>Private</span>
  </button>
</div>


    </div>

    {/* Permissions Table */}
    <div className="border-t border-gray-300 pt-4">
      <div className="font-semibold text-gray-900 text-[16px] mb-3">
        Your Permissions
      </div>
      <div className="border border-gray-300 bg-gray-50 rounded-xl">
        <div className="grid grid-cols-3 bg-white text-[15px] font-semibold px-4 py-2">
          <span>Permissions</span>
          <span className="text-center">Allowed</span>
          <span className="text-center">No Allowed</span>
        </div>

        <div className="grid grid-cols-3 items-center px-4 py-2 text-sm text-gray-700">
          <span>Set folder mode</span>
          <div className="flex justify-center">
           <input type="radio" name="setMode" defaultChecked className="accent-black" />
          </div>
          <div className="flex justify-center">
           <input type="radio" name="setMode" className="accent-black" />
          </div>
        </div>

        <div className="grid grid-cols-3 items-center px-4 py-2 text-sm text-gray-700">
          <span>Sharing Data</span>
          <div className="flex justify-center">
           <input type="radio" name="sharing" className="accent-black" />
          </div>
          <div className="flex justify-center">
            <input type="radio" name="sharing" defaultChecked className="accent-black" />
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
}
