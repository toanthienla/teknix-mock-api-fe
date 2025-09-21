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

export default function Topbar({breadcrumb = [], onSearch, onNewProject, showNewProjectButton}) {
    const [query, setQuery] = useState("");

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (onSearch) onSearch(value);
    };

    return (
        <div className="relative flex items-center justify-between bg-white px-8 py-2 -mt-8 border-b border-slate-200">
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
                    <div className="bg-slate-100 px-4 py-2 rounded-md">
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumb.map((item, idx) => (
                                    <React.Fragment key={idx}>
                                        <BreadcrumbItem>
                                            {idx === breadcrumb.length - 1 ? (
                                                <BreadcrumbPage>{item}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink href="/dashboard">{item}</BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {idx < breadcrumb.length - 1 && <BreadcrumbSeparator />}
                                    </React.Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                )}
            </div>

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
        </div>
    );
}
