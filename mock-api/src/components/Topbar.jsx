import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Topbar({ onSearch, onNewProject }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className="flex items-center justify-between bg-white px-6 py-3 border-b border-slate-200">
      <div className="flex justify-center flex-1">
        <div className="relative w-[440px]">
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
      <Button
        onClick={onNewProject}
        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 rounded-md"
      >
        New Project
      </Button>
    </div>
  );
}