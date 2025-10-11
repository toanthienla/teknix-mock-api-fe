import React, { useState } from "react";
import { Search } from "lucide-react";
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
import { ChevronDown } from "lucide-react";

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
      <div className="flex items-center gap-4 ml-auto">
        {/* Luôn hiển thị search */}
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

        {/* State Mode Toggle - luôn hiển thị nếu được yêu cầu */}
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
      </div>
    </div>
  );
}
