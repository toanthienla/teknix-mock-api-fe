import React from "react";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import detailIcon from "@/assets/light/view_detail.svg";

export default function ProjectCard({ project, folders, endpoints, onView, onClick }) {
  const { id, name, created_at } = project;

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
      className="h-[64px] hover:bg-gray-50 border-b border-gray-200 transition cursor-pointer"
    >
      {/* Project name */}
      <TableCell className="font-medium text-gray-800">{name}</TableCell>

      {/* Folders */}
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {folderNames.length > 0 ? (
            folderNames.map((fn) => (
              <span
                key={fn}
                className="bg-yellow-200 text-gray-800 text-sm px-2.5 py-0.5 rounded-full font-medium shadow-sm"
              >
                {fn}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">No folders</span>
          )}
        </div>
      </TableCell>

      {/* Endpoints */}
      <TableCell className="text-center text-sm font-semibold text-gray-700">
        {projectEndpoints.length}
      </TableCell>

      {/* Date Created */}
      <TableCell className="text-sm text-right text-gray-600">
        {formatDate(created_at)}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <div className="flex justify-end gap-3">
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
