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
  <Breadcrumb>
    <BreadcrumbList className="flex flex-nowrap items-center space-x-2 overflow-hidden text-slate-600 text-sm">
      {breadcrumb.map((item, idx) => {
        const isLast = idx === breadcrumb.length - 1;
        return (
          <React.Fragment key={idx}>
            <BreadcrumbItem className="whitespace-nowrap overflow-hidden min-w-0 truncate">
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
                  className="text-slate-600"
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
)}


      {/* Search + Buttons bên phải */}
      <div className="flex items-center gap-4 ml-auto">
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

        {showNewProjectButton && (
          <Button
            onClick={onNewProject}
            className="px-4 h-10 rounded-md"
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
            className="px-4 h-10 rounded-md"
          >
            <img
              src={addIcon}
              alt="Add icon"
              className="w-5 h-5 object-contain invert brightness-0"
            />
            New Folder
          </Button>
        )}

        {showNewResponseButton && (
          <Button
            onClick={onNewResponse}
            className="px-4 h-10 rounded-md"
          >
            <img
              src={addIcon}
              alt="Add icon"
              className="w-5 h-5 object-contain invert brightness-0"
            />
            New Response
          </Button>
        )}
      </div>
    </div>
  );
}

