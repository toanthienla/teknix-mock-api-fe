import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Topbar({ breadcrumb = [], onSearch, onNewProject }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (onSearch) onSearch(value);
  };

  return (
  <div className="relative flex items-center justify-between bg-white px-8 py-2 -mt-10 border-b border-slate-200">

      {/* Search */}
      <div className="flex flex-1 items-center">
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

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="flex items-center ml-12 space-x-3">
            {breadcrumb.map((item, idx) => (
              <div
                key={idx}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Button */}
      <Button
        onClick={onNewProject}
        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 rounded-md"
      >
        New Project
      </Button>
    </div>
  );
}
