import React from "react";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import detailIconLight from "@/assets/light/view_detail.svg";
import detailIconDark from "@/assets/dark/view_detail.svg";
import {useTheme} from "@/services/useTheme.js";

export default function ProjectCard({ project, folders, endpoints, onView, onClick }) {
  const { id, name, created_at } = project;
  const { isDark } = useTheme();

  const detailIcon = isDark ? detailIconDark : detailIconLight;

  // Format ngày tạo
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Lấy folder + endpoint liên quan
  const projectFolders = folders.filter((f) => String(f.project_id) === String(id));
  const folderNames = projectFolders.map((f) => f.name);
  const projectFolderIds = projectFolders.map((f) => String(f.id));
  const projectEndpoints = endpoints.filter((ep) =>
    projectFolderIds.includes(String(ep.folder_id))
  );

  return (
    <TableRow
      onClick={onClick}
      className="h-[64px] border-b transition cursor-pointer"
    >
      {/* Project name */}
      <TableCell className="font-medium pl-2.5">{name}</TableCell>

      {/* Folders */}
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {folderNames.length > 0 ? (
            folderNames.map((fn) => (
              <span
                key={fn}
                className="text-sm px-3 py-1 rounded-full shadow-sm
                 bg-yellow-200 hover:bg-yellow-300 text-black dark:bg-[#5865F2] dark:hover:bg-[#4f5ad9]
                 dark:text-white"
              >
                {fn}
              </span>
            ))
          ) : (
            <span className="text-sm">No folders</span>
          )}
        </div>
      </TableCell>

      {/* Endpoints */}
      <TableCell className="text-center text-sm font-semibold">
        {projectEndpoints.length}
      </TableCell>

      {/* Date Created */}
      <TableCell className="text-sm text-right">
        {formatDate(created_at)}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex justify-end pr-2.5">
          <img
            src={detailIcon}
            alt="Detail"
            className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
