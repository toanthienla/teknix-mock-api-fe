import React, {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import editIcon from "@/assets/light/Edit Icon.svg";
import editSchemaIcon from "@/assets/light/edit_schema.svg";
import plusIcon from "@/assets/light/plus.svg";
import minusIcon from "@/assets/light/minus.svg";
import trashIcon from "@/assets/light/Trash Icon.svg";
import EndpointCard from "@/components/EndpointCard";

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
    <div className="rounded-2xl border border-gray-200 bg-gray-50 mb-6 overflow-hidden">
      {/* Folder Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 mx-6 my-2 rounded-t-2xl cursor-pointer ${
          expanded ? 'border-b border-gray-200 bg-gray-50' : ''
        }`}
        onClick={handleToggleExpand}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">{folder.name}</h2>
          <span className="text-gray-400 font-semibold text-lg">{folderEndpoints.length}</span>

          {expanded && (
            <div className="flex gap-2 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditName(folder);
                }}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <img src={editIcon} alt="Edit" className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSchema(folder);
                }}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <img src={editSchemaIcon} alt="Schema" className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder);
                }}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <img src={trashIcon} alt="Trash" className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {expanded && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Public</span>
              <Switch
                checked={!!folder.is_public}
                onCheckedChange={(val) => {
                  onToggleMode(folder, val);
                }}
                onClick={(e) => e.stopPropagation()}
                className="data-[state=checked]:bg-yellow-300"
              />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="h-6 w-6 p-0 hover:bg-gray-100 rounded-4xl"
          >
            {expanded ? (
              <img src={minusIcon} alt="Minus" className="w-6 h-6" />
            ) : (
              <img src={plusIcon} alt="Plus" className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 rounded-b-2xl">
          {/* Endpoint Table */}
          <div className="overflow-x-auto bg-gray-50 rounded-md">
            <table className="w-full border-separate border-spacing-x-2 border-spacing-y-0">
              <thead>
              <tr>
                <th className="text-xs font-semibold text-gray-700 py-2 px-3 text-left bg-neutral-300 rounded-md w-1/2">
                  ENDPOINT NAME
                </th>
                <th className="text-xs font-semibold text-gray-700 text-center py-2 px-3 bg-neutral-300 rounded-md w-1/12">
                  STATE
                </th>
                <th className="text-xs font-semibold text-gray-700 text-center py-2 px-3 bg-neutral-300 rounded-md w-1/12">
                  METHOD
                </th>
                <th className="text-xs font-semibold text-gray-700 text-center py-2 px-3 bg-neutral-300 rounded-md w-1/12">
                  STATUS
                </th>
                <th className="text-xs font-semibold text-gray-700 text-center py-2 px-3 bg-neutral-300 rounded-md w-1/6">
                  TIME & DATE
                </th>
                <th className="text-xs font-semibold text-gray-700 text-center py-2 px-3 bg-neutral-300 rounded-md w-1/12">
                  ACTION
                </th>
              </tr>
              </thead>
              <tbody>
              {folderEndpoints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-gray-500 py-4">
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
              variant="outline"
              className="border-dashed border-2 border-gray-400 text-gray-600 bg-yellow-200 hover:bg-yellow-300"
              onClick={() => onAddEndpoint(folder)}
            >
              New Endpoint
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
