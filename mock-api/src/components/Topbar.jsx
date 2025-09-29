import React, { useState } from "react";
import { Search, Circle } from "lucide-react";
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

// Sửa component EndpointStatusToggle để có thể toggle được và đổi màu
const EndpointStatusToggle = () => {
  const [isActive, setIsActive] = useState(true);

  const toggle = () => {
    setIsActive(!isActive);
  };

  return (
    <div
      className="flex flex-row items-center w-[12px] h-[30px] cursor-pointer"
      onClick={toggle}
    >
      <div className="flex flex-row items-center w-[60px] h-[30px]">
        <span className="w-[60px] h-[30px] font-inter font-semibold text-[16px] leading-[19px] text-black">
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="relative w-[60px] h-[30px]">
        <div
          className={`flex flex-row items-center px-[4px] gap-[10px] w-[60px] h-[30px] rounded-[16px] transition-colors ${
            isActive ? "bg-[#2563EB]" : "bg-[#D1D5DB]"
          }`}
        >
          <div
            className={`absolute w-[24px] h-[24px] top-[3px] rounded-full bg-white transition-all ${
              isActive ? "left-[32px]" : "left-[3px]"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default function Topbar({
  breadcrumb = [],
  onSearch,
  onNewProject,
  onNewResponse,
  showNewProjectButton,
  showNewResponseButton,
}) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className="relative flex items-center justify-between bg-white px-8 py-2 -mt-8 border-b border-slate-200 h-16">
      {/* Search */}
      <div className="flex-1 flex items-center">
        <div className="relative w-[250px]">
          <Input
            placeholder="Search"
            value={query}
            onChange={handleChange}
            className="pl-9 pr-3 py-2 h-10 bg-slate-100 rounded-lg text-[15px] font-medium placeholder:font-medium"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <Search size={16} />
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div
        className={
          showNewProjectButton
            ? "flex-1 flex justify-center"
            : "flex flex-1 justify-end"
        }
      >
        {breadcrumb.length > 0 && (
          <div className="bg-slate-100 px-4 py-2 rounded-md min-w-[250px] max-w-[100%] overflow-hidden">
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
                          >
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}
      </div>

      {/* Endpoint Status Toggle */}
      {showNewResponseButton && (
        <div className="flex-1 flex justify-end mr-4">
          <EndpointStatusToggle />
        </div>
      )}

      {/* New Project Button */}
      {showNewProjectButton && (
        <div className="flex-1 flex justify-end">
          <Button
            onClick={onNewProject}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 rounded-md"
          >
            New Project
          </Button>
        </div>
      )}

      {/* New Response Button */}
      {showNewResponseButton && (
        <div className="flex-1 flex justify-end">
          <Button
            onClick={onNewResponse}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 rounded-md"
          >
            New Response
          </Button>
        </div>
      )}
    </div>
  );
}
