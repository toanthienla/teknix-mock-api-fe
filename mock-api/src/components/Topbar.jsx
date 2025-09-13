import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Topbar() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Search"
            className="pl-10 pr-4 py-2"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <Search size={16} />
          </div>
        </div>
      </div>
      <div className="ml-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          New Project
        </Button>
      </div>
    </div>
  );
}
