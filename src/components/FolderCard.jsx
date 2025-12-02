import React, {useEffect, useState} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import editIcon from "@/assets/light/Edit Icon.svg";
import editSchemaIcon from "@/assets/light/edit_schema.svg";
import plusIconLight from "@/assets/light/plus.svg";
import minusIconLight from "@/assets/light/minus.svg";
import plusIconDark from "@/assets/dark/plus.svg";
import minusIconDark from "@/assets/dark/minus.svg";
import trashIcon from "@/assets/light/Trash Icon.svg";
import EndpointCard from "@/components/EndpointCard";
import {useTheme} from "@/services/ThemeContext.jsx";

export default function FolderCard({
                                     folder,
                                     endpoints,
                                     onEditName,
                                     onEditSchema,
                                     onDeleteFolder,
                                     onToggleMode,
                                     onAddEndpoint,
                                     onEditEndpoint,
                                     onDeleteEndpoint,
                                     onOpenEndpoint,
                                   }) {
  const [expanded, setExpanded] = useState(false);
  const {isDark} = useTheme();

  const plusIcon = isDark ? plusIconDark : plusIconLight;
  const minusIcon = isDark ? minusIconDark : minusIconLight;

  // Khi load, kiểm tra xem folder này có trong danh sách lưu hay không
  useEffect(() => {
    let savedFolders;
    try {
      savedFolders = JSON.parse(localStorage.getItem("openFolders") || "[]");
    } catch (err) {
      console.error(err);
      savedFolders = [];
    }

    if (!Array.isArray(savedFolders)) {
      savedFolders = [];
    }

    if (savedFolders.includes(String(folder.id))) {
      setExpanded(true);
    }
  }, [folder.id]);

  const handleToggleExpand = () => {
    const newState = !expanded;
    setExpanded(newState);

    let savedFolders;
    try {
      savedFolders = JSON.parse(localStorage.getItem("openFolders") || "[]");
    } catch (err) {
      console.error(err);
      savedFolders = [];
    }

    // Đảm bảo savedFolders luôn là mảng
    if (!Array.isArray(savedFolders)) {
      savedFolders = [];
    }

    if (newState) {
      // Nếu mở folder → thêm ID nếu chưa có
      if (!savedFolders.includes(String(folder.id))) {
        savedFolders.push(String(folder.id));
        localStorage.setItem("openFolders", JSON.stringify(savedFolders));
      }
    } else {
      // Nếu đóng folder → xóa ID khỏi danh sách
      const updated = savedFolders.filter((id) => id !== String(folder.id));
      localStorage.setItem("openFolders", JSON.stringify(updated));
    }
  };

  const folderEndpoints = endpoints.filter(
    (e) => String(e.folder_id) === String(folder.id)
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="tab-header rounded-2xl border mb-6 overflow-hidden">
        {/* Folder Header */}
        <div
          className={`flex items-center justify-between py-2 mx-14 mb-2 rounded-t-2xl cursor-pointer ${
            expanded ? 'folder-card mt-6' : 'mt-2'
          }`}
          onClick={handleToggleExpand}
        >
          <div className="flex items-center gap-3">
            <h2 className="font-medium">
              {folder.name}
            </h2>
            <span className="font-medium opacity-50">
            {folderEndpoints.length}
          </span>

            {/* === Action Buttons with Tooltip === */}
            {expanded && (
              <div className="flex gap-2 ml-2">

                {/* Edit Name */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); onEditName(folder); }}
                      className="h-6 w-6 p-0"
                    >
                      <img src={editIcon} alt="Edit" className="w-4 h-4 dark:brightness-0 dark:invert" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-white bg-black">Edit</TooltipContent>
                </Tooltip>

                {/* Edit Schema */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); onEditSchema(folder); }}
                      className="h-6 w-6 p-0"
                    >
                      <img src={editSchemaIcon} alt="Schema" className="w-4 h-4 dark:brightness-0 dark:invert" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-white bg-black">Schema</TooltipContent>
                </Tooltip>

                {/* Delete Folder */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder); }}
                      className="h-6 w-6 p-0"
                    >
                      <img src={trashIcon} alt="Trash" className="w-4 h-4 dark:brightness-0 dark:invert" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-white bg-black">Delete</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {expanded && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Public</span>
                <Switch
                  checked={!!folder.is_public}
                  onCheckedChange={(val) => {
                    onToggleMode(folder, val);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="switch"
                />
              </div>
            )}

            <Button
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="h-6 w-6 p-0 rounded-4xl"
            >
              {expanded ? (
                <img src={minusIcon} alt="Minus" className="w-6 h-6 toggle-icon"/>
              ) : (
                <img src={plusIcon} alt="Plus" className="w-6 h-6 toggle-icon"/>
              )}
            </Button>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="px-12 pb-6 pt-2 rounded-b-2xl">
            {/* Endpoint Table */}
            <div className="overflow-x-auto rounded-md">
              <table className="w-full border-separate border-spacing-x-2 border-spacing-y-0">
                <thead>
                <tr>
                  <th className="endpoint-header text-xs font-semibold py-2 px-3 text-left rounded-md w-1/2">
                    ENDPOINT NAME
                  </th>
                  <th className="endpoint-header text-xs font-semibold text-center py-2 px-3 rounded-md w-1/12">
                    STATE
                  </th>
                  <th className="endpoint-header text-xs font-semibold text-center py-2 px-3 rounded-md w-1/12">
                    METHOD
                  </th>
                  <th className="endpoint-header text-xs font-semibold text-center py-2 px-3 rounded-md w-1/12">
                    STATUS
                  </th>
                  <th className="endpoint-header text-xs font-semibold text-center py-2 px-3 rounded-md w-1/6">
                    TIME & DATE
                  </th>
                  <th className="endpoint-header text-xs font-semibold text-center py-2 px-3 rounded-md w-1/12">
                    ACTION
                  </th>
                </tr>
                </thead>
                <tbody>
                {folderEndpoints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-sm py-4">
                      No endpoints yet.
                    </td>
                  </tr>
                ) : (
                  folderEndpoints.map((ep) => (
                    <EndpointCard
                      key={ep.id}
                      endpoint={ep}
                      onEdit={() => onEditEndpoint(ep)}
                      onDelete={() => onDeleteEndpoint(ep.id)}
                      onClick={() => onOpenEndpoint(ep)}
                    />
                  ))
                )}
                </tbody>
              </table>
            </div>

            {/* New Endpoint Button */}
            <div className="mt-4 flex justify-end">
              <Button
                className="btn-new-endpoint border-dashed border-2 text-sm"
                onClick={() => onAddEndpoint(folder)}
              >
                New Endpoint
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
