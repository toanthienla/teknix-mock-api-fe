import React, {useState} from "react";
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
import addIcon from "@/assets/Add.svg"

// Sửa component EndpointStatusToggle để có thể toggle được và đổi màu
const EndpointStatusToggle = () => {
  const [isActive, setIsActive] = useState(true);

  const toggle = () => {
    setIsActive(!isActive);
  };

  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={toggle}
    >
      <span className="mr-2 font-inter font-semibold text-[16px] leading-[19px] text-black">
        {isActive ? "Active" : "Inactive"}
      </span>
      <div className="relative w-[60px] h-[30px]">
        <div
          className={`flex items-center px-[4px] w-[60px] h-[30px] rounded-[16px] transition-colors ${
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
   onNewFolder,
   onNewResponse,
   showNewProjectButton,
   showNewFolderButton,
   showNewResponseButton
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
                              localStorage.setItem("currentWorkspace", item.WORKSPACE_ID);
                            }
                          }}
                          className="font-medium text-slate-900"
                        >
                          {item.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator className="font-medium text-slate-900"/>}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Search + Buttons bên phải */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Nếu có Response thì gom Search + Toggle + Button chung nhóm */}
        {showNewResponseButton ? (
          <div className="flex items-center gap-4">
            {/* Search giữ nguyên */}
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

            {/* Toggle */}
            <EndpointStatusToggle />

            {/* New Response */}
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
          </div>
        ) : (
          <>
            {/* Trường hợp không có Response thì search đứng 1 mình */}
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
          </>
        )}
      </div>
    </div>
  );
}
